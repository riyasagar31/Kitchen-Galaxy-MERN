// src/routes/cartRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getCart, addToCart, updateQuantity, removeItem, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/add', authMiddleware, addToCart);
router.patch('/quantity', authMiddleware, updateQuantity);
router.delete('/item/:productId', authMiddleware, removeItem);
router.delete('/clear', authMiddleware, clearCart);

export default router;
