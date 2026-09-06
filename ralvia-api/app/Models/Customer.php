<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'email',
        'phone'
    ];

    public function invoices(): HasMany {
        return $this->hasMany(Invoice::class);
    }

    public function company(): BelongsTo {
        return $this->belongsTo(Company::class);
    }
}
