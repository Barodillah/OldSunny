<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleComment extends Model
{
    use HasFactory;

    protected $table = 'article_comments';

    protected $fillable = [
        'article_id',
        'name',
        'is_anon',
        'comment',
        'status',
        'ip_address',
        'device'
    ];

    protected $casts = [
        'is_anon' => 'boolean'
    ];

    public function article()
    {
        return $this->belongsTo(Article::class, 'article_id');
    }
}
