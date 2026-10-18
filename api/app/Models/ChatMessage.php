<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'sender_type',
        'message',
        'quick_replies',
        'action_tags',
        'metadata',
    ];

    protected $casts = [
        'quick_replies' => 'array',
        'action_tags' => 'array',
        'metadata' => 'array',
    ];

    public function session()
    {
        return $this->belongsTo(ChatSession::class, 'session_id', 'session_id');
    }
}
