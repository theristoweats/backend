const Carriers = require("../models/Carriers");
const Cart = require("../models/Cart");
const Orders = require("../models/Orders");
const Products = require("../models/Products");
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();


// create product


router.post("/", verifyToken, async (req,res)=>{
    // const newOrder = new Orders(req.body); 
    try{
        const user_UUID = req.body.user_UUID;
        const userId = req.body.userId;
        const deliveryAddress = req.body.deliveryAddress;

        const cartitems = await Cart.aggregate( [
            { 
                $match: 
                { 
                    user_UUID: user_UUID,
                    status:"incart"
                } 
            },
            {
                $addFields: {
                    "productId": {
                        "$map": {
                          "input": "$product",
                          "in": {
                            "$mergeObjects": [
                                "$$this",
                                {
                                  "dest_oid": {
                                    "$toObjectId": "$$this.productId"
                                  }
                                }
                              ]
                          }
                        }
                    },
                    "_price":{
                        "$map": {
                            "input": "$product",
                            "in": {
                                "$multiply": [
                                    "$$this.quantity",
                                    "$$this.price"
                                ]
                            }
                        }
                    }
                },
                
            },
            // { 
            //     "$unwind": "$products"
            // }, 
            // {$unwind: "$productId"},

            {
                
               $lookup:
                  {
                     from: "products",
                     localField: "productId.dest_oid",
                     foreignField: "_id",
                     as: "product_info"
                 }
            },
            { 
                "$group": 
                { 
                    "_id": null, 
                    products:
                    { 
                        $push: { 
                            "itemId" : "$_id",
                            "productId":  { "$first": "$product_info._id" },  
                            "title":  { "$first": "$product_info.title" },  
                            "img":  { "$first": "$product_info.img" },  
                            "quantity":  { "$first": "$product.quantity" },  
                            "price":  { "$first": "$_price" },  
                            
                        } 
                    },
                    count:{$sum:1}, 
                    totalAmount:{$sum:{ "$first": "$_price" }}, 

                } 
            }, 
             
        ] ); 
        

        if(cartitems.length !== 0){
            // console.log(cartitems);

            const now = new Date();
            const timenow = new Date(now.setHours(now.getHours() + 2));  
            const countOrders = await Orders.count()+1;
            const order_create = new Orders(
                {
                    pro_Id: countOrders,
                    userId: userId, 
                    cart_UUID: user_UUID, 
                    products: cartitems[0].products,
                    amount: cartitems[0].totalAmount+70,
                    deliveryAddress: deliveryAddress,
                    phoneNumber:"0",
                    carrierId:"0",
                    carrierName:"0",
                    orderStatus:"pending",
                    time:timenow
                }
            ); 
            console.log(order_create);
            
            const savedOrder = await order_create.save();
            const savedOrderId = savedOrder._id.toString();
            // console.log("da");
            const updatedCartOrder = await Cart.updateMany({user_UUID:user_UUID,status:"incart"},{
                "$set": {"orderId":savedOrderId, status:"ordered"}},
                {new:true});
            res.status(200).json(savedOrder);
        }else{
            console.log("nooo");
        }
        
        
        // const cart = await Cart.find({user_UUID:user_UUID, status:"incart"});
        
        
        // if(cart){
            
        //     var totalPrice = 0;
        //     var FetchedItemsCart = [];

        //     const now = new Date();
        //     const timenow = new Date(now.setHours(now.getHours() + 2));  

        //     for(var i=0; i<cart.length; i++){  
        //         const _quantity = cart[i].product[0].quantity;
        //         const itemID = cart[i]._id;
    
        //         const productId = cart[i].product[0].productId;
        //         const product = await Products.find({_id:productId});
        //         const productImg = product[0].img;
        //         const productName = product[0].title;
        //         const productPrice = product[0].price*_quantity;
        //         const fetchedProdct = { 
        //             itemId:itemID,
        //             productId:productId,
        //             img:productImg,
        //             title:productName,
        //             quantity:_quantity,
        //             price:productPrice,
        //         };
        //         FetchedItemsCart.push(fetchedProdct);
        //         totalPrice = totalPrice + productPrice;
        //     }
        //     const countOrders = await Orders.count()+1;
        //     const order_create = new Orders(
        //         {
        //             pro_Id: countOrders,
        //             userId: userId, 
        //             cart_UUID: user_UUID, 
        //             products: FetchedItemsCart,
        //             amount: totalPrice+70,
        //             deliveryAddress: deliveryAddress,
        //             phoneNumber:"0",
        //             carrierId:"0",
        //             carrierName:"0",
        //             orderStatus:"pending",
        //             time:timenow
        //         }
        //     ); 
        //     // const savedOrder = await order_create.save();
        //     // const savedOrderId = savedOrder._id.toString();
        //     // console.log("da");
        //     // const updatedCartOrder = await Cart.updateMany({user_UUID:user_UUID,status:"incart"},{
        //     //     "$set": {"orderId":savedOrderId, status:"ordered"}},
        //     //     {new:true});

        //     // console.log(updatedCartOrder);
        //     // console.log("daa");
        //     // findAndModify({
        //     //     ... query: {"id": "test_object"},
        //     //     ... update: {"$set": {"some_key.param2": "val2_new", "some_key.param3": "val3_new"}},
        //     //     ... new: true
        //     //     ... })
        //     console.log(order_create);


        //     // res.status(200).json(savedOrder);
        // }
        
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }

});

