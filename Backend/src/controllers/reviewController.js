import Review from '../models/Review.js';
import Product from '../models/Product.js';

export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment
        });

        // Update Product Ratings
        const product = await Product.findById(productId);
        const reviews = await Review.find({ product: productId });
        product.numReviews = reviews.length;
        product.ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await product.save();

        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Error adding review", error });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ product: productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error });
    }
};
