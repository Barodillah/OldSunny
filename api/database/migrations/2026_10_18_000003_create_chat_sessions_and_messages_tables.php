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
        if (!Schema::hasTable('chat_sessions')) {
            Schema::create('chat_sessions', function (Blueprint $table) {
                $table->id();
                $table->string('session_id', 100)->unique()->index();
                $table->string('customer_name')->nullable();
                $table->string('customer_phone', 40)->nullable()->index();
                $table->string('customer_nopol', 20)->nullable()->index();
                $table->string('ip_address', 50)->nullable()->index();
                $table->text('user_agent')->nullable();
                $table->string('device_type', 30)->nullable(); // mobile, tablet, desktop
                $table->string('browser', 60)->nullable(); // Chrome, Safari, Firefox, Edge, etc.
                $table->string('browser_version', 40)->nullable();
                $table->string('os', 60)->nullable(); // Windows, macOS, Android, iOS, Linux
                $table->string('screen_resolution', 30)->nullable(); // e.g. 1920x1080
                $table->string('language', 20)->nullable(); // e.g. id-ID
                $table->string('timezone', 60)->nullable(); // e.g. Asia/Jakarta
                $table->string('city', 100)->nullable()->index();
                $table->string('region', 100)->nullable(); // e.g. Jawa Barat
                $table->string('country', 100)->nullable()->index(); // e.g. Indonesia
                $table->string('country_code', 10)->nullable(); // e.g. ID
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->string('isp', 150)->nullable();
                $table->string('status', 30)->default('active')->index(); // active, closed
                $table->unsignedInteger('messages_count')->default(0);
                $table->timestamp('last_activity_at')->nullable()->index();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('chat_messages')) {
            Schema::create('chat_messages', function (Blueprint $table) {
                $table->id();
                $table->string('session_id', 100)->index();
                $table->string('sender_type', 20)->index(); // user, ai, bot, cs, system
                $table->longText('message');
                $table->json('quick_replies')->nullable();
                $table->json('action_tags')->nullable();
                $table->json('metadata')->nullable(); // e.g. model, saved_lead_id, execution time
                $table->timestamps();

                // Index composite for efficient history querying
                $table->index(['session_id', 'created_at']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_sessions');
    }
};
