const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { adminMiddleware } = require('../middleware/auth');

//Admin endpoints
router.post('/admin/product/new', adminMiddleware, createProduct);
router.patch('/admin/product/:id', adminMiddleware, updateProduct);
router.delete('/admin/product/:id', adminMiddleware, deleteProduct);

module.exports = router