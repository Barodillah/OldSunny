<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SunnyAiService;
use App\Services\ChatSessionTracker;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\Lead;
use App\Models\ChatBlock;

class AiAssistantController extends Controller
{
    protected SunnyAiService $aiService;
    protected ChatSessionTracker $tracker;

    public function __construct(SunnyAiService $aiService, ChatSessionTracker $tracker)
    {
        $this->aiService = $aiService;
        $this->tracker = $tracker;
    }

    /**
     * Process AI Chat through OpenRouter & track session and messages in MySQL
     */
    public function chat(Request $request)
    {
        $data = $request->json()->all() ?: $request->all();
        $messages = $data['messages'] ?? [];
        $sessionId = $data['session_id'] ?? ('sunny_sess_' . time() . '_' . substr(md5(uniqid()), 0, 6));
        $clientInfo = $data['client_info'] ?? [];
        $deviceId = $clientInfo['device_id'] ?? $request->input('device_id');

        if (empty($messages) || !is_array($messages)) {
            return response()->json([
                'success' => false,
                'message' => 'Parameter messages wajib diisi berupa array riwayat percakapan.'
            ], 422);
        }

        // 0. Cek apakah IP / Device saat ini sedang dalam status pemblokiran aktif
        $ip = $this->getClientIpAddress($request);
        $blockRecord = $this->getActiveBlockRecord($ip, $deviceId, $sessionId);

        if ($blockRecord && $blockRecord->blocked_until && $blockRecord->blocked_until->isFuture()) {
            return response()->json([
                'success' => false,
                'is_blocked' => true,
                'blocked_until' => $blockRecord->blocked_until->toIso8601String(),
                'remaining_seconds' => max(0, $blockRecord->blocked_until->diffInSeconds(now())),
                'block_count' => $blockRecord->block_count,
                'duration_minutes' => $blockRecord->block_duration_minutes,
                'message' => 'Layanan chat interaktif sedang dibatasi sementara. Silakan hubungi konsultan kami langsung melalui WhatsApp atau Telepon.'
            ], 429);
        }

        // 1. Record / update chat session with comprehensive IP, device, browser, city, country data
        $session = $this->tracker->recordSession($sessionId, $request, $clientInfo);

        // 2. Record the latest user message into chat_messages table
        $lastUserMsg = null;
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if (($messages[$i]['role'] ?? '') === 'user') {
                $lastUserMsg = $messages[$i]['content'] ?? '';
                break;
            }
        }

        if ($lastUserMsg) {
            $this->tracker->recordMessage($sessionId, 'user', $lastUserMsg);

            // Automatically capture customer phone/WhatsApp if mentioned in the message
            if (preg_match('/(?:\+?62|0)8[1-9][0-9]{7,11}/', $lastUserMsg, $phoneMatch)) {
                $session->update(['customer_phone' => $phoneMatch[0]]);
            }
            // Automatically capture customer name if mentioned
            if (preg_match('/(?:nama\s+(?:saya|lengkap)?\s*(?:adalah|:)?\s*|saya\s+)([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i', $lastUserMsg, $nameMatch)) {
                if (empty($session->customer_name)) {
                    $session->update(['customer_name' => trim($nameMatch[1])]);
                }
            }
        }

        // 3. Generate AI Response
        $result = $this->aiService->chat($messages, $sessionId);

