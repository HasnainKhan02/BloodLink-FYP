<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id',
        'patient_name',
        'hospital_name',
        'blood_type',
        'units_required',
        'urgency',
        'contact_phone',
        'latitude',
        'longitude',
        'address',
        'status',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }
}