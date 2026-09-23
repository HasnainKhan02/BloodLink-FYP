import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {submitted ? (
        <div className="text-center py-4 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Reset Link Sent</h3>
          <p className="text-xs text-slate-500">
            We sent instructions to recover your account to <span className="font-semibold text-slate-800">{email}</span>.
          </p>
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-rose-600 font-semibold hover:underline pt-2 block mx-auto"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter your account's registered email address and we'll send you a password reset link.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="donor@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-rose-200 transition-all"
          >
            Send Reset Link
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full text-center text-xs text-slate-500 font-semibold hover:text-slate-800 flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}
    </div>
  );
}