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
        Schema::table('articles', function (Blueprint $table) {
            if (!Schema::hasColumn('articles', 'comments_count')) {
                $table->unsignedBigInteger('comments_count')->default(0)->after('likes_count');
            }
            if (!Schema::hasColumn('articles', 'approved_comments_count')) {
                $table->unsignedBigInteger('approved_comments_count')->default(0)->after('comments_count');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn(['comments_count', 'approved_comments_count']);
        });
    }
};
