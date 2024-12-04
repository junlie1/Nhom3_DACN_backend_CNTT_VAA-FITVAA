const express = require('express');
const Vendor = require('../models/vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const vendorRouter = express.Router();

vendorRouter.post("/api/vendor/signup", async (req,res) => {
    const { email, fullName, password } = req.body;
    const existingEmail =  await Vendor.findOne({email});
    
    try {
        if(existingEmail) {
            res.status(400).json({
                message: "Tài khoản đã tồn tại"
            });
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password,salt);
            let vendor = new Vendor({fullName, email, password:hashPassword});
            vendor = await vendor.save();
            res.json({vendor});
        }
    }
    catch(e) {
        console.error("Error during signup:", e);
        res.status(500).json({
            message: "Không kết nối được với server"
        })
    }
});

//sign in api
vendorRouter.post("/api/vendor/signin", async (req,res)=> {
    try {
        const {email, password} = req.body;
        const findVendor = await Vendor.findOne({email});
        if(!findVendor){
            res.status(404).json({
                message: "Không tìm thấy tài khoản"
            });
        }
        else {
            //So sánh mật khẩu nhập vào và mật khẩu trong db
            const isMatch =  await bcrypt.compare(password, findVendor.password);
            if(!isMatch) {
                res.status(400).json({
                    message: "Sai mật khẩu"
                });
            }
            else{
                //jwt.sign( Dữ liệu, privateKey: khóa riêng token k để ngkhac sdung, [options], [callback])
                const token = jwt.sign({id: findVendor._id}, "passwordKey");
                
                const {password, ...vendorWithoutPassword} = findVendor._doc;
                
                //Gửi phản hồi
                res.send({token, vendor: vendorWithoutPassword});
            }
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

module.exports = vendorRouter;