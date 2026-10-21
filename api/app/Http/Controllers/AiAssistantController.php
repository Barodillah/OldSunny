<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SunnyAiService;
use App\Services\ChatSessionTracker;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\Lead;

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

        if (empty($messages) || !is_array($messages)) {
            return response()->json([
                'success' => false,
                'message' => 'Parameter messages wajib diisi berupa array riwayat percakapan.'
            ], 422);
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

        if ($status) {
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

        return response()->json([
            'success' => true,
            'data' => $query->paginate(25)
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
}
