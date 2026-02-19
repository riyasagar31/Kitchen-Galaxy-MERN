import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createReview, getProductReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authMiddleware, createReview);

export default router;
