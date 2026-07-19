<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorStatement extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_name',
        'statement_received',
        'status',
        'assigned_to',
        'period',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'statement_received' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
