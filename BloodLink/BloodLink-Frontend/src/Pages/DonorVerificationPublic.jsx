import React, { useState, useEffect } from "react";
import { useParams } from "react"
import { ShieldCheck, ShieldAlert, Award, Clock, CheckCircle2 } from "lucide-react";

export default function DonorVerificationPublic() {
  const { hash } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/verify-donor/${hash}`)
      .then((res) => {
        if (!res.ok) throw new Error("Donor record not found or invalid QR code.");
        return res.json();
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-sm font-semibold animate-pulse">Verifying Donor Authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Invalid Verification Code</h3>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white">
        {/* Top Status */}
        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-400">Official BloodLink Donor</h4>
            <p className="text-[10px] text-emerald-200/70">Cryptographically Authenticated Record</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-rose-600/20 border-2 border-rose-500 text-rose-500 font-black text-2xl rounded-full flex items-center justify-center mx-auto mb-3">
            {data.blood_type}
          </div>
          <h2 className="text-xl font-bold text-white">{data.name}</h2>
          <span className="inline-block mt-1 px-3 py-0.5 bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold rounded-full">
            {data.badge}
          </span>
        </div>

        {/* Cooldown & Donation Stats */}
        <div className="space-y-3">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Verified Donations</p>
              <p className="text-base font-bold text-white">{data.total_verified_donations} Proofs Approved</p>
            </div>
            <Award className="w-6 h-6 text-amber-400" />
          </div>

          <div className={`p-4 rounded-2xl border flex justify-between items-center ${
            data.in_cooldown 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}>
            <div>
              <p className="text-[10px] opacity-80 uppercase tracking-wider">Medical Cooldown Status</p>
              <p className="text-sm font-bold mt-0.5">
                {data.in_cooldown 
                  ? `In Cooldown (${data.cooldown_days_remaining} Days Remaining)` 
                  : "Eligible for Donation"}
              </p>
            </div>
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}