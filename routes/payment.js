const express = require("express");
const Payment = require("../models/payment");
const Order = require('../models/order');
const paymentRouter = express.Router();
const vnpayService = require('../vnpay/vnpay');
const moment = require('moment');
const crypto = require('crypto');


paymentRouter.post('/api/payment/create_payment_url', async (req,res) => {
    try {
        const { 
            fullName,
            email,
            city,
            locality,
            phoneNumber,
            productId,
            productName,
            productPrice,
            quantity,
            category,
            image,
            buyerId,
            vendorId,
            paymentMethod,
            ...otherData 
        } = req.body;

        // Tính tổng giá trị đơn hàng
        const totalPrice = productPrice * quantity;

        // Tạo dữ liệu đơn hàng
        const orderData = {
            fullName,
            email,
            city,
            locality,
            phoneNumber,
            productId,
            productName,
            productPrice,
            quantity,
            category,
            image,
            buyerId,
            vendorId,
            paymentMethod,
            paymentStatus: 'pending', // Đơn hàng chưa thanh toán
            isPaid: false, // Chưa thanh toán
            totalPrice,
            ...otherData,
        };

        // Lưu đơn hàng vào cơ sở dữ liệu
        const newOrder = new Order(orderData);        
        await newOrder.save();

        const orderId = newOrder._id.toString(); // Lấy ID đơn hàng mới

        // Tạo URL thanh toán VNPAY
        process.env.TZ = 'Asia/Ho_Chi_Minh';

        let date = new Date();
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            '127.0.0.1';

        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const vnpUrl = process.env.VNP_URL;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId; // Sử dụng ID thực tế của đơn hàng
        vnp_Params['vnp_OrderInfo'] = `Thanh toán đơn hàng #${orderId}`;
        vnp_Params['vnp_OrderType'] = 'billpayment';
        vnp_Params['vnp_Amount'] = totalPrice * 100; // Đảm bảo giá trị là VND
        vnp_Params['vnp_ReturnUrl'] = process.env.VNP_RETURN_URL;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = moment(date).format('YYYYMMDDHHmmss');

        // Tạo URL và chữ ký
        const redirectUrl = new URL(vnpUrl);
        console.log('redirectUrl',redirectUrl);
        
        const searchParams = redirectUrl.searchParams;

        Object.entries(vnp_Params)
            .sort(([key1], [key2]) => key1.localeCompare(key2))
            .forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, value.toString());
                }
            });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(searchParams.toString(), 'utf-8')).digest('hex');
        searchParams.append('vnp_SecureHash', signed);

        return res.status(200).json({
            status: 'success',
            url: redirectUrl.toString(),
        });

    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal Server Error'
        });
    }
});

paymentRouter.get('/api/payment/vnpay_return', async (req,res) => {
    try {
        const vnpayResponse = await vnpayService.verifyReturnUrl(req.query);

        console.log('VNPAY Response:', vnpayResponse); // In ra phản hồi để kiểm tra

        if (vnpayResponse.responseCode === '00') {
            const orderId = vnpayResponse.orderId; // orderId từ VNPAY
            const amount = vnpayResponse.amount;

            // Tìm kiếm đơn hàng trong cơ sở dữ liệu để lấy orderItems
            const order = await Order.findById(orderId); // Sử dụng findById để lấy đơn hàng

            if (!order) {
                console.error('Không tìm thấy đơn hàng để cập nhật');
                return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=order_not_found`);
            }

            // Cập nhật trạng thái đơn hàng
            const updatedOrder = await Order.findOneAndUpdate(
                { _id: orderId },
                { isPaid: true },
                { new: true }
            );

            // Lưu thông tin thanh toán vào cơ sở dữ liệu
            const payment = new Payment({
                orderId,
                amount,
                orderInfo: 'Thanh toán qua VNPAY',
                status: 'completed'
            });
            await payment.save();

            // Sử dụng orderItems từ đơn hàng đã tìm thấy
            res.redirect(`${process.env.FRONTEND_URL}/order-success?${new URLSearchParams({
                orderId: orderId,
                amount: amount,
                paymentMethod: 'vnpay',
                status: 'success',
                orderItems: JSON.stringify(order.productName), // Lấy orderItems từ đơn hàng
                totalPrice: order.productPrice * order.quantity // Lấy totalPrice từ đơn hàng
            }).toString()}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=transaction_failed`);
        }
    } catch (error) {
        console.error('VNPAY return error:', error.message, error.stack);
        res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
});
module.exports = paymentRouter;