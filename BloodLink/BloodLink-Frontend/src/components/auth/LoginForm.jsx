import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

export default function LoginForm({ onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handles 401 (Invalid Credentials) or 422 (Validation) errors
        throw new Error(data.message || 'Invalid email or password');
      }

      // Save Sanctum Token and User Info to LocalStorage
      if (data.token) {
        localStorage.setItem('bloodlink_token', data.token);
        localStorage.setItem('bloodlink_user', JSON.stringify(data.user));

        // Redirect to Donor Dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="hk4547124@gmail.com"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl font-semibold text-sm shadow-md shadow-rose-200 transition-all"
      >
        {loading ? 'Authenticating...' : 'Sign In'}
      </button>

      <p className="text-center text-xs text-slate-500 pt-1">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-rose-600 font-semibold hover:underline"
        >
          Register Now
        </button>
      </p>
    </form>
  );
}