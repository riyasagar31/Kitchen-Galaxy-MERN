import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';
import { listSellerOrders, updateSellerOrderStatus, getSellerAnalytics } from '../controllers/seller/sellerOrderController.js';

const router = express.Router();
const sellerOnly = [authMiddleware, authorizeRoles('seller', 'admin')];

router.get('/orders', ...sellerOnly, listSellerOrders);
router.get('/analytics', ...sellerOnly, getSellerAnalytics);
router.patch('/orders/:id/status', ...sellerOnly, updateSellerOrderStatus);

export default router;
