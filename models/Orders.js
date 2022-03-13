const mongoose = require("mongoose");
 
const OrdersSchema = new mongoose.Schema({
    pro_Id: {type: Number, required:true},
    userId: { type: String, required:true }, 
    cart_UUID: { type: String, required:true }, 
    products: [
        {
            itemId:{
                type:String
            },
            productId:{
                type:String
            },
            img:{
                type:String
            },
            title:{
                type:String
            },
            quantity:{
                type:Number,
            },
            price:{
                type:Number
            }
        },
    ],
    amount: {type:Number, required: true},
    deliveryAddress:{type: String, required: true},
    phoneNumber:{type:String, default:"0"},
    carrierId:{type:String, default:"0"},
    carrierName:{type:String, default:"0"},
    orderStatus:{type:String, default:"pending"},

},{
    timestamps: true
});

module.exports = mongoose.model("Orders", OrdersSchema);