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
const momoRouter = require('./routes/momo');
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;
const app = express();

const mongo = mongoose.connect('mongodb://127.0.0.1:27017/nhom3_dacn_db');
/* ---------------------------------------------------------------------------------- */
//Sdung routes
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryBanner);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);
app.use(vendorRouter);
app.use(orderRouter);
app.use(cartRouter);
app.use(momoRouter);

/* ---------------------------------------------------------------------------------- */

app.listen(PORT, () => {
    console.log(`Server đang chạy ở: ${PORT}`);
});

