// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Real-time Validation Logic
  useEffect(() => {
    const newErrors = {};
    if (form.name && form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (form.email && !emailRegex.test(form.email)) {
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
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the validation errors.");
      return;
    }

    setSubmitting(true);
    try {
      const { name, email, password, role } = form;
      // Removed extra fields: phone, city, shopName, etc.
      await register(name.trim(), email.trim(), password, role);

      if (role === 'seller') {
        toast.success('Registration successful! Please wait for Admin approval.', { duration: 6000 });
      } else {
        toast.success('Welcome! Registration successful.');
      }
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-start justify-center bg-white pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-black tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Join the Kitchen Galaxy community</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-all font-semibold text-black ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#ff5252]'
                  }`}
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase italic">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email address</label>
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

            {/* Password Input with Toggle */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
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

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">I am a...</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#ff5252] sm:text-sm transition-all font-bold text-black"
              >
                <option value="customer">Customer (Want to Buy)</option>
                <option value="seller">Seller (Want to Sell)</option>
              </select>
              {form.role === 'seller' && (
                <p className="mt-2 text-[10px] text-orange-600 font-bold uppercase tracking-tighter">* Requires Manual Admin Approval</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || Object.keys(errors).length > 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#ff5252] hover:bg-[#e04848] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5252] disabled:bg-gray-400 transition-all active:scale-[0.98] shadow-lg"
            >
              {submitting ? 'Creating Account...' : 'Register'}
            </button>
          </div>

          <div className="text-sm text-center font-medium">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-bold text-[#ff5252] hover:text-[#e04848] transition-colors underline underline-offset-4">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}