const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

exports.createProduct = async (req, res) => {
    try {
        let images = [];

        // 1. Check if 'images' is a single string or an array (Postman can vary)
        if (typeof req.body.images === 'string') {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLinks = [];

        // 2. Loop through the images and upload to Cloudinary
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        // 3. Replace the input images with the Cloudinary results
        req.body.images = imagesLinks;
        req.body.user = req.user.id; // Link to the admin who created it

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {

        //1. Check if product is in DB
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        //2. Handle any new images
        if (req.body.images) {
            let images = [];

            // 2.1 Normalize: If it's a string, wrap it in an array. 
            // If it's already an array, just use it.
            if (typeof req.body.images === "string") {
                images.push(req.body.images);
            } else {
                images = req.body.images;
            }

            // 2.2 Now that we are CERTAIN 'images' is a non-empty array, 
            // we can safely delete the old ones and upload the new ones.
            if (images.length > 0) {
                //2.2.1 Delete all saved images
                for (let i = 0; i < product.images.length; i++) {
                    await cloudinary.uploader.destroy(product.images[i].public_id)
                }

                //2.2.2 Upload URLs to Cloudinary and save their link info
                const imagesLinks = [];
                for (let i = 0; i < images.length; i++) {
                    const result = await cloudinary.uploader.upload(images[i], {
                        folder: "products",
                    });
                    imagesLinks.push({
                        "public_id": result.public_id,
                        url: result.secure_url
                    });
                }
                req.body.images = imagesLinks;
            }   
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            product
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages });
        }
        res.status(500).json({ message: "Server Error" });
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        // 1. Find the product in DB
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        // 2. Delete images from Cloudinary
        // We loop because the schema allows for multiple images
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.uploader.destroy(product.images[i].public_id);
        }

        // 3. Delete product from DB
        await product.deleteOne();

        res.status(204).json({
            success: true,
            message: "Product and associated images deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}