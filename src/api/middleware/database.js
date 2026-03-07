const mongoose = require('mongoose');

const connectDB = async(req, res, next) => {
    if (mongoose.connection.readyState >= 1) {
        return next(); // We are already connected (readyState 0 means not connected)
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        next(); // Connection successful, move to the controller
    } catch (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({ message: 'Database connection failed' });
    }
};