        // If no saved_lead was returned by AI, check if session already has a lead or user just provided a phone number
        if (empty($result['saved_lead'])) {
            $activePhone = $session->customer_phone ?? ($clientInfo['customer_phone'] ?? null);
            if (!empty($activePhone) && preg_match('/(?:\+?62|0)8[0-9]{7,12}/', $activePhone)) {
                $existingLead = Lead::where('session_id', $sessionId)->first();
                if ($existingLead) {
                    // Lead already exists! Append new user information to notes without duplicating
                    if ($lastUserMsg && !str_contains($existingLead->notes ?? '', $lastUserMsg) && strlen($lastUserMsg) > 3) {
                        $time = date('d/m H:i');
                        $existingLead->notes = ($existingLead->notes ? $existingLead->notes . "\n" : "") . "[Pesan Pengguna {$time} WIB]: " . $lastUserMsg;
                    }
                    if (empty($existingLead->customer_name) && !empty($session->customer_name)) {
                        $existingLead->customer_name = $session->customer_name;
                    }
                    // Detect vehicle mentioned in message
                    if (empty($existingLead->vehicle_model)) {
                        foreach (['pajero', 'xpander cross', 'xpander', 'xforce', 'destinator', 'triton', 'l300', 'canter', 'fuso'] as $vm) {
                            if (stripos($lastUserMsg, $vm) !== false) {
                                $existingLead->vehicle_model = ucwords($vm);
                                break;
                            }
                        }
                    }
                    $existingLead->save();
                    $result['saved_lead'] = [
                        'id' => $existingLead->id,
                        'type' => $existingLead->type,
                        'customer_name' => $existingLead->customer_name,
                        'customer_phone' => $existingLead->customer_phone,
                        'is_updated' => true,
                    ];
                } elseif (isset($phoneMatch) && !empty($phoneMatch[0])) {
                    // User just gave phone in this turn for the first time!
                    // Save initial lead
                    $newLead = $this->aiService->saveOrUpdateLead($sessionId, 'prospect', [
                        'customer_name' => $session->customer_name ?? null,
                        'customer_phone' => $phoneMatch[0],
                        'notes' => "Nomor WhatsApp diberikan via chat Sunny AI" . ($lastUserMsg ? "\n[Pesan]: {$lastUserMsg}" : ""),
                    ], $phoneMatch[0]);

                    if ($newLead) {
                        $result['saved_lead'] = [
                            'id' => $newLead->id,
                            'type' => $newLead->type,
                            'customer_name' => $newLead->customer_name,
                            'customer_phone' => $newLead->customer_phone,
                            'is_updated' => false,
                        ];
                    }
                }
            }
        }

        // Update session telemetry if lead was successfully captured or updated by AI
        if (!empty($result['saved_lead'])) {
            $leadUpdates = [];
            if (!empty($result['saved_lead']['customer_name']) && empty($session->customer_name)) {
                $leadUpdates['customer_name'] = $result['saved_lead']['customer_name'];
            }
            if (!empty($result['saved_lead']['customer_phone']) && empty($session->customer_phone)) {
                $leadUpdates['customer_phone'] = $result['saved_lead']['customer_phone'];
            }
            if (!empty($leadUpdates)) {
                $session->update($leadUpdates);
            }
        }

        // 4. Record AI response message into chat_messages table
        if (!empty($result['reply'])) {
            $this->tracker->recordMessage(
                $sessionId,
                'ai',
                $result['reply'],
                $result['quick_replies'] ?? null,
                $result['action_tags'] ?? null,
                [
                    'saved_lead_id' => $result['saved_lead']['id'] ?? null,
                    'note' => $result['note'] ?? null,
                ]
            );
        }

        $result['session'] = [
            'session_id' => $session->session_id,
            'city' => $session->city,
            'region' => $session->region,
            'country' => $session->country,
            'device_type' => $session->device_type,
            'browser' => $session->browser,
            'os' => $session->os,
        ];

        // 5. Cek & Proses Deteksi Pertanyaan di Luar Konteks Pelayanan Dealer
        $isOutOfContext = !empty($result['action_tags']['out_of_context']);
        $blockInfo = null;

