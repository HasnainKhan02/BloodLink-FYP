import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  CheckCheck 
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("bloodlink_user") || "{}");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setRefreshing(true);
    setError("");
    const token = localStorage.getItem("bloodlink_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to load notifications.");

      setNotifications(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem("bloodlink_token");
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/${id}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("bloodlink_token");
    try {
      await fetch("http://127.0.0.1:8000/api/notifications/read-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar role={user?.role || "Donor"} unreadCount={unreadCount} userName={user?.name || "User"} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-rose-600" /> Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time alerts for blood requests, pledge responses, and proof verifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" /> Mark All Read
              </button>
            )}
            <button
              onClick={fetchNotifications}
              disabled={refreshing}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-rose-600" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              You'll get notified when someone matches your emergency calls or updates donation status.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                className={`p-4 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer ${
                  item.is_read
                    ? "bg-white border-slate-200/70"
                    : "bg-rose-50/40 border-rose-200/80 shadow-xs"
                }`}
              >
                <div className="p-2.5 rounded-xl shrink-0 mt-0.5 bg-rose-100 text-rose-600">
                  {item.type === "proof_verified" ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  ) : item.type === "proof_declined" ? (
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-rose-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm ${item.is_read ? "font-bold text-slate-800" : "font-black text-slate-900"}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                </div>

                {!item.is_read && (
                  <span className="w-2.5 h-2.5 bg-rose-600 rounded-full shrink-0 mt-2"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}