import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, AlertCircle, PhoneCall, ChevronRight } from 'lucide-react';

export default function RequestCard({ request }) {
  const navigate = useNavigate();

  const handleRespond = () => {
    // Navigates to auth/dashboard with context or prompt to respond
    navigate('/auth', { state: { targetRequestId: request.id } });
  };

  const getUrgencyBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse';
      case 'URGENT':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm shadow-rose-200">
              {request.bloodType}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                {request.patientName || 'Emergency Patient'}
              </h3>
              <p className="text-[11px] text-slate-500">{request.hospitalName}</p>
            </div>
          </div>

          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getUrgencyBadge(
              request.urgency
            )}`}
          >
            {request.urgency}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{request.location || '2.4 km away'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{request.timeNeeded || 'Needed Today'}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold text-slate-500">
          Units Needed: <span className="text-slate-900 font-bold">{request.units || 2}</span>
        </div>

        <button
          onClick={handleRespond}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1 group"
        >
          <span>Respond</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}