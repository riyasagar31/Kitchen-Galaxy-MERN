import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiLock, FiCheckCircle } from 'react-icons/fi';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Real-time Validation
  useEffect(() => {
    const newErrors = {};
    if (form.password && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirm = "Passwords do not match.";
    }
    setErrors(newErrors);
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0 || !form.password) {
      return toast.error("Please ensure passwords match and are secure.");
    }

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.password })
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.error || "Token expired or invalid.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <FiLock className="h-6 w-6 text-[#ff5252]" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">Set New Password</h2>
          <p className="mt-2 text-sm text-gray-600">Please choose a strong password you haven't used before.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-all ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#ff5252]'
              }`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-all ${
                errors.confirm ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#ff5252]'
              }`}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {errors.confirm && <p className="mt-1 text-[10px] text-red-500 font-bold uppercase">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || Object.keys(errors).length > 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#ff5252] hover:bg-[#e04848] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5252] disabled:bg-gray-400 transition-all active:scale-95 shadow-md"
          >
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}