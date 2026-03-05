const express = require('express');
const router = express.Router();
const { login, register, createCheckoutSession } = require('../../controllers/userController');
const { authorizeUserMiddleware } = require('../../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/checkout', authorizeUserMiddleware, createCheckoutSession);

module.exports = router