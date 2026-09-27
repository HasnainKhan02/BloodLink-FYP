<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['blood_request_id', 'requester_id', 'donor_id'];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function donor()
    {
        return $this->belongsTo(User::class, 'donor_id');
    }
}
