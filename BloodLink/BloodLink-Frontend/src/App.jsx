import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './pages/LandingPage';
import Auth from './pages/AuthPage';
import DonorDashboard from './pages/DonorDashboard';
import CreateRequest from './pages/CreateRequestPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/ProfilePage';
import Notifications from './pages/NotificationsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<DonorDashboard />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* Catch-all route to prevent blank screen on wrong path */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;