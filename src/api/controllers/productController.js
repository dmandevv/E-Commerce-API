const Product = require('#api/index').models.Product;
const { utils } = require('#api/index').utils;
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
        next(error);
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
            returnDocument: 'after',
            runValidators: true
        });
        res.status(200).json({
            success: true,
            product
        });
    }
    catch (error) {
        next(error);
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        // 1. Find the product in DB
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
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
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

exports.getSingleProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
        success: true,
        product
    });
}

exports.getProducts = async (req, res) => {
    const resPerPage = 8;

    const apiFeatures = new utils.APIFeatures(Product.find(), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    
    const products = await apiFeatures.query

    res.status(200).json({
        success: true,
        products
    });
}

exports.createProductReview = async (req, res) => {
    const { rating, comment, productId } = req.body;

    const product = await Product.findById(productId);

    const existingReview = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else { //new review
        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    //Recalculate Average Rating
    product.rating = product.reviews.reduce((accumulator, review) => 
        { accumulator + review.rating; }, 0) / product.reviews.length;

    //skip checks on unrelated fields (like product description)
    await product.save({ validateBeforeSave: false });
    
    res.status(200).json({ success: true });
}

//used by frontend to display reviews under product
exports.getProductReviews = async (req, res) => {
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
}

exports.deleteReview = async (req, res) => {
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    //filter out review we want to delete
    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.reviewId.toString()
    );

    const numOfReviews = reviews.length;

    //Recalculate Average Rating
    //Use ternary (? : ) to avoid "Division by Zero" in case we deleted last review
    const rating = reviews.length === 0 ? 0 
        : reviews.reduce((accumulator, review) => accumulator + review.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        rating,
        numOfReviews
    }, {
        returnDocument: 'after',
        runValidators: true
    });

    res.status(200).json({ success: true });
}

