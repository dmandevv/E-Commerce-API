const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct, getSingleProduct, createProductReview, getProductReviews, deleteReview, getProducts } = require('../controllers/productController');
const { adminMiddleware, authorizeUserMiddleware, authorizeRolesMiddleware } = require('../middleware/auth');

//User endpoints
router.route('/product/:id').get(getSingleProduct);
router.route('/products').get(getProducts);
router.route('/review').put(authorizeUserMiddleware, createProductReview);
router.route('/reviews').get(getProductReviews)

//Admin endpoints
router.post('/admin/product/new', authorizeUserMiddleware, authorizeRolesMiddleware('admin'), createProduct);
router.route('/admin/product/:id')
    .patch(authorizeUserMiddleware, authorizeRolesMiddleware('admin'), updateProduct)
    .delete(authorizeUserMiddleware, authorizeRolesMiddleware('admin'), deleteProduct);
router.route('/admin/reviews')
    .delete(authorizeUserMiddleware, authorizeRolesMiddleware('admin'), deleteReview);


module.exports = router