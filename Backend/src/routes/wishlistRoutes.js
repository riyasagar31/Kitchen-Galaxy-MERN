import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { toggleWishlist, getWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

// Get user's wishlist
router.get('/', authMiddleware, getWishlist);

// Add or Remove item
router.post('/toggle', authMiddleware, toggleWishlist);

export default router;