// router.post("/", verifyToken, async (req,res)=>{
//     // const newOrder = new Orders(req.body); 
//     try{
//         const user_UUID = req.body.user_UUID;
//         const userId = req.body.userId;
//         const deliveryAddress = req.body.deliveryAddress;

//         const cart = await Cart.find({user_UUID:user_UUID, status:"incart"});
//         if(cart){
                
//             var totalPrice = 0;
//             var FetchedItemsCart = [];

//             const now = new Date();
//             const timenow = new Date(now.setHours(now.getHours() + 2));  

//             for(var i=0; i<cart.length; i++){  
//                 const _quantity = cart[i].product[0].quantity;
//                 const itemID = cart[i]._id;
    
//                 const productId = cart[i].product[0].productId;
//                 const product = await Products.find({_id:productId});
//                 const productImg = product[0].img;
//                 const productName = product[0].title;
//                 const productPrice = product[0].price*_quantity;
//                 const fetchedProdct = { 
//                     itemId:itemID,
//                     productId:productId,
//                     img:productImg,
//                     title:productName,
//                     quantity:_quantity,
//                     price:productPrice,
//                 };
//                 FetchedItemsCart.push(fetchedProdct);
//                 totalPrice = totalPrice + productPrice;
//             }
//             const countOrders = await Orders.count()+1;
//             const order_create = new Orders(
//                 {
//                     pro_Id: countOrders,
//                     userId: userId, 
//                     cart_UUID: user_UUID, 
//                     products: FetchedItemsCart,
//                     amount: totalPrice+70,
//                     deliveryAddress: deliveryAddress,
//                     phoneNumber:"0",
//                     carrierId:"0",
//                     carrierName:"0",
//                     orderStatus:"pending",
//                     time:timenow
//                 }
//             ); 
//             const savedOrder = await order_create.save();
//             const savedOrderId = savedOrder._id.toString();
//             console.log("da");
//             const updatedCartOrder = await Cart.updateMany({user_UUID:user_UUID,status:"incart"},{
//                 "$set": {"orderId":savedOrderId, status:"ordered"}},
//                 {new:true});

//             console.log(updatedCartOrder);
//             console.log("daa");
//             // findAndModify({
//             //     ... query: {"id": "test_object"},
//             //     ... update: {"$set": {"some_key.param2": "val2_new", "some_key.param3": "val3_new"}},
//             //     ... new: true
//             //     ... })
//             // console.log(savedOrder);


