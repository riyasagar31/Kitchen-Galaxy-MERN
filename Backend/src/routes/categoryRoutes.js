import express from 'express';
import { listCategories } from '../controllers/admin/adminCategoryController.js';

const router = express.Router();

// Publicly accessible categories (or you can add authMiddleware if you want only logged-in users)
router.get('/', listCategories);

export default router;
