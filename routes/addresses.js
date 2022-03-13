const Products = require("../models/Products");
const Addresses = require("../models/Addresses");
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

// create product

router.post("/", verifyToken, async (req,res)=>{ 

    const newAddress = new Addresses({
        userID: req.body.userId,
        addressLocation: req.body.name,
        addressShortName: req.body.addressShortName,
        addressLongDescription: req.body.addressDescription,
        addressCoordinates:{
            lng:req.body.lng,
            lat:req.body.lat
        }

    }); 

    try{
        const savedAddress = await newAddress.save();
        res.status(200).json(savedAddress);
    }catch(err){
        res.status(500).json(err);
    }

});


router.get("/:userID", verifyToken, async (req,res)=>{

    try{ 
        const addresses = await Addresses.find({userID:req.params.userID}); 
        res.status(200).json(addresses);
    }catch(err){
        res.status(500).json(err);
    }

});
 

router.put("/", verifyToken, async (req, res) =>{
    console.log(req.body);
    try {
        const address = await Addresses.find({_id:req.body.addressID, userID:req.body.userId});
        if(address){
            const updateAddress = {
                userID: req.body.userId,
                addressLocation: req.body.name,
                addressShortName: req.body.addressShortName,
                addressLongDescription: req.body.addressDescription,
                addressCoordinates: {
                    lng: (req.body.lng).toString(),
                    lat: (req.body.lat).toString()
                }

            };
            console.log(updateAddress);
            
            const updateAddresReq = await Addresses.findByIdAndUpdate(req.body.addressID, {
                $set: updateAddress,
            },{new:true});
            res.status(200).json(updateAddresReq);
        }
    }catch(err){
        res.status(500).json(err);
    } 
    // res.send("user test is successfuly")
});

router.delete("/:userId/:addressId", async (req,res)=>{
    try{
        const address = await Addresses.find({userID:req.params.userId});
        if(address){
            await Addresses.findByIdAndDelete(req.params.addressId);
            res.status(200).json("Address has been deleted");
        }
    }catch(err){
        res.status(501).json(err)
    }
});

router.get("/find/:id", async (req,res)=>{
    try{ 
        const products_pro = await Products.findById(req.params.id);
        res.status(200).json(products_pro);
    }catch(err){
        res.status(501).json(err)
    } 
});
  

module.exports = router;