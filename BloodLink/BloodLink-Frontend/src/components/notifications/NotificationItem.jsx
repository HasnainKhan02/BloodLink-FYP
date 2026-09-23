import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Info, ArrowRight } from 'lucide-react';

export default function NotificationItem({ notification, onMarkRead }) {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'emergency':
        return { icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' };
      case 'status':
        return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
      default:
        return { icon: Info, color: 'text-sky-600 bg-sky-50 border-sky-100' };
    }
  };

  const { icon: Icon, color } = getBadgeStyle(notification.type);

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      notification.read 
        ? 'bg-white border-slate-200' 
        : 'bg-rose-50/20 border-rose-200 shadow-sm'
    }`}>
      <div className="flex items-start space-x-3.5">
        <div className={`p-2 rounded-lg border ${color} shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">{notification.title}</h4>
            <span className="text-[10px] text-slate-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{notification.time}</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{notification.message}</p>

          <div className="flex items-center justify-between pt-2">
            {notification.actionUrl ? (
              <a
                href={notification.actionUrl}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:underline"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            ) : <span />}

            {!notification.read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-700"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}