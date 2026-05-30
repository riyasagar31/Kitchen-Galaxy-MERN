import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';
import { listSellerOrders, updateSellerOrderStatus, updateOrderItemStatus, getSellerAnalytics, getSellerReport } from '../controllers/seller/sellerOrderController.js';

const router = express.Router();
const sellerOnly = [authMiddleware, authorizeRoles('seller', 'admin')];

router.get('/orders', ...sellerOnly, listSellerOrders);
router.get('/analytics', ...sellerOnly, getSellerAnalytics);
router.get('/report', ...sellerOnly, getSellerReport);
router.patch('/orders/:id/status', ...sellerOnly, updateSellerOrderStatus);
router.patch('/orders/:orderId/items/:itemId/status', ...sellerOnly, updateOrderItemStatus);

export default router;
