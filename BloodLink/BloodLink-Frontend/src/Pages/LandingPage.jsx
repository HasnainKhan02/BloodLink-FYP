import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', 'offline'
  const navigate = useNavigate();

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
    const token = localStorage.getItem('bloodlink_token');

    if (token) {
      // User is already logged in -> go straight to target page
      navigate(targetPath);
    } else {
      // User is NOT logged in -> go to /auth and pass target destination in state
      navigate('/auth', { state: { redirectTo: targetPath } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Banner Status */}
      <header className="border-b border-slate-800 bg-slate-950/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-rose-500 tracking-wider">BloodLink</span>
          <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold">
            Emergency Network
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              apiStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : apiStatus === 'offline'
                ? 'bg-rose-500'
                : 'bg-amber-500 animate-ping'
            }`}
          ></span>
          <span className="text-slate-400">
            {apiStatus === 'connected'
              ? 'Backend Live'
              : apiStatus === 'offline'
              ? 'Backend Offline'
              : 'Connecting...'}
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 text-center max-w-3xl flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          Real-Time Emergency <br />
          <span className="text-rose-500">Geospatial Blood Network</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl">
          Connecting critical blood demand with verified donors instantly through real-time location tracking and verified emergency credentials.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => handleProtectedNavigation('/create-request')}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all duration-200 cursor-pointer"
          >
            Find Donors / Request Blood
          </button>
          
          <button
            onClick={() => handleProtectedNavigation('/dashboard')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-8 py-3.5 rounded-xl border border-slate-700 transition-all duration-200 cursor-pointer"
          >
            Donor Dashboard
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} BloodLink System. Final Year Project.
      </footer>
    </div>
  );
}