<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    use HasFactory;

    protected $table = 'sales';

    protected $fillable = [
        'name',
        'supervisor_id',
        'position',
        'phone',
        'email',
        'nik',
        'photo_url',
        'specialization',
        'tenure',
        'joined_year',
        'status',
        'deactivated_at',
        'deactivated_reason',
        'notes'
    ];

    protected $casts = [
        'deactivated_at' => 'datetime',
    ];

    /**
     * Setiap sales harus menginduk ke seorang supervisor (Employee)
     */
    public function supervisor()
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }
}
