<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleView;
use App\Models\ArticleLike;
use App\Models\ArticleComment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ArticleController extends Controller
{
    /**
     * Get all articles (with search, category filter, and portal/public status filtering)
     */
    public function index(Request $request)
    {
        $caller = $request->header('X-Caller') ?: $request->input('caller');
        $query = Article::withCount([
            'views',
            'likes',
            'comments as comments_count',
            'approvedComments as approved_comments_count'
        ]);

        // Status filtering: Public only sees published; Portal sees all or filtered
        if ($caller !== 'portal' && !$request->has('all_status')) {
            $query->where('status', 'published');
        } elseif ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Category filter
        if ($request->filled('category') && $request->input('category') !== 'Semua') {
            $query->where('category', $request->input('category'));
        }

        // Search query
        if ($request->filled('q')) {
            $q = trim($request->input('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('summary', 'like', "%{$q}%")
                    ->orWhere('category', 'like', "%{$q}%")
                    ->orWhere('author', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        $articles = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'total' => $articles->count(),
            'data' => $articles
        ]);
    }

    /**
     * Get single article by ID or Slug
     */
    public function show($idOrSlug, Request $request)
    {
        $article = Article::where('id', $idOrSlug)
            ->orWhere('slug', $idOrSlug)
            ->withCount(['views', 'likes', 'approvedComments as approved_comments_count'])
            ->with(['approvedComments' => function ($q) {
                $q->orderBy('created_at', 'desc');
            }])
            ->first();

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan di database.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $article
        ]);
    }

    /**
     * Create new article (Portal)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'category_theme' => 'nullable|in:red,yellow',
            'date' => 'nullable|string',
            'read_time' => 'nullable|string',
            'image_url' => 'nullable|string',
            'summary' => 'required|string',
            'author' => 'nullable|string|max:100',
            'author_role' => 'nullable|string|max:150',
            'is_highlight' => 'nullable|boolean',
            'highlight_badge' => 'nullable|string|max:50',
            'full_content' => 'nullable|string',
            'paragraphs' => 'nullable|array',
            'expert_quote' => 'nullable|string',
            'highlights' => 'nullable|array',
            'tags' => 'nullable|array',
            'status' => 'nullable|in:published,draft,archived'
        ]);

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug ?: 'artikel-' . time();
        $count = 1;
        while (Article::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }
        $validated['slug'] = $slug;

        if (empty($validated['category_theme'])) {
            $validated['category_theme'] = 'red';
        }
        if (empty($validated['status'])) {
            $validated['status'] = 'published';
        }
        if (empty($validated['author'])) {
            $validated['author'] = 'Tim Redaksi Mitsubishi Sun';
        }
        if (empty($validated['author_role'])) {
            $validated['author_role'] = 'Dealer Resmi Sun Star Prima Motor Margahayu';
        }
        if (empty($validated['read_time'])) {
            $wordCount = str_word_count(strip_tags($validated['full_content'] ?? $validated['summary']));
            $minutes = max(1, ceil($wordCount / 180));
            $validated['read_time'] = "{$minutes} mnt baca";
        }
        if (empty($validated['date'])) {
            $validated['date'] = now()->locale('id')->isoFormat('D MMMM Y');
        }

        $article = Article::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil diterbitkan ke database!',
            'data' => $article
        ], 201);
    }

    /**
     * Update article (Portal)
     */
    public function update(Request $request, $id)
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'category_theme' => 'nullable|in:red,yellow',
            'date' => 'nullable|string',
            'read_time' => 'nullable|string',
            'image_url' => 'nullable|string',
            'summary' => 'sometimes|required|string',
            'author' => 'nullable|string|max:100',
            'author_role' => 'nullable|string|max:150',
            'is_highlight' => 'nullable|boolean',
            'highlight_badge' => 'nullable|string|max:50',
            'full_content' => 'nullable|string',
            'paragraphs' => 'nullable|array',
            'expert_quote' => 'nullable|string',
            'highlights' => 'nullable|array',
            'tags' => 'nullable|array',
            'status' => 'nullable|in:published,draft,archived',
            'slug' => 'nullable|string'
        ]);

        if (!empty($validated['title']) && empty($validated['slug']) && $validated['title'] !== $article->title) {
            $baseSlug = Str::slug($validated['title']);
            $slug = $baseSlug;
            $count = 1;
            while (Article::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = "{$baseSlug}-{$count}";
                $count++;
            }
            $validated['slug'] = $slug;
        }

        $article->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil diperbarui.',
            'data' => $article
        ]);
    }

    /**
     * Delete article
     */
    public function destroy($id)
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan.'], 404);
        }

        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil dihapus dari database.'
        ]);
    }

    /**
     * Toggle article status (published, draft, archived)
     */
    public function toggleStatus(Request $request, $id)
    {
        $article = Article::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan.'], 404);
        }

        $newStatus = $request->input('status');
        if (!in_array($newStatus, ['published', 'draft', 'archived'])) {
            $newStatus = $article->status === 'published' ? 'draft' : 'published';
        }

        $article->status = $newStatus;
        $article->save();

        return response()->json([
            'success' => true,
            'status' => $article->status,
            'message' => "Status artikel diubah menjadi {$article->status}."
        ]);
    }

    /**
     * Record detailed article view (IP, device, browser, OS, city, country)
     */
    public function recordView(Request $request, $idOrSlug)
    {
        $article = Article::where('id', $idOrSlug)->orWhere('slug', $idOrSlug)->first();
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan.'], 404);
        }

        $ip = $request->ip() ?: $request->header('X-Forwarded-For') ?: '127.0.0.1';
        if (str_contains($ip, ',')) {
            $ip = trim(explode(',', $ip)[0]);
        }

        $userAgent = $request->userAgent() ?: $request->input('user_agent', '');
        $clientTelemetry = $this->parseUserAgent($userAgent);

        $device = $request->input('device') ?: $clientTelemetry['device'];
        $browser = $request->input('browser') ?: $clientTelemetry['browser'];
        $os = $request->input('os') ?: $clientTelemetry['os'];

        $location = $this->resolveLocation(
            $ip,
            $request->input('city'),
            $request->input('country')
        );

        $sessionId = $request->input('session_id') ?: $request->cookie('sunny_session_id') ?: Str::uuid()->toString();

        // Prevent duplicate views within 10 minutes from same session/IP
        $recentView = ArticleView::where('article_id', $article->id)
            ->where(function ($q) use ($sessionId, $ip) {
                $q->where('session_id', $sessionId)
                  ->orWhere('ip_address', $ip);
            })
            ->where('created_at', '>=', now()->subMinutes(10))
            ->first();

        if (!$recentView) {
            ArticleView::create([
                'article_id' => $article->id,
                'session_id' => $sessionId,
                'ip_address' => $ip,
                'device' => $device,
                'browser' => $browser,
                'os' => $os,
                'city' => $location['city'],
                'country' => $location['country'],
                'user_agent' => $userAgent,
                'viewed_at' => now()
            ]);

            $article->increment('views_count');
        }

        return response()->json([
            'success' => true,
            'views_count' => $article->views_count,
            'details' => [
                'ip' => $ip,
                'device' => $device,
                'browser' => $browser,
                'os' => $os,
                'city' => $location['city'],
                'country' => $location['country']
            ]
        ]);
    }

    /**
     * Toggle like on article
     */
    public function toggleLike(Request $request, $idOrSlug)
    {
        $article = Article::where('id', $idOrSlug)->orWhere('slug', $idOrSlug)->first();
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan.'], 404);
        }

        $ip = $request->ip() ?: '127.0.0.1';
        $sessionId = $request->input('session_id') ?: Str::uuid()->toString();

        $existingLike = ArticleLike::where('article_id', $article->id)
            ->where(function ($q) use ($sessionId, $ip) {
                $q->where('session_id', $sessionId)
                  ->orWhere('ip_address', $ip);
            })
            ->first();

        $isLiked = false;
        if ($existingLike) {
            $existingLike->delete();
            $article->decrement('likes_count');
            $isLiked = false;
        } else {
            ArticleLike::create([
                'article_id' => $article->id,
                'session_id' => $sessionId,
                'ip_address' => $ip,
                'user_agent' => $request->userAgent()
            ]);
            $article->increment('likes_count');
            $isLiked = true;
        }

        return response()->json([
            'success' => true,
            'is_liked' => $isLiked,
            'likes_count' => max(0, $article->likes_count)
        ]);
    }

    /**
     * Get comments for an article
     */
    public function getComments($idOrSlug, Request $request)
    {
        $article = Article::where('id', $idOrSlug)->orWhere('slug', $idOrSlug)->first();
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan.'], 404);
        }

        $caller = $request->header('X-Caller') ?: $request->input('caller');
        $query = ArticleComment::where('article_id', $article->id);

        // Public only sees approved comments
        if ($caller !== 'portal') {
            $query->where('status', 'approved');
        }

        $comments = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'total' => $comments->count(),
            'data' => $comments
        ]);
    }

    /**
     * Submit a new comment
     */
    public function storeComment(Request $request, $idOrSlug)
    {
        $article = Article::where('id', $idOrSlug)->orWhere('slug', $idOrSlug)->first();
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
            'name' => 'nullable|string|max:80',
            'is_anon' => 'nullable|boolean',
            'device' => 'nullable|string|max:50',
            'browser' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100'
        ]);

        $isAnon = (bool) ($validated['is_anon'] ?? false);
        $name = $isAnon || empty($validated['name']) ? 'Anonim' : trim($validated['name']);

        $ip = $request->ip() ?: '127.0.0.1';
        $userAgent = $request->userAgent() ?: '';
        $parsedUa = $this->parseUserAgent($userAgent);
        $location = $this->resolveLocation($ip, $validated['city'] ?? null, $validated['country'] ?? null);

        $device = $validated['device'] ?? $parsedUa['device'];
        $browser = $validated['browser'] ?? $parsedUa['browser'];
        $city = $location['city'];
        $country = $location['country'];

        // If caller is portal or admin, approve directly; else default to pending
        $caller = $request->header('X-Caller') ?: $request->input('caller');
        $status = ($caller === 'portal' || $caller === 'admin') ? 'approved' : 'pending';

        $comment = ArticleComment::create([
            'article_id' => $article->id,
            'name' => $name,
            'is_anon' => $isAnon,
            'comment' => trim($validated['comment']),
            'status' => $status,
            'ip_address' => $ip,
            'device' => $device,
            'browser' => $browser,
            'city' => $city,
            'country' => $country
        ]);

        $article->increment('comments_count');
        if ($status === 'approved') {
            $article->increment('approved_comments_count');
        }

        return response()->json([
            'success' => true,
            'message' => $status === 'approved' ? 'Komentar berhasil dikirim!' : 'Komentar berhasil dikirim dan menunggu moderasi.',
            'data' => $comment
        ], 201);
    }

    /**
     * Portal: Get all comments across all articles for moderation table
     */
    public function getAllComments(Request $request)
    {
        $query = ArticleComment::with('article:id,title,slug,category');

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('article_id') && $request->input('article_id') !== 'all') {
            $query->where('article_id', $request->input('article_id'));
        }

        $comments = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'total' => $comments->count(),
            'data' => $comments
        ]);
    }

    /**
     * Portal: Approve a comment
     */
    public function approveComment($commentId)
    {
        $comment = ArticleComment::find($commentId);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan.'], 404);
        }

        $previousStatus = $comment->status;
        $comment->status = 'approved';
        $comment->save();

        if ($previousStatus !== 'approved') {
            Article::where('id', $comment->article_id)->increment('approved_comments_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Komentar telah disetujui (Approved).',
            'data' => $comment
        ]);
    }

    /**
     * Portal: Reject a comment
     */
    public function rejectComment($commentId)
    {
        $comment = ArticleComment::find($commentId);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan.'], 404);
        }

        $previousStatus = $comment->status;
        $comment->status = 'rejected';
        $comment->save();

        if ($previousStatus === 'approved') {
            Article::where('id', $comment->article_id)->decrement('approved_comments_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Komentar telah ditolak.',
            'data' => $comment
        ]);
    }

    /**
     * Portal: Delete a comment
     */
    public function deleteComment($commentId)
    {
        $comment = ArticleComment::find($commentId);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan.'], 404);
        }

        $articleId = $comment->article_id;
        $wasApproved = ($comment->status === 'approved');
        $comment->delete();

        Article::where('id', $articleId)->decrement('comments_count');
        if ($wasApproved) {
            Article::where('id', $articleId)->decrement('approved_comments_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Komentar telah dihapus.'
        ]);
    }

    /**
     * Portal: Get detailed view analytics for an article (IP, device, browser, OS, city, country)
     */
    public function getViewAnalytics($idOrSlug)
    {
        $article = Article::where('id', $idOrSlug)->orWhere('slug', $idOrSlug)->first();
        if (!$article) {
            return response()->json(['success' => false, 'message' => 'Artikel tidak ditemukan.'], 404);
        }

        $views = ArticleView::where('article_id', $article->id)
            ->orderBy('viewed_at', 'desc')
            ->limit(50)
            ->get();

        $totalViews = ArticleView::where('article_id', $article->id)->count();
        $uniqueIps = ArticleView::where('article_id', $article->id)->distinct('ip_address')->count('ip_address');

        // Summary stats
        $devices = ArticleView::where('article_id', $article->id)
            ->selectRaw('device, count(*) as count')
            ->groupBy('device')
            ->orderByDesc('count')
            ->get();

        $browsers = ArticleView::where('article_id', $article->id)
            ->selectRaw('browser, count(*) as count')
            ->groupBy('browser')
            ->orderByDesc('count')
            ->get();

        $cities = ArticleView::where('article_id', $article->id)
            ->selectRaw('city, country, count(*) as count')
            ->groupBy('city', 'country')
            ->orderByDesc('count')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_views' => max((int) $article->views_count, (int) $totalViews),
                'unique_ips' => max((int) $uniqueIps, 1),
                'device_breakdown' => $devices,
                'browser_breakdown' => $browsers,
                'city_breakdown' => $cities,
                'recent_views' => $views,
            ],
            'article' => [
                'id' => $article->id,
                'title' => $article->title,
                'views_count' => $article->views_count,
                'likes_count' => $article->likes_count
            ]
        ]);
    }

    /**
     * Helper: Parse User Agent into Device, Browser, and OS
     */
    private function parseUserAgent($userAgent)
    {
        if (empty($userAgent)) {
            return ['device' => 'Desktop', 'browser' => 'Chrome', 'os' => 'Windows'];
        }

        // Device
        $device = 'Desktop';
        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', $userAgent)) {
            $device = 'Tablet';
        } elseif (preg_match('/(mobi|phone|iphone|ipod|blackberry|opera mini)/i', $userAgent)) {
            $device = 'Mobile';
        }

        // Browser
        $browser = 'Google Chrome';
        if (preg_match('/Edg/i', $userAgent)) {
            $browser = 'Microsoft Edge';
        } elseif (preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Google Chrome';
        } elseif (preg_match('/Safari/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Firefox/i', $userAgent)) {
            $browser = 'Mozilla Firefox';
        } elseif (preg_match('/Opera|OPR/i', $userAgent)) {
            $browser = 'Opera';
        }

        // OS
        $os = 'Windows 11';
        if (preg_match('/windows nt 10/i', $userAgent)) {
            $os = 'Windows 10/11';
        } elseif (preg_match('/windows/i', $userAgent)) {
            $os = 'Windows';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $os = 'macOS';
        } elseif (preg_match('/android/i', $userAgent)) {
            $os = 'Android';
        } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            $os = 'iOS';
        } elseif (preg_match('/linux/i', $userAgent)) {
            $os = 'Linux';
        }

        return compact('device', 'browser', 'os');
    }

    /**
     * Helper: Resolve City and Country from IP and client data
     */
    private function resolveLocation($ip, $clientCity = null, $clientCountry = null)
    {
        if ($clientCity && $clientCountry) {
            return ['city' => $clientCity, 'country' => $clientCountry];
        }

        if (!$ip || in_array($ip, ['127.0.0.1', '::1']) || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.')) {
            return [
                'city' => $clientCity ?: 'Bekasi',
                'country' => $clientCountry ?: 'Indonesia'
            ];
        }

        try {
            $response = @file_get_contents("http://ip-api.com/json/{$ip}?fields=status,country,city", false, stream_context_create([
                'http' => ['timeout' => 1.2]
            ]));
            if ($response) {
                $data = json_decode($response, true);
                if (($data['status'] ?? '') === 'success') {
                    return [
                        'city' => $data['city'] ?: ($clientCity ?: 'Bekasi'),
                        'country' => $data['country'] ?: ($clientCountry ?: 'Indonesia')
                    ];
                }
            }
        } catch (\Throwable $e) {}

        return [
            'city' => $clientCity ?: 'Bekasi',
            'country' => $clientCountry ?: 'Indonesia'
        ];
    }

    /**
     * Generate full article draft and metadata via OpenRouter AI securely from backend
     */
    public function generateWithAi(Request $request)
    {
        $prompt = trim((string) $request->input('prompt', ''));
        if (empty($prompt)) {
            return response()->json([
                'success' => false,
                'message' => 'Silakan masukkan topik, informasi, atau draf artikel terlebih dahulu.'
            ], 422);
        }

        $apiKey = env('OPENROUTER_API_KEY');
        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'OPENROUTER_API_KEY belum dikonfigurasikan di backend server (.env).'
            ], 500);
        }

        $model = env('OPENROUTER_MODEL', 'google/gemini-3.1-flash-lite');
        $siteUrl = env('OPENROUTER_SITE_URL', 'http://localhost:5173');
        $appName = env('OPENROUTER_APP_NAME', 'Sunny AI - PT Sun Star Prima Motor Margahayu');

        $systemPrompt = "Anda adalah Asisten Redaksi & Public Relations Resmi untuk PT Sun Star Prima Motor Margahayu, dealer resmi 3S (Sales, Service, Sparepart) dan Bodi & Cat Mitsubishi Motors terkemuka di Kota Bekasi / Jawa Barat.
