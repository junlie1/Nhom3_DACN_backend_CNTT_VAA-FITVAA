const express = require("express");
const SubCategory = require("../models/sub_category");
const subCategoryRouter = express.Router();

subCategoryRouter.post("/api/subcategories", async (req,res) => {
    try {
        const {categoryId, categoryName, image, subCategoryName} = req.body;
        const subcategory = new SubCategory({categoryId, categoryName, image, subCategoryName});
        await subcategory.save();
        res.status(201).send(subcategory);
    } catch (error) {
        res.status(500).json({
            Lỗi: error.message
        });
    }
});

subCategoryRouter.get("/api/subcategories", async (req,res) => {
    try {
        const subcategories =  await SubCategory.find();
        return res.status(200).json(subcategories)
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

subCategoryRouter.get("/api/category/:categoryName/subcategories", async (req,res) => {
    const {categoryName} = req.params;
    const subcategories =  await SubCategory.find({categoryName});
    if(!subcategories || subcategories.length ==0) {
        return res.status(404).json(
            {
                message: "Không tìm thấy sản phẩm"
            }
        )
    }
    else {
        return res.status(200).json(subcategories)
    }
});

module.exports = subCategoryRouter;
