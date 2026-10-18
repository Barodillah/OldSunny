<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    protected $fillable = [
        'name',
        'role',
        'level',
        'department',
        'photo_url',
        'description',
        'tenure',
        'nik',
        'badge',
        'status',
        'deactivated_at',
        'deactivated_reason'
    ];

    protected $casts = [
        'deactivated_at' => 'datetime',
    ];

    /**
     * Relasi ke tim sales yang menginduk jika employee ini adalah Supervisor
     */
    public function salesTeam()
    {
        return $this->hasMany(Sales::class, 'supervisor_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeLevel($query, $level)
    {
        return $query->where('level', $level);
    }
}
