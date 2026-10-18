<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'type',
        'customer_name',
        'customer_phone',
        'customer_nopol',
        'vehicle_model',
        'status',
        'data',
        'notes',
        'source',
    ];

    protected $casts = [
        'data' => 'array',
    ];
}
