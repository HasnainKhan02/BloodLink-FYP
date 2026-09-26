import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, Heart, Shield, Activity, ArrowRight, UserCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', 'offline'
  const navigate = useNavigate();
  const { isAuthenticated, user, logoutSession } = useAuth();

  useEffect(() => {
    // Non-blocking ping test
    fetch('http://127.0.0.1:8000/api/ping')
      .then((res) => {
        if (res.ok) setApiStatus('connected');
        else setApiStatus('offline');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  // Smart Navigation Handler based on Auth Status
  const handleProtectedNavigation = (targetPath) => {
    if (isAuthenticated) {
      navigate(targetPath);
    } else {
      navigate('/auth', { state: { redirectTo: targetPath } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans selection:bg-rose-100 selection:text-rose-600">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 transition-all">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-md shadow-rose-600/20">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Blood<span className="text-rose-600">Link</span>
              </span>
              <span className="ml-2 text-[10px] uppercase tracking-wider font-extrabold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
                Emergency Network
              </span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">
            {/* Backend Status Badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : apiStatus === 'offline'
                    ? 'bg-rose-500'
                    : 'bg-amber-500 animate-ping'
                }`}
              ></span>
              <span className="text-slate-600">
                {apiStatus === 'connected'
                  ? 'System Live'
                  : apiStatus === 'offline'
                  ? 'Offline Mode'
                  : 'Connecting...'}
              </span>
            </div>

            {/* Auth Action */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition shadow-sm"
                >
                  Dashboard
                </button>
                <button
                  onClick={logoutSession}
                  className="text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-4.5 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center py-12 px-6">
        <section className="max-w-4xl mx-auto text-center my-auto">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span>Fast, verified emergency blood matching</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.15]">
            Real-Time Emergency <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700">
              Geospatial Blood Network
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connecting critical blood requests directly with nearby verified donors instantly through real-time location tracking and immediate response notifications.
          </p>

          {/* Action Callouts */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => handleProtectedNavigation('/create-request')}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Request Blood Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleProtectedNavigation('/dashboard')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm px-8 py-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Donor Live Dashboard</span>
            </button>
          </div>

          {/* Highlight Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Geospatial Matching</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically routes request broadcasts to registered donors in your immediate city or location radius.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Privacy Focused</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Contact information and GPS directions are only shared when a donor explicitly accepts a request.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Filtered Alerts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Donors only receive notifications matching their compatible blood group to prevent alert fatigue.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Light Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="font-medium text-slate-600">
            &copy; {new Date().getFullYear()} BloodLink System. Emergency Health Platform.
          </span>
          <span className="text-slate-400">
            Powered by React, Tailwind CSS & Laravel Sanctum
          </span>
        </div>
      </footer>
    </div>
  );
}