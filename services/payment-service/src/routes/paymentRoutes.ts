import { Router } from 'express';
import { getPayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Authenticated routes
router.get('/:orderId', authenticate, asyncHandler(getPayment));

export default router;
