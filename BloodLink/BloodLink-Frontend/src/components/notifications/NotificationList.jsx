import React from 'react';
import NotificationItem from './NotificationItem';
import { BellOff } from 'lucide-react';

export default function NotificationList({ notifications, onMarkRead }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <BellOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="font-semibold text-sm text-slate-700">No notifications found</p>
        <p className="text-xs text-slate-400 mt-0.5">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((item) => (
        <NotificationItem key={item.id} notification={item} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
}