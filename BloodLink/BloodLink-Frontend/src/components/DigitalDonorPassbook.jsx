import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Award, Clock, QrCode } from "lucide-react";

export default function DigitalDonorPassbook({ user }) {
  const [verificationHash, setVerificationHash] = useState(user?.verification_hash || "");

  // Generate public URL for QR Scan
  const verificationUrl = `${window.location.origin}/verify-donor/${verificationHash}`;

  // Badge calculation based on verified donations
  const donationCount = user?.verified_donations_count || 0;
  const getBadgeDetails = (count) => {
    if (count >= 10) return { title: "Gold Life Saver", color: "bg-amber-500 text-white", border: "border-amber-400" };
    if (count >= 5) return { title: "Silver Hero", color: "bg-slate-400 text-white", border: "border-slate-300" };
    if (count >= 1) return { title: "Bronze Donor", color: "bg-amber-700 text-white", border: "border-amber-600" };
    return { title: "Verified Member", color: "bg-rose-600 text-white", border: "border-rose-500" };
  };

  const badge = getBadgeDetails(donationCount);

  return (
    <div className="max-w-md w-full bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
      {/* Background Accent Graphics */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
            Official Passbook
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            BloodLink Donor Card
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color} shadow-lg`}>
          {badge.title}
        </span>
      </div>

      {/* Donor Info */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Donor Name</p>
          <p className="text-sm font-bold text-white truncate">{user?.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Blood Group</p>
          <p className="text-base font-black text-rose-400">{user?.blood_type || "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Verified Donations</p>
          <p className="text-sm font-bold text-white">{donationCount} Times</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status</p>
          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Active
          </p>
        </div>
      </div>

      {/* Dynamic QR Verification Area */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl text-slate-900 shadow-inner">
        <div>
          <p className="text-xs font-black text-slate-900 flex items-center gap-1">
            <QrCode className="w-4 h-4 text-rose-600" /> Digital QR Verification
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Scan to verify medical authenticity & cooldown status.
          </p>
        </div>
        {verificationHash ? (
          <div className="p-1 bg-white border border-slate-200 rounded-xl">
            <QRCodeSVG value={verificationUrl} size={64} level="H" />
          </div>
        ) : (
          <span className="text-[10px] text-slate-400">QR Unavailable</span>
        )}
      </div>
    </div>
  );
}