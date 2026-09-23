<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'latitude',
        'longitude',
        'address',
        'weight_kg',
        'blood_pressure',
        'last_donation_date',
        'is_eligible',
    ];

    protected $casts = [
        'is_eligible' => 'boolean',
        'last_donation_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}