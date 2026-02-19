// src/routes/sellerProductRoutes.js
import express from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { uploadImages } from '../middleware/upload.js';
import {
  listMyProducts, createMyProduct, updateMyProduct, deleteMyProduct
} from '../controllers/seller/sellerProductController.js';

const router = express.Router();
const sellerOnly = [authMiddleware, authorizeRoles('seller', 'admin')];

router.get('/products', ...sellerOnly, listMyProducts);
router.post('/products', ...sellerOnly, uploadImages.single('image'), createMyProduct);
router.patch('/products/:id', ...sellerOnly, uploadImages.single('image'), updateMyProduct);
router.delete('/products/:id', ...sellerOnly, deleteMyProduct);

export default router;
