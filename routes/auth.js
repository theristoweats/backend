const { verifyToken } = require("./verifyToken");
 
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