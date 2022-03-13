const Users = require("../models/Users");
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const CryptoJS = require("crypto-js"); 

const router = require("express").Router();

// router.put("/:id", verifyTokenAuthorization, async (req, res) =>{
//     if(req.body.password){
//         req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
//     }
//     try {
//         const updateUser = await Users.findByIdAndUpdate(req.params.id, {
//             $set: req.body,
//         },{new:true});
//         res.status(200).json(updateUser);
//     }catch(err){
//         res.status(500).json(err);
//     }
 
//     res.send("user test is successfuly")
// });


router.put("/:id", verifyToken, async (req, res) =>{ 
     
    try {
        var element = {}, updateUserData = [];
        const accessToken  = req.headers.token.split(" ")[1];

        console.log(accessToken);
    
        console.log(req.body);
        console.log(req.body.newFullname);

        if(req.body.newFullname){
            console.log(req.body.newFullname);
            element.fullname = req.body.newFullname;
        }

        if(req.body.newPhonenumber){
            console.log(req.body.newPhonenumber);
            element.phonenumber = req.body.newPhonenumber;
        }

        if(req.body.newPassword){
            console.log(req.body.newPassword);
            element.password = CryptoJS.AES.encrypt(req.body.newPassword, process.env.SECRET_KEY).toString();
        }
        console.log(req.body.newPassword);

        const updateUser = await Users.findByIdAndUpdate(req.params.id, {
            $set: element,
        },{new:true});


        const { password, isAdmin, ...others } = updateUser._doc;
        res.status(200).json({others, accessToken});

    }catch(err){
        res.status(500).json(err);
    }
 
});

router.delete("/:id", verifyTokenAuthorization, async (req,res)=>{
    try{
        await Users.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted");
    }catch(err){
        res.status(501).json(err)
    }
});

router.get("/find/:id", verifyTokenAndAdmin, async (req,res)=>{
    try{ 
        const user = await Users.findById(req.params.id);
        
        const { password, ...others } = user._doc;

        res.status(200).json(others);
    }catch(err){
        res.status(501).json(err)
    }
});

router.get("/", verifyTokenAndAdmin, async (req,res)=>{
    const query = req.query.new;

    try{ 
        const user = query ? await Users.find().sort({_id:-1}).limit(1) : await Users.find();
        res.status(200).json(user);
    }catch(err){
        res.status(501).json(err)
    } 
});

router.get("/stats", verifyTokenAndAdmin, async (req, res)=>{
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1))
    
    try{
        const data = await Users.aggregate([
            {
                $match: {createdAt: {$gte: lastYear}}
            },
            {
                $project: {
                    month:{$month: "$createdAt"},
                }
            },{
                $group:{
                    _id:"$month",
                    total:{$sum:1},
                }
            }
        ]);
        res.status(200).json(data);
    }catch(err){
        res.status(501).json(err);
    }
});

// router.post("/userposttest", (req, res)=>{
//     const username = req.body.username;
//     console.log(username); 
// });

module.exports = router;