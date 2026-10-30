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
        Schema::create('chat_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45)->index();
            $table->string('device_id', 100)->nullable()->index();
            $table->string('session_id', 100)->nullable()->index();
            $table->integer('out_of_context_count')->default(0);
            $table->integer('block_count')->default(0); // 1 = 30m, 2 = 60m, 3 = 120m, dst.
            $table->integer('block_duration_minutes')->default(0);
            $table->timestamp('blocked_until')->nullable()->index();
            $table->text('last_out_of_context_message')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['ip_address', 'blocked_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_blocks');
    }
};
