import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import Navbar from '../components/layout/Navbar';
import { Droplet } from 'lucide-react';

export default function AuthPage() {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {view === 'login' && 'Welcome Back'}
              {view === 'register' && 'Join BloodLink Network'}
              {view === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {view === 'login' && 'Sign in to access emergency requests & donor dashboard.'}
              {view === 'register' && 'Register as a donor to save lives in your area.'}
              {view === 'forgot' && 'Recover access to your donor account.'}
            </p>
          </div>

          {view === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setView('register')}
              onSwitchToForgot={() => setView('forgot')}
            />
          )}

          {view === 'register' && (
            <RegisterForm onSwitchToLogin={() => setView('login')} />
          )}

          {view === 'forgot' && (
            <ForgotPasswordForm onBackToLogin={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  );
}