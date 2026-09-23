import React from 'react';
import { useNavigate } from 'react-router-dom';
import RequestCard from './RequestCard';
import { AlertCircle, PlusCircle } from 'lucide-react';

const MOCK_REQUESTS = [
  {
    id: 'req-1',
    patientName: 'Sarah Connor',
    hospitalName: 'St. Jude Children Hospital',
    bloodType: 'O-',
    urgency: 'CRITICAL',
    location: 'Central City, 1.2 km',
    units: 3,
    timeNeeded: 'Within 2 hrs'
  },
  {
    id: 'req-2',
    patientName: 'Marcus Wright',
    hospitalName: 'Metro Health Care Center',
    bloodType: 'A+',
    urgency: 'URGENT',
    location: 'Westside, 3.8 km',
    units: 2,
    timeNeeded: 'Today'
  },
  {
    id: 'req-3',
    patientName: 'David Miller',
    hospitalName: 'General University Hospital',
    bloodType: 'B-',
    urgency: 'CRITICAL',
    location: 'North Wing, 0.8 km',
    units: 1,
    timeNeeded: 'Immediate'
  }
];

export default function EmergencyRequests({ onRequestClick }) {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4 animate-bounce" />
            <span>Active Emergency Broadcasts</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Urgent Patient Demands Nearby
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRequestClick}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Request</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_REQUESTS.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
      </div>
    </section>
  );
}