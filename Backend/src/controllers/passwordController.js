import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import * as MailService from '../services/mailService.js';

// --- FORGOT PASSWORD ---
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No user found with this email." });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour
    await user.save();

    await MailService.sendResetEmail(user.email, user.name, resetToken);
    res.json({ success: true, message: "Reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- RESET PASSWORD (via Email Link) ---
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Token is invalid or expired." });

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Reset failed" });
  }
};

// --- CHANGE PASSWORD (while logged in) ---
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Check if user ID exists from middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User session not found. Please re-login.' });
    }

    // 2. Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database.' });
    }

    // 3. Compare OLD password
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'The old password you entered is incorrect.' });
    }

    // 4. Hash the NEW password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 5. THE CRITICAL STEP: Direct Update
    // We use { new: true } to ensure Mongoose returns the updated document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        passwordHash: hashedNewPassword,
        token: null // Clear token to force fresh login
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({ error: 'Database failed to update password.' });
    }

    console.log(`Password updated successfully for: ${updatedUser.email}`);
    return res.status(200).json({ message: 'Password changed! Please login with your new password.' });

  } catch (err) {
    console.error('Change Password Error:', err);
    return res.status(500).json({ error: 'Server error during password change.' });
  }
};