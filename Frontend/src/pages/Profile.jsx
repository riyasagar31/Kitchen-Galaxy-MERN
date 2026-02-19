import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../redux/slices/authSlice';
import {
  FiMail, FiLock, FiCheckCircle, FiEdit2, FiSave, FiArrowLeft,
  FiPhone, FiMapPin
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Profile State
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', city: '', pincode: '', state: '',
    shopName: '', shopDescription: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        state: user.state || '',
        shopName: user.shopName || '',
        shopDescription: user.shopDescription || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await dispatch(updateUserProfile(profile)).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }
    setPasswordLoading(true);
    try {
      const { data } = await api.post('/auth/change-password', passwords);
      toast.success(data.message);
      setPasswords({ currentPassword: '', newPassword: '' });
      if (data.token) localStorage.setItem('token', data.token);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#ff5252] transition-colors rounded-lg bg-gray-50 shadow-sm"
          >
            <FiArrowLeft size={18} /> Back
          </button>

          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-gray-100 text-gray-800 border">
              CUSTOMER ACCOUNT
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gray-50/50 rounded-3xl p-8 mb-8 border border-gray-100 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            {/* Fixed Icon - No Transition/Rotation */}
            <div className="h-28 w-28 bg-[#ff5252] rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'H'}
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-gray-900 rounded-full border-4 border-white flex items-center justify-center text-white shadow-md">
              <FiCheckCircle size={16} />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name || 'harsh'}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-3">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <FiMail className="text-[#ff5252]" /> {user?.email || 'harsh@gmail.com'}
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <FiPhone className="text-[#ff5252]" /> {user?.phone || '+91 1452369875'}
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <FiMapPin className="text-[#ff5252]" /> {user?.city || 'Vadodara'}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#ff5252] transition-all"
              >
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="bg-[#2ecc71] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#27ae60] shadow-lg shadow-green-100"
                >
                  <FiSave /> {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-50/30 rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="h-6 w-1 bg-[#ff5252] rounded-full"></span>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                  {isEditing ? (
                    <input name="name" value={profile.name} onChange={handleProfileChange} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 focus:border-[#ff5252] outline-none font-bold" />
                  ) : (
                    <p className="text-gray-900 font-bold">{profile.name || 'harsh'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Phone</label>
                  {isEditing ? (
                    <input name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 focus:border-[#ff5252] outline-none font-bold" />
                  ) : (
                    <p className="text-gray-900 font-bold">{profile.phone || '+91 1452369875'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City / Region</label>
                  {isEditing ? (
                    <input name="city" value={profile.city} onChange={handleProfileChange} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 focus:border-[#ff5252] outline-none font-bold" />
                  ) : (
                    <p className="text-gray-900 font-bold">{profile.city || 'Vadodara'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pincode</label>
                  {isEditing ? (
                    <input name="pincode" value={profile.pincode} onChange={handleProfileChange} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 focus:border-[#ff5252] outline-none font-bold" />
                  ) : (
                    <p className="text-gray-900 font-bold">{profile.pincode || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">State</label>
                  {isEditing ? (
                    <input name="state" value={profile.state} onChange={handleProfileChange} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 focus:border-[#ff5252] outline-none font-bold" />
                  ) : (
                    <p className="text-gray-900 font-bold">{profile.state || '—'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Address</label>
                  {isEditing ? (
                    <textarea name="address" value={profile.address} onChange={handleProfileChange} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 focus:border-[#ff5252] outline-none font-bold" rows="2" />
                  ) : (
                    <p className="text-gray-900 font-bold">{profile.address || 'A/4, Swaraj nagar soc, vadodara'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Security Card */}
            <div className="bg-gray-50/30 rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="h-6 w-1 bg-[#ff5252] rounded-full"></span>
                Security
              </h3>

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-[#ff5252] outline-none transition-all"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-[#ff5252] outline-none transition-all"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-[#ff5252] text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#e04848] transition-all shadow-lg shadow-red-50"
                >
                  {passwordLoading ? 'UPDATING...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}