<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Otp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    $dbOk = false;
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbOk = true;
    } catch (\Throwable $e) {
        $dbOk = false;
    }

    return response()->json([
        'status' => $dbOk ? 'ok' : 'error',
        'database' => $dbOk ? 'connected' : 'disconnected'
    ], $dbOk ? 200 : 503);
});

/*
|--------------------------------------------------------------------------
| Portal Dashboard Operational Statistics
|--------------------------------------------------------------------------
*/
Route::get('/dashboard/stats', function () {
    // 1. Total Chat Sunny (ambil semua data chat session)
    $totalChatSessions = \Illuminate\Support\Facades\DB::table('chat_sessions')->count();
    $activeChatSessions = \Illuminate\Support\Facades\DB::table('chat_sessions')->where('status', 'active')->count();

    // 2. Semua Leads (semua data leads yang diterima semua status)
    $totalLeads = \Illuminate\Support\Facades\DB::table('leads')->count();
    $statusCounts = \Illuminate\Support\Facades\DB::table('leads')
        ->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
        ->groupBy('status')
        ->pluck('count', 'status')
        ->toArray();

    // 3. Total View Artikel (ambil total baris log kunjungan riil dari tabel article_views)
    $totalArticles = \Illuminate\Support\Facades\DB::table('articles')->count();
    $publishedArticles = \Illuminate\Support\Facades\DB::table('articles')->where('status', 'published')->count();
    $totalArticleViews = (int) \Illuminate\Support\Facades\DB::table('article_views')->count();

    // 4. Waktu Respon Sunny (ambil data 50 chat message terakhir, lalu rata2 dari semua selisih waktu antar chat)
    $messages = \Illuminate\Support\Facades\DB::table('chat_messages')
        ->orderBy('id', 'desc')
        ->limit(50)
        ->get(['id', 'session_id', 'sender_type', 'created_at'])
        ->reverse()
        ->values();

    $diffs = [];
    for ($i = 0; $i < count($messages) - 1; $i++) {
        $curr = $messages[$i];
        $next = $messages[$i + 1];

        // Selisih waktu pesan customer ke balasan Sunny AI dalam sesi yang sama
        if ($curr->session_id === $next->session_id && $curr->sender_type === 'user' && in_array($next->sender_type, ['ai', 'bot', 'assistant'])) {
            $t1 = strtotime($curr->created_at);
            $t2 = strtotime($next->created_at);
            $diff = $t2 - $t1;
            if ($diff >= 0 && $diff <= 180) {
                // Jika balasan pada detik yang sama (< 1 detik), hitung ~0.8 detik
                $diffs[] = $diff === 0 ? 0.8 : (float) $diff;
            }
        }
    }

    $avgResponseTime = count($diffs) > 0 
        ? round(array_sum($diffs) / count($diffs), 1) 
        : 1.5;

    return response()->json([
        'success' => true,
        'data' => [
            'total_chat_sessions' => $totalChatSessions,
            'active_chat_sessions' => $activeChatSessions,
            'total_leads' => $totalLeads,
            'status_leads' => $statusCounts,
            'total_article_views' => $totalArticleViews,
            'total_articles' => $totalArticles,
            'published_articles' => $publishedArticles,
            'avg_response_time' => $avgResponseTime,
            'evaluated_messages' => count($messages),
            'paired_replies' => count($diffs)
        ]
    ]);
});

