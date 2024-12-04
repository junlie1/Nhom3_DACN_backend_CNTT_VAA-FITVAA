const express = require('express');
const Cart = require('../models/cart');

const cartRouter = express.Router();

cartRouter.post('/api/add-cart', async (req,res) => {
    const { userId, productName, productPrice, category, image, productId,vendorId } = req.body;
  
  try {
    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng của user chưa
    const existingCartItem = await Cart.findOne({ userId, productId });
    
    if (existingCartItem) {
      existingCartItem.quantity += 1;
      await existingCartItem.save();
      return res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng' });
    }
    
    const newCartItem = new Cart({
      userId,
      productName,
      productPrice,
      category,
      image,
      productId,
      vendorId,
      quantity: 1, 
    });
    
    await newCartItem.save();
    res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng' });
  } 
  catch (error) {
    res.status(500).json({ error: 'Không thêm được' });
  }
});

// Giảm số lượng sản phẩm trong giỏ hàng hoặc xóa nếu số lượng giảm xuống 0
cartRouter.post('/api/decrement-cart', async (req, res) => {
    const { userId, productId } = req.body;
  
    try {
      const existingCartItem = await Cart.findOne({ userId, productId });
      
      if (existingCartItem) {
        if (existingCartItem.quantity > 1) {
          existingCartItem.quantity -= 1;
          await existingCartItem.save();
          return res.status(200).json({ message: 'Product quantity decreased in cart' });
        } else {
          // Nếu quantity là 1, xóa sản phẩm khỏi giỏ hàng
          await Cart.deleteOne({ userId, productId });
          return res.status(200).json({ message: 'Product removed from cart' });
        }
      } else {
        res.status(404).json({ message: 'Product not found in cart' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to decrement item in cart' });
    }
  });


  cartRouter.post('/api/remove-cart', async (req, res) => {
    const { userId, productId } = req.body;
  
    try {
      await Cart.deleteOne({ userId, productId });
      res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  });


  // Xóa toàn bộ giỏ hàng của người dùng
    cartRouter.post('/api/clear-cart', async (req, res) => {
        const { userId } = req.body;
    
        try {
        await Cart.deleteMany({ userId });
        res.status(200).json({ message: 'All items removed from cart successfully' });
        } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' });
        }
    });
  

  // Lấy danh sách sản phẩm trong giỏ hàng của người dùng
  cartRouter.get('/api/get-cart/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const cartItems = await Cart.find({ userId });
      res.status(200).json(cartItems);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve cart items' });
    }
  });

  //Xóa sản phẩm sau khi đặt hàng thành công
  cartRouter.delete('/api/delete-cart/:userId', async(req,res) => {
    try {
      const {userId} = req.params;
      const deleteCart = await Cart.findByIdAndDelete(userId);
      if(!deleteCart) {
        res.status(404).json({
          message: "Không tìm thấy sản phẩm để xóa"
        });
      }
      else {
        res.status(200).json({
          message: "Xóa sản phẩm thành công",
          data: deleteCart
        })
      }
    } catch (error) {
      res.status(500).json({
        error: error
      })
    }
  });
module.exports = cartRouter;