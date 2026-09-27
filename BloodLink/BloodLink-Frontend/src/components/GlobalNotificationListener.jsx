import React, { useState, useEffect } from "react";
import { Bell, ShieldCheck, ShieldAlert, X } from "lucide-react";
import echo from "../services/echo";

export default function GlobalNotificationListener() {
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    // 1. Request Browser Desktop Notification Permission
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }

    const token = localStorage.getItem("bloodlink_token");
    const userStr =
      localStorage.getItem("bloodlink_user") || localStorage.getItem("user");

    if (!token || !userStr) return;

    try {
      const user = JSON.parse(userStr);
      if (!user?.id) return;

      // 2. Subscribe to Laravel Echo / Reverb Private Channel
      const channel = echo
        .private(`App.Models.User.${user.id}`)
        .listen(".notification.created", (e) => {
          console.log("🔔 Realtime Notification Received:", e);

          const newNotification = e.notification || e;

          if (newNotification && (newNotification.title || newNotification.message)) {
            // Audio Alert
            playNotificationSound();

            // Native Desktop Pop-up
            showDesktopNotification(
              newNotification.title || "BloodLink Notification",
              newNotification.message || ""
            );

            // On-Screen Toast Card
            setActiveToast(newNotification);

            // Auto-dismiss Toast after 6 seconds
            setTimeout(() => {
              setActiveToast(null);
            }, 6000);
          }
        });

      return () => {
        channel.stopListening(".notification.created");
      };
    } catch (err) {
      console.error("WebSocket Listener Error:", err);
    }
  }, []);

  // Play Audio Notification Alert
  function playNotificationSound() {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch((err) => {
        console.log("Audio play blocked by browser policy:", err);
      });
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // Trigger System Native Desktop Notification
  function showDesktopNotification(title, message) {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(title, {
        body: message,
        icon: "/bloodlink-logo.png",
      });
    }
  };

  if (!activeToast) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] max-w-sm w-full bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3 transition-all transform translate-y-0 duration-300">
      {/* Icon based on notification type */}
      <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5">
        {activeToast.type === "proof_verified" ? (
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        ) : activeToast.type === "proof_declined" ? (
          <ShieldAlert className="w-5 h-5 text-rose-600" />
        ) : (
          <Bell className="w-5 h-5 text-rose-600" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-slate-900 tracking-tight">
          {activeToast.title}
        </h4>
        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
          {activeToast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setActiveToast(null)}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}