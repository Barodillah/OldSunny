<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Otp;
use Illuminate\Support\Facades\Hash;

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

    return response()->json([
        'success' => true,
        'otpCode' => $otpCode,
        'user' => [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'nik' => $user->nik
        ],
        'expiresAt' => $expiresAt->timestamp * 1000,
        'message' => "Kode OTP berhasil dibuat untuk {$user->name}."
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

    // Jika peran yang meminta bukan superadmin (misal admin atau staf), jangan tampilkan akun superadmin
    if ($callerRole && $callerRole !== 'superadmin') {
        $query->where('role', '!=', 'superadmin');
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
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'phone' => 'nullable|string|max:30',
        'nik' => 'nullable|string|max:50|unique:users,nik',
        'position' => 'required|string|max:100',
        'role' => 'required|in:superadmin,admin,user',
        'department' => 'nullable|string|max:100',
        'password' => 'required|string|min:6',
        'status' => 'nullable|in:active,inactive'
    ]);

    $validated['password'] = Hash::make($validated['password']);
    $user = User::create($validated);

    return response()->json([
        'success' => true,
        'data' => $user,
        'message' => 'Pengguna berhasil ditambahkan ke database MySQL.'
    ], 201);
});

Route::put('/users/{id}', function (Request $request, $id) {
    $user = User::findOrFail($id);

    $fields = $request->only([
        'name', 'email', 'phone', 'nik', 'position', 'role', 'department', 'status', 'avatar'
    ]);

    if ($request->filled('password')) {
        $fields['password'] = Hash::make($request->input('password'));
    }

    $user->update($fields);

    return response()->json([
        'success' => true,
        'data' => $user,
        'message' => 'Data pengguna berhasil diperbarui di database.'
    ]);
});

Route::delete('/users/{id}', function ($id) {
    $user = User::findOrFail($id);

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
