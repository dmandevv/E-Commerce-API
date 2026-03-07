const express = require('express');
const router = express.Router();
const { login, register, createCheckoutSession } = require('#src/api/controllers/userController');
const { authorizeUserMiddleware } = require('#src/api/middleware/auth');
const { connectDB } = require('#app')

router.post('/register', connectDB, register);
router.post('/login', connectDB, login);
router.post('/checkout', connectDB, authorizeUserMiddleware, createCheckoutSession);

module.exports = router