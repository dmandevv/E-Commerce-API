const express = require('express');
const router = express.Router();
const { login, register, createCheckoutSession } = require('../../controllers/userController');
const { authorizeUserMiddleware } = require('../../middleware/auth');
const { connectDB } = require('../../app')

router.post('/register', connectDB, register);
router.post('/login', connectDB, login);
router.post('/checkout', connectDB, authorizeUserMiddleware, createCheckoutSession);

module.exports = router