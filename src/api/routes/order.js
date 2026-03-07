const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderByID,
    updateOrderStatus,
    getAllOrders
} = require('#api/index').controllers.OrderController;
const { connectDB } = require('#app')

const { authorizeUserMiddleware, authorizeRolesMiddleware } = require('#api/index').middleware.auth;

// User routes
router.post('/order', connectDB,  authorizeUserMiddleware, createOrder);
router.get('/orders', connectDB, authorizeUserMiddleware, getUserOrders);
router.get('/order/:orderId', connectDB, authorizeUserMiddleware, getOrderByID);

// Admin routes
router.get('/admin/orders', connectDB, authorizeUserMiddleware, authorizeRolesMiddleware('admin'), getAllOrders);
router.patch('/admin/order/:orderId', connectDB, authorizeUserMiddleware, authorizeRolesMiddleware('admin'), updateOrderStatus);

module.exports = router;