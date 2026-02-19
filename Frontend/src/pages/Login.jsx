// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-start justify-center bg-white pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-black text-black tracking-tight">Sign In</h2>
          <p className="mt-2 text-center text-sm text-gray-500 font-medium">Welcome back to Kitchen Galaxy</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-all font-semibold text-black ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#ff5252]'
                  }`}
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
                  className={`appearance-none block w-full px-3 pr-10 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-all font-semibold text-black ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#ff5252]'
                    }`}
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
      </div>
    </div>
  );
}