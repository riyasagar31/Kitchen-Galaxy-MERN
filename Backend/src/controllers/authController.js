import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import * as MailService from '../services/mailService.js';

// Helper to generate JWT
const issueToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// --- REGISTER ---
export const register = async (req, res) => {
  try {
    const {
      name, email, password, role,
      // New Fields
      phone, address, city, pincode, state,
      shopName, shopDescription, experience, platform
    } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);

    // Create User with all fields (Mongoose will ignore extra fields if not in schema, but we added them)
    const userData = {
      name, email, passwordHash, role,
      phone, address, city, pincode, state
    };

    // Add Seller specific fields
    if (role === 'seller') {
      userData.status = 'pending'; // Explicitly set pending for sellers
      if (shopName) userData.shopName = shopName;
      if (shopDescription) userData.shopDescription = shopDescription;
      if (experience) userData.experience = experience;
      if (platform) userData.platform = platform;
    }

    const user = await User.create(userData);

    const token = issueToken(user);
    user.token = token;
    await user.save();

    // Send Welcome Email via Service
    await MailService.sendWelcomeEmail(name, email, password, role);

    return res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// --- LOGIN ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Immediate Status Checks 
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account inactive. Please contact admin.' });
    }
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Account pending approval. Please wait for admin review.' });
    }

    // 3. Compare Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Issue Token
    const token = issueToken(user);

    // 5. Update token in DB
    await User.findByIdAndUpdate(user._id, { token: token });

    // 6. Response
    return res.json({
      token,
      user: user.toSafeJSON()
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// --- LOGOUT ---
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// --- GET PROFILE (ME) ---
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- UPDATE PROFILE ---
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, pincode, state, shopName, shopDescription } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (pincode) user.pincode = pincode;
    if (state) user.state = state;

    if (user.role === 'seller') {
      if (shopName) user.shopName = shopName;
      if (shopDescription) user.shopDescription = shopDescription;
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: user.toSafeJSON() });
  } catch (err) {
    console.error('Update Profile error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- CHANGE PASSWORD ---
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash New Password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;

    // Invalidate old tokens by generating a new one (or just clearing it)
    // Here we will keep the current user logged in by issuing a new token, 
    // BUT front-end might need to handle the new token if we send it back.
    // For specific requirement "still logged in as previous password" issue:
    // Changing the password hash invalidates the OLD logic if the token payload contained the password hash (which it doesn't).
    // However, we want to invalidate OTHER sessions.

    const newToken = issueToken(user);
    user.token = newToken; // Update stored token

    await user.save();

    res.json({ message: "Password changed successfully", token: newToken });
  } catch (err) {
    console.error('Change Password error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- ADMIN: UPDATE USER STATUS ---
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const user = await User.findById(id).select('+email +name');
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    // Trigger Email based on status
    if (status === 'active') {
      await MailService.sendApprovalEmail(user);
    } else if (status === 'inactive') {
      await MailService.sendRejectionEmail(user);
    }

    // Return updated dashboard data
    const allSellers = await User.find({ role: 'seller' });
    const counts = {
      pending: await User.countDocuments({ role: 'seller', status: 'pending' }),
      active: await User.countDocuments({ role: 'seller', status: 'active' }),
      inactive: await User.countDocuments({ role: 'seller', status: 'inactive' }),
    };

    return res.json({ message: `User status updated to ${status}`, users: allSellers, counts });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- SEND OTP ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    // Status checks
    if (user.status === 'inactive') return res.status(403).json({ message: 'Account inactive. Please contact admin.' });
    if (user.status === 'pending') return res.status(403).json({ message: 'Account pending approval. Please wait for admin review.' });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await MailService.sendOTPEmail(user.email, user.name, otp);

    return res.json({ message: 'OTP sent to your email. It is valid for 5 minutes.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// --- VERIFY OTP ---
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user || !user.otp) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Check expiry
    if (new Date() > user.otpExpires) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP value
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpires = null;

    // Issue token
    const token = issueToken(user);
    user.token = token;
    await user.save();

    return res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
