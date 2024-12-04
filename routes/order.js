const express = require('express');
const Order = require('../models/order');
const stripe = require('stripe')("sk_test_51QQAS0FV5SaBBPCR0envszYXsbSk9H8QsTVe4PWuunkI2jAe3BeX5oARpfiURXjLC5fuwmQOirKjshPHxCKFSLdU00rtNXalHf");
const orderRouter = express.Router();

orderRouter.post("/api/orders", async (req,res) => {
    try {
        const {fullName, email, city, locality, phoneNumber,productId,productName, productPrice, quantity,category,image, vendorId, buyerId, paymentStatus,paymentIntentId,paymentMethod} = req.body;
        const createdAt = new Date().getMilliseconds();
        const order = new Order({
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
            vendorId, 
            buyerId,
            paymentStatus,
            paymentIntentId,
            paymentMethod,
            createdAt
        });
        await order.save();
        return res.status(201).json(order);
    } catch (error) {
        res.status(500).json({
            Lỗi: error.message
        });
    }
});

//payment method with stripe
orderRouter.post('/api/payment-intent',async (req,res)=>{
    try {
      const {amount, currency} = req.body;
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });
  
      return res.status(200).json(paymentIntent);
    } catch (e) {
      return res.status(500).json({error:e.message});
    }
  });

orderRouter.get('/api/payment-intent/:id', async (req,res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
        return res.status(200).json(paymentIntent);
    } catch (error) {
        return res.status(500).json({error:e.message});
    }
});

// try {
//     const {orderId,paymentMethodId, currency = 'usd', amount} = req.body;
//     if(!orderId || !paymentMethodId || !currency || !amount) {
//         return res.status(400).json({
//             message: "Nhập thiếu cột"
//         });
//     }
//     const order = await Order.findById(orderId);
//     if(!order) {
//         return res.status(404).json({
//             message: "Không tìm thấy order"
//         });
//     }
//     const totalAmounts = order.productPrice * order.quantity;
//     const minimumAmount = 0.50;
//     if(totalAmounts < minimumAmount) {
//         return res.status(400).json({
//             message: "Số tiền tối thiểu là 0.5$"
//         });
//     }
//     const amountInCents = Math.round(totalAmounts * 100);
//     const paymentIntent = await stripe.paymentIntents.create({
//         amount: amountInCents,
//         currency: currency,
//         payment_method: paymentMethodId,
//         automatic_payment_methods: {enabled: true}
//     });
//     console.log('paymentIntent',paymentIntent);
    
//     return res.json({
//         status: "success",
//         paymentIntentId: paymentIntent.id,
//         amount: paymentIntent.amount / 100,
//         currency: paymentIntent.currency
//     });
// } catch (error) {
//     res.status(500).json({
//         Lỗi: error.message
//     });
// }

//Get order by buyerId
orderRouter.get('/api/orders/:buyerId', async (req,res) => {
    try {
        const {buyerId} = req.params;
        const orders = await Order.find({buyerId});
        if(!orders) {
            return res.status(404).json({
                message: "Không tìm thấy order theo buyerId"
            });
        }
        else {
            return res.status(200).json(orders);
        }
    } catch (error) {
        console.error("Error", error);
    }
})

//Delete order by id
orderRouter.delete('/api/delete-order/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm đơn hàng theo id
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Không tìm thấy order để xóa"
            });
        }

        // Kiểm tra nếu shipping = true
        if (order.shipping) {
            return res.status(400).json({
                message: "Không thể xóa order vì đang trong quá trình vận chuyển"
            });
        }

        // Xóa đơn hàng nếu shipping = false
        await Order.findByIdAndDelete(id);
        res.status(200).json({
            message: "Order đã được xóa thành công"
        });
    } catch (error) {
        console.error("Lỗi", error);
        res.status(500).json({ message: "Đã xảy ra lỗi" });
    }
});

//Get order by vendorId
orderRouter.get('/api/orders/vendors/:vendorId', async (req,res) => {
    try {
        const {vendorId} = req.params;
        const orders = await Order.find({vendorId});
        if(!orders) {
            return res.status(404).json({
                message: "Không tìm thấy order theo vendorId"
            });
        }
        else {
            return res.status(200).json(orders);
        }
    } catch (error) {
        console.error("Error", error);
    }
})


//PATCH method chỉ thay đổi 1 vài trường dữ liệu chứ k cần phải điền hết các trường dữ liệu như POST và PUT
orderRouter.patch('/api/order/:id/delivered', async (req,res) => {
    try {
        const {id} = req.params;
        const updatedOrderDelivered = await Order.findByIdAndUpdate(
            id,
            { delivered: true, shipping: false, processing: false, isPaid: true },
            {new: true}
        );
        if(!updatedOrderDelivered) {
            res.status(404).json({
                message: "Không thể thay đổi với sản phẩm không tồn tại"
            });
        } 
        else {
            res.status(200).json(updatedOrderDelivered);
        }
    } catch (error) {
        console.error("Error", error);
    }
});

orderRouter.patch('/api/order/:id/shipping', async (req,res) => {
    try {
        const {id} = req.params;
        const updatedOrderShipping= await Order.findByIdAndUpdate(
            id,
            { shipping: true, processing: false }, 
            {new: true}
        );
        if(!updatedOrderShipping) {
            res.status(404).json({
                message: "Không thể thay đổi với sản phẩm không tồn tại"
            });
        } 
        else {
            res.status(200).json(updatedOrderShipping);
        }
    } catch (error) {
        console.error("Error", error);
    }
});

orderRouter.patch('/api/order/:id/processing', async (req,res) => {
    try {
        const {id} = req.params;
        const updatedOrderProcessing= await Order.findByIdAndUpdate(
            id,
            { processing: false, shipping: false },
            {new: true}
        );
        if(!updatedOrderProcessing) {
            res.status(404).json({
                message: "Không thể thay đổi với sản phẩm không tồn tại"
            });
        } 
        else {
            res.status(200).json(updatedOrderProcessing);
        }
    } catch (error) {
        console.error("Error", error);
    }
});

module.exports = orderRouter;