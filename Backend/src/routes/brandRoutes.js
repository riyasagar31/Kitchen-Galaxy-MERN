import express from 'express';
const router = express.Router();

import {
  createBrand,
  getAllBrandsAdmin,
  updateBrand,
  deleteBrand
} from '../controllers/brandController.js';

// FIX: Use the names you actually exported in auth.js and role.js
import { authMiddleware, authorizeRoles, adminOnly } from '../middleware/auth.js';

import { uploadImages } from '../middleware/upload.js';

// Public/Seller access to see brands
router.get('/', getAllBrandsAdmin);

// Admin only logic using the new names
// router.use applies to everything below this line
router.use(authMiddleware, adminOnly);

router.post('/', uploadImages.single('logo'), createBrand);

router.route('/:id')
  .put(uploadImages.single('logo'), updateBrand)
  .delete(deleteBrand);

export default router;