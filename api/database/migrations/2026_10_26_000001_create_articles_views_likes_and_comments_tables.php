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
        // 1. Articles Table
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('category')->default('Berita Resmi');
            $table->string('category_theme')->default('red'); // 'red' | 'yellow'
            $table->string('date')->nullable();
            $table->string('read_time')->default('3 mnt baca');
            $table->text('image_url')->nullable();
            $table->text('summary')->nullable();
            $table->string('author')->default('Tim Redaksi Mitsubishi Sun');
            $table->string('author_role')->default('Dealer Resmi Sun Star Prima Motor Margahayu');
            $table->boolean('is_highlight')->default(false);
            $table->string('highlight_badge')->nullable();
            $table->longText('full_content')->nullable();
            $table->json('paragraphs')->nullable();
            $table->text('expert_quote')->nullable();
            $table->json('highlights')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['published', 'draft', 'archived'])->default('published');
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->timestamps();
        });

        // 2. Article Views Table (Detailed IP, Device, Browser, OS, City, Country)
        Schema::create('article_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->string('session_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable()->index();
            $table->string('device')->nullable(); // Mobile, Desktop, Tablet
            $table->string('browser')->nullable(); // Chrome, Safari, Firefox, Edge, etc.
            $table->string('os')->nullable(); // Windows, macOS, Android, iOS, Linux
            $table->string('city')->nullable(); // Jakarta, Bekasi, Bandung, etc.
            $table->string('country')->nullable(); // Indonesia, etc.
            $table->text('user_agent')->nullable();
            $table->timestamp('viewed_at')->useCurrent();
            $table->timestamps();
        });

        // 3. Article Likes Table
        Schema::create('article_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->string('session_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable()->index();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        // 4. Article Comments Table with Approval Status
        Schema::create('article_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->string('name')->default('Anonim');
            $table->boolean('is_anon')->default(false);
            $table->text('comment');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved'); // Default approved for responsive experience, or manageable via portal
            $table->string('ip_address', 45)->nullable();
            $table->string('device')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_comments');
        Schema::dropIfExists('article_likes');
        Schema::dropIfExists('article_views');
        Schema::dropIfExists('articles');
    }
};
