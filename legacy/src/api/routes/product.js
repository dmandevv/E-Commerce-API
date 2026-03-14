const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct, getSingleProduct, createProductReview, getProductReviews, deleteReview, getProducts } = require('#controllers/productController');
const { authorizeUserMiddleware, authorizeRolesMiddleware } = require('#middleware/auth');
const { connectDB } = require('#middleware/database');

//User endpoints
router.route('/product/:id').get(connectDB, getSingleProduct);
router.route('/products').get(connectDB, getProducts);
router.route('/review').put(connectDB, authorizeUserMiddleware, createProductReview);
router.route('/reviews').get(connectDB, getProductReviews);

//Admin endpoints
router.post('/admin/product/new', connectDB, authorizeUserMiddleware, authorizeRolesMiddleware('admin'), createProduct);
router.route('/admin/product/:id')
    .patch(connectDB, authorizeUserMiddleware, authorizeRolesMiddleware('admin'), updateProduct)
    .delete(connectDB, authorizeUserMiddleware, authorizeRolesMiddleware('admin'), deleteProduct);
router.route('/admin/reviews')
    .delete(connectDB, authorizeUserMiddleware, authorizeRolesMiddleware('admin'), deleteReview);


module.exports = router