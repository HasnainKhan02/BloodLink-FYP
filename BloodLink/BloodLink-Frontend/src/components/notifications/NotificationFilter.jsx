import React from 'react';

export default function NotificationFilter({ currentFilter, onSelectFilter, unreadCount }) {
  const tabs = [
    { id: 'all', label: 'All Notifications' },
    { id: 'unread', label: `Unread (${unreadCount})` },
    { id: 'emergency', label: 'Urgent Emergencies' }
  ];

  return (
    <div className="flex space-x-2 border-b border-slate-200 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectFilter(tab.id)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentFilter === tab.id
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}