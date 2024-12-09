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

subCategoryRouter.delete("/api/subcategories/delete-subcategories/:subcategoryId", async (req,res) => {
    try {
        const {subcategoryId} = req.params;
        const product = await SubCategory.findByIdAndDelete(subcategoryId);
        if(!product) {
            res.status(404).json({
                message: "Không tìm thấy subcategory để xóa"
            });
        }
        res.status(200).json({
            message: "Xóa thành công sản phẩm",
            data: product
        });
    } catch (error) {
        
    }
});

subCategoryRouter.put("/api/subcategory/update/:subcategoryId", async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const updateData = req.body;

        // Kiểm tra và cập nhật subcategory
        const updatedSubcategory = await SubCategory.findByIdAndUpdate(
            subcategoryId,
            updateData,
            { new: true } // Trả về document đã được cập nhật
        );

        if (!updatedSubcategory) {
            return res.status(404).json({
                message: "Không tìm thấy subcategory để cập nhật"
            });
        }

        res.status(200).json({
            message: "Cập nhật thành công subcategory",
            data: updatedSubcategory
        });
    } catch (error) {
        res.status(500).json({
            message: "Đã xảy ra lỗi trong quá trình cập nhật",
            error: error.message
        });
    }
});

module.exports = subCategoryRouter;