Tugas Anda adalah menulis artikel berita / panduan / promo dealer yang PROFESIONAL, INFORMATIF, MENARIK, dan MENGALIR ALAMI berdasarkan konteks yang diberikan pengguna.

Anda WAJIB memberikan respons HANYA DALAM FORMAT JSON VALID (tanpa teks pengantar apapun di luar JSON).

Gunakan skema JSON persis berikut:
{
  \"title\": \"Headline judul artikel yang memikat, informatif, dan profesional (maksimal 95 karakter)\",
  \"slug\": \"slug-url-ramah-seo-tanpa-spasi-dan-huruf-kecil\",
  \"summary\": \"Ringkasan pengantar 1-2 kalimat (sekitar 140-200 karakter) yang memikat calon konsumen atau pembaca\",
  \"category\": \"PILIH SALAH SATU PERSIS: Rilis Unit Baru | Tips & Perawatan | Edukasi & Keamanan | Standar Layanan | Promo & Program\",
  \"categoryTheme\": \"PILIH: red (untuk rilis unit baru / promo sporty) atau yellow (untuk tips, edukasi, standar layanan)\",
  \"status\": \"published\",
  \"isHighlight\": true,
  \"highlightBadge\": \"HIGHLIGHT UTAMA (atau TOP STORY / TIPS TERBAIK / PROMO SPESIAL)\",
  \"fullContent\": \"Konten lengkap artikel editorial dalam format Markdown yang kaya, variatif, dan dinamis.\",
  \"highlights\": [
    \"Poin sorotan kunci 1\",
    \"Poin sorotan kunci 2\",
    \"Poin sorotan kunci 3\",
    \"Poin sorotan kunci 4\"
  ],
  \"tags\": [
    \"Mitsubishi Motors\",
    \"Sun Margahayu\",
    \"Tag topik spesifik 1\",
    \"Tag topik spesifik 2\",
    \"Tag topik spesifik 3\"
  ],
  \"recommendedPresetIndex\": 0,
  \"readTime\": \"3 mnt baca\"
}

