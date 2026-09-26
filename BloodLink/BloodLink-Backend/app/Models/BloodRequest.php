<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BloodRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id',
        'responder_id',
        'patient_name',
        'age',
        'blood_type',
        'units_needed',
        'urgency',
        'hospital_name',
        'city',
        'address',
        'latitude',
        'longitude',
        'contact_phone',
        'proof_document',
        'status',
    ];

    // Append custom computed attributes to JSON serialization
    protected $appends = ['effective_radius_km', 'elapsed_minutes', 'is_escalated'];

    /**
     * Compute effective radius dynamically based on elapsed time:
     * 0 - 15 mins  => 5 km
     * 15 - 30 mins => 15 km
     * 30+ mins     => 30 km (Maximum Escalation)
     */
    public function getEffectiveRadiusKmAttribute()
    {
        if (strtolower($this->status) !== 'pending') {
            return $this->initial_radius_km ?? 5;
        }

        $elapsedMinutes = $this->elapsed_minutes;

        if ($elapsedMinutes >= 30) {
            return 30; // Maximum emergency ring
        } elseif ($elapsedMinutes >= 15) {
            return 15; // Expanded ring
        }

        return $this->initial_radius_km ?? 5;
    }

    public function getElapsedMinutesAttribute()
    {
        return $this->created_at ? (int) $this->created_at->diffInMinutes(Carbon::now()) : 0;
    }

    public function getIsEscalatedAttribute()
    {
        return strtolower($this->status) === 'pending' && $this->elapsed_minutes >= 15;
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function responder()
    {
        return $this->belongsTo(User::class, 'responder_id');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class, 'blood_request_id');
    }
}
