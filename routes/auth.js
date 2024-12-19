const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authRouter = express.Router();

authRouter.post("/api/signup",async (req,res) => {
    console.log(req.body)
    const { fullName, email, password } = req.body;
    const existingEmail =  await User.findOne({email});
    
    try {
        if(existingEmail) {
            res.status(400).json({
                message: "Tài khoản đã tồn tại"
            });
        }
        else {
            const salt = await bcrypt.genSalt(10);
            // const password = req.body.password;
            console.log("Password and salt before hashing:", password, salt);
            const hashPassword = await bcrypt.hash(password,salt);
            let user = new User({fullName, email, password:hashPassword});
            user = await user.save();
            res.json({user});
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
authRouter.post("/api/signin", async (req,res)=> {
    try {
        const {email, password} = req.body;
        const findUser = await User.findOne({email});
        if(!findUser){
            res.status(404).json({
                message: "Không tìm thấy tài khoản"
            });
        }
        else {
            //So sánh mật khẩu nhập vào và mật khẩu trong db
            const isMatch =  await bcrypt.compare(password, findUser.password);
            if(!isMatch) {
                res.status(400).json({
                    message: "Sai mật khẩu"
                });
            }
            else{
                //jwt.sign( Dữ liệu, privateKey: khóa riêng token k để ngkhac sdung, [options], [callback])
                const token = jwt.sign({id: findUser._id}, "passwordKey");
                
                const {password, ...userWithoutPassword} = findUser._doc;
                
                //Gửi phản hồi
                res.send({token, user: userWithoutPassword});
            }
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
});

//Update địa điểm User app
    authRouter.put("/api/users/:id", async (req,res) => {
        try {
            const {id} = req.params;
            const {city, locality, phoneNumber} = req.body;
            //Tìm và update city, locality của user
            //{new: true} chắc chắn rằng update sẽ đc thay đổi
            const updatedUser = await User.findByIdAndUpdate(
                id,
                {city,locality,phoneNumber},
                {new: true}
            );
            if(!updatedUser) {
                res.status(404).json({
                    error: "Không tìm thấy user"
                })
            }
            return res.status(200).json(updatedUser);

        } catch (error) {
            return res.status(500).json({error: error.message});
        }
    });

    //Update địa điểm User web
    authRouter.patch("/api/users-web/:id", async (req,res) => {
        try {
            const {id} = req.params;
            const {fullName,city, locality, phoneNumber} = req.body;
            //Tìm và update city, locality của user
            //{new: true} chắc chắn rằng update sẽ đc thay đổi
            const updatedUser = await User.findByIdAndUpdate(
                id,
                {fullName, city,locality,phoneNumber},
                {new: true}
            );
            if(!updatedUser) {
                res.status(404).json({
                    error: "Không tìm thấy user"
                })
            }
            return res.status(200).json(updatedUser);

        } catch (error) {
            return res.status(500).json({error: error.message});
        }
    });

    authRouter.post('/api/user/log-out', async (req,res) => {
        try {
            res.clearCookie('token');
            return res.status(200).json({
                status: 'Ok',
                message: 'Đăng xuất thành công'
            });
        } catch (error) {
            return res.status(500).json({error: error.message});
        }
    });

    authRouter.get('/api/get-user/:userId', async (req,res) => {
        try {
            const {userId} = req.params;
            const user = await User.findById(userId);        
            if(!user) {
                res.status(404).json({
                    message: "Không tìm thấy user"
                });
            }
            res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({error: error.message});
        }
    });

//Check email có tồn tại để update mật khẩu
authRouter.post('/api/check-email', async (req,res) => {
    const {email} = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ" });
    }
    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản"
            })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});
    
//Đổi mật khẩu
authRouter.post('/api/update/:userId', async (req,res) => {
    try {
        const {userId} = req.params;
        const {currentPassword, newPassword} = req.body;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({
                message: "Không tìm thấy user"
            });
        }
        const isMatch = await bcrypt.compare(currentPassword,user.password);
        if(!isMatch) {
            return res.status(400).json({
                message: "Sai mật khẩu hiện tại"
            }); 
        }
        const salt = await bcrypt.genSalt(10);
        const hashNewPassword = await bcrypt.hash(newPassword,salt);
        user.password = hashNewPassword;
        await user.save();
        return res.status(200).json({
            message: "Update thành công"
        })
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
})


module.exports = authRouter;