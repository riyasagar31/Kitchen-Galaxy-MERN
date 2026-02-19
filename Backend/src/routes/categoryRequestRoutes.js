import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { createRequest, getRequests, updateRequestStatus } from '../controllers/admin/categoryRequestController.js';

const router = express.Router();

// Seller: Create Request
router.post('/', authMiddleware, requireRole('seller'), createRequest);

// Admin: List Requests
router.get('/', authMiddleware, requireRole('admin'), getRequests);

// Admin: Update Status
router.patch('/:id', authMiddleware, requireRole('admin'), updateRequestStatus);

export default router;
