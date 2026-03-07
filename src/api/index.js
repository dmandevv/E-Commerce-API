import APIFeatures from './utils/apiFeatures.js';   

export const models = {
  user: require('./models/User.js'),
  product: require('./models/Product.js'),
  order: require('./models/Order.js'),
};

export const controllers = {
  user: require('./controllers/userController.js'),
  product: require('./controllers/productController.js'),
  order: require('./controllers/orderController.js'),
};

export const middleware = {
    auth: require('./middleware/auth.js'),
    error: require('./middleware/error.js'),
};

export const routes = {
    user: require('./routes/user.js'),
    product: require('./routes/product.js'),
    order: require('./routes/order.js'),
};