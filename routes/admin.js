const Carriers = require("../models/Carriers");
const Orders = require("../models/Orders");
const Users = require("../models/Users");
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();


router.get("/orders", async (req,res)=> {
    try{
        // const order = await Orders.find();
        const idConversionStage = {
            $addFields: {
               convertedId: { $toObjectId: "$userId" },
               convertedAddressId: {$toObjectId: "$deliveryAddress"},
            }
         };

        const orders = await Orders.aggregate( [
            idConversionStage,
            
            {
                
               $lookup:
                  {
                     from: "users",
                     localField: "convertedId",
                     foreignField: "_id",
                     as: "user_info"
                 }
            },

            {
                
                $lookup:
                   {
                      from: "addresses",
                      localField: "convertedAddressId",
                      foreignField: "_id",
                      as: "address_info"
                  }
             },

            { 
                $project : 
                    { 
                        "user_info.password": 0,
                        "user_info.isAdmin": 0,
                    } 
            }
            
        ] ); 
        
        // const { password, ...others } = orders;
        
        res.status(200).json(orders);
    }catch(err){
        res.status(501).json(err);
    }

});


router.get("/carriers", async (req,res)=> {
    try{
        // const order = await Orders.find();
        
        const carriers = await Carriers.aggregate([

            { 
                $project : 
                    { 
                        "password": 0,
                    } 
            }

        ]); 
        console.log(carriers);
        res.status(200).json(carriers);
    }catch(err){
        res.status(501).json(err);
    }

});


router.get("/users", async (req,res)=> {
    try{
        // const order = await Orders.find();
        
        const users = await Users.aggregate([
            { 
                $project : 
                    { 
                        "password": 0,
                        "isAdmin": 0,
                    } 
            }

        ]); 
        console.log(users);
        res.status(200).json(users);
    }catch(err){
        res.status(501).json(err);
    }

});
 
 

module.exports = router;