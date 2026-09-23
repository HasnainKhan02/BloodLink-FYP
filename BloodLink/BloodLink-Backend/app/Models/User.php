<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'blood_type',
        'role',
        'is_verified',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
        ];
    }

    /**
     * Relationship: User has many emergency blood requests.
     */
    public function bloodRequests()
    {
        return $this->hasMany(BloodRequest::class, 'requester_id');
    }

    /**
     * Relationship: User has one donor profile.
     */
    public function donorProfile()
    {
        return $this->hasOne(DonorProfile::class, 'user_id');
    }

    /**
     * Relationship: User has many verification documents.
     */
    public function verificationDocuments()
    {
        return $this->hasMany(VerificationDocument::class, 'user_id');
    }
}