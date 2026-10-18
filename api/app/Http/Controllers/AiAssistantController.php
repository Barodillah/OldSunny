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

        // Update session telemetry if lead was successfully captured by AI
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
        $validated = $request->validate([
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

        return response()->json([
            'success' => true,
            'data' => $query->paginate(25),
            'type_counts' => $typeCounts
        ]);
    }

    /**
     * Update lead status and follow-up notes
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
        $notes = array_key_exists('notes', $data) ? $data['notes'] : $request->input('notes');

        if (!$status || !in_array($status, ['new', 'contacted', 'in_progress', 'completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Status tidak valid. Pilihan: new, contacted, in_progress, completed, cancelled.'
            ], 422);
        }

        $lead->status = $status;
        if ($notes !== null) {
            $lead->notes = $notes;
        }
        $lead->save();

        return response()->json([
            'success' => true,
            'data' => $lead,
            'message' => 'Status lead berhasil diperbarui.'
        ]);
    }
}
