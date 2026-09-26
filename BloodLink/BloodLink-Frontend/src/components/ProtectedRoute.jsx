import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Verifying Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save intended path and redirect to Login
    return <Navigate to="/auth" state={{ redirectTo: location.pathname }} replace />;
  }

  return children;
}