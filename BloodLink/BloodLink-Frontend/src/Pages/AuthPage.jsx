import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, ArrowRight, CheckCircle2, User, Lock, Phone, HeartPulse, KeyRound } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [step, setStep] = useState(1); // 1 = Input/Send Code, 2 = Verify OTP
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    blood_type: "A+",
    otp: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

// Handle Login Authentication
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccessMsg("");

  try {
    const res = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors) {
        const firstErr = Object.values(data.errors)[0][0];
        throw new Error(firstErr);
      }
      throw new Error(data.message || "Invalid login credentials.");
    }

    // Support both 'token' and 'access_token' keys from Laravel
    const token = data.token || data.access_token;

    if (!token) {
      throw new Error("Authentication failed: No token received from server.");
    }

    // Store auth credentials
    localStorage.setItem("bloodlink_token", token);
    localStorage.setItem("bloodlink_user", JSON.stringify(data.user));

    setSuccessMsg("Logged in successfully! Redirecting...");

    // Immediate redirection to Dashboard
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 500);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Step 1: Send Registration Email OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) throw new Error(Object.values(data.errors)[0][0]);
        throw new Error(data.message || "Failed to send verification code.");
      }

      setSuccessMsg("Verification code sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register-verified", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) throw new Error(Object.values(data.errors)[0][0]);
        throw new Error(data.message || "Invalid or expired OTP code.");
      }

      setSuccessMsg("Email verified & registered successfully! Please sign in.");
      setTimeout(() => {
        setMode("login");
        setStep(1);
        setSuccessMsg("Account created! Enter your password to sign in.");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - Step 1: Send Reset OTP
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) throw new Error(Object.values(data.errors)[0][0]);
        throw new Error(data.message || "Failed to send reset code.");
      }

      setSuccessMsg("Reset code sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) throw new Error(Object.values(data.errors)[0][0]);
        throw new Error(data.message || "Failed to reset password.");
      }

      setSuccessMsg("Password reset successfully! Please sign in.");
      setTimeout(() => {
        setMode("login");
        setStep(1);
        setSuccessMsg("Sign in with your new password.");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20">
        
        {/* Modern Minimalist Header */}
        <div className="pt-8 pb-6 px-8 text-center bg-gradient-to-b from-rose-50/50 to-transparent">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/30 mb-3">
            <HeartPulse className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Blood<span className="text-rose-600">Link</span></h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {mode === "login" 
              ? "Welcome back! Access your donor dashboard." 
              : mode === "register" 
                ? step === 1 ? "Join our life-saving community network." : "Verify your inbox to secure account."
                : "Recover access to your account securely."}
          </p>
        </div>

        {/* Tab Selector */}
        {mode !== "forgot" && (
          <div className="flex px-6 mb-2">
            <div className="flex w-full bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setMode("register"); setStep(1); setError(""); setSuccessMsg(""); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  mode === "register" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  mode === "login" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        <div className="p-8 pt-4">
          {/* Notifications */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs p-3.5 rounded-2xl mb-4 font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3.5 rounded-2xl mb-4 font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successMsg}
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {mode === "forgot" && (
            <div>
              <button
                type="button"
                onClick={() => { setMode("login"); setStep(1); setError(""); setSuccessMsg(""); }}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 mb-4 inline-block transition"
              >
                ← Back to Sign In
              </button>

              {step === 1 ? (
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/25 disabled:opacity-50"
                  >
                    {loading ? "Sending Code..." : "Send Reset Code"} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">6-Digit Reset Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      className="w-full py-3 text-center text-xl font-mono tracking-widest font-bold border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Reset Password & Sign In"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SIGN IN VIEW */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setStep(1); setError(""); setSuccessMsg(""); }}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/25 disabled:opacity-50 mt-2"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* REGISTER VIEW (STEP 1 & STEP 2) */}
          {mode === "register" && (
            <>
              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="+923001234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Blood Group</label>
                    <select
                      value={formData.blood_type}
                      onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-rose-600/25 disabled:opacity-50 mt-2"
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                  <div className="text-center mb-2">
                    <ShieldCheck className="w-10 h-10 text-rose-600 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-600">
                      Enter the 6-digit code sent to <br />
                      <span className="font-bold text-slate-900">{formData.email}</span>
                    </p>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="w-full py-3.5 text-center text-xl font-mono tracking-widest font-bold border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 transition"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Complete Registration"} <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-xs text-slate-500 hover:underline text-center block mt-2"
                  >
                    Change Email Address
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}