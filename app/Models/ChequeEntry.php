<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChequeEntry extends Model
{
    use HasFactory;

    protected $table = 'cheque_register';

    protected $fillable = [
        'issue_date',
        'cheque_no',
        'vendor_name',
        'cheque_date',
        'amount',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'issue_date'  => 'date',
        'cheque_date' => 'date',
        'amount'      => 'decimal:2',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