//             res.status(200).json(savedOrder);
//         }
        
//     }catch(err){
//         res.status(500).json(err);
//     }

// });


router.put("/:id", verifyTokenAndAdmin, async (req, res) =>{

    try {
        const updatedOrder = await Orders.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        },{new:true});
        
        res.status(200).json(updatedOrder);
    }catch(err){
        res.status(500).json(err);
    } 

});

router.delete("/:id", verifyTokenAndAdmin, async (req,res)=>{
    try{
        await Orders.findByIdAndDelete(req.params.id);
        res.status(200).json("Item has been deleted");
    }catch(err){
        res.status(501).json(err)
    }
});


router.get("/:orderId/:userId", verifyToken, async (req,res)=>{ 
    try{ 
        const order = await Orders.find({_id:req.params.orderId, userId:req.params.userId});
        if(order){
            res.status(200).json(order);
        } 
    }catch(err){
        res.status(501).json(err)
    }
});


router.get("/:userId", verifyToken, async (req,res)=>{ 
    try{ 
        const orders = await Orders.find({userId:req.params.userId});
        res.status(200).json(orders);
    }catch(err){
        res.status(501).json(err)
    }
});

 

// http://localhost:5000/api/orders/status/622841c9713f4c6d12cd998b/pending
router.put("/status/:orderId/:type/:carrierID", async (req, res) =>{
    var io = req.app.get('socketio');

    try {  

        const carrier = await Carriers.find({_id:req.params.carrierID});
        const carrier_name = carrier[0].fullname;
        console.log(carrier_name);

        const updatedOrderStatus = await Orders.findByIdAndUpdate(req.params.orderId,{
            "$set": {orderStatus:req.params.type, carrierId:req.params.carrierID, carrierName:carrier_name}},
            {new:true});
        
        const order_USER = await Orders.find({_id:req.params.orderId});
        const _orderUSER__id = order_USER[0].userId;

        res.status(200).json(updatedOrderStatus);

        const orderStatus = req.params.type;
        const orderIdPro = req.params.orderId;

        io.to(orderIdPro).emit('new-status', {orderStatus:orderStatus, carrierID:req.params.carrierID});
        io.to(_orderUSER__id).emit('new-status-order-user', {update:"true"});
    
    }catch(err){
        console.log("JAS SUM ERRORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR" + err);
        res.status(500).json(err);
    } 

});



// router.get("/find/:userId", verifyTokenAndAdmin, async (req,res)=>{
//     try{ 
//         const order = await Order.find({userId:req.params.userId});
//         res.status(200).json(order);
//     }catch(err){
//         res.status(501).json(err)
//     }
// });

// router.get("/", verifyTokenAndAdmin, async (req, res)=>{
//     try{
//         const orders = await Order.find();
//         res.status(200).json(orders);

//     }catch(err){
//         res.status(500).json(res);
//     }
// }); 

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  
    try {
      const income = await Orders.aggregate([
        { $match: { createdAt: { $gte: previousMonth } } },
        {
          $project: {
            month: { $month: "$createdAt" },
            sales: "$amount",
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$sales" },
          },
        },
      ]);
      res.status(200).json(income);
    } catch (err) {
      res.status(500).json(err);
    }
});  

// router.get("/income", verifyTokenAndAdmin, async (req,res)=>{
//     const date = new Date();
//     const lastMonth = new Date(date.getMonth()-1);
//     const previusMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));

//     try{
//         const income = await Orders.aggregate([
//             {$match: { createdAt: {$gte: previusMonth} }},
//             {
//                 project:{
//                     month: { $month: "$createdAt"},
//                     sales: "$amonut",
//                 },
//             },
//             {
//                 $group: {
//                     _id:"$month",
//                     total:{$sum: "$sales"}
//                 },
//             },
//         ]);
//         res.status(200).json(income);
//     }catch(err){
//         res.status(500).json(err);
//     }
// }); 

module.exports = router;