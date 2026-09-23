import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EligibilityCard({ daysRemaining, isEligible }) {
  return (
    <div className={`rounded-2xl border p-5 ${
      isEligible 
        ? 'bg-emerald-50/50 border-emerald-200' 
        : 'bg-amber-50/50 border-amber-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${isEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {isEligible ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {isEligible ? 'Eligible to Donate Today' : 'Donation Cooldown Active'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {isEligible 
                ? 'Your donation waiting period has concluded. You can respond to active requests.'
                : `Next eligible donation date is in approx. ${daysRemaining} days.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}