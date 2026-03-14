import { Router } from 'express';
import { register, login, getProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Protected routes
router.get('/profile', authenticate, asyncHandler(getProfile));

export default router;
