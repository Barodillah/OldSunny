<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return response()->json([
        'name' => 'OldSunny Backend API',
        'status' => 'ready',
        'health_check' => url('/health'),
    ]);
});

Route::get('/health', function () {
    $dbOk = false;
    $dbError = null;
    $dbName = null;

    try {
        DB::connection()->getPdo();
        $dbName = DB::connection()->getDatabaseName();
        $dbOk = true;
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
    }

    return response()->json([
        'status' => $dbOk ? 'ok' : 'error',
        'database' => $dbOk ? 'connected' : 'disconnected',
        'backend' => 'siap',
        'details' => [
            'name' => $dbName,
            'error' => $dbError,
        ],
        'timestamp' => now()->toIso8601String(),
    ], $dbOk ? 200 : 503);
});

// Alias if route resolves with /api prefix
Route::get('/api/health', function () {
    $dbOk = false;
    $dbError = null;
    $dbName = null;

    try {
        DB::connection()->getPdo();
        $dbName = DB::connection()->getDatabaseName();
        $dbOk = true;
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
    }

    return response()->json([
        'status' => $dbOk ? 'ok' : 'error',
        'database' => $dbOk ? 'connected' : 'disconnected',
        'details' => [
            'name' => $dbName,
            'error' => $dbError,
        ],
        'timestamp' => now()->toIso8601String(),
    ], $dbOk ? 200 : 503);
});

// Load all API endpoints for direct Apache resolution
require __DIR__ . '/api.php';
