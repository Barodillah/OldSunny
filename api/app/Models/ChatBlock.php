<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatBlock extends Model
{
    protected $connection = 'mysql';

    protected $fillable = [
        'ip_address',
        'device_id',
        'session_id',
        'out_of_context_count',
        'block_count',
        'block_duration_minutes',
        'blocked_until',
        'last_out_of_context_message',
        'reason',
    ];

    protected $casts = [
        'blocked_until' => 'datetime',
        'out_of_context_count' => 'integer',
        'block_count' => 'integer',
        'block_duration_minutes' => 'integer',
    ];
}