        if ($isOutOfContext) {
            $record = $blockRecord ?: new ChatBlock([
                'ip_address' => $ip,
                'device_id' => $deviceId,
                'session_id' => $sessionId,
                'out_of_context_count' => 0,
                'block_count' => 0,
            ]);

            $record->ip_address = $ip;
            if (!empty($deviceId)) $record->device_id = $deviceId;
            $record->session_id = $sessionId;
            $record->last_out_of_context_message = $lastUserMsg;

            $record->out_of_context_count = ($record->out_of_context_count ?? 0) + 1;

            $shouldBlock = false;
            $newDurationMinutes = 0;

            if ($record->block_count == 0) {
                // Pemblokiran pertama: harus 3x out of context
                if ($record->out_of_context_count >= 3) {
                    $shouldBlock = true;
                    $record->block_count = 1;
                    $newDurationMinutes = 30; // 30 menit
                }
            } else {
                // Pernah diblokir sebelumnya: cukup 1x pesan di luar konteks lagi
                $shouldBlock = true;
                $record->block_count += 1;
                // Kelipatan 2x: 30 -> 60 -> 120 -> 240 ...
                $base = $record->block_duration_minutes > 0 ? $record->block_duration_minutes : 30;
                $newDurationMinutes = $base * 2;
            }

            if ($shouldBlock) {
                $record->block_duration_minutes = $newDurationMinutes;
                $record->blocked_until = now()->addMinutes($newDurationMinutes);
                $record->reason = "Pesan di luar konteks dealer sebanyak {$record->out_of_context_count}x. Pemblokiran ke-{$record->block_count} selama {$newDurationMinutes} menit.";
            }

            $record->save();

            $blockInfo = [
                'out_of_context_detected' => true,
                'out_of_context_count' => $record->out_of_context_count,
                'is_blocked' => $shouldBlock || ($record->blocked_until && $record->blocked_until->isFuture()),
                'blocked_until' => $record->blocked_until ? $record->blocked_until->toIso8601String() : null,
                'remaining_seconds' => $record->blocked_until && $record->blocked_until->isFuture() ? max(0, $record->blocked_until->diffInSeconds(now())) : 0,
                'block_count' => $record->block_count,
                'duration_minutes' => $record->block_duration_minutes
            ];
        }

        $result['block_info'] = $blockInfo;

