const mongoose = require("mongoose");
// const { boolean } = require("webidl-conversions");

const userSchema = new mongoose.Schema({
    fullname: { type: String, required:true, unique:true},
    phonenumber: { type: String, default: "0"},
    phonenumberVerified: { type: Boolean, default: false},
    lastTimeCode: { type: Boolean, default: false},
    codeVerify: { type: String, default: "0"},
    email: {type: String, required:true, unique:true},
    password: { type:String, require: true},
    isAdmin: {
        type: Boolean,
        default:false,
    },
    time: { type:Date},
},{
    timestamps: true
});

module.exports = mongoose.model("Users", userSchema);