// 1. Auth: Login
Route::post('/auth/login', function (Request $request) {
    $data = $request->json()->all() ?: $request->all();
    $identifier = trim((string) ($data['identifier'] ?? $request->input('identifier', '')));
    $password = (string) ($data['password'] ?? $request->input('password', ''));

    if (!$identifier || !$password) {
        return response()->json([
            'success' => false,
            'message' => 'Silakan masukkan Email / No. Telepon / NIK dan kata sandi Anda.'
        ], 422);
    }

    // Cari pengguna di MySQL berdasarkan Email, No. Telepon, atau NIK
    $user = User::where('email', $identifier)
        ->orWhere('phone', $identifier)
        ->orWhere('nik', $identifier)
        ->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => "Pengguna dengan identitas '{$identifier}' tidak terdaftar di database MySQL."
        ], 404);
    }

    if ($user->status !== 'active') {
        return response()->json([
            'success' => false,
            'message' => 'Akun pengguna ini berstatus non-aktif di database.'
        ], 403);
    }

    // Mendukung Bcrypt hash, Plaintext (langsung ketik di phpMyAdmin), MD5, SHA1, dan MySQL PASSWORD()
    $isValidPassword = false;
    if (Hash::check($password, $user->password)) {
        $isValidPassword = true;
    } elseif ($user->password === $password || trim($user->password) === trim($password)) {
        // Plaintext match dari phpMyAdmin
        $isValidPassword = true;
        $user->password = Hash::make($password);
        $user->save();
    } elseif (md5($password) === strtolower($user->password)) {
        // MD5 function match dari dropdown phpMyAdmin
        $isValidPassword = true;
        $user->password = Hash::make($password);
        $user->save();
    } elseif (sha1($password) === strtolower($user->password)) {
        // SHA1 function match dari dropdown phpMyAdmin
        $isValidPassword = true;
        $user->password = Hash::make($password);
        $user->save();
    } elseif (strtoupper($user->password) === '*' . strtoupper(sha1(sha1($password, true)))) {
        // MySQL PASSWORD() function match dari dropdown phpMyAdmin
        $isValidPassword = true;
        $user->password = Hash::make($password);
        $user->save();
    }

    if (!$isValidPassword) {
        return response()->json([
            'success' => false,
            'message' => 'Kata sandi tidak sesuai dengan data di sistem database.'
        ], 401);
    }

    // Update waktu login terakhir di database
    $user->last_login_at = now();
    $user->last_login_ip = $request->ip();
    $user->save();

    return response()->json([
        'success' => true,
        'user' => [
            'id' => (string) $user->id,
            'nik' => $user->nik,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'position' => $user->position,
            'role' => $user->role,
            'department' => $user->department,
            'status' => $user->status,
            'avatar' => $user->avatar ?: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
            'lastLogin' => 'Baru saja'
        ],
        'message' => 'Login berhasil'
    ]);
});

