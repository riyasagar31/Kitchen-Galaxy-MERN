// src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'seller', 'customer'],
    default: 'customer'
  },
  /**
   * Token Storage:
   * Storing the JWT or session token directly on the user model.
   */
  token: {
    type: String,
    default: null
  },
  /**
   * Status Logic:
   * 'active': User can login freely.
   * 'pending': Default for Sellers. Blocked from login until Admin approves.
   * 'inactive': Blocked by Admin. Displays "Please contact admin" message.
   */
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    default: 'active' // Set a safe default
  },

  /**
   * Password Reset Logic:
   * resetPasswordToken: A temporary crypto-string sent to the user's email.
   * resetPasswordExpires: The timestamp after which the token is no longer valid.
   */

  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },

  // --- NEW: Seller & Profile Fields ---

  // Address Details (Common for all users)
  phone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  pincode: { type: String, trim: true, default: '' },
  state: { type: String, trim: true, default: '' },

  // Seller Details
  shopName: { type: String, trim: true },
  shopDescription: { type: String, trim: true },
  experience: { type: String, trim: true }, // e.g., "2 years"
  platform: { type: String, enum: ['shop', 'online', 'both'], default: 'shop' },

  // OTP Authentication
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },

  // --- NEW: Addresses Array ---
  addresses: [{
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Updated safe serializer
userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    phone: this.phone,
    address: this.address,
    city: this.city,
    pincode: this.pincode,
    state: this.state,
    shopName: this.shopName,
    shopDescription: this.shopDescription,
    experience: this.experience,
    platform: this.platform,
    addresses: this.addresses
  };
};

export default mongoose.model('User', userSchema);