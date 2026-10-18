<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Otp extends Model
{
    protected $fillable = [
        'user_id',
        'identifier',
        'otp_code',
        'type',
        'expires_at',
        'is_used',
        'used_at',
        'attempts',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'is_used' => 'boolean',
            'attempts' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isValid(string $inputCode): bool
    {
        if ($this->is_used) {
            return false;
        }

        if (now()->greaterThan($this->expires_at)) {
            return false;
        }

        return hash_equals($this->otp_code, $inputCode);
    }
}
