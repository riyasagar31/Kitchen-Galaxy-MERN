import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { approveSeller } from '../controllers/userController.js';

const router = Router();

router.put('/approve-seller/:userId', requireAuth, requireRole('admin'), approveSeller);

export default router;
