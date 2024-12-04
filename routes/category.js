const express = require("express");
const Category = require("../models/category");

const categoryRouter = express.Router();

categoryRouter.post("/api/categories", async (req,res) => {
    try {
        const {name, image, banner} = req.body;
        const category =  new Category({name,image,banner});
        await category.save();
        res.status(201).send(category);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
categoryRouter.get("/api/categories", async (req,res) => {
    try {
        const categories =  await Category.find();
        return res.status(200).json(categories)
    } catch (error) {
            res.status(500).json({
                error: error.message
            });
    }
});

module.exports = categoryRouter;