import React from 'react';
import { User, ShieldCheck, MapPin, Calendar, Edit3 } from 'lucide-react';

export default function ProfileHeader({ profile, onEditClick }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
        <div className="relative">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-black text-2xl border-2 border-rose-200">
            {profile.bloodType}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full text-white ring-2 ring-white" title="Verified Donor">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        </div>

        <div>
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
              Verified Donor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{profile.email} • {profile.phone}</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.location}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Member since {profile.joinedDate}</span>
            </span>
          </div>
        </div>
      </div>

      <button 
        type="button"
        onClick={onEditClick}
        className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
        <span>Edit Profile</span>
      </button>
    </div>
  );
}