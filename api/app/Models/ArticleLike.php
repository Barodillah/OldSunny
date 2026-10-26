<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleLike extends Model
{
    use HasFactory;

    protected $table = 'article_likes';

    protected $fillable = [
        'article_id',
        'session_id',
        'ip_address',
        'user_agent'
    ];

    public function article()
    {
        return $this->belongsTo(Article::class, 'article_id');
    }
}
