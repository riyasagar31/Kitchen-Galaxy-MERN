// src/routes/orderRoutes.js
import express from 'express';
import { createOrder, getCustomerOrders } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getCustomerOrders);

export default router;