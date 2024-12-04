const express = require("express");
const Product = require("../models/product");
const ProductReview = require('../models/product_review');
const productRouter = express.Router();

productRouter.post("/api/add-product", async (req,res) => {
    try {
        const {productName, productPrice, quantity, description, category, vendorId,fullName ,subCategory, images} = req.body;
        const product = new Product({productName, productPrice, quantity, description, category,vendorId,fullName, subCategory, images});
        await product.save();
        return res.status(201).send(product);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

productRouter.get("/api/popular-product", async (req,res) => {
    try {
        const product = await Product.find({popular: true});
        if(!product || product.length == 0) {
            return res.status(404).json(
                {
                    message: "Không tìm thấy sản phẩm"
                }
            )
        }
        else {
            return res.status(200).json(product);
        }
    } catch (error) {
        return res.status(500).json(
            {
                error: error.message
            }
        )
    }
    
});

productRouter.get("/api/recommend-product", async (req,res) => {
    try {
        const product = await Product.find({recommend: true});
        if(!product || product.length == 0) {
            return res.status(404).json(
                {
                    message: "Không tìm thấy sản phẩm"
                }
            )
        }
        else {
            return res.status(200).json(product);
        }
    } catch (error) {
        return res.status(500).json(
            {
                error: error.message
            }
        )
    }
    
});

productRouter.get('/api/products-by-category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const products = await Product.find({ category, popular: true });
      if (!products || products.length == 0) {
        return res.status(404).json({ msg: "Product not found" });
      } else {
        return res.status(200).json(products);
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  

productRouter.get("/api/product/:id", async (req,res) => {
    try {
        const {id} = req.params;
        const product = await Product.findById(id);
        if(!product) {
            return res.status(404).json(
                {
                    message: "Không tìm thấy sản phẩm"
                }
            )
        }
        else {
            return res.status(200).json(product);
        }
    } catch (error) {
        return res.status(500).json(
            {
                error: error.message
            }
        )
    }
    
});

productRouter.get('/api/search-products',async(req,res)=>{
    try {
      const {query} = req.query;
  
      if(!query){
        return res.status(400).json({message:"Hãy nhập sản phẩm muốn tìm"});
      }
  
   const products = await Product.find({
     $or:[
      //Regex will match any productName containing the query String, 
      //For example , if the user  search for "apple ", the regex will check
      //if "apple " is part  of any productName , so product  name "Green Apple pie",
      //or "Fresh Apples" , would all match  because they contain  the world "apple"
      {productName: {$regex:query, $options:'i'}},
      {description: {$regex:query, $options:'i'}},
     ]
    });
     if(!products|| products.length==0){
      return res.status(404).json({message:"Không có sản phẩm phù hợp"});
     }
  
     return res.status(200).json(products);
    } catch (e) {
      return res.status(500).json({error:e.message})
    }
  });

  //new route for retrieving related products by subcategory
productRouter.get('/api/related-products-by-subcategory/:productId',async(req,res)=>{
    try {
      const {productId} = req.params;
    const product =  await Product.findById(productId);
    if(!product){
      return res.status(404).json({message:"Product not found"});
    }else{
    const relatedProducts =  await Product.find({
        subCategory: product.subCategory,
        _id:{$ne:productId}//Ngoại trừ sản phẩm đang hiển thị
      });
  
     if(!relatedProducts || relatedProducts.length ==0){
      return res.status(404).json({message:"No related products found"});
     } 
      
     return res.status(200).json(relatedProducts);
  
    }
    } catch (e) {
      return res.status(500).json({error:e.message});
    }
  });

  //route for retrieving the top 10 highest-rated products
productRouter.get('/api/top-rated-products',async(req,res)=>{
    try {
      //fetch all products and sort them by avaragerating in decending order(higest rating)
      //sort product by averageRating, with -1 indicating decending
    const topRatedProducts =  await Product.find({}).sort({averageRating: -1}).limit(10);//limit the result to the top highest rated product
  
    if(!topRatedProducts||topRatedProducts.length==0){
      return res.status(404).json({msg:"No top-rated products  found"});
    }
  
    return res.status(200).json(topRatedProducts);
    } catch (e) {
      return res.status(500).json({error:e.message});
    }
  });
  
module.exports = productRouter;