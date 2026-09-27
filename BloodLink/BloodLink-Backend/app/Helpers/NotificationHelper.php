<?php

namespace App\Helpers;

use App\Models\Notification;
use App\Events\NotificationSent;

class NotificationHelper
{
    public static function create($userId, $title, $message, $type = 'info', $bloodRequestId = null)
    {
        $notification = Notification::create([
            'user_id'          => $userId,
            'title'            => $title,
            'message'          => $message,
            'type'             => $type,
            'blood_request_id' => $bloodRequestId,
            'is_read'          => false,
        ]);

        // Real-time Broadcast Fire
        try {
            broadcast(new NotificationSent($notification));
        } catch (\Exception $e) {
            \Log::error('Notification Broadcast Error: ' . $e->getMessage());
        }

        return $notification;
    }
}
