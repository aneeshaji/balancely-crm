<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CargoLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'cargo_name',
        'party_name',
        'part_count',
        'amount',
        'phone_no',
        'bill_no',
        'payment_status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'date'   => 'date',
        'amount' => 'decimal:2',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
