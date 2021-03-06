const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const ProductsSchema = new mongoose.Schema({
    title: { type: String, required:true, unique:true},
    title_en: { type: String, required:true, unique:true},
    title_url: { type: String, required:true, unique:true},
    img: { type:String, require: true},
    categories: { type: Array, require: true},
    price: { type:Number, require: true},
    transform: { type:String, require: true},
},{
    timestamps: true
});

module.exports = mongoose.model("Products", ProductsSchema);