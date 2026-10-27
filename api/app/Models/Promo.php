<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $table = 'promos';

    protected $fillable = [
        'slug',
        'title',
        'category',
        'category_label',
        'badge',
        'badge_theme',
        'target_vehicles',
        'validity',
        'highlight',
        'bullets',
        'terms',
        'action_link',
        'action_link_active',
        'action_button_label',
        'is_active',
        'sort_order',
        'updated_by'
    ];

    protected $casts = [
        'bullets' => 'array',
        'terms' => 'array',
        'action_link_active' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];
}
