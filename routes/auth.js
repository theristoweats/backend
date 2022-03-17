const { verifyToken } = require("./verifyToken");
var cryptotoken = require("crypto");

const router = require("express").Router();
const User = require("../models/Users");
const CryptoJS = require("crypto-js"); 
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    const newUser = new User({  
        fullname: req.body.fullname,
        email: req.body.email,   
        phonenumber: req.body.phoneNumber,   
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),   
    });

    try{
        const user = await User.findOne({email:req.body.email});
        if(!user){
            console.log(newUser);
            const savedUser = await newUser.save();

            const accessToken = jwt.sign(
                {
                    id: savedUser._id,
                    isAdmin: savedUser.isAdmin, 
                }, 
                process.env.JWT_SECRET,
                {expiresIn:"3d"}
            );  
            const {codeVerify, lastTimeCode, phonenumberVerified, password, isAdmin, ...others } = savedUser._doc;

            res.status(201).json({others, accessToken});
        }else{
            res.status(405).json("Email taken");
        }
    }catch(err){
        res.status(500).json(err);
    }
});

// MarRkOBelLa-f[[f]f]fe;/.e]f]q 312=323$@$@- +____ $@$@ther#$!#$#! %@istow@12-312-41
router.post("/login", async (req, res)=>{
    try{
        const user = await User.findOne({email:req.body.email});
        !user && res.status(401).json("Грешни податоци."); 

        const hasedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const Originalpassword = hasedPassword.toString(CryptoJS.enc.Utf8);
        Originalpassword != req.body.password && res.status(401).json("Грешка податоци.");


        const accessToken = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin, 
            }, 
            process.env.JWT_SECRET,
            {expiresIn:"3d"}
        );
        const {codeVerify, lastTimeCode, phonenumberVerified, password, isAdmin, ...others } = savedUser._doc;
        res.status(200).json({others, accessToken});
    }catch (err){
        console.log(err);
    }
});


router.post("/checktoken", verifyToken, async (req, res)=>{
    try{
        // console.log("daaa");
         res.status(200).json("ok");
    }catch (err){
        console.log(err);
    }
});


// router.post("/checknumber", verifyToken, async (req, res)=>{
//     try{
//         const user = await User.findOne({_id:req.body.userId});
//         // console.log(user.phonenumberVerified);
//         if(user.phonenumberVerified === false){
//             res.status(200).json("not_verified");
//         }else{
//             res.status(200).json("verified");
//         } 
//         // console.log("daaa"); 
//     }catch (err){
//         console.log(err);
//     }
// });



// router.post("/sendcodecheck", verifyToken, async (req, res)=>{
//     try{
//         const user = await User.findOne({_id:req.body.userId});
//         var today = new Date();
//         var lastUpdate = new Date(user.updatedAt);
//         var difference = (today - lastUpdate);
//         var diffMin = Math.round(((difference % 86400000) % 3600000) / 60000); // minutes
//         console.log(diffMin);
//         if(user.lastTimeCode === false && diffMin < 2){
//             res.status(200).json("not");
//         }else{
//             if(diffMin > 2 && user.codeVerify==="0"){
//                 var code = cryptotoken.randomBytes(4).toString('hex'); 
//                 const updateUser = await User.findByIdAndUpdate(req.body.userId, {
//                     $set: {lastTimeCode:true, codeVerify:code},
//                 },{new:true});
//                 res.status(200).json("can"); 
//                 console.log("EXE 1");
//             }else{
//                 console.log("EXE 2");
//                 if(user.lastTimeCode === true){
//                     res.status(200).json("can");
//                     console.log("EXE 2 1");
//                 }else{
//                     res.status(200).json("not");
//                     console.log("EXE 2 2");
//                 }
//             }
//         } 
//         // console.log("daaa"); 
//     }catch (err){
//         console.log(err);
//     }
// });

router.post("/passwordverify/:userId", verifyToken, async (req, res)=>{
    console.log(req.body);
    try{
        // console.log("daaa"); 
        const user = await User.findOne({_id:req.params.userId});

        const hasedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const Originalpassword = hasedPassword.toString(CryptoJS.enc.Utf8);
        if(Originalpassword != req.body.oldPassword){
            res.status(401).json("wrong_pw");
        }else{
            res.status(200).json("successfully");
        }
    }catch (err){
        res.status(401).json(err);
    }
});



module.exports = router;