const mongoose = require("mongoose");
// const { boolean } = require("webidl-conversions");

const adminSchema = new mongoose.Schema({
    fullname: { type: String, required:true, unique:true}, 
    email: {type: String, required:true, unique:true},
    password: { type:String, require: true},
     
},{
    timestamps: true
});

module.exports = mongoose.model("Admins", adminSchema);