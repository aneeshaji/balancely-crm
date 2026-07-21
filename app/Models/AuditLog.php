<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_type',
        'description',
        'ip_address',
        'user_agent',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record a system/user event.
     */
    public static function record($eventType, $description, $payload = null, $userId = null)
    {
        try {
            return self::create([
                'user_id' => $userId ?? auth()->id(),
                'event_type' => $eventType,
                'description' => $description,
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
                'payload' => $payload,
            ]);
        } catch (\Throwable $e) {
            // Write to system logs if db write fails to prevent loops
            \Log::error("Failed to record audit log: " . $e->getMessage(), [
                'event_type' => $eventType,
                'description' => $description,
                'original_exception' => $e
            ]);
        }
    }
}
