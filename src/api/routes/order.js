const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderByID,
    updateOrderStatus,
    getAllOrders
} = require('../../controllers/orderController');

const { authorizeUserMiddleware, authorizeRolesMiddleware } = require('../../middleware/auth');

// User routes
router.post('/order', authorizeUserMiddleware, createOrder);
router.get('/orders', authorizeUserMiddleware, getUserOrders);
router.get('/order/:orderId', authorizeUserMiddleware, getOrderByID);

// Admin routes
router.get('/admin/orders', authorizeUserMiddleware, authorizeRolesMiddleware('admin'), getAllOrders);
router.patch('/admin/order/:orderId', authorizeUserMiddleware, authorizeRolesMiddleware('admin'), updateOrderStatus);

module.exports = router;