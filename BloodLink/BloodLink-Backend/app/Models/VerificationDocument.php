<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VerificationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_name',
        'file_path',
        'document_type',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}