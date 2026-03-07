module.exports = {
  models: {
    user: require('./models/User.js'),
    product: require('./models/Product.js'),
    order: require('./models/Order.js'),
  },
  controllers: {
    user: require('./controllers/userController.js'),
    product: require('./controllers/productController.js'),
    order: require('./controllers/orderController.js'),
  },
  middleware: {
    auth: require('./middleware/auth.js'),
    error: require('./middleware/error.js'),
  },
  routes: {
    user: require('./routes/user.js'),
    product: require('./routes/product.js'),
    order: require('./routes/order.js'),
  },
  utils: {
    APIFeatures: require('./utils/apiFeatures.js'),
  }
};