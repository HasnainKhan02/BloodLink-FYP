<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // 1. Fetch User Notifications
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->take(30)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $notifications
        ], 200);
    }

    // 2. Fetch Unread Count (Navbar Badge)
    public function unreadCount(Request $request)
    {
        try {
            $count = Notification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->count();

            return response()->json(['unread_count' => $count], 200);
        } catch (\Exception $e) {
            return response()->json(['unread_count' => 0], 200);
        }
    }

    // 3. Mark Single Notification as Read
    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)->find($id);

        if ($notification) {
            $notification->update(['is_read' => true]);
        }

        return response()->json(['message' => 'Notification marked as read'], 200);
    }

    // 4. Mark All as Read
    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read'], 200);
    }
}
