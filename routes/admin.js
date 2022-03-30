const Admin = require("../models/Admin");
const Carriers = require("../models/Carriers");
const Orders = require("../models/Orders");
const Users = require("../models/Users");
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router(); 
const CryptoJS = require("crypto-js"); 
const jwt = require("jsonwebtoken");

router.get("/orders", verifyTokenAndAdmin, async (req,res)=> {
    try{
        var _filter = {$match: { }};
        const filter = req.query.filter || "today";
        const _date = req.query.date || "";

        const date = new Date();
        const lastDay = new Date(date.setDate(date.getDate() - 1)).toISOString().slice(0, 10);
        const today = new Date().toISOString().slice(0, 10); 
        if(filter==="today"){
            _filter = { 
                $match: { 
                    time: {$gte: new Date(today)}
                } 
            };
        }
        if(filter==="lastday"){
            _filter = { 
                $match: { 
                    time: {$gte: new Date(lastDay), $lte: new Date(today)}
                } 
            };
        }
        
        if(filter==="choose_date" && _date === ""){
            _filter = { 
                $match: { 
                    time: {$gte: new Date(today)}
                } 
            };
        }else if(filter==="choose_date" && _date !== ""){
            const __date = new Date(_date);
            const ___NEXTDAY = new Date(__date.setDate(__date.getDate() + 1)).toISOString().slice(0, 10);
            _filter = { 
                $match: { 
                    time: {$gte: new Date(_date), $lte: new Date(___NEXTDAY)}
                } 
            };
        } 

        const idConversionStage = {
            $addFields: {
               convertedId: { $toObjectId: "$userId" },
               convertedAddressId: {$toObjectId: "$deliveryAddress"},
            }
        };

        const orders = await Orders.aggregate( [
            _filter,
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
        console.log(err);
        res.status(501).json(err);
    }

});


router.get("/statisitc", verifyTokenAndAdmin, async (req,res)=> {
    try{
        var _filter = {$match: { }};
        const filter = req.query.filter || "today";
        const _date = req.query.date || "";

        const date = new Date();
        const lastDay = new Date(date.setDate(date.getDate() - 1)).toISOString().slice(0, 10);
        const today = new Date().toISOString().slice(0, 10); 

        if(filter==="today"){
            _filter = { 
                $match: { 
                    time: {$gte: new Date(today)}
                } 
            };
        }
        if(filter==="lastday"){
            _filter = { 
                $match: { 
                    time: {$gte: new Date(lastDay), $lte: new Date(today)}
                } 
            };
        }
        
        if(filter==="choose_date" && _date === ""){
            _filter = { 
                $match: { 
                    time: {$gte: new Date(today)}
                } 
            };
        }else if(filter==="choose_date" && _date !== ""){
            const __date = new Date(_date);
            const ___NEXTDAY = new Date(__date.setDate(__date.getDate() + 1)).toISOString().slice(0, 10);
            _filter = { 
                $match: { 
                    time: {$gte: new Date(_date), $lte: new Date(___NEXTDAY)}
                } 
            };
        } 
           
        const count = await Orders.aggregate([
            // ...nameFilter,  
            _filter,
            {
                $count: "totalCount"
            }
        ]); 
        
        const usersCount = await Users.aggregate([
            // ...nameFilter,  
            _filter,
            {
                $count: "totalCount"
            }
        ]);  
        
        // const { password, ...others } = orders;
        // console.log(cetDate);
        res.status(200).json({orders:count.length > 0 ? count[0].totalCount : 0, 
            revenue:count.length > 0 ? count[0].totalCount*110 : 0, 
            users:usersCount.length > 0 ? usersCount[0].totalCount : 0});

    }catch(err){
        console.log(err);
        res.status(501).json(err);
    }

});

router.get("/carriers", verifyTokenAndAdmin, async (req,res)=> {
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


// router.get("/users", async (req,res)=> {
//     try{
//         // const order = await Orders.find();
        
//         const users = await Users.aggregate([
//             { 
//                 $project : 
//                     { 
//                         "password": 0,
//                         "isAdmin": 0,
//                     } 
//             }

//         ]); 
//         console.log(users);
//         res.status(200).json(users);
//     }catch(err){
//         res.status(501).json(err);
//     }

// });


router.get("/users", verifyTokenAndAdmin, async (req,res)=>{
    const pageSize = 50;
    const page = Number(req.query.pageNumber) || 1;
    const name = req.query.name || ''; 
    const nameFilter = name ? { fullname: { $regex: name, $options: 'i' } } : {};
    
    try{    
      const count = await Users.count({
          ...nameFilter, 
      }); 

      const users = await Users.find({
          ...nameFilter, 
      })
      // .populate('seller', 'seller.name seller.logo')
      .skip(pageSize * (page - 1))
      .limit(pageSize);

  //   res.send({ products, page, pages: Math.ceil(count / pageSize) });
      res.send({users, pages: Math.ceil(count / pageSize), totalUsers:count});
  }catch(err){
      res.status(501).json(err);
  }
});


router.delete("/users/:id", verifyTokenAndAdmin, async (req,res)=>{
    try{
        await Users.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted");
    }catch(err){
        res.status(501).json(err)
    }
});



router.post("/login", async (req, res)=>{
    try{
        const admin = await Admin.findOne({email:req.body.email});
        !admin && res.status(401).json(""); 

        const hasedPassword = CryptoJS.AES.decrypt(admin.password, process.env.SECRET_KEY);
        const Originalpassword = hasedPassword.toString(CryptoJS.enc.Utf8);
        Originalpassword != req.body.password && res.status(401).json(""); 

        const accessToken = jwt.sign(
            {
                id: admin._id,
            }, 
            process.env.JWT_SECRET,
            {expiresIn:"3d"}
        );
        const {password, ...others } = admin._doc;
        res.status(200).json({others, accessToken});
    }catch (err){
        console.log(err);
    }
});



// router.post("/register", verifyTokenAndAdmin, async (req, res) => {
//     req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
//     const newAdmin = new Admin(req.body);
//     console.log(newAdmin);
//     try{
//         const admin = await Admin.findOne({email:req.body.email});
//         if(!admin){
//             console.log(newAdmin);
//             const savedAdmin = await newAdmin.save();
//             res.status(201).json(savedAdmin);
//         }else{
//             res.status(405).json("Email taken");
//         }
//     }catch(err){
//         res.status(500).json(err);
//     }
// });
 
 

module.exports = router;