        return response()->json($result);
    }

    /**
     * Get chat history for a session from MySQL database
     */
    public function getHistory(Request $request)
    {
        $sessionId = $request->query('session_id');
        if (!$sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Parameter session_id wajib diisi.'
            ], 422);
        }

        $session = ChatSession::where('session_id', $sessionId)->first();
        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi percakapan tidak ditemukan.'
            ], 404);
        }

        $messages = ChatMessage::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'session' => $session,
            'messages' => $messages
        ]);
    }

    /**
     * Close a chat session
     */
    public function closeSession(Request $request)
    {
        $data = $request->json()->all() ?: $request->all();
        $sessionId = $data['session_id'] ?? null;

        if (!$sessionId) {
            return response()->json(['success' => false, 'message' => 'session_id wajib diisi.'], 422);
        }

        $session = ChatSession::where('session_id', $sessionId)->first();
        if ($session) {
            $session->update(['status' => 'closed']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sesi obrolan berhasil ditutup.'
        ]);
    }

    /**
     * List all chat sessions for Dealership Management Portal
     */
    public function getSessions(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = ChatSession::withCount('messages')->orderBy('last_activity_at', 'desc');

        if ($status === 'blocked') {
            // Sesi yang IP, device_id, atau session_id nya terdaftar di tabel chat_blocks yang pernah diblokir (block_count > 0)
            $blockedIps = ChatBlock::where('block_count', '>', 0)->pluck('ip_address')->filter()->unique();
            $blockedSessions = ChatBlock::where('block_count', '>', 0)->pluck('session_id')->filter()->unique();
            $blockedDevices = ChatBlock::where('block_count', '>', 0)->pluck('device_id')->filter()->unique();

            $query->where(function ($q) use ($blockedIps, $blockedSessions, $blockedDevices) {
                $q->whereIn('ip_address', $blockedIps)
                  ->orWhereIn('session_id', $blockedSessions);
            });
        } elseif ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('session_id', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        $paginated = $query->paginate(25);

        // Ambil data pemblokiran aktif atau riwayat blokir untuk setiap sesi
        $sessionIps = collect($paginated->items())->pluck('ip_address')->unique();
        $sessionIds = collect($paginated->items())->pluck('session_id')->unique();

        $blocks = ChatBlock::where(function ($q) use ($sessionIps, $sessionIds) {
            $q->whereIn('ip_address', $sessionIps)
              ->orWhereIn('session_id', $sessionIds);
        })->get();

        $items = collect($paginated->items())->map(function ($sess) use ($blocks) {
            $matchedBlock = $blocks->first(function ($b) use ($sess) {
                return ($b->session_id && $b->session_id === $sess->session_id) || ($b->ip_address && $b->ip_address === $sess->ip_address);
            });

            $sessArray = $sess->toArray();
            if ($matchedBlock && $matchedBlock->block_count > 0) {
                $isCurrentlyBlocked = $matchedBlock->blocked_until && $matchedBlock->blocked_until->isFuture();
                $sessArray['block_status'] = [
                    'is_blocked' => $isCurrentlyBlocked,
                    'block_count' => $matchedBlock->block_count,
                    'out_of_context_count' => $matchedBlock->out_of_context_count,
                    'blocked_until' => $matchedBlock->blocked_until ? $matchedBlock->blocked_until->toIso8601String() : null,
                    'duration_minutes' => $matchedBlock->block_duration_minutes,
                ];
            } else {
                $sessArray['block_status'] = null;
            }

            return $sessArray;
        });

        // Hitung total blokir tercatat secara keseluruhan di sistem
        $totalBlockedCount = ChatBlock::where('block_count', '>', 0)->count();

        $customPaginated = $paginated->toArray();
        $customPaginated['data'] = $items;

        return response()->json([
            'success' => true,
            'data' => $customPaginated,
            'meta' => [
                'total_blocks' => $totalBlockedCount
            ]
        ]);
    }

    /**
     * Batch fetch sessions info for customer device local storage session IDs
     */
    public function getCustomerSessions(Request $request)
    {
        $data = $request->json()->all() ?: $request->all();
        $sessionIds = $data['session_ids'] ?? $request->input('session_ids') ?? $request->query('session_ids', []);
        if (is_string($sessionIds)) {
            $sessionIds = array_filter(array_map('trim', explode(',', $sessionIds)));
        }

        if (empty($sessionIds) || !is_array($sessionIds)) {
            return response()->json([
                'success' => true,
                'sessions' => []
            ]);
        }

        $sessions = ChatSession::withCount('messages')
            ->whereIn('session_id', $sessionIds)
            ->orderBy('last_activity_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'sessions' => $sessions
        ]);
    }

    /**
     * Fetch raw knowledge base data
     */
    public function getKnowledge(string $key)
    {
        $data = $this->aiService->getKnowledge($key);
        if ($data === null) {
            return response()->json([
                'success' => false,
                'message' => "Knowledge kategori '{$key}' tidak ditemukan di repositori sistem."
            ], 404);
        }

        return response()->json([
            'success' => true,
            'key' => $key,
            'data' => $data
        ]);
    }

    /**
     * Store a lead/request explicitly from AI action or UI form
     */
    public function storeLead(Request $request)
    {
        $data = $request->json()->all() ?: $request->all();
        if (empty($data)) {
            $raw = file_get_contents('php://input');
            $cleanRaw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
            $data = json_decode($cleanRaw, true) ?: [];
        }

        $validator = \Illuminate\Support\Facades\Validator::make($data, [
            'session_id' => 'nullable|string|max:100',
            'type' => 'required|string|max:50',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:40',
            'customer_nopol' => 'nullable|string|max:20',
            'vehicle_model' => 'nullable|string|max:100',
            'data' => 'nullable|array',
            'notes' => 'nullable|string',
            'source' => 'nullable|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Normalize type (e.g. "test drive" -> "test_drive")
        $validated['type'] = str_replace(' ', '_', strtolower($validated['type']));
        if ($validated['type'] === 'aksesoris') {
            $validated['type'] = 'sparepart';
        }
        if ($validated['type'] === 'booking_service') {
            $validated['type'] = 'booking';
        }

        // Deduplication: check if lead already exists for this session or phone
        $existingLead = null;
        if (!empty($validated['session_id'])) {
            $existingLead = Lead::where('session_id', $validated['session_id'])->first();
        }
        if (!$existingLead && !empty($validated['customer_phone'])) {
            $existingLead = Lead::where('customer_phone', $validated['customer_phone'])
                ->where('status', 'new')
                ->where('created_at', '>=', now()->subHours(24))
                ->latest()
                ->first();
        }

        if ($existingLead) {
            $updates = [
                'type' => $validated['type'],
                'customer_phone' => $validated['customer_phone'],
            ];
            if (!empty($validated['customer_name'])) {
                $updates['customer_name'] = $validated['customer_name'];
            }
            if (!empty($validated['vehicle_model'])) {
                $updates['vehicle_model'] = $validated['vehicle_model'];
            }
            if (!empty($validated['customer_nopol'])) {
                $updates['customer_nopol'] = $validated['customer_nopol'];
            }
            if (!empty($validated['notes'])) {
                $time = date('d/m H:i');
                $updates['notes'] = ($existingLead->notes ? $existingLead->notes . "\n" : "") . "[Form {$validated['type']} {$time} WIB]: " . $validated['notes'];
            }
            if (!empty($validated['data'])) {
                $updates['data'] = array_merge($existingLead->data ?? [], $validated['data']);
            }
            $existingLead->update($updates);

            return response()->json([
                'success' => true,
                'data' => $existingLead,
                'message' => 'Data prospek berhasil diperbarui dengan informasi terbaru.'
            ], 200);
        }

        $lead = Lead::create($validated);

        return response()->json([
            'success' => true,
            'data' => $lead,
            'message' => 'Permintaan layanan / prospek berhasil disimpan ke database.'
        ], 201);
    }

    /**
     * Retrieve leads list for portal with filtering, search, and type metrics
     */
    public function getLeads(Request $request)
    {
        $type = $request->query('type');
        $status = $request->query('status');
        $search = $request->query('search');

        $query = Lead::orderBy('created_at', 'desc');

        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('vehicle_model', 'like', "%{$search}%")
                  ->orWhere('customer_nopol', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhere('session_id', 'like', "%{$search}%");
            });
        }

        // Aggregate counts by type for tabs/badges
        $typeCounts = [
            'all' => Lead::count(),
            'booking' => Lead::where('type', 'booking')->count(),
            'test_drive' => Lead::where('type', 'test_drive')->count(),
            'prospect' => Lead::where('type', 'prospect')->count(),
            'emergency' => Lead::where('type', 'emergency')->count(),
            'sparepart' => Lead::where('type', 'sparepart')->count(),
            'complaint' => Lead::where('type', 'complaint')->count()
        ];

        // Aggregate new leads counts for sidebar / badges
        $newCounts = [
            'all' => Lead::where('status', 'new')->count(),
            'booking' => Lead::where('status', 'new')->where('type', 'booking')->count(),
            'test_drive' => Lead::where('status', 'new')->where('type', 'test_drive')->count(),
            'prospect' => Lead::where('status', 'new')->where('type', 'prospect')->count(),
            'emergency' => Lead::where('status', 'new')->where('type', 'emergency')->count(),
            'sparepart' => Lead::where('status', 'new')->where('type', 'sparepart')->count(),
            'complaint' => Lead::where('status', 'new')->where('type', 'complaint')->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $query->paginate(25),
            'type_counts' => $typeCounts,
            'new_counts' => $newCounts
        ]);
    }

    /**
     * Retrieve aggregated lead counts (by status and type) for navigation badges
     */
    public function getLeadCounts(Request $request)
    {
        $newCounts = [
            'all' => Lead::where('status', 'new')->count(),
            'booking' => Lead::where('status', 'new')->where('type', 'booking')->count(),
            'test_drive' => Lead::where('status', 'new')->where('type', 'test_drive')->count(),
            'prospect' => Lead::where('status', 'new')->where('type', 'prospect')->count(),
            'emergency' => Lead::where('status', 'new')->where('type', 'emergency')->count(),
            'sparepart' => Lead::where('status', 'new')->where('type', 'sparepart')->count(),
            'complaint' => Lead::where('status', 'new')->where('type', 'complaint')->count()
        ];

        $totalCounts = [
            'all' => Lead::count(),
            'booking' => Lead::where('type', 'booking')->count(),
            'test_drive' => Lead::where('type', 'test_drive')->count(),
            'prospect' => Lead::where('type', 'prospect')->count(),
            'emergency' => Lead::where('type', 'emergency')->count(),
            'sparepart' => Lead::where('type', 'sparepart')->count(),
            'complaint' => Lead::where('type', 'complaint')->count()
        ];

        return response()->json([
            'success' => true,
            'new_counts' => $newCounts,
            'total_counts' => $totalCounts
        ]);
    }

    /**
     * Update lead status, type, and follow-up notes
     */
    public function updateLead(Request $request, $id)
    {
        $lead = Lead::find($id);
        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Data lead tidak ditemukan.'
            ], 404);
        }

        $data = $request->json()->all() ?: $request->all();
        $status = $data['status'] ?? $request->input('status');
        $type = $data['type'] ?? $request->input('type');
        $notes = array_key_exists('notes', $data) ? $data['notes'] : $request->input('notes');

        if ($status !== null) {
            if (!in_array($status, ['new', 'contacted', 'in_progress', 'completed', 'cancelled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Status tidak valid. Pilihan: new, contacted, in_progress, completed, cancelled.'
                ], 422);
            }
            $lead->status = $status;
        }

        if ($type !== null) {
            $allowedTypes = ['booking', 'test_drive', 'prospect', 'emergency', 'sparepart', 'aksesoris', 'complaint', 'question'];
            if (!in_array($type, $allowedTypes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tipe lead tidak valid. Pilihan: ' . implode(', ', $allowedTypes)
                ], 422);
            }
            $lead->type = $type;
        }

        if ($notes !== null) {
            $lead->notes = $notes;
        }
        $lead->save();

        return response()->json([
            'success' => true,
            'data' => $lead,
            'message' => 'Data lead berhasil diperbarui.'
        ]);
    }

    /**
     * Generate 3 contextual quick replies based on current page content
     * Using google/gemini-3.1-flash-lite (fast & cost-efficient)
     */
    public function generateQuickReplies(Request $request)
    {
        $pagePath = $request->input('path', '/');
        $pageTitle = $request->input('title', 'PT Sun Star Prima Motor Margahayu');
        $pageContext = $request->input('context', '');

        // Static fallback per rute jika AI timeout atau offline
        $fallback = [
            'Promo mobil baru',
            'Simulasi kredit angsuran',
            'Booking jadwal bengkel'
        ];

        $normalizedPath = strtolower(trim((string) $pagePath, '/'));
        if (str_contains($normalizedPath, 'promo')) {
            $fallback = ['Promo bunga ringan', 'Diskon mobil baru', 'Klaim kupon promo'];
        } elseif (str_contains($normalizedPath, 'booking') || str_contains($normalizedPath, 'bengkel') || str_contains($normalizedPath, 'servis') || str_contains($normalizedPath, 'facilities') || str_contains($normalizedPath, 'fasilitas')) {
            $fallback = ['Booking servis berkala', 'Biaya tune up', 'Layanan bengkel resmi'];
        } elseif (str_contains($normalizedPath, 'service-on-road') || str_contains($normalizedPath, 'emergency')) {
            $fallback = ['Bantuan darurat mogok', 'Panggil derek resmi', 'Kirim lokasi GPS'];
        } elseif (str_contains($normalizedPath, 'accessori') || str_contains($normalizedPath, 'aksesoris') || str_contains($normalizedPath, 'sparepart')) {
            $fallback = ['Katalog aksesoris resmi', 'Harga suku cadang', 'Pasang variasi mobil'];
        } elseif (str_contains($normalizedPath, 'vehicle') || str_contains($normalizedPath, 'mobil')) {
            $fallback = ['Harga OTR terbaru', 'Simulasi DP murah', 'Jadwal test drive'];
        } elseif (str_contains($normalizedPath, 'sales')) {
            $fallback = ['Kontak wiraniaga resmi', 'Rekomendasi sales terbaik', 'Konsultasi mobil baru'];
        } elseif (str_contains($normalizedPath, 'news') || str_contains($normalizedPath, 'article')) {
            $fallback = ['Rangkuman berita ini', 'Promo terkait artikel', 'Tanya seputar topik'];
        }

        // Cache 1 jam per rute unik untuk menghemat token dan respon secepat kilat
        $cacheKey = 'qr_page_' . md5($pagePath . '_' . substr($pageTitle, 0, 50) . '_' . substr($pageContext, 0, 50));
        $cached = \Illuminate\Support\Facades\Cache::get($cacheKey);
        if (is_array($cached) && count($cached) === 3) {
            return response()->json([
                'success' => true,
                'source' => 'cache',
                'quick_replies' => $cached
            ]);
        }

        $apiKey = env('OPENROUTER_API_KEY');
        if (empty($apiKey) || trim($apiKey) === 'your_openrouter_api_key_here') {
            return response()->json([
                'success' => true,
                'source' => 'fallback',
                'quick_replies' => $fallback
            ]);
        }

        $model = 'google/gemini-3.1-flash-lite';
        $siteUrl = env('OPENROUTER_SITE_URL', 'http://localhost:5173');
        $appName = env('OPENROUTER_APP_NAME', 'Sunny AI - PT Sun Star Prima Motor Margahayu');

        $systemPrompt = "Kamu adalah generator opsi pertanyaan cepat untuk website dealer Mitsubishi Margahayu Bekasi Timur.\n" .
            "Tugas: buat tepat 3 opsi pertanyaan cepat yang 100% membahas isi topik halaman yang sedang dilihat pengunjung.\n" .
            "Panjang per opsi: WAJIB 3 sampai 4 KATA SAJA.\n" .
            "Format balasan: HANYA JSON array string valid [\"opsi 1\", \"opsi 2\", \"opsi 3\"] tanpa pembungkus markdown.";

        $userContent = "Topik Halaman Web:\n" .
            "- URL: {$pagePath}\n" .
            "- Judul Halaman: {$pageTitle}\n" .
            "- Isi/Deskripsi Halaman: " . substr((string) $pageContext, 0, 400);

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'HTTP-Referer' => $siteUrl,
                'X-Title' => $appName,
                'Content-Type' => 'application/json'
            ])->timeout(8)->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userContent]
                ],
                'temperature' => 0.3,
                'max_tokens' => 120
            ]);

            if ($response->successful()) {
                $raw = $response->json()['choices'][0]['message']['content'] ?? '';
                $clean = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($raw));
                $decoded = json_decode($clean, true);

                if (is_array($decoded) && count($decoded) >= 3) {
                    $finalReplies = [];
                    foreach (array_slice($decoded, 0, 3) as $item) {
                        $str = trim(strip_tags((string) $item));
                        $words = preg_split('/\s+/', $str);
                        if (count($words) > 4) {
                            $str = implode(' ', array_slice($words, 0, 4));
                        }
                        $finalReplies[] = $str;
                    }

                    if (count($finalReplies) === 3) {
                        \Illuminate\Support\Facades\Cache::put($cacheKey, $finalReplies, now()->addHours(1));
                        return response()->json([
                            'success' => true,
                            'source' => 'gemini-3.1-flash-lite',
                            'quick_replies' => $finalReplies
                        ]);
                    }
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Quick replies generation failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'source' => 'fallback',
            'quick_replies' => $fallback
        ]);
    }

    /**
     * Check if client IP / Device ID is currently blocked
     */
    public function checkBlockStatus(Request $request)
    {
        $ip = $this->getClientIpAddress($request);
        $deviceId = $request->input('device_id');
        $sessionId = $request->input('session_id');

        $blockRecord = $this->getActiveBlockRecord($ip, $deviceId, $sessionId);

        if ($blockRecord && $blockRecord->blocked_until && $blockRecord->blocked_until->isFuture()) {
            return response()->json([
                'success' => true,
                'is_blocked' => true,
                'blocked_until' => $blockRecord->blocked_until->toIso8601String(),
                'remaining_seconds' => max(0, $blockRecord->blocked_until->diffInSeconds(now())),
                'block_count' => $blockRecord->block_count,
                'duration_minutes' => $blockRecord->block_duration_minutes,
                'message' => 'Layanan chat interaktif sedang dibatasi sementara karena terdeteksi beberapa pesan di luar konteks pelayanan dealer.'
            ]);
        }

        return response()->json([
            'success' => true,
            'is_blocked' => false,
            'out_of_context_count' => $blockRecord ? $blockRecord->out_of_context_count : 0,
            'block_count' => $blockRecord ? $blockRecord->block_count : 0
        ]);
    }

    /**
     * Helper to find or resolve active block record by IP, deviceId, or sessionId
     */
    protected function getActiveBlockRecord(string $ip, ?string $deviceId = null, ?string $sessionId = null): ?ChatBlock
    {
        $query = ChatBlock::query();

        $query->where(function ($q) use ($ip, $deviceId, $sessionId) {
            $q->where('ip_address', $ip);
            if (!empty($deviceId)) {
                $q->orWhere('device_id', $deviceId);
            }
            if (!empty($sessionId)) {
                $q->orWhere('session_id', $sessionId);
            }
        });

        return $query->orderBy('id', 'desc')->first();
    }

    /**
     * Helper get real client IP
     */
    protected function getClientIpAddress(Request $request): string
    {
        $headers = ['CF-Connecting-IP', 'X-Forwarded-For', 'X-Real-IP'];
        foreach ($headers as $h) {
            $val = $request->header($h);
            if (!empty($val)) {
                $parts = explode(',', $val);
                $ip = trim($parts[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        return $request->ip() ?: '127.0.0.1';
    }
}
