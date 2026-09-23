import React, { useState } from 'react';
import { Mail, Lock, User, Phone } from 'lucide-react';
import BloodTypeSelector from './BloodTypeSelector';

export default function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    bloodType: 'O+',
    role: 'donor' // Default role required by Laravel validation
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side password validation (Laravel expects min 6 chars)
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    // Format payload to match Laravel's validation rules
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      blood_type: formData.bloodType, // Transformed from camelCase to snake_case
      role: formData.role
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle Laravel validation errors (HTTP 422)
        if (data.errors) {
          const firstError = Object.values(data.errors)[0][0];
          throw new Error(firstError);
        }
        throw new Error(data.message || 'Registration failed');
      }

      // Success: Save token and redirect
      if (data.token) {
        localStorage.setItem('bloodlink_token', data.token);
        localStorage.setItem('bloodlink_user', JSON.stringify(data.user));
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
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Hasnain"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="hasnain@example.com"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="03109349800"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Select Blood Type
        </label>
        <BloodTypeSelector
          selected={formData.bloodType}
          onSelect={(type) => setFormData({ ...formData, bloodType: type })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Password (min. 6 characters)
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create password"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl font-semibold text-sm shadow-md shadow-rose-200 transition-all"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className="text-center text-xs text-slate-500 pt-1">
        Already registered?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-rose-600 font-semibold hover:underline"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}