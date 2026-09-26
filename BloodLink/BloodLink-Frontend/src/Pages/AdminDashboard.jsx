import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Droplet,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Eye,
  X,
  Calendar,
  Download,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [cooldownUsers, setCooldownUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("requests"); // 'requests', 'verifications', 'cooldowns', 'users'
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

const fetchAdminData = async () => {
    setRefreshing(true);
    setError("");

    const token = localStorage.getItem("bloodlink_token");
    if (!token) {
      navigate("/auth", { state: { redirectTo: "/admin" } });
      return;
    }

    try {
      // 1. Fetch Requests (Handles object wrappers & arrays)
      const reqRes = await fetch("http://127.0.0.1:8000/api/admin/requests", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (reqRes.status === 403 || reqRes.status === 401) {
        throw new Error("Unauthorized access. Admin privileges required.");
      }
      const reqJson = await reqRes.json();
      const rawRequests = reqJson.requests || reqJson.data || reqJson;
      setRequests(Array.isArray(rawRequests) ? rawRequests : []);

      // 2. Fetch Users
      const userRes = await fetch("http://127.0.0.1:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (userRes.ok) {
        const userJson = await userRes.json();
        const rawUsers = userJson.users || userJson.data || userJson;
        setUsersList(Array.isArray(rawUsers) ? rawUsers : []);
      }

      // 3. Fetch Pending Donation Proofs
      const donRes = await fetch("http://127.0.0.1:8000/api/admin/pending-donations", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (donRes.ok) {
        const donJson = await donRes.json();
        const rawDonations = donJson.pending_donations || donJson.donations || donJson.data || donJson;
        setPendingDonations(Array.isArray(rawDonations) ? rawDonations : []);
      }

      // 4. Fetch Cooldown Donors
      const coolRes = await fetch("http://127.0.0.1:8000/api/admin/cooldown-users", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (coolRes.ok) {
        const coolJson = await coolRes.json();
        const rawCooldowns = coolJson.cooldown_users || coolJson.data || coolJson;
        setCooldownUsers(Array.isArray(rawCooldowns) ? rawCooldowns : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Export Donation History CSV
  const handleExportCSV = async () => {
    setExporting(true);
    const token = localStorage.getItem("bloodlink_token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/donations/export-history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to export donation history.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BloodLink_Donation_History_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleVerifyDonation = async (donationId, donorName) => {
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
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineDonation = async (donationId, donorName) => {
    const reason = window.prompt(
      `Reason for declining proof for ${donorName}:`,
      "Invalid document or unreadable image"
    );

    if (reason === null) return; // User cancelled prompt

    setActionLoadingId(donationId);
    const token = localStorage.getItem("bloodlink_token");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/admin/donations/${donationId}/decline`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Decline failed.");

      alert(`Proof declined for ${donorName}. Recorded in history.`);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (
      !window.confirm("Are you sure you want to delete this emergency request?")
    )
      return;

    const token = localStorage.getItem("bloodlink_token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/requests/${requestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete request");

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      alert("Request deleted successfully.");
    } catch (err) {
      alert(err.message);
    }
  };

// Safe Metric Calculations
  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const safePendingDonations = Array.isArray(pendingDonations) ? pendingDonations : [];
  const safeCooldownUsers = Array.isArray(cooldownUsers) ? cooldownUsers : [];

  const totalRequests = safeRequests.length;
  const totalUsers = safeUsers.length;
  const totalPendingProofs = safePendingDonations.length;
  const totalCooldowns = safeCooldownUsers.length;

  // Search Filters
  const filteredRequests = safeRequests.filter(
    (r) =>
      r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.blood_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = safeUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.blood_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVerifications = safePendingDonations.filter(
    (d) =>
      d.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.blood_request?.hospital_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const filteredCooldownUsers = safeCooldownUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.blood_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-600">
      <Navbar role="Admin" unreadCount={0} userName="System Admin" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Title & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              Admin Control Panel
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              System monitoring, proof verification, cooldown tracking & history exports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Download
                className={`w-3.5 h-3.5 ${exporting ? "animate-bounce" : ""}`}
              />
              {exporting ? "Exporting..." : "Export History (CSV)"}
            </button>

            <button
              onClick={fetchAdminData}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  refreshing ? "animate-spin text-rose-600" : ""
                }`}
              />
              Sync Data
            </button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Total Calls</span>
              <Droplet className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalRequests}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Pending Proofs</span>
              <ShieldCheck className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-600">{totalPendingProofs}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Active Cooldowns</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{totalCooldowns}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Registered Donors</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalUsers}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === "requests"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Droplet className="w-4 h-4 text-rose-500" />
              Emergency Broadcasts ({totalRequests})
            </button>

            <button
              onClick={() => setActiveTab("verifications")}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === "verifications"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Proof Verifications ({totalPendingProofs})
            </button>

            <button
              onClick={() => setActiveTab("cooldowns")}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === "cooldowns"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              Cooldown Donors ({totalCooldowns})
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === "users"
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Users className="w-4 h-4 text-blue-500" />
              Users ({totalUsers})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Emergency Requests */}
        {activeTab === "requests" && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Loading requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No emergency requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                      <th className="p-4">Blood</th>
                      <th className="p-4">Patient Details</th>
                      <th className="p-4">Hospital & Location</th>
                      <th className="p-4">Proof Document</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-4 font-black text-rose-600 text-sm">
                          <span className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                            {req.blood_type}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">
                            {req.patient_name}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            {req.units_needed || 1} Bag(s) needed
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-800">
                            {req.hospital_name}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            {req.city}
                          </p>
                        </td>
                        <td className="p-4">
                          {req.proof_document ? (
                            <a
                              href={`http://127.0.0.1:8000/storage/${req.proof_document}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Doc
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              No File
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              req.status?.toLowerCase() === "accepted" ||
                              req.status?.toLowerCase() === "fulfilled"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {req.status || "Pending"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Proof Verifications */}
        {activeTab === "verifications" && (
          <div>
            {filteredVerifications.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  All caught up!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  There are no pending donation proof documents to review right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVerifications.map((item) => {
                  const proofUrl = `http://127.0.0.1:8000/storage/${item.proof_image}`;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              Donor Name
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {item.user?.name || "Donor"}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {item.user?.email}
                            </p>
                          </div>
                          <span className="bg-rose-50 text-rose-600 font-black text-xs px-2.5 py-1 rounded-xl border border-rose-200">
                            {item.user?.blood_type || "A+"}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
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

                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 relative group h-40 flex items-center justify-center">
                          {item.proof_image?.endsWith(".pdf") ? (
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

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() =>
                            handleVerifyDonation(item.id, item.user?.name)
                          }
                          disabled={actionLoadingId === item.id}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Verify
                        </button>

                        <button
                          onClick={() =>
                            handleDeclineDonation(item.id, item.user?.name)
                          }
                          disabled={actionLoadingId === item.id}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Cooldown Donors */}
        {activeTab === "cooldowns" && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Loading cooldown records...
              </div>
            ) : filteredCooldownUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-medium">
                No donors are currently in the 90-day cooldown period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                      <th className="p-4">Donor Info</th>
                      <th className="p-4">Blood Group</th>
                      <th className="p-4">Cooldown Start Date</th>
                      <th className="p-4">Recovery Progress</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCooldownUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </td>

                        <td className="p-4">
                          <span className="bg-rose-50 border border-rose-200 text-rose-600 font-black px-2.5 py-1 rounded-lg text-xs">
                            {u.blood_type || "N/A"}
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {u.cooldown_start_date || "N/A"}
                          </div>
                        </td>

                        <td className="p-4 min-w-[200px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-amber-700">
                                {u.days_completed} Days Completed
                              </span>
                              <span className="text-slate-400">
                                {u.days_remaining} Days Left
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${u.progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-[11px] px-3 py-1 rounded-full inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {u.days_remaining} Days Left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: User Management */}
        {activeTab === "users" && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No registered users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Blood Group</th>
                      <th className="p-4">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-4 font-bold text-slate-900">
                          {u.name}
                        </td>
                        <td className="p-4 text-slate-600">{u.email}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 border border-slate-200 text-slate-800 font-extrabold px-2 py-0.5 rounded text-[11px]">
                            {u.blood_type || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-500 uppercase text-[10px]">
                          {u.role || "Donor"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Proof Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-4 relative shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                Hospital Donation Proof Document
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] min-h-[300px] overflow-auto rounded-2xl bg-slate-900 flex items-center justify-center p-2">
              <img
                src={selectedImage}
                alt="Donation Proof Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  alert(
                    "Image load failed. Make sure 'php artisan storage:link' is executed on Laravel backend."
                  );
                }}
              />
            </div>

            <div className="mt-3 flex justify-between items-center px-2">
              <a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
              >
                Open original file in new tab{" "}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}