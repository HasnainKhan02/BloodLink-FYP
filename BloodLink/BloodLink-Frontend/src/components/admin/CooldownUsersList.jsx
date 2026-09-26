import React, { useState, useEffect } from "react";
import { Clock, User, Droplet, Calendar, ShieldAlert, RefreshCw } from "lucide-react";

export default function CooldownUsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCooldownUsers = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("bloodlink_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/cooldown-users", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch cooldown users.");
      }

      setUsers(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooldownUsers();
  }, []);

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Users in Medical Cooldown
            </h2>
            <p className="text-xs text-slate-500">
              Active donors currently in their 90-day recovery period
            </p>
          </div>
        </div>

        <button
          onClick={fetchCooldownUsers}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium text-sm">
          Loading cooldown records...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-bold text-sm">
          No users are currently in the 90-day cooldown period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="p-4 rounded-l-2xl">User Info</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">Cooldown Start Date</th>
                <th className="p-4">Days Progress</th>
                <th className="p-4 rounded-r-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  {/* User details */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Blood Type */}
                  <td className="p-4">
                    <span className="bg-rose-50 border border-rose-200 text-rose-600 font-black px-2.5 py-1 rounded-xl text-xs">
                      {u.blood_type}
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="p-4 text-slate-700">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {u.cooldown_start_date}
                    </div>
                  </td>

                  {/* Days Progress & Visual Bar */}
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

                  {/* Badge Status */}
                  <td className="p-4">
                    <span className="bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-[11px] px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {u.days_remaining} Days Remaining
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}