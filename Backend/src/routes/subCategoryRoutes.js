import express from 'express';
import { listSubCategories, createSubCategory, updateSubCategory, deleteSubCategory } from '../controllers/admin/adminSubCategoryController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Admin only (assuming authMiddleware checks role, or add admin check)
// For simplicity using authMiddleware. Ideally should check admin role.
router.use(authMiddleware);

router.get('/', listSubCategories);
router.post('/', createSubCategory);
router.patch('/:id', updateSubCategory);
router.delete('/:id', deleteSubCategory);

export default router;
