import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, Bell, User, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 sm:px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="p-2 bg-rose-600 rounded-xl text-white">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <span className="font-black text-lg text-white tracking-tight">BloodLink</span>
        </Link>

        {/* Links & Navigation Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/request/new')}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Request</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Profile"
          >
            <User className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}