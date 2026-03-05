require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const productRoutes = require('./src/api/routes/product');
const userRoutes = require('./src/api/routes/user');
const orderRoutes = require('./src/api/routes/order');
const errorMiddleware = require('./src/middleware/error')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Allows the server to understand JSON sent by the frontend
app.use(cors());

// Webhook endpoint needs raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.set('query parser', 'extended');

//Prefix all routes with '/api'
app.use('/api', productRoutes);
app.use('/api', userRoutes);
app.use('/api', orderRoutes);
app.use(errorMiddleware);

if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1); // Stop the server immediately
}

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Error connecting to MongoDB: ", err));


//Start Server LOCALLY
//const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => {
//    console.log("Server is running on port ${PORT}");
//});

//Hosting on Vercel
module.exports = app;