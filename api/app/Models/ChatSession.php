<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'customer_name',
        'customer_phone',
        'customer_nopol',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'browser_version',
        'os',
        'screen_resolution',
        'language',
        'timezone',
        'city',
        'region',
        'country',
        'country_code',
        'latitude',
        'longitude',
        'isp',
        'status',
        'messages_count',
        'last_activity_at',
    ];

    protected $casts = [
        'last_activity_at' => 'datetime',
        'latitude' => 'float',
        'longitude' => 'float',
        'messages_count' => 'integer',
    ];

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'session_id', 'session_id')->orderBy('created_at', 'asc');
    }
}
