import React from 'react';
import { Heart, Search, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Hero({ onDonateClick, onRequestClick, onLearnMoreClick }) {
  return (
    <div className="relative bg-slate-900 text-white overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 px-4 py-1.5 rounded-full text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Emergency Blood Network</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Connecting <span className="text-rose-500">Donors</span> with Patients in Real-Time
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          BloodLink bridges the gap between urgent hospital needs and nearby verified blood donors. Minutes matter — find or donate blood instantly.
        </p>

        {/* Working CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onRequestClick}
            className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Heart className="w-5 h-5 fill-current" />
            <span>Request Blood Urgently</span>
          </button>

          <button
            onClick={onDonateClick}
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>Become a Donor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onLearnMoreClick}
          className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4"
        >
          Learn how BloodLink works →
        </button>
      </div>
    </div>
  );
}