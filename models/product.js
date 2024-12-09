const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productName: { type: String, trim: true, required: true },
    normalizedProductName: { type: String},
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    normalizedDescription: { type: String},
    category: { type: String, required: true },
    vendorId: { type: String, required: true },
    fullName: { type: String, required: true },
    subCategory: { type: String, required: true },
    images: [{ type: String, required: true }],
    popular: { type: Boolean, default: true },
    recommend: { type: Boolean, default: false },
    //Thêm đánh giá sản phẩm
    averageRating: {type: Number, default: 0.0},
    totalRatings: {type: Number, default: 0}
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
