import React, { useState } from "react";
import { 
  HeartPulse, 
  MapPin, 
  Clock, 
  User, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  FileText, 
  Image as ImageIcon 
} from "lucide-react";

// Modal Component for Proof Upload
function UploadProofModal({ requestId, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a hospital proof slip or document.");
      return;
    }

    setLoading(true);
    setError("");
    const token = localStorage.getItem("bloodlink_token");

    if (!token) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Record Intent / Pledge
      const pledgeRes = await fetch(`http://127.0.0.1:8000/api/requests/${requestId}/pledge`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const pledgeData = await pledgeRes.json();
      if (!pledgeRes.ok) {
        throw new Error(pledgeData.message || "Failed to record donation pledge.");
      }

      // Step 2: Upload Proof Document
      const formData = new FormData();
      formData.append("donation_id", pledgeData.donation_id);
      formData.append("proof_image", file);

      const uploadRes = await fetch("http://127.0.0.1:8000/api/donations/upload-proof", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        if (uploadData.errors) {
          const firstErr = Object.values(uploadData.errors)[0][0];
          throw new Error(firstErr);
        }
        throw new Error(uploadData.message || "Failed to upload proof document.");
      }

      alert("Donation proof uploaded successfully! Admin will verify it shortly.");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Upload Donation Proof</h3>
        </div>

        <p className="text-xs text-slate-500 mb-4 pl-1">
          Upload your hospital slip or donation certificate. Once verified by Admin, your 90-day cooldown will activate.
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 rounded-2xl mb-4 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/80 transition relative">
            {file ? (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                {file.type.includes("image") ? (
                  <ImageIcon className="w-5 h-5 text-rose-600" />
                ) : (
                  <FileText className="w-5 h-5 text-rose-600" />
                )}
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 mb-1">Click or drag file to upload</p>
                <p className="text-[10px] text-slate-400">Supports JPG, PNG, PDF (Max 2MB)</p>
              </>
            )}

            <input
              type="file"
              accept="image/*,application/pdf"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Submit Proof"} <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main RequestCard Component
export default function RequestCard({ request, onRefresh }) {
  const [showProofModal, setShowProofModal] = useState(false);

  // Check status flags
  const isFulfilled = request?.status === "fulfilled" || request?.status === "closed";
  const isAccepted = request?.status === "accepted";

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Top Header: Blood Group Badge & Urgency / Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-black text-sm border border-rose-200">
              {request.blood_type}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
              request.urgency === "CRITICAL" 
                ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {request.urgency || "CRITICAL"}
            </span>
          </div>

          {/* Status Badge */}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            isFulfilled 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : isAccepted 
                ? "bg-blue-50 text-blue-700 border border-blue-200" 
                : "bg-slate-100 text-slate-600"
          }`}>
            {isFulfilled ? "✓ Fulfilled / Closed" : isAccepted ? "Accepted" : "Pending Donor"}
          </span>
        </div>

        {/* Patient Name & Age */}
        <div className="mb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            {request.patient_name} {request.age ? `(${request.age} yrs)` : ""}
          </h3>
          <p className="text-xs text-rose-600 font-bold mt-0.5 flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5" />
            Units Needed: {request.units_needed || 1} Bag(s)
          </p>
        </div>

        {/* Location & Hospital Info */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-6 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-medium text-slate-700">
              {request.hospital_name}, {request.address || request.city}
            </span>
          </div>
          {request.created_at && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100">
        {!isFulfilled ? (
          <button
            onClick={() => setShowProofModal(true)}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-rose-600/20"
          >
            <Upload className="w-4 h-4" />
            {isAccepted ? "Upload Donation Proof" : "I Can Donate (Upload Proof)"}
          </button>
        ) : (
          <button
            onClick={() => setShowProofModal(true)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition cursor-pointer"
          >
            View / Re-upload Proof
          </button>
        )}
      </div>

      {/* Proof Upload Modal */}
      {showProofModal && (
        <UploadProofModal
          requestId={request.id}
          onClose={() => setShowProofModal(false)}
          onSuccess={() => {
            setShowProofModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}