// 2. Auth: Request OTP Reset Password
Route::post('/auth/request-otp', function (Request $request) {
    $data = $request->json()->all() ?: $request->all();
    $identifier = trim((string) ($data['identifier'] ?? $request->input('identifier', '')));

    if (!$identifier) {
        return response()->json([
            'success' => false,
            'message' => 'Email, Nomor Telepon, atau NIK wajib diisi.'
        ], 422);
    }

    $user = User::where('email', $identifier)
        ->orWhere('phone', $identifier)
        ->orWhere('nik', $identifier)
        ->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Pengguna tidak ditemukan di database.'
        ], 404);
    }

    // Generate 6-digit random code
    $otpCode = (string) random_int(100000, 999999);
    $expiresAt = now()->addMinutes(5);

    // Simpan ke database MySQL tabel otps
    $otp = Otp::create([
        'user_id' => $user->id,
        'identifier' => $user->email,
        'otp_code' => $otpCode,
        'type' => 'reset_password',
        'expires_at' => $expiresAt,
        'is_used' => false,
        'ip_address' => $request->ip()
    ]);

    // Kirim email kode OTP ke email asli pengguna via SMTP Hostinger
    $emailSent = false;
    try {
        Mail::html("
            <div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 14px; background-color: #ffffff;'>
                <div style='text-align: center; margin-bottom: 24px;'>
                    <h2 style='color: #0f172a; margin: 0 0 6px 0; font-size: 20px; font-weight: 800;'>MITSUBISHI MOTORS</h2>
                    <span style='color: #b91c1c; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;'>PT SUN STAR MOTOR MARGAHAYU</span>
                </div>
                
                <div style='background-color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px; border: 1px solid #f1f5f9;'>
                    <h3 style='color: #1e293b; font-size: 15px; margin: 0 0 6px 0;'>Verifikasi Reset Kata Sandi Akun</h3>
                    <p style='color: #475569; font-size: 13px; line-height: 1.5; margin: 0;'>
                        Halo <strong>{$user->name}</strong>,<br>
                        Berikut adalah kode OTP resmi untuk memverifikasi akun Portal Sunny Anda:
                    </p>
                </div>

                <div style='text-align: center; margin: 24px 0; padding: 20px; background: #fffbeb; border: 2px dashed #fde68a; border-radius: 12px;'>
                    <div style='font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;'>KODE VERIFIKASI OTP (6-DIGIT)</div>
                    <div style='font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #d97706;'>{$otpCode}</div>
                </div>

                <p style='color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 14px 0;'>
                    Kode verifikasi ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapa pun demi keamanan akun internal dealer Anda.
                </p>

                <p style='color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;'>
                    Jika Anda tidak merasa mengajukan reset sandi, abaikan email ini atau segera hubungi Superadmin.
                </p>

                <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;' />
                <p style='color: #94a3b8; font-size: 11px; text-align: center; margin: 0;'>
                    © " . date('Y') . " PT Sun Star Motor Margahayu • Sistem Portal Resmi
                </p>
            </div>
        ", function ($message) use ($user) {
            $message->to($user->email, $user->name)
                    ->subject("Kode OTP Reset Kata Sandi - Portal Sunny Margahayu");
        });
        $emailSent = true;
    } catch (\Throwable $mailErr) {
        Log::error("Gagal mengirim email OTP ke {$user->email}: " . $mailErr->getMessage());
    }

    return response()->json([
        'success' => true,
        'emailSent' => $emailSent,
        'user' => [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'nik' => $user->nik
        ],
        'expiresAt' => $expiresAt->timestamp * 1000,
        'message' => $emailSent
            ? "Kode OTP telah berhasil dikirim ke email {$user->email}."
            : "Kode OTP berhasil diproses. Silakan periksa email {$user->email}."
    ]);
});

// 3. Auth: Verify OTP & Change Password
Route::post('/auth/verify-otp', function (Request $request) {
    $data = $request->json()->all() ?: $request->all();
    $identifier = trim((string) ($data['identifier'] ?? $request->input('identifier', '')));
    $otpCode = trim((string) ($data['otp_code'] ?? $request->input('otp_code', '')));
    $newPassword = (string) ($data['new_password'] ?? $request->input('new_password', ''));

    if (!$identifier || !$otpCode || !$newPassword) {
        return response()->json([
            'success' => false,
            'message' => 'Identitas, kode OTP, dan kata sandi baru wajib diisi.'
        ], 422);
    }

    if (strlen($newPassword) < 6) {
        return response()->json([
            'success' => false,
            'message' => 'Kata sandi baru minimal 6 karakter.'
        ], 422);
    }

    $user = User::where('email', $identifier)
        ->orWhere('phone', $identifier)
        ->orWhere('nik', $identifier)
        ->first();

    if (!$user) {
        return response()->json(['success' => false, 'message' => 'Pengguna tidak ditemukan.'], 404);
    }

    // Cari OTP aktif di database
    $otp = Otp::where('user_id', $user->id)
        ->where('otp_code', $otpCode)
        ->where('is_used', false)
        ->where('expires_at', '>', now())
        ->latest()
        ->first();

    if (!$otp) {
        return response()->json([
            'success' => false,
            'message' => 'Kode OTP tidak valid atau telah kedaluwarsa (berlaku 5 menit).'
        ], 422);
    }

    // Update status OTP & kata sandi pengguna di database MySQL
    $otp->is_used = true;
    $otp->used_at = now();
    $otp->save();

    $user->password = Hash::make($newPassword);
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Kata sandi berhasil diperbarui di database! Silakan masuk dengan kata sandi baru.'
    ]);
});

