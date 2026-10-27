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
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('title', 191);
            $table->string('category', 50)->default('leasing'); // leasing, event, service
            $table->string('category_label', 100)->default('Leasing');
            $table->string('badge', 60)->default('PROMO');
            $table->string('badge_theme', 30)->default('red'); // red, dark, emerald, blue
            $table->string('target_vehicles', 191)->nullable();
            $table->string('validity', 191)->nullable();
            $table->text('highlight')->nullable();
            $table->json('bullets')->nullable();
            $table->json('terms')->nullable();
            $table->text('action_link')->nullable(); // Link form pendaftaran event / link form claim promo
            $table->boolean('action_link_active')->default(false); // Toggle aktifkan link action
            $table->string('action_button_label', 100)->nullable(); // Label tombol (e.g. Klaim Promo / Daftar Event)
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('updated_by', 100)->nullable();
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};