ATURAN KHUSUS UNTUK 'fullContent' (WAJIB DIIKUTI DENGAN TELITI):
1. PANJANG ARTIKEL MENYESUAIKAN DENGAN KONTEKS:
   - Jika konteks yang diberikan sedikit atau ringkas (misal 1-2 kalimat ringkas): Buat artikel yang padat, to-the-point, dan proporsional (cukup 2-3 paragraf ringkas, jangan dipaksakan bertele-tele atau mengulang kata-kata yang sama).
   - Jika konteks yang diberikan panjang, detail, atau sarat data/poin: Buat artikel yang mendalam, komprehensif, kaya penjelasan detail teknis, dan berstruktur rapi dengan banyak sub-bagian.
2. VARIASI FORMAT MARKDOWN YANG KAYA DAN TIDAK MONOTON (HANYA GUNAKAN JIKA DIBUTUHKAN SESUAI KONTEKS):
   - Pisahkan setiap blok (paragraf, subtitle, list, kutipan, tabel) dengan DUA KALI ENTER (\\n\\n).
   - Gunakan Subtitle (## atau ###) untuk membagi bagian artikel jika artikel memiliki beberapa subtopik pembicaraan.
   - Gunakan penekanan **tebal** pada nama produk, tipe varian, harga, angka persentase, atau garansi, dan *miring* untuk istilah teknis otomotif asing.
   - Gunakan Bullet List (- atau *) untuk daftar keunggulan, fasilitas, atau syarat promo yang mudah dibaca per poin.
   - Gunakan Numbered List (1. 2. 3.) jika menjelaskan tips langkah demi langkah atau prosedur servis yang berurutan.
   - Gunakan Kutipan Editorial (> \\\"Pernyataan bermakna...\\\" — Nama Tokoh, Jabatan di Sun Star Prima Motor Margahayu) untuk memperkuat kredibilitas informasi.
   - Gunakan Tabel Markdown (| Kolom 1 | Kolom 2 |\\n| --- | --- |\\n| Data 1 | Data 2 |) JIKA dan HANYA JIKA topik membutuhkan perbandingan data (misalnya: rincian paket promo servis, tabel spesifikasi mesin/dimensi/varian, atau perbandingan tipe). JANGAN memaksakan tabel jika konteks artikel murni tips umum atau narasi singkat.
   - Jangan monoton: variasikan susunan format agar pembaca menikmati ritme membaca seperti di portal majalah otomotif terkemuka.

Pedoman Tambahan:
- Nilai category WAJIB salah satu dari: 'Rilis Unit Baru', 'Tips & Perawatan', 'Edukasi & Keamanan', 'Standar Layanan', 'Promo & Program'.
- Nilai recommendedPresetIndex pilih angka 0 (Emergency), 1 (Destinator/Rilis), 2 (Interior Xforce), 3 (Tampilan Dealer), 4 (Playground/Fasilitas).
- Isi artikel harus mencerminkan standar dealer resmi Mitsubishi Sun Star Prima Motor Margahayu.";

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'HTTP-Referer'  => $siteUrl,
                'X-Title'       => $appName,
                'Content-Type'  => 'application/json',
            ])->timeout(60)->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Konteks/Informasi Bahan Artikel:\n" . $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens'  => 2800,
            ]);

            if (!$response->successful()) {
                $err = $response->json();
                $msg = $err['error']['message'] ?? ('OpenRouter status: ' . $response->status());
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menghubungi OpenRouter AI dari backend: ' . $msg
                ], $response->status() >= 400 && $response->status() < 600 ? $response->status() : 500);
            }

            $raw = $response->json('choices.0.message.content');
            if (empty($raw)) {
                return response()->json([
                    'success' => false,
                    'message' => 'AI tidak mengembalikan konten teks.'
                ], 500);
            }

            // Strip markdown code fences if wrapped
            $jsonStr = trim($raw);
            if (str_starts_with($jsonStr, '```json')) {
                $jsonStr = preg_replace('/^```json\s*/i', '', $jsonStr);
                $jsonStr = preg_replace('/```\s*$/i', '', $jsonStr);
            } elseif (str_starts_with($jsonStr, '```')) {
                $jsonStr = preg_replace('/^```\s*/i', '', $jsonStr);
                $jsonStr = preg_replace('/```\s*$/i', '', $jsonStr);
            }
            $jsonStr = trim($jsonStr);

            $parsed = json_decode($jsonStr, true);
            if (!is_array($parsed)) {
                if (preg_match('/\{.*\}/s', $raw, $m)) {
                    $parsed = json_decode($m[0], true);
                }
            }

            if (!is_array($parsed)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Format respons dari OpenRouter AI tidak valid JSON.',
                    'raw'     => $raw
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data'    => $parsed
            ]);

        } catch (\Throwable $e) {
            Log::error('AI Article Generation Exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses generate artikel: ' . $e->getMessage()
            ], 500);
        }
    }
}