// 4. Users Resource CRUD (Get All, Create, Update, Delete)
Route::get('/users', function (Request $request) {
    $callerRole = $request->header('X-User-Role') ?: $request->input('caller_role');
    $query = User::orderBy('id', 'asc');

    // Pembatasan akses:
    // - Superadmin: melihat semua pengguna (superadmin, admin, user)
    // - Admin: HANYA BISA melihat list akun user saja
    // - User: tidak memiliki akses
    if ($callerRole === 'admin') {
        $query->where('role', 'user');
    } elseif ($callerRole === 'user') {
        return response()->json([
            'success' => false,
            'message' => 'Akun User tidak memiliki akses ke data manajemen pengguna.',
            'data' => []
        ], 403);
    } elseif ($callerRole && $callerRole !== 'superadmin') {
        $query->where('role', 'user');
    }

    $users = $query->get()->map(function ($u) {
        return [
            'id' => (string) $u->id,
            'nik' => $u->nik,
            'name' => $u->name,
            'email' => $u->email,
            'phone' => $u->phone,
            'position' => $u->position,
            'role' => $u->role,
            'department' => $u->department,
            'status' => $u->status,
            'avatar' => $u->avatar ?: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
            'lastLogin' => $u->last_login_at ? $u->last_login_at->diffForHumans() : 'Belum pernah login'
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $users
    ]);
});

Route::post('/users', function (Request $request) {
    $callerRole = $request->header('X-User-Role') ?: $request->input('caller_role');

    // Role User tidak diizinkan membuat akun
    if ($callerRole === 'user') {
        return response()->json([
            'success' => false,
            'message' => 'Akun User tidak memiliki hak akses untuk menambahkan pengguna.'
        ], 403);
    }

    // Role Admin HANYA BISA membuat role user saja
    if ($callerRole === 'admin' && ($request->input('role') !== 'user')) {
        return response()->json([
            'success' => false,
            'message' => 'Admin hanya memiliki izin untuk membuat akun dengan peran User.'
        ], 403);
    }

    $input = array_map(function ($val) {
        return is_string($val) ? trim($val) : $val;
    }, $request->all());

    if ($callerRole === 'admin') {
        $input['role'] = 'user';
    }

    if (empty($input['phone'])) {
        $input['phone'] = null;
    }
    if (empty($input['nik'])) {
        $input['nik'] = null;
    }

    $validator = \Illuminate\Support\Facades\Validator::make($input, [
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users,email',
        'phone' => 'nullable|string|max:30|unique:users,phone',
        'nik' => 'nullable|string|max:50|unique:users,nik',
        'position' => 'required|string|max:100',
        'role' => 'required|in:superadmin,admin,user',
        'department' => 'nullable|string|max:100',
        'password' => 'required|string|min:6',
        'status' => 'nullable|in:active,inactive,suspended'
    ], [
        'name.required' => 'Nama lengkap wajib diisi.',
        'email.required' => 'Alamat email wajib diisi.',
        'email.email' => 'Format alamat email tidak valid.',
        'email.unique' => 'Alamat email sudah terdaftar pada pengguna lain.',
        'phone.unique' => 'Nomor WhatsApp / telepon sudah terdaftar pada pengguna lain.',
        'nik.unique' => 'NIK Karyawan sudah terdaftar pada pengguna lain.',
        'position.required' => 'Jabatan pengguna wajib diisi.',
        'password.required' => 'Password sementara wajib diisi.',
        'password.min' => 'Password minimal harus 6 karakter.'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        $validated = $validator->validated();
        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Pengguna berhasil ditambahkan ke database MySQL.'
        ], 201);
    } catch (\Illuminate\Database\QueryException $e) {
        $errorCode = $e->errorInfo[1] ?? null;
        $errorMsg = $e->getMessage();
        $msg = 'Data yang Anda masukkan sudah terdaftar pada pengguna lain.';
        $errors = [];

        if ($errorCode === 1062 || str_contains($errorMsg, 'Duplicate entry')) {
            if (str_contains($errorMsg, 'users_phone_unique')) {
                $msg = 'Nomor WhatsApp / telepon sudah terdaftar pada pengguna lain.';
                $errors['phone'] = [$msg];
            } elseif (str_contains($errorMsg, 'users_email_unique')) {
                $msg = 'Alamat email sudah terdaftar pada pengguna lain.';
                $errors['email'] = [$msg];
            } elseif (str_contains($errorMsg, 'users_nik_unique')) {
                $msg = 'NIK Karyawan sudah terdaftar pada pengguna lain.';
                $errors['nik'] = [$msg];
            }
        }

        return response()->json([
            'success' => false,
            'message' => $msg,
            'errors' => $errors
        ], 422);
    }
});

