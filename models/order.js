const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    locality: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    buyerId: { type: String, required: true },
    vendorId: { type: String, required: true },
    processing: {type: Boolean, default: true},
    shipping: {type: Boolean, default: false},
    delivered: {type: Boolean, default: false},
    isPaid: {type: Boolean, default: false},
    paymentStatus: { type: String, required: true },
    paymentIntentId: {type: String, required: true },
    paymentMethod: {type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
