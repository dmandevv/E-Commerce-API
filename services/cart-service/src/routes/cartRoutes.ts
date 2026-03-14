import { Router } from 'express';
import {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', asyncHandler(getCart));
router.post('/items', asyncHandler(addItem));
router.patch('/items/:productId', asyncHandler(updateQuantity));
router.delete('/items/:productId', asyncHandler(removeItem));
router.delete('/', asyncHandler(clearCart));

export default router;
