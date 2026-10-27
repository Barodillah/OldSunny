<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KnowledgeItem extends Model
{
    use HasFactory;

    protected $table = 'knowledge_items';

    protected $fillable = [
        'key',
        'title',
        'category',
        'payload',
        'metadata',
        'is_active',
        'updated_by',
    ];

    protected $casts = [
        'payload' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];
}
