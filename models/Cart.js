const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    user_UUID: { type: String, required:true }, 
    user_ip: {type: String, require:true},
    totalPrice: {type: Number, require:true},
    product: [
        {
            productId:{
                type:String
            },
            quantity:{
                type:Number,
                default: 1,
            },
            price:{
                type:Number,
            }
        },
    ], 
    status:{type:String, default:"incart"},
    orderId:{type:String, default:"0"}
},{
    timestamps: true
});

module.exports = mongoose.model("Cart", CartSchema);