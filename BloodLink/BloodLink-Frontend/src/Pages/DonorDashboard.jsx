import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Droplet,
  MapPin,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  User,
  UserCheck,
  Radio,
  Bell,
  ExternalLink,
  Plus,
  Upload,
  ShieldCheck,
  X,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Map as MapIcon,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import EmergencyMap from "../components/dashboard/EmergencyMap";

// Proof Upload Modal Sub-Component
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
      // Step 1: Record Pledge / Intent
      const pledgeRes = await fetch(
        `http://127.0.0.1:8000/api/requests/${requestId}/pledge`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      const pledgeData = await pledgeRes.json();
      if (!pledgeRes.ok) {
        throw new Error(
          pledgeData.message || "Failed to record donation pledge.",
        );
      }

      // Step 2: Upload Proof Document
      const formData = new FormData();
      formData.append("donation_id", pledgeData.donation_id);
      formData.append("proof_image", file);

      const uploadRes = await fetch(
        "http://127.0.0.1:8000/api/donations/upload-proof",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        },
      );

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        if (uploadData.errors) {
          const firstErr = Object.values(uploadData.errors)[0][0];
          throw new Error(firstErr);
        }
        throw new Error(
          uploadData.message || "Failed to upload proof document.",
        );
      }

      alert(
        "Donation proof uploaded successfully! Admin will verify it shortly.",
      );
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
          <h3 className="text-lg font-black text-slate-900">
            Upload Donation Proof
          </h3>
        </div>

        <p className="text-xs text-slate-500 mb-4 pl-1">
          Upload your hospital slip or donation certificate. Once verified by
          Admin, your 90-day cooldown will activate.
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
                <p className="text-xs font-bold text-slate-700 mb-1">
                  Click or drag file to upload
                </p>
                <p className="text-[10px] text-slate-400">
                  Supports JPG, PNG, PDF (Max 2MB)
                </p>
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
              {loading ? "Uploading..." : "Submit Proof"}{" "}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DonorDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lazy State Initialization (Prevents Cascading Render Warning)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("bloodlink_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("incoming"); // "incoming" | "my"
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'map'
  const [selectedProofRequestId, setSelectedProofRequestId] = useState(null);
  const [cooldownInfo, setCooldownInfo] = useState({
    in_cooldown: false,
    days_remaining: 0,
  });
  const navigate = useNavigate();

  // Function Declared BEFORE Effect to Avoid Hoisting Error
  const fetchRealtimeRequests = async () => {
    setRefreshing(true);
    setError("");

    const token = localStorage.getItem("bloodlink_token");
    if (!token) {
      navigate("/auth", { state: { redirectTo: "/dashboard" } });
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/requests/nearby",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok)
        throw new Error(result.message || "Failed to load live requests");

      // Cooldown metadata set karein
      if (result.in_cooldown) {
        setCooldownInfo({
          in_cooldown: true,
          days_remaining: result.days_remaining || 0,
        });
      } else {
        setCooldownInfo({ in_cooldown: false, days_remaining: 0 });
      }

      // Safe requests extraction
      let liveData = [];
      if (Array.isArray(result)) {
        liveData = result;
      } else if (result && Array.isArray(result.data)) {
        liveData = result.data;
      }

      setRequests(liveData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mount Effect
  useEffect(() => {
    fetchRealtimeRequests();
  }, []);

  const handleAcceptRequest = async (requestId, patientName) => {
    const token = localStorage.getItem("bloodlink_token");
    if (!token) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await sendAcceptRequest(requestId, patientName, token, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        async () => {
          await sendAcceptRequest(requestId, patientName, token, null);
        },
      );
    } else {
      await sendAcceptRequest(requestId, patientName, token, null);
    }
  };

  const sendAcceptRequest = async (requestId, patientName, token, location) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/requests/${requestId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(location || {}),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Failed to accept request");
      } else {
        alert(
          `You pledged to donate for ${patientName}! Please upload your donation proof.`,
        );
        setSelectedProofRequestId(requestId);
        fetchRealtimeRequests();
      }
    } catch (err) {
      alert("Error accepting request.");
    }
  };

  // Local user ID extraction with fallback
  const currentUserId = user?.id ? String(user.id) : null;

  // Debugging logs to inspect in Console
  console.log("Current Logged-in User ID:", currentUserId);
  console.log("All Raw Requests from API:", requests);

  const myRequests = requests.filter((r) => {
    const reqId = r.requester_id ?? r.user_id ?? r.requester?.id;
    return currentUserId && String(reqId) === currentUserId;
  });

  const incomingRequests = requests.filter((r) => {
    const reqId = r.requester_id ?? r.user_id ?? r.requester?.id;
    return !currentUserId || String(reqId) !== currentUserId;
  });

  const displayedRequests = activeTab === "my" ? myRequests : incomingRequests;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-600">
      <Navbar
        role={user?.role || "Donor"}
        unreadCount={0}
        userName={user?.name || "Donor"}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome back,{" "}
              <span className="text-rose-600">{user?.name || "User"}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              Registered Blood Group:
              <span className="font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                {user?.blood_type || user?.bloodType || "O+"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRealtimeRequests}
              disabled={refreshing}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${
                  refreshing ? "animate-spin text-rose-600" : ""
                }`}
              />
              Refresh
            </button>
            <Link
              to="/create-request"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Request
            </Link>
          </div>
        </div>

        {/* Cooldown Progress Banner */}
        {(cooldownInfo.in_cooldown || user?.last_donation_date) &&
          (() => {
            const daysRemaining =
              cooldownInfo.days_remaining > 0
                ? cooldownInfo.days_remaining
                : (() => {
                    if (!user?.last_donation_date) return 0;
                    const lastDate = new Date(user.last_donation_date);
                    const diffDays = Math.ceil(
                      Math.abs(new Date() - lastDate) / (1000 * 60 * 60 * 24),
                    );
                    return 90 - diffDays;
                  })();

            if (daysRemaining > 0) {
              const progressPercent = Math.min(
                100,
                Math.max(0, Math.round(((90 - daysRemaining) / 90) * 100)),
              );

              return (
                <div className="mb-8 bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                        <Clock className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-amber-900 text-sm">
                          Medical Cooldown Active ({daysRemaining} Days
                          Remaining)
                        </h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Per health guidelines, you cannot accept new emergency
                          requests until recovery finishes.
                        </p>
                      </div>
                    </div>
                    <span className="bg-amber-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shrink-0">
                      {daysRemaining} Days Left
                    </span>
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="w-full bg-amber-200/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-amber-700 font-bold px-1">
                    <span>Day 1 (Donated)</span>
                    <span>{progressPercent}% Recovered</span>
                    <span>Day 90 (Ready)</span>
                  </div>
                </div>
              );
            }
            return null;
          })()}

        {/* Tab Controls + View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("incoming")}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === "incoming"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Bell
                className={`w-4 h-4 ${
                  activeTab === "incoming" ? "text-white" : "text-amber-500"
                }`}
              />
              Requests Received ({incomingRequests.length})
            </button>

            <button
              onClick={() => setActiveTab("my")}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === "my"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Radio
                className={`w-4 h-4 ${
                  activeTab === "my" ? "text-white" : "text-emerald-500"
                }`}
              />
              My Broadcasts ({myRequests.length})
            </button>
          </div>

          {/* List View vs Radar Map Toggle Button */}
          <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center gap-1 shrink-0">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "map"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-rose-600" /> Radar Map
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Feed Content Area */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-medium text-sm">
            Loading emergency network requests...
          </div>
        ) : viewMode === "map" ? (
          /* Interactive Radar Map View */
          <EmergencyMap
            requests={displayedRequests}
            currentUserId={currentUserId}
            onAcceptRequest={handleAcceptRequest}
            onUploadProof={(reqId) => setSelectedProofRequestId(reqId)}
          />
        ) : displayedRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
            <div className="p-3 bg-rose-50 rounded-2xl w-fit mx-auto mb-3 text-rose-600">
              <Droplet className="w-8 h-8 fill-rose-600/20" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === "my"
                ? "You haven't posted any emergency blood requests yet."
                : `No incoming emergency calls for blood group ${
                    user?.blood_type || "your group"
                  }.`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === "my"
                ? "Click '+ Create Request' above to broadcast an emergency blood call."
                : "When someone requests your matching blood group, it will appear here instantly."}
            </p>
          </div>
        ) : (
          /* Cards List Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedRequests.map((req) => {
              const isRequester = String(req.requester_id) === currentUserId;
              const isAccepted = req.status?.toLowerCase() === "accepted";
              const responder = req.responder;

              return (
                <div
                  key={req.id}
                  className="bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 font-black text-base px-3 py-1 rounded-xl">
                          {req.blood_type}
                        </span>
                        {req.urgency && (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                            {req.urgency}
                          </span>
                        )}
                      </div>

                      {isAccepted ? (
                        <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                          Accepted
                        </span>
                      ) : req.is_escalated ? (
                        <span className="flex items-center gap-1.5 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse shadow-md shadow-rose-600/30">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Escalated to {req.effective_radius_km}km (
                          {req.elapsed_minutes}m ago)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />{" "}
                          Pending ({req.effective_radius_km || 10}km Radius)
                        </span>
                      )}
                    </div>

                    {/* Patient Information */}
                    <div className="space-y-2 mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {req.patient_name}{" "}
                        {req.age && req.age < 120 ? `(${req.age} yrs)` : ""}
                      </h3>
                      <p className="text-xs text-slate-600 flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-rose-600 fill-rose-600/20" />{" "}
                        Units Needed:{" "}
                        <strong className="text-slate-900 font-bold">
                          {req.units_needed || 1} Bag(s)
                        </strong>
                      </p>
                      <p className="text-xs text-slate-600 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-900 font-semibold">
                            {req.hospital_name}
                          </strong>
                          , {req.address}, {req.city}
                        </span>
                      </p>
                    </div>

                    {/* REQUESTER VIEW: Accepted Donor Contact Info */}
                    {isRequester && isAccepted && responder && (
                      <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
                        <p className="text-emerald-800 font-bold flex items-center gap-1.5 border-b border-emerald-200/80 pb-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />{" "}
                          Donor Matched & Contact Info:
                        </p>

                        <div className="space-y-1">
                          <p className="text-slate-800 font-semibold">
                            Name:{" "}
                            <span className="font-bold text-slate-900">
                              {responder.name}
                            </span>
                          </p>

                          <p className="text-slate-700 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            Phone:{" "}
                            <strong className="text-slate-900">
                              {responder.phone || "Contact via App"}
                            </strong>
                          </p>
                        </div>

                        <a
                          href={
                            responder.latitude && responder.longitude
                              ? `https://www.google.com/maps?q=${responder.latitude},${responder.longitude}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  req.hospital_name + " " + req.city,
                                )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-[11px] shadow-sm transition"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Open Location on Map</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recently"}
                    </span>

                    {isRequester ? (
                      <span className="text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold text-[11px]">
                        Your Broadcast
                      </span>
                    ) : req.user_has_proof ? (
                      <button
                        disabled
                        className="bg-slate-100 border border-slate-200 text-slate-500 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-[11px] cursor-not-allowed opacity-80"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Proof Uploaded (Pending Review)
                      </button>
                    ) : isAccepted ? (
                      <button
                        onClick={() => setSelectedProofRequestId(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Donation Proof
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleAcceptRequest(req.id, req.patient_name)
                        }
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-md shadow-rose-600/20 cursor-pointer"
                      >
                        Respond / Donate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Render Proof Upload Modal */}
      {selectedProofRequestId && (
        <UploadProofModal
          requestId={selectedProofRequestId}
          onClose={() => setSelectedProofRequestId(null)}
          onSuccess={() => {
            setSelectedProofRequestId(null);
            fetchRealtimeRequests();
          }}
        />
      )}
    </div>
  );
}
