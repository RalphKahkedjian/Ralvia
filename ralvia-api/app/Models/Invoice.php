<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'customer_id',
        'invoice_number',
        'amount',
        'issue_date',
        'due_date',
        'paid_at',
        'status',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'paid_at' => 'date',
        'amount' => 'decimal:2'
    ];

    public function customer(): BelongsTo {
        return $this->belongsTo(Customer::class);
    }

    public function aiActions()
    {
        return $this->hasMany(AiAction::class);
    }

    public function latestAiAction()
    {
        return $this->hasOne(AiAction::class)->latestOfMany();
    }
}
