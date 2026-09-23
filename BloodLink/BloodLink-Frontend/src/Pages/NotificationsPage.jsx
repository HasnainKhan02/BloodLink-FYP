import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import NotificationFilter from '../components/notifications/NotificationFilter';
import NotificationList from '../components/notifications/NotificationList';
import { Bell, Check } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'emergency',
    title: 'URGENT: O- Blood Needed Near You',
    message: 'St. Jude Hospital requested 2 units of O- blood (2.4 km away).',
    time: '10 mins ago',
    read: false,
    actionUrl: '/dashboard'
  },
  {
    id: '2',
    type: 'status',
    title: 'Verification Approved',
    message: 'Your donor identity verification documents have been approved by Admin.',
    time: '2 hours ago',
    read: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Donation Reminder',
    message: 'You are now eligible to donate blood again! Thank you for being a donor.',
    time: '1 day ago',
    read: true
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const handleMarkRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'emergency') return n.type === 'emergency';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
              <p className="text-xs text-slate-500">Stay updated on nearby emergency alerts and status changes.</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        <NotificationFilter
          currentFilter={filter}
          onSelectFilter={setFilter}
          unreadCount={unreadCount}
        />

        <NotificationList
          notifications={filteredNotifications}
          onMarkRead={handleMarkRead}
        />
      </div>
    </div>
  );
}