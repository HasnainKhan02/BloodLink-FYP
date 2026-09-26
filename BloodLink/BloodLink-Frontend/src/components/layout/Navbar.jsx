import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  HeartPulse, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Menu, 
  X,
  ShieldAlert
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load logged-in user from localStorage
    const storedUser = localStorage.getItem("bloodlink_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error("Failed to parse stored user", err);
      }
    }

    // Fetch unread notifications count if token exists
    const token = localStorage.getItem("bloodlink_token");
    if (token) {
      fetch("http://127.0.0.1:8000/api/notifications/unread-count", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then((res) => (res.ok ? res.json() : { unread: 0 }))
        .then((data) => setUnreadCount(data.unread || 0))
        .catch(() => setUnreadCount(0));
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem("bloodlink_token");
    if (token) {
      try {
        await fetch("http://127.0.0.1:8000/api/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      } catch (err) {
        console.error("Logout request error", err);
      }
    }

    localStorage.removeItem("bloodlink_token");
    localStorage.removeItem("bloodlink_user");
    setUser(null);
    navigate("/auth");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="bg-rose-600 p-2 rounded-xl text-white shadow-md shadow-rose-600/20">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Blood<span className="text-rose-600">Link</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user ? (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isActive("/dashboard")
                    ? "bg-rose-50 text-rose-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              {/* <Link
                to="/create-request"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isActive("/create-request")
                    ? "bg-rose-50 text-rose-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Request Blood
              </Link> */}

              {/* NOTIFICATION LINK WITH UNREAD BADGE */}
              <Link
                to="/notifications"
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isActive("/notifications")
                    ? "bg-rose-50 text-rose-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Bell className="w-4 h-4" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* ADMIN CONTROL PANEL ROUTE (IF USER IS ADMIN) */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isActive("/admin")
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Admin Panel
                </Link>
              )}

              <div className="h-5 w-px bg-slate-200 mx-2" />

              {/* PROFILE LINK */}
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isActive("/profile")
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <User className="w-4 h-4 text-rose-600" />
                <span>{user.name.split(" ")[0]}</span>
                {user.blood_type && (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    {user.blood_type}
                  </span>
                )}
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/auth"
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition"
              >
                Sign In / Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>

              <Link
                to="/create-request"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <PlusCircle className="w-4 h-4" /> Request Blood
              </Link>

              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notifications
                </div>
                {unreadCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <User className="w-4 h-4 text-rose-600" /> My Profile ({user.name})
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Admin Control Panel
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}