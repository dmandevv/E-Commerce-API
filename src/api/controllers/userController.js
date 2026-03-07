const { models } = require('#api/index');
const User = models.User;
const Product = models.Product;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        //1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        //2. Create user and save to DB
        user = await User.create({
            name,
            email,
            password,
            role: "customer"
        });

        //3. Generate JWT token to immediately log them in
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        res.status(201).json({ success: true, token });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        //1. Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //3. Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn:'1h' }
        );

        res.status(200).json({ 
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            } 
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.createCheckoutSession = async (req, res) => {
    const { cartItems } = req.body; //Array of { productId, quantity }

    //1. Fetch real price from DB
    const lineItems = await Promise.all(cartItems.map(async (item) => {
        const product = await Product.findById(item.productId)
        return {
            price_data: {
                currency: 'cad',
                product_data: { name: product.name },
                unit_amount: product.price * 100, //Stripe uses cents ($1.00 = 100)
            },
            quantity: item.quantity,
        };
    }));

    //2. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    res.json({ id: session.id });
}