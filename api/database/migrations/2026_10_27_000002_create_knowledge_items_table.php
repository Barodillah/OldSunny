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
        Schema::create('knowledge_items', function (Blueprint $table) {
            $table->id();
            $table->string('key', 64)->unique(); // e.g. price_list, accessories, sparepart, promo_event
            $table->string('title', 191);
            $table->string('category', 64)->nullable(); // sales, aftersales, marketing, general
            $table->longText('payload'); // Full structured JSON payload
            $table->json('metadata')->nullable(); // Additional tags, periode, featured config
            $table->boolean('is_active')->default(true);
            $table->string('updated_by', 100)->nullable();
            $table->timestamps();

            $table->index(['key', 'is_active']);
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_items');
    }
};
