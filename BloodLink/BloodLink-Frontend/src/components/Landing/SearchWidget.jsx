import React, { useState } from 'react';
import { Search, MapPin, Droplet } from 'lucide-react';

const BLOOD_TYPES = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function SearchWidget({ onSearch }) {
  const [bloodType, setBloodType] = useState('All');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ bloodType, location });
  };

  return (
    <div className="max-w-4xl mx-auto -mt-10 px-4 relative z-20">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4"
      >
        <div className="w-full md:w-1/3 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <Droplet className="w-3 h-3 text-rose-500" />
            <span>Blood Group</span>
          </label>
          <select
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500 bg-slate-50"
          >
            {BLOOD_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/2 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-rose-500" />
            <span>Location / Hospital</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, ZIP, or Hospital name"
            className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500 bg-slate-50"
          />
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-2 shrink-0 self-end"
        >
          <Search className="w-4 h-4" />
          <span>Find Donors</span>
        </button>
      </form>
    </div>
  );
}