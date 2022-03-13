const mongoose = require("mongoose");
// 62212477b170a71cdf14b78e
const AddressesSchema = new mongoose.Schema({ 
    userID: {type: String, require:true},
    addressLocation: {type: String, require:true},
    addressShortName: {type: String, require:true},
    addressLongDescription: {type: String, require:true},
    addressCoordinates:[
        {
            lng:{
                type:String
            },
            lat:{
                type:String
            }
        }
    ]
},{
    timestamps: true
});

module.exports = mongoose.model("Address", AddressesSchema);