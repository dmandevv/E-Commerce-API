
const Product = require('#api/index').models.Product;
const Order = require('#api/index').models.Order;

// Create a new order - called after successful Stripe payment
// Take cart items from frontend and saves them as complete order in the database
exports.createOrder = async (req, res, next) => {
    try {
        // Retrieve cart items and total from request body
        const { cartItems, total, stripePaymentId } = req.body;

        // Fetch full product details for each cart item
        // Ensures price is correct
        const items = await Promise.all(
            cartItems.map(async (item) => {
                const product = await Product.findById(item.productId);
                if (!product) {
                    const err = new Error(`Product ${item.productId} not found`);
                    err.statusCode = 404;
                    throw(err);
                }

                // Product exists - add item info to Order
                return {
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity
                };
            })
        );
        const order = await Order.create({
            user: req.user._id,
            items,
            total,
            stripePaymentId,
            status: 'paid'
        });

        res.status(201).json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

// Authenticated Users can view their past orders
exports.getUserOrders = async (req, res, next) => {
    try {
        // Get a list of all orders for requested user
        const orders = await Order.find( {user: req.user._id} )
            .sort( {createdAt: -1 }) // Newest first (descending order)
            .populate('items.productId', 'name price'); // Fetch product details to display for user
        
        res.status(200).json({
            success: true,
            orders: orders
        });
    } catch (err) {
        next(err);
    }
}

// Retrieve details of specific Order
// Users can only view their own orders
// Admin can view any order
exports.getOrderByID = async (req, res, next) => {
    try {
        // Extract orderId from url
        const { orderId } = req.params;

        // Find Order info
        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('items.productId', 'name price');
        
        // Check if order exists
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Deny if requesting User is NOT owner of Order
        // AND they are NOT an admin
        if (order.user._id.toString() !== req.user._id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized: You can only view your own orders '});
        }

        // Return Order details
        res.status(200).json({
            success: true,
            order: order
        });
    } catch (err) {
        next(err);
    }
}

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status value
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.status(200).json({
            success: true,
            message: `Order status updated to: ${status}`,
            order: order
        });

    } catch (err) {
        next(err);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('items.productId', 'name price');
        
        res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders
        });
    } catch (err) {
        next(err);
    }
}