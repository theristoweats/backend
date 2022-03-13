const mongoose = require("mongoose");
// const { boolean } = require("webidl-conversions");

const userSchema = new mongoose.Schema({
    fullname: { type: String, required:true, unique:true},
    phonenumber: { type: String, default: "0"},
    email: {type: String, required:true, unique:true},
    password: { type:String, require: true},
    isAdmin: {
        type: Boolean,
        default:false,
    },
},{
    timestamps: true
});

module.exports = mongoose.model("Users", userSchema);