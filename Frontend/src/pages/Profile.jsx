import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../redux/slices/authSlice';
import {
  FiMail, FiLock, FiCheckCircle, FiEdit2, FiSave, FiArrowLeft,
  FiPhone, FiMapPin, FiPlus, FiTrash2, FiHome, FiBriefcase, FiMap
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    fetchAddresses();
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

  // Address Functions
  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data);
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      if (editingAddressId) {
        await api.put(`/addresses/${editingAddressId}`, newAddress);
        toast.success("Address updated successfully!");
      } else {
        await api.post('/addresses', newAddress);
        toast.success("Address added successfully!");
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setAddressLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Address deleted successfully!");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const setAsDefault = async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      toast.success("Default address updated!");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  const handleEditAddress = (addr) => {
    setNewAddress({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault
    });
    setEditingAddressId(addr._id);
    setShowAddressForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#ff5252] transition-colors rounded-lg bg-white shadow-sm border border-gray-200"
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
        <div className="bg-white rounded-3xl p-8 mb-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
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
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name || 'User'}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-3">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <FiMail className="text-[#ff5252]" /> {user?.email || '—'}
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <FiPhone className="text-[#ff5252]" /> {user?.phone || '—'}
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <FiMapPin className="text-[#ff5252]" /> {user?.city || '—'}
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
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
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
                    <p className="text-gray-900 font-bold">{profile.name || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Phone</label>
                  {isEditing ? (
                    <input name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 focus:border-[#ff5252] outline-none font-bold" />
                  ) : (
                    <p className="text-gray-900 font-bold">{profile.phone || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City / Region</label>
                  {isEditing ? (
                    <input name="city" value={profile.city} onChange={handleProfileChange} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 focus:border-[#ff5252] outline-none font-bold" />
                  ) : (
                    <p className="text-gray-900 font-bold">{profile.city || '—'}</p>
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
                    <p className="text-gray-900 font-bold">{profile.address || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Security Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className="h-6 w-1 bg-[#ff5252] rounded-full"></span>
                  Security
                </h3>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center gap-2 text-sm font-black text-[#ff5252] hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                  >
                    Reset Password
                  </button>
                )}
              </div>

              {showPasswordForm ? (
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

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="flex-1 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-2 bg-[#ff5252] text-white py-4 px-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#e04848] transition-all shadow-lg shadow-red-50"
                    >
                      {passwordLoading ? 'UPDATING...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                  <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#ff5252]">
                    <FiLock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Password & Authentication</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Last updated: Recently</p>
                  </div>
                </div>
              )}
            </div>

            {/* Addresses Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className="h-6 w-1 bg-[#ff5252] rounded-full"></span>
                  Saved Addresses
                </h3>
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setEditingAddressId(null);
                      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
                    }}
                    className="flex items-center gap-2 text-sm font-black text-[#ff5252] hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                  >
                    <FiPlus /> Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddressSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Address Label (Home, Work, etc.)</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#ff5252] outline-none"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        placeholder="e.g. Home"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Phone Number</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#ff5252] outline-none"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Pincode</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#ff5252] outline-none"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Street Address</label>
                      <textarea
                        required
                        rows="2"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#ff5252] outline-none"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">City</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#ff5252] outline-none"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">State</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:border-[#ff5252] outline-none"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="w-4 h-4 accent-[#ff5252]"
                      />
                      <label htmlFor="isDefault" className="text-xs font-bold text-gray-600">Set as default address</label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="flex-1 py-3 text-sm font-bold text-white bg-[#ff5252] rounded-xl hover:bg-[#e04848] transition-all"
                    >
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                      <FiMapPin size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm font-medium">No saved addresses yet</p>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-[#ff5252]/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="p-2 bg-red-50 text-[#ff5252] rounded-lg">
                              {addr.name.toLowerCase().includes('home') ? <FiHome size={16} /> :
                                addr.name.toLowerCase().includes('office') || addr.name.toLowerCase().includes('work') ? <FiBriefcase size={16} /> :
                                  <FiMap size={16} />}
                            </span>
                            <h4 className="font-black text-gray-900 uppercase text-xs tracking-wider">{addr.name}</h4>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-[#27ae60] text-white px-2 py-0.5 rounded-full font-bold">DEFAULT</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="p-2 text-gray-400 hover:text-[#ff5252] hover:bg-red-50 rounded-lg transition-all"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1 pt-1">
                            <FiPhone size={10} /> {addr.phone}
                          </p>
                        </div>
                        {!addr.isDefault && (
                          <button
                            onClick={() => setAsDefault(addr._id)}
                            className="mt-4 w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 rounded-xl hover:border-[#ff5252] hover:text-[#ff5252] transition-all"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}