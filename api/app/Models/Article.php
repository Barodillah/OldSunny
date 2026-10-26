<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $table = 'articles';

    protected $fillable = [
        'slug',
        'title',
        'category',
        'category_theme',
        'date',
        'read_time',
        'image_url',
        'summary',
        'author',
        'author_role',
        'is_highlight',
        'highlight_badge',
        'full_content',
        'paragraphs',
        'expert_quote',
        'highlights',
        'tags',
        'status',
        'views_count',
        'likes_count'
    ];

    protected $casts = [
        'is_highlight' => 'boolean',
        'paragraphs' => 'array',
        'highlights' => 'array',
        'tags' => 'array',
        'views_count' => 'integer',
        'likes_count' => 'integer'
    ];

    public function views()
    {
        return $this->hasMany(ArticleView::class, 'article_id');
    }

    public function likes()
    {
        return $this->hasMany(ArticleLike::class, 'article_id');
    }

    public function comments()
    {
        return $this->hasMany(ArticleComment::class, 'article_id');
    }

    public function approvedComments()
    {
        return $this->hasMany(ArticleComment::class, 'article_id')->where('status', 'approved');
    }
}
