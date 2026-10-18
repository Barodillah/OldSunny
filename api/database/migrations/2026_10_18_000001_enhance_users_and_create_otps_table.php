<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambahkan kolom baru pada table users sesuai spesifikasi & analisis kebutuhan
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 30)->nullable()->unique()->after('email');
            }
            if (!Schema::hasColumn('users', 'position')) {
                $table->string('position', 100)->default('Staf Operasional')->after('phone');
            }
            if (!Schema::hasColumn('users', 'role')) {
                // Role: superadmin (developer), admin (manajemen dealer), user (staf/sales umum)
                $table->enum('role', ['superadmin', 'admin', 'user'])->default('user')->after('position');
            }
            if (!Schema::hasColumn('users', 'nik')) {
                $table->string('nik', 50)->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('users', 'department')) {
                $table->string('department', 100)->nullable()->after('role');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('department');
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->text('avatar')->nullable()->after('status');
            }
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('avatar');
            }
            if (!Schema::hasColumn('users', 'last_login_ip')) {
                $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            }
            if (!Schema::hasColumn('users', 'phone_verified_at')) {
                $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
            }
        });

        // 2. Buat table otps untuk lupa kata sandi / reset password / verifikasi 2FA
        if (!Schema::hasTable('otps')) {
            Schema::create('otps', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->string('identifier')->index(); // Email atau Nomor Telepon
                $table->string('otp_code', 10);        // 6-digit kode OTP
                $table->string('type', 50)->default('reset_password'); // 'reset_password', 'login_2fa', 'verification'
                $table->timestamp('expires_at');
                $table->boolean('is_used')->default(false);
                $table->timestamp('used_at')->nullable();
                $table->unsignedTinyInteger('attempts')->default(0);
                $table->string('ip_address', 45)->nullable();
                $table->timestamps();

                $table->index(['identifier', 'otp_code', 'is_used']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otps');

        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [
                'nik',
                'phone',
                'position',
                'role',
                'department',
                'status',
                'avatar',
                'last_login_at',
                'last_login_ip',
                'phone_verified_at'
            ];
            foreach ($columnsToDrop as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
