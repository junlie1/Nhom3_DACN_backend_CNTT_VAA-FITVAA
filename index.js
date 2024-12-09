//import module
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const bannerRouter = require('./routes/banner');
const categoryBanner = require('./routes/category');
const subCategoryRouter = require('./routes/sub_category');
const productRouter = require('./routes/product');
const productReviewRouter = require('./routes/product_review');
const vendorRouter = require('./routes/vendor');
const orderRouter = require('./routes/order');
const cartRouter = require('./routes/cart');
const paymentRouter = require('./routes/payment');
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;
const app = express();

mongoose.connect('mongodb+srv://letrung:trung2432004@cluster0.r6qbf.mongodb.net/nhom3_dacn_db')
    .then(() => console.log("Conneect thành công"))
    .catch(err => console.log("Connect error",err))
/* ---------------------------------------------------------------------------------- */
//Sdung routes
app.use(bodyParser.json({ limit: "10mb" })); // 10mb là ví dụ
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:8008', 'http://192.168.99.239', 'http://58.187.120.142', 'http://democode.ddns.net'], // URL của frontend React
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true,
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryBanner);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);
app.use(vendorRouter);
app.use(orderRouter);
app.use(cartRouter);
app.use(paymentRouter);

/* ---------------------------------------------------------------------------------- */

app.listen(PORT, () => {
    console.log(`Server đang chạy ở: ${PORT}`);
});

