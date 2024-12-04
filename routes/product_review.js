const express = require("express");
const ProductReview = require("../models/product_review");
const Product = require('../models/product');

const productReviewRouter = express.Router();

productReviewRouter.post("/api/product-review", async (req,res) => {
    try {
        const {buyerId, email, fullName, productId, rating, review} = req.body;
        const reviews = new ProductReview({buyerId, email, fullName, productId, rating, review});
        console.log('rating',typeof(rating));
        
        //Tìm sản phẩm và cập nhật averageRating và totalRatings
        const product = await Product.findById(productId);
        
        if(!product) {
         return res.status(404).json({message: "Không tìm thấy sản phẩm"});
        }
        product.totalRatings += 1;
        product.averageRating = ((product.averageRating * (product.totalRatings - 1)) + rating) / product.totalRatings;
        await product.save();
        await reviews.save();
        return res.status(201).send(reviews);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

productReviewRouter.get("/api/reviews", async (req,res) => {
    try {
        const reviews = await ProductReview.find();
        return res.status(201).send(reviews);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

productReviewRouter.get("/api/reviews/:productId", async (req,res) => {
    try {
        const products = await ProductReview.find();
        const productIds = products.map((product) => product.productId);

        // Lọc lấy productId tương ứng với req.params.productId
        const filteredProductId = productIds.find((id) => id === req.params.productId);
        const product = await ProductReview.find({ productId: filteredProductId });
        if(!product) {
            return res.status(404).json({message: "Không tìm thấy sản phẩm"});
        }
        return res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = productReviewRouter;