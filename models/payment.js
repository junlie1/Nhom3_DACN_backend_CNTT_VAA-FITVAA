const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    bankCode: { type: String, default: null },
    transactionStatus: { type: String, default: 'pending' }, // Trạng thái: pending, success, failure
    createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;
