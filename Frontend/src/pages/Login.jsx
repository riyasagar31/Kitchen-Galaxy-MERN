// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiKey } from 'react-icons/fi';
import api from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Toggle between password and OTP mode
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'

  // Password login state
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Real-time Validation Logic
  useEffect(() => {
    const newErrors = {};
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (form.password && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
  }, [form]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ─── Password Login ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0 || !form.email || !form.password) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setSubmitting(true);
    try {
      const u = await login(form.email.trim(), form.password);
      if (u.role === 'admin') navigate('/admin/dashboard');
      else if (u.role === 'seller') navigate('/seller');
      else navigate('/');
      toast.success(`Welcome back, ${u.name}!`);
    } catch (err) {
      toast.error(err.message || 'Login failed', {
        style: { border: '1px solid #ff5252', color: '#ff5252' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email || errors.email) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    setIsForgotPasswordLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reset link sent! Check your email inbox.");
      } else {
        toast.error(data.error || "Could not process request.");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (errors) {
      toast.error("Server error. Please try again later.");
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  // ─── OTP Login ───
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!otpEmail || !/\S+@\S+\.\S+/.test(otpEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', { email: otpEmail.trim() });
      toast.success(data.message || "OTP sent! Check your email.");
      setOtpSent(true);
      setOtpTimer(300); // 5 minute countdown
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email: otpEmail.trim(), otp: otpCode.trim() });
      // Store token and user the same way normal login does
      localStorage.setItem('token', data.token);
      // Navigate based on role
      const role = data.user?.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'seller') navigate('/seller');
      else navigate('/');
      toast.success(`Welcome back, ${data.user?.name}!`);
      // Force page reload so AuthContext picks up the new token
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const switchMode = (mode) => {
    setLoginMode(mode);
    setOtpSent(false);
    setOtpCode('');
    setOtpEmail('');
    setOtpTimer(0);
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-start justify-center bg-white pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-black text-black tracking-tight">Sign In</h2>
          <p className="mt-2 text-center text-sm text-gray-500 font-medium">Welcome back to Kitchen Galaxy</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 p-1 bg-gray-50 gap-1">
          <button
            type="button"
            onClick={() => switchMode('password')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${loginMode === 'password' ? 'bg-white shadow text-[#ff5252]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FiKey size={14} /> Password
          </button>
          <button
            type="button"
            onClick={() => switchMode('otp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${loginMode === 'otp' ? 'bg-white shadow text-[#ff5252]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FiMail size={14} /> Email OTP
          </button>
        </div>

        {/* ─── PASSWORD MODE ─── */}
        {loginMode === 'password' && (
          <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email-address" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-all font-semibold text-black ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#ff5252]'}`}
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase italic">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isForgotPasswordLoading}
                    className="text-[11px] font-bold text-gray-400 hover:text-black uppercase tracking-tighter transition-colors duration-200"
                  >
                    {isForgotPasswordLoading ? 'Sending...' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`appearance-none block w-full px-3 pr-10 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-all font-semibold text-black ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#ff5252]'}`}
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase italic">{errors.password}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#ff5252] hover:bg-[#e04848] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5252] disabled:bg-gray-400 transition-all active:scale-[0.98] shadow-lg"
              >
                {submitting ? 'Verifying...' : 'Sign In'}
              </button>
            </div>

            <div className="text-sm text-center font-medium">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="font-bold text-[#ff5252] hover:text-[#e04848] transition-colors underline underline-offset-4">
                Register here
              </Link>
            </div>
          </form>
        )}

        {/* ─── OTP MODE ─── */}
        {loginMode === 'otp' && (
          <div className="mt-2 space-y-6">
            {!otpSent ? (
              /* Step 1: Enter email and request OTP */
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff5252] sm:text-sm font-semibold text-black"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-lg text-white bg-[#ff5252] hover:bg-[#e04848] disabled:bg-gray-400 transition-all active:scale-[0.98] shadow-lg"
                >
                  {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP code */
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-green-700">OTP sent to</p>
                  <p className="text-sm font-black text-green-800 truncate">{otpEmail}</p>
                  {otpTimer > 0 && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Expires in <span className="font-black">{formatTimer(otpTimer)}</span>
                    </p>
                  )}
                  {otpTimer === 0 && (
                    <p className="text-xs text-red-500 font-bold mt-1">OTP expired. Please request a new one.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="● ● ● ● ● ●"
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff5252] text-2xl font-black text-center tracking-[0.5em] text-gray-800"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpTimer === 0}
                  className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-lg text-white bg-[#ff5252] hover:bg-[#e04848] disabled:bg-gray-400 transition-all active:scale-[0.98] shadow-lg"
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpCode(''); setOtpTimer(0); }}
                  className="w-full text-xs font-bold text-gray-400 hover:text-[#ff5252] uppercase tracking-wider transition-colors"
                >
                  ← Use a different email or resend
                </button>
              </form>
            )}

            <div className="text-sm text-center font-medium">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="font-bold text-[#ff5252] hover:text-[#e04848] transition-colors underline underline-offset-4">
                Register here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}