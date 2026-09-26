import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  FileText,
  X,
  Eye,
} from "lucide-react";

export default function AdminDonationVerifications() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // 1. Declare function FIRST to avoid hoisting issues
  const fetchPendingDonations = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("bloodlink_token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/pending-donations", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch pending donations.");

      const data = await res.json();
      setDonations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Execute hook AFTER function declaration
  useEffect(() => {
    fetchPendingDonations();
  }, []);

  const handleVerify = async (donationId, donorName) => {
    if (
      !window.confirm(
        `Verify donation proof for ${donorName}? This will activate their 90-day cooldown.`
      )
    ) {
      return;
    }

    setActionLoadingId(donationId);
    const token = localStorage.getItem("bloodlink_token");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/admin/donations/${donationId}/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed.");

      alert(`Donation verified! 90-day cooldown activated for ${donorName}.`);
      setDonations((prev) => prev.filter((d) => d.id !== donationId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              Donation Proof Verifications
            </h1>
            <p className="text-xs text-slate-500">
              Review hospital slips uploaded by donors to trigger their 90-day medical cooldown.
            </p>
          </div>
        </div>

        <button
          onClick={fetchPendingDonations}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose-600" : ""}`}
          />
          Refresh List
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-4 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {/* Main Table / Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are no pending donation proof documents to review right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((item) => {
            const proofUrl = `http://127.0.0.1:8000/storage/${item.proof_image}`;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Donor Info */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Donor Name
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {item.user?.name || "Anonymous Donor"}
                      </h4>
                      <p className="text-xs text-slate-500">{item.user?.email}</p>
                    </div>
                    <span className="bg-rose-50 text-rose-600 font-black text-xs px-2.5 py-1 rounded-xl border border-rose-200">
                      {item.user?.blood_type || "A+"}
                    </span>
                  </div>

                  {/* Request Info */}
                  <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                    <p className="text-slate-500">
                      Patient:{" "}
                      <strong className="text-slate-800">
                        {item.blood_request?.patient_name}
                      </strong>
                    </p>
                    <p className="text-slate-500">
                      Hospital:{" "}
                      <strong className="text-slate-800">
                        {item.blood_request?.hospital_name}
                      </strong>
                    </p>
                  </div>

                  {/* Proof Image Preview Box */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 relative group h-40 flex items-center justify-center">
                    {item.proof_image.endsWith(".pdf") ? (
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-rose-600 mx-auto mb-1" />
                        <span className="text-xs font-bold text-slate-700">
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <img
                        src={proofUrl}
                        alt="Donation Proof"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                    )}

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 backdrop-blur-xs">
                      <button
                        onClick={() => setSelectedImage(proofUrl)}
                        className="bg-white text-slate-900 p-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-slate-100 cursor-pointer shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-slate-800 shadow-md"
                      >
                        Open <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Verification Button */}
                <button
                  onClick={() => handleVerify(item.id, item.user?.name)}
                  disabled={actionLoadingId === item.id}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition"
                >
                  {actionLoadingId === item.id ? (
                    "Verifying..."
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Verify & Start 90-Day Cooldown
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 relative overflow-hidden border border-slate-200">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[80vh] overflow-auto rounded-2xl flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Enlarged Proof"
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}