Route::put('/users/{id}', function (Request $request, $id) {
    $user = User::find($id);
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Pengguna tidak ditemukan di database.'
        ], 404);
    }

    $callerRole = $request->header('X-User-Role') ?: $request->input('caller_role');

    // Role User tidak diizinkan mengubah akun
    if ($callerRole === 'user') {
        return response()->json([
            'success' => false,
            'message' => 'Akun User tidak memiliki hak akses untuk mengedit data pengguna.'
        ], 403);
    }

    // Role Admin HANYA BISA mengedit akun ber-role user, dan tidak bisa mengubah role menjadi selain user
    if ($callerRole === 'admin') {
        if ($user->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Admin hanya memiliki izin untuk mengelola akun dengan peran User.'
            ], 403);
        }
    }

    $input = array_map(function ($val) {
        return is_string($val) ? trim($val) : $val;
    }, $request->all());

    if ($callerRole === 'admin') {
        $input['role'] = 'user';
    }

    if (array_key_exists('phone', $input) && empty($input['phone'])) {
        $input['phone'] = null;
    }
    if (array_key_exists('nik', $input) && empty($input['nik'])) {
        $input['nik'] = null;
    }

    $validator = \Illuminate\Support\Facades\Validator::make($input, [
        'name' => 'sometimes|required|string|max:255',
        'email' => ['sometimes', 'required', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users', 'email')->ignore($id)],
        'phone' => ['nullable', 'string', 'max:30', \Illuminate\Validation\Rule::unique('users', 'phone')->ignore($id)],
        'nik' => ['nullable', 'string', 'max:50', \Illuminate\Validation\Rule::unique('users', 'nik')->ignore($id)],
        'position' => 'sometimes|required|string|max:100',
        'role' => 'sometimes|required|in:superadmin,admin,user',
        'department' => 'nullable|string|max:100',
        'status' => 'nullable|in:active,inactive,suspended',
        'password' => 'nullable|string|min:6',
        'avatar' => 'nullable|string'
    ], [
        'name.required' => 'Nama lengkap wajib diisi.',
        'email.required' => 'Alamat email wajib diisi.',
        'email.email' => 'Format alamat email tidak valid.',
        'email.unique' => 'Alamat email sudah terdaftar pada pengguna lain.',
        'phone.unique' => 'Nomor WhatsApp / telepon sudah terdaftar pada pengguna lain.',
        'nik.unique' => 'NIK Karyawan sudah terdaftar pada pengguna lain.',
        'position.required' => 'Jabatan pengguna wajib diisi.',
        'password.min' => 'Password minimal harus 6 karakter.'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        $fields = $validator->validated();
        if (!empty($fields['password'])) {
            $fields['password'] = Hash::make($fields['password']);
        } else {
            unset($fields['password']);
        }

        $user->update($fields);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Data pengguna berhasil diperbarui di database.'
        ]);
    } catch (\Illuminate\Database\QueryException $e) {
        $errorCode = $e->errorInfo[1] ?? null;
        $errorMsg = $e->getMessage();
        $msg = 'Gagal memperbarui data pengguna: terjadi konflik data.';
        $errors = [];

        if ($errorCode === 1062 || str_contains($errorMsg, 'Duplicate entry')) {
            if (str_contains($errorMsg, 'users_phone_unique')) {
                $msg = 'Nomor WhatsApp / telepon sudah terdaftar pada pengguna lain.';
                $errors['phone'] = [$msg];
            } elseif (str_contains($errorMsg, 'users_email_unique')) {
                $msg = 'Alamat email sudah terdaftar pada pengguna lain.';
                $errors['email'] = [$msg];
            } elseif (str_contains($errorMsg, 'users_nik_unique')) {
                $msg = 'NIK Karyawan sudah terdaftar pada pengguna lain.';
                $errors['nik'] = [$msg];
            }
        }

        return response()->json([
            'success' => false,
            'message' => $msg,
            'errors' => $errors
        ], 422);
    }
});

Route::delete('/users/{id}', function (Request $request, $id) {
    $user = User::findOrFail($id);
    $callerRole = $request->header('X-User-Role') ?: $request->input('caller_role');

    if ($callerRole === 'user') {
        return response()->json([
            'success' => false,
            'message' => 'Akun User tidak memiliki hak akses untuk menghapus pengguna.'
        ], 403);
    }

    if ($callerRole === 'admin' && $user->role !== 'user') {
        return response()->json([
            'success' => false,
            'message' => 'Admin hanya memiliki izin untuk menghapus akun dengan peran User.'
        ], 403);
    }

    if ($user->role === 'superadmin') {
        return response()->json([
            'success' => false,
            'message' => 'Akun Superadmin Developer dilindungi dan tidak dapat dihapus.'
        ], 403);
    }

    $user->delete();

    return response()->json([
        'success' => true,
        'message' => 'Pengguna berhasil dihapus dari database.'
    ]);
});

/*
|--------------------------------------------------------------------------
| AI Assistant (Sunny) Routes via OpenRouter & Knowledge Engine
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\AiAssistantController;

Route::post('/ai/chat', [AiAssistantController::class, 'chat']);
Route::get('/ai/history', [AiAssistantController::class, 'getHistory']);
Route::post('/ai/session/close', [AiAssistantController::class, 'closeSession']);
Route::get('/ai/sessions', [AiAssistantController::class, 'getSessions']);
Route::match(['get', 'post'], '/ai/customer/sessions', [AiAssistantController::class, 'getCustomerSessions']);
Route::get('/ai/knowledge/{key}', [AiAssistantController::class, 'getKnowledge']);
Route::get('/ai/leads/counts', [AiAssistantController::class, 'getLeadCounts']);
Route::post('/ai/leads', [AiAssistantController::class, 'storeLead']);
Route::get('/ai/leads', [AiAssistantController::class, 'getLeads']);
Route::match(['put', 'patch'], '/ai/leads/{id}', [AiAssistantController::class, 'updateLead']);

/*
|--------------------------------------------------------------------------
| Employee & Sales Management Routes (Struktur, Sales, Nonaktif)
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\EmployeeController;

// 1. Employees (Struktur Organisasi)
Route::get('/employees', [EmployeeController::class, 'getEmployees']);
Route::post('/employees', [EmployeeController::class, 'storeEmployee']);
Route::post('/employees/{id}/replace', [EmployeeController::class, 'replaceEmployee']);
Route::match(['put', 'patch'], '/employees/{id}', [EmployeeController::class, 'updateEmployee']);
Route::patch('/employees/{id}/status', [EmployeeController::class, 'toggleEmployeeStatus']);
Route::delete('/employees/{id}', [EmployeeController::class, 'deleteEmployee']);

// 2. Sales (Wiraniaga menginduk ke SPV)
Route::get('/sales', [EmployeeController::class, 'getSales']);
Route::post('/sales', [EmployeeController::class, 'storeSales']);
Route::match(['put', 'patch'], '/sales/{id}', [EmployeeController::class, 'updateSales']);
Route::patch('/sales/{id}/status', [EmployeeController::class, 'toggleSalesStatus']);
Route::delete('/sales/{id}', [EmployeeController::class, 'deleteSales']);

// 3. Inactive Archive (Employees + Sales)
Route::get('/inactive', [EmployeeController::class, 'getInactiveRecords']);
Route::get('/inactive-records', [EmployeeController::class, 'getInactiveRecords']);

/*
|--------------------------------------------------------------------------
| Articles, Views, Likes, & Comments Management Routes
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\ArticleController;

// 1. Articles Public & Portal
Route::get('/articles', [ArticleController::class, 'index']);
Route::post('/articles', [ArticleController::class, 'store']);
Route::post('/articles/generate-ai', [ArticleController::class, 'generateWithAi']);
Route::get('/articles/comments/all', [ArticleController::class, 'getAllComments']);
Route::patch('/articles/comments/{commentId}/approve', [ArticleController::class, 'approveComment']);
Route::patch('/articles/comments/{commentId}/reject', [ArticleController::class, 'rejectComment']);
Route::delete('/articles/comments/{commentId}', [ArticleController::class, 'deleteComment']);

Route::get('/articles/{idOrSlug}', [ArticleController::class, 'show']);
Route::match(['put', 'patch'], '/articles/{id}', [ArticleController::class, 'update']);
Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
Route::patch('/articles/{id}/status', [ArticleController::class, 'toggleStatus']);

// 2. View Analytics & Tracking
Route::post('/articles/{idOrSlug}/view', [ArticleController::class, 'recordView']);
Route::get('/articles/{idOrSlug}/analytics', [ArticleController::class, 'getViewAnalytics']);

// 3. Likes
Route::post('/articles/{idOrSlug}/like', [ArticleController::class, 'toggleLike']);

// 4. Comments
Route::get('/articles/{idOrSlug}/comments', [ArticleController::class, 'getComments']);
Route::post('/articles/{idOrSlug}/comments', [ArticleController::class, 'storeComment']);

/*
|--------------------------------------------------------------------------
| Newsletter / Email Subscription Routes
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\NewsletterSubscriberController;

Route::post('/newsletter/subscribe', [NewsletterSubscriberController::class, 'subscribe']);
Route::get('/newsletter/subscribers', [NewsletterSubscriberController::class, 'index']);
Route::delete('/newsletter/subscribers/{id}', [NewsletterSubscriberController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| Knowledge Base Management Routes (Price List, Aksesoris, Sparepart, etc.)
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\KnowledgeController;

Route::get('/knowledge/{key}', [KnowledgeController::class, 'show']);
Route::post('/knowledge/{key}', [KnowledgeController::class, 'update']);
Route::match(['put', 'patch'], '/knowledge/{key}', [KnowledgeController::class, 'update']);
Route::post('/knowledge/{key}/reset', [KnowledgeController::class, 'reset']);

/*
|--------------------------------------------------------------------------
| Promo & Event Management Routes
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\PromoController;

Route::get('/promos', [PromoController::class, 'index']);
Route::get('/portal/promos', [PromoController::class, 'portalIndex']);
Route::post('/portal/promos', [PromoController::class, 'store']);
Route::put('/portal/promos/{id}', [PromoController::class, 'update']);
Route::patch('/portal/promos/{id}/toggle-link', [PromoController::class, 'toggleActionLink']);
Route::delete('/portal/promos/{id}', [PromoController::class, 'destroy']);
Route::post('/portal/promos/reorder', [PromoController::class, 'reorder']);
Route::post('/portal/promos/reset', [PromoController::class, 'reset']);




