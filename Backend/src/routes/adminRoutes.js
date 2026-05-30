import express from 'express';
// Ensure your middleware imports match your actual file names (auth.js vs authMiddleware.js)
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

import { getAdminSummary } from '../controllers/admin/adminDashboardController.js';
import { listProducts, getProduct, createProduct, updateProduct, toggleProductVisible, deleteProduct } from '../controllers/admin/adminProductController.js';
import { listOrders, getOrder, updateOrderStatus, deleteOrder } from '../controllers/admin/adminOrderController.js';
// UPDATED: Removed toggleUserActive and setUserActiveStatus, added setUserStatus
import { listUsers, updateUser, getUser, deleteUser, setUserStatus } from '../controllers/admin/adminUserController.js';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/admin/adminCategoryController.js';
import { searchSellers } from '../controllers/admin/adminSellerController.js';

import {
  getMonthlySales,
  getOrdersPerMonth,
  getDashboardCounts,
  getTopProducts,
  getSellerRevenue,
  getPaymentMethodDistribution,
  getAdminReport
} from '../controllers/admin/adminAnalyticsController.js';

const router = express.Router();
const adminOnly = [authMiddleware, requireRole('admin')];

// Analytics
router.get('/analytics/monthly-sales', ...adminOnly, getMonthlySales);
router.get('/analytics/orders-per-month', ...adminOnly, getOrdersPerMonth);
router.get('/analytics/counts', ...adminOnly, getDashboardCounts);
router.get('/analytics/top-products', ...adminOnly, getTopProducts);
router.get('/analytics/seller-revenue', ...adminOnly, getSellerRevenue);
router.get('/analytics/payment-methods', ...adminOnly, getPaymentMethodDistribution);
router.get('/analytics/report', ...adminOnly, getAdminReport);

// Dashboard
router.get('/dashboard', ...adminOnly, getAdminSummary);

import { uploadImages } from '../middleware/upload.js';

// ... (imports remain)

// Products
router.get('/products', ...adminOnly, listProducts);
router.post('/products', authMiddleware, requireRole('admin'), uploadImages.array('images', 5), createProduct);
router.get('/products/:id', ...adminOnly, getProduct);
// Enable file uploads for product updates
router.patch('/products/:id', authMiddleware, requireRole('admin'), uploadImages.array('images', 5), updateProduct);
router.patch('/products/:id/toggle-visible', ...adminOnly, toggleProductVisible);
router.delete('/products/:id', ...adminOnly, deleteProduct);

// Categories
router.get('/categories', ...adminOnly, listCategories);
router.get('/categories/:id', ...adminOnly, getCategory);
router.post('/categories', ...adminOnly, createCategory);
router.patch('/categories/:id', ...adminOnly, updateCategory);
router.delete('/categories/:id', ...adminOnly, deleteCategory);

// Sellers & Orders
router.get('/sellers', ...adminOnly, searchSellers);
router.get('/orders', ...adminOnly, listOrders);
router.get('/orders/:id', ...adminOnly, getOrder);
router.put('/orders/:id/status', ...adminOnly, updateOrderStatus);
router.delete('/orders/:id', ...adminOnly, deleteOrder);

// Users Management
router.get('/users', ...adminOnly, listUsers);
router.get('/users/:id', ...adminOnly, getUser);
router.patch('/users/:id', ...adminOnly, updateUser);

/** * UPDATED ROUTE: 
 * This replaces 'toggle-active' and 'active' routes.
 * Use this for approving sellers or deactivating users.
 * Frontend should send: PATCH /api/admin/users/ID/status with { "status": "active" }
 */
router.patch('/users/:id/status', ...adminOnly, setUserStatus);

router.delete('/users/:id', ...adminOnly, deleteUser);

export default router;