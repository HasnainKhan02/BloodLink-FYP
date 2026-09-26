import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-semibold">
        Verifying Admin Privileges...
      </div>
    );
  }

  // 1. Check if user is logged in
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ redirectTo: location.pathname }} replace />;
  }

  // 2. Check if user has 'admin' role
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  if (!isAdmin) {
    // Non-admin user trying to access admin dashboard -> redirect to user dashboard
    alert("Unauthorized! You do not have permission to access the Admin Panel.");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}