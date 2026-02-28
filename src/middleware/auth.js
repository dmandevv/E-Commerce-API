const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authorizeUserMiddleware = async (req, res, next) => {
    console.log("Headers:", req.headers);

    // 1. Try to get token from header OR cookies (if you use them)
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. If no token, return the message you're seeing now
    if (!token) {
        return res.status(401).json({ message: "Login first to access this resource" });
    }

    console.log("Secret being used to verify: ", process.env.JWT_SECRET);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        // This will tell us if it's 'invalid signature' or 'jwt expired'
        console.log("JWT Error Details:", error.message);
        return res.status(401).json({ message: "Invalid Token" });
    }
}

exports.authorizeRolesMiddleware = (...roles) => {
    return (req, res, next) => {
        //req.user was set my authorizeUserMiddleware
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                messages: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    }
}

