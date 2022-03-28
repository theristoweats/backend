const mongoose = require("mongoose");

const CarriersSchema = new mongoose.Schema({  
    fullname: {type: String, require:true}, 
    carrierCoordinates: [
        {
            lat:{
                type:String,
                default:"0"
            }, 
            lng:{
                type:String,
                default:"0"
            }, 
        },
    ], 
    profilePicture:{type:String,default:"0"},
    phoneNumber:{type:String},
    email:{type:String},
    password:{type:String}
},{
    timestamps: true
});

module.exports = mongoose.model("Carriers", CarriersSchema);