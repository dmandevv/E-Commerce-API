const mongoose = require('mongoose');
const { timeStamp } = require('node:console');
const { type } = require('node:os');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
        maxLength: [8, "Price cannot exceed 8 figures"],
        min: [0, "Price cannot be less than 0"]
    },
    category: {
        type: String,
        required: [true, "Please select category for product"],
        enum: {
            values: ['Electronics', 'Cameras', 'Laptops', 'Accessories', 'Food'],
            message: 'Please select correct category'
        }
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        default: 0,
        min: [0, "Stock cannot be less than 0"]
    },
    images: [
        {
            public_id: { type: String, required: true },
            url: { type: String, required: true }
        }
    ],
    user: { //Admin who created product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);