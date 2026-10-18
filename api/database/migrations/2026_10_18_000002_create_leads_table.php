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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->nullable()->index();
            $table->string('type', 50)->default('prospect')->index(); // booking, test_drive, prospect, emergency, sparepart, aksesoris, complaint, question
            $table->string('customer_name')->nullable();
            $table->string('customer_phone', 40)->nullable()->index();
            $table->string('customer_nopol', 20)->nullable()->index();
            $table->string('vehicle_model')->nullable();
            $table->string('status', 30)->default('new')->index(); // new, contacted, in_progress, completed, cancelled
            $table->json('data')->nullable(); // structured payload (booking_date, booking_time, keluhan, lat, lng, etc.)
            $table->text('notes')->nullable();
            $table->string('source', 50)->default('sunny_ai');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
