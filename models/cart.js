const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    productName: {type: String, required: true},
    productPrice: {type: Number, required: true},
    category: {type: String, required: true},
    image: {type: [String], required: true},
    productId: {type: String, required: true},
    vendorId: {type: String, required: true},
    quantity: { type: Number, default: 1 }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;