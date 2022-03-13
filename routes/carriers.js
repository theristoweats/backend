const { verifyToken } = require("./verifyToken");
 
const router = require("express").Router();
const Carriers = require("../models/Carriers");
const CryptoJS = require("crypto-js"); 

router.post("/", async (req, res) => {
    try{
        const newCarrier = new Carriers({  
            fullname: req.body.fullname,
            carrierCoordinates: [
                {
                    lat:"0",
                    lng:"0"
                }
            ],   
            profilePicture: req.body.profilePicture,    
            phoneNumber: req.body.phoneNumber,   
            email: req.body.email,   
            password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),   
        });

        const carrier = await Carriers.findOne({email:req.body.email});
        if(!carrier){
            const savedCarrier = await newCarrier.save();

            const {password, ...others} = savedCarrier._doc;
            console.log(others);

            res.status(200).json(others);
        }
    }catch(err){
        res.status(500).json(err);
    }
     
     
});


router.put("/location/:carrierID", async (req, res) => {
    var io = req.app.get('socketio');
    try{ 
        const carrier = await Carriers.findOne({_id:req.params.carrierID});
        if(carrier){ 
            const updateCarrierLocation = await Carriers.findByIdAndUpdate(req.params.carrierID,{
                "$set": {carrierCoordinates:[{ lat:req.body.lat, lng:req.body.lng }]}},
                {new:true});

            io.to(req.params.carrierID).emit('carrier-location', {lat:req.body.lat, lng:req.body.lng});
            console.log(req.params.carrierID);
            res.status(200).json(updateCarrierLocation);
            
        }
    }catch(err){
        res.status(500).json(err);
    }
});


router.get("/details/:carrierId", verifyToken, async (req,res)=>{
    try{ 
        const carrier = await Carriers.find({_id:req.params.carrierId});
        res.status(200).json({phoneNumber:carrier[0].phoneNumber, fullname:carrier[0].fullname});
    }catch(err){
        res.status(501).json(err)
    }
});
 

module.exports = router;