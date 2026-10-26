<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleView extends Model
{
    use HasFactory;

    protected $table = 'article_views';

    protected $fillable = [
        'article_id',
        'session_id',
        'ip_address',
        'device',
        'browser',
        'os',
        'city',
        'country',
        'user_agent',
        'viewed_at'
    ];

    protected $casts = [
        'viewed_at' => 'datetime'
    ];

    public function article()
    {
        return $this->belongsTo(Article::class, 'article_id');
    }
}
