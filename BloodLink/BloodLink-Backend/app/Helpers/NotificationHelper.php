<?php
namespace App\Helpers;

use App\Models\Notification;

class NotificationHelper
{
    public static function create($userId, $title, $message, $type = 'info', $bloodRequestId = null)
    {
        return Notification::create([
            'user_id'          => $userId,
            'blood_request_id' => $bloodRequestId,
            'title'            => $title,
            'message'          => $message,
            'type'             => $type,
            'is_read'          => false,
        ]);
    }
}
