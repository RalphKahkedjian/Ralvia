<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiAction extends Model
{
    protected $fillable = [
        'invoice_id',
        'type',
        'status',
        'subject',
        'message',
        'sent_at'
    ];
    protected $casts = [
        'sent_at' => 'datetime',
    ];
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}