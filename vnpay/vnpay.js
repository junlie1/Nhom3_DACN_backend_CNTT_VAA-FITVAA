require('dotenv').config();
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');

class VNPayService {
    constructor() {
        this.tmnCode = process.env.VNP_TMN_CODE;
        this.hashSecret = process.env.VNP_HASH_SECRET;
        this.vnpUrl = process.env.VNP_URL;
        this.returnUrl = process.env.VNP_RETURN_URL;
    }

    createPaymentUrl(paymentData) {
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');

        const vnpParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.tmnCode,
            vnp_Locale: paymentData.language || 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: paymentData.orderId,
            vnp_OrderInfo: paymentData.orderDescription,
            vnp_OrderType: paymentData.orderType,
            vnp_Amount: paymentData.amount * 100,
            vnp_ReturnUrl: this.returnUrl,
            vnp_IpAddr: paymentData.ipAddr || '127.0.0.1',
            vnp_CreateDate: createDate
        };

        const sortedParams = this.sortObject(vnpParams);
        const signData = querystring.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', this.hashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        
        vnpParams.vnp_SecureHash = signed;
        
        return `${this.vnpUrl}?${querystring.stringify(vnpParams, { encode: false })}`;
    }

    verifyReturnUrl(vnpParams) {
        console.log('vnpParams',vnpParams);
        
        const secureHash = vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHash;
        delete vnpParams.vnp_SecureHashType;

        const sortedParams = this.sortObject(vnpParams);
        const signData = querystring.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', this.hashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        const isSuccess = secureHash === signed && vnpParams.vnp_ResponseCode === '00';

        return {
            isSuccess,
            orderId: vnpParams.vnp_TxnRef,
            amount: vnpParams.vnp_Amount / 100,
            responseCode: vnpParams.vnp_ResponseCode
        };
    }

    verifyIpn(vnpParams) {
        return this.verifyReturnUrl(vnpParams);
    }

    sortObject(obj) {
        const sorted = {};
        const keys = Object.keys(obj).sort();
        
        for (const key of keys) {
            sorted[key] = obj[key];
        }
        
        return sorted;
    }
}

module.exports = new VNPayService();