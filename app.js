require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { routes } = require('#api/index');
const { middleware } = require('#api/index');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Allows the server to understand JSON sent by the frontend (ONLY my domain)
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true // Helpful if you plan to use cookies for auth later
}));

// Webhook endpoint needs raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.set('query parser', 'extended');

//Prefix all routes with '/api'
app.use('/api', routes.user);
app.use('/api', routes.product);
app.use('/api', routes.order);
app.use(middleware.error);

if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1); // Stop the server immediately
}

app.get('/', (req, res) => {
  res.send('API is running successfully on Vercel!');
});

//Start Server LOCALLY
//const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => {
//    console.log("Server is running on port ${PORT}");
//});

//Hosting on Vercel
module.exports = app;