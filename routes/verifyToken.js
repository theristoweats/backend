const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next)=>{
    try{
        const authHeader = req.headers.token;
        if(authHeader){
            const token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
                if(err) res.status(401).json("");
                req.user = user;
                next();
            });
        }else{
            return res.status(401).json("");
        }
    }catch(err){
        return res.status(401).json("");
    }
    
}

const verifyTokenAuthorization = (req, res, next)=>{
    console.log(req);

    verifyToken(req, res, ()=>{        
        if ( req.user.id === req.params.id || req.user.isAdmin){
            next();
        }else{
            res.status(403).json("You cant do that");
        }
    })
}


const verifyTokenAndAdmin = async (req, res, next) => {
    try{
        verifyToken(req, res, async ()=>{     
            if(req.user){
                const admin = await Admin.findById(req.user.id);
                if(admin){
                    next();
                }else{
                    res.status(403).json("");
                }
            } 
        })
    }catch(err){
        res.status(403).json("");
    }
}

module.exports = {
    verifyToken, 
    verifyTokenAuthorization,
    verifyTokenAndAdmin
}