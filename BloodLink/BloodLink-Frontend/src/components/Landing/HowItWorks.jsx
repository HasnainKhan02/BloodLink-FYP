import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: UserPlus,
    title: '1. Register Profile',
    desc: 'Sign up, specify your blood group, and set your location preference.'
  },
  {
    icon: Search,
    title: '2. Receive Alerts',
    desc: 'Get immediate notifications when hospitals or local patients request your blood type.'
  },
  {
    icon: HeartHandshake,
    title: '3. Save Lives',
    desc: 'Connect with verified patients directly and complete your donation process.'
  }
];

export default function HowItWorks({ onRegisterClick }) {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-rose-600 font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Simplified Process</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            How BloodLink Works
          </h2>
          <p className="text-slate-600 text-sm">
            Three simple steps to bridge emergency requirements and save precious time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative flex flex-col items-center text-center space-y-4 hover:border-rose-300 transition-colors"
              >
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={onRegisterClick || (() => navigate('/auth'))}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-lg transition-all inline-flex items-center space-x-2"
          >
            <span>Join as a Donor Today</span>
            <ArrowRight className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      </div>
    </section>
  );
}