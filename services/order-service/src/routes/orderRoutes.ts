import { Router } from 'express';
import { placeOrder, getOrder, getMyOrders, updateStatus } from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post('/', asyncHandler(placeOrder));
router.get('/mine', asyncHandler(getMyOrders));
router.get('/:id', asyncHandler(getOrder));

// Admin only
router.patch('/:id/status', authorize('admin'), asyncHandler(updateStatus));

export default router;
