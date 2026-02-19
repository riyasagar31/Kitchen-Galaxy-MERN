import express from 'express';
// Controllers
import { register, login, logout, getMe, updateUserStatus, changePassword, updateProfile } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/passwordController.js';

// Middlewares
import { authMiddleware } from '../middleware/auth.js'; // Corrected path
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.post('/register', register);
router.post('/login', login);

// Password Recovery (Public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// --- PROTECTED ROUTES (User must be logged in) ---
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile); // NEW: Update Profile

// Update password (Logged-in users)
router.post('/change-password', authMiddleware, changePassword);

// --- ADMIN ONLY ROUTES ---
// Using requireRole('admin') instead of adminOnly
router.patch('/users/:id/status', authMiddleware, requireRole('admin'), updateUserStatus);

export default router;