import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Landing from "./pages/LandingPage";
import Auth from "./pages/AuthPage";
import DonorDashboard from "./pages/DonorDashboard";
import CreateRequest from "./pages/CreateRequestPage";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/ProfilePage";
import Notifications from "./pages/NotificationsPage";
import GlobalNotificationListener from "./components/GlobalNotificationListener"; // Import Listener
import DonorVerificationPublic from "./Pages/DonorVerificationPublic";

export default function App() {
  return (
    <AuthProvider>
      <GlobalNotificationListener />
      <Router>
        <Routes>

          {/* Default Entry Point: Always loads Landing Page */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-request"
            element={
              <ProtectedRoute>
                <CreateRequest />
              </ProtectedRoute>
            }
          />
          <Route path="/verify-donor/:hash" element={<DonorVerificationPublic />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Strict Admin Route Protection */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch-all route: Redirects to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}