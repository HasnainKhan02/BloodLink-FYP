import React from 'react';
import { Heart, Activity, Scale, ShieldAlert } from 'lucide-react';

export default function MedicalInfoSection({ medicalData }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
        <Heart className="w-4 h-4 text-rose-500" />
        <span>Medical & Physical Metrics</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Weight</p>
          <p className="font-bold text-slate-800 text-sm mt-0.5">{medicalData.weight} kg</p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Blood Pressure</p>
          <p className="font-bold text-slate-800 text-sm mt-0.5">{medicalData.bloodPressure}</p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Last Donation</p>
          <p className="font-bold text-slate-800 text-sm mt-0.5">{medicalData.lastDonation}</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
        <p className="font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Health Conditions / Disqualifiers</span>
        </p>
        <p className="text-slate-600">
          {medicalData.conditions.length > 0 
            ? medicalData.conditions.join(', ')
            : 'No active chronic health conditions declared.'
          }
        </p>
      </div>
    </div>
  );
}