const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema({
    category_name: { type: String, required:true}, 
    category_url: { type: String, required:true}, 
},{
    timestamps: true
});

module.exports = mongoose.model("Categories", CategoriesSchema);