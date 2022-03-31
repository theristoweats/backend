const Cart = require("../models/Cart");
const Products = require("../models/Products");
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

// create product

// router.post("/", async (req,res)=>{

//     const cart = new Cart(req.body); 

//     try{
//         const savedCart = await cart.save();
//         res.status(200).json(savedCart);
//     }catch(err){
//         res.status(500).json(err);
//     }

// });

router.put("/:user_UUID/:itemId/:type", async (req, res) =>{
    try {
        const type = req.params.type;
        const cart = await Cart.find({user_UUID:req.params.user_UUID, _id:req.params.itemId});
        if(cart){
            
            const user_UUID = cart[0].user_UUID; 
            const user_ip = cart[0].user_ip; 
            const totalPrice = cart[0].totalPrice; 
            const old_quantity = cart[0].product[0].quantity;
            const new_quantity_dec = old_quantity - 1;
            const new_quantity_inc = old_quantity + 1;

            const item_product_ID = cart[0].product[0]._id;
            const productId = cart[0].product[0].productId;
            const price = cart[0].product[0].price;
            
            // FUCK NOOOOOOO WHAT A CODE - OVA NE E TAKA KAKO STO TREBA AMA RABOTE xD DONT TOUCH THISSSS
            // MISLAM STARTA VERZIJA E PORADI PRODUT_OLD_QUANTITY AMAAA KE VIDIMEEE
            if(type==="dec"){ 
                const new_body = {
                    user_UUID: user_UUID, 
                    user_ip: user_ip,
                    totalPrice: totalPrice,
                    product: {
                        productId:productId,
                        quantity:new_quantity_dec,
                        price:price
                    }, 
                };

                const updateItemCart = await Cart.findOneAndUpdate(
                    {
                      _id: req.params.itemId,
                    },
                    new_body,
                    { new: true }
                ).exec();

            }

            if(type==="inc"){ 
                const new_body = {
                    user_UUID: user_UUID, 
                    user_ip: user_ip,
                    totalPrice: totalPrice,
                    product: {
                        productId:productId,
                        quantity:new_quantity_inc,
                        price:price
                    }, 
                };

                const updateItemCart = await Cart.findOneAndUpdate(
                    {
                      _id: req.params.itemId,
                    },
                    new_body,
                    { new: true }
                ).exec();

            }
        }
        // 
        res.status(200).json(true);
    }catch(err){
        res.status(500).json(err);
    } 

});

router.delete("/:user_UUID/:itemId", async (req,res)=>{
    try{
        const cart = await Cart.find({user_UUID:req.params.user_UUID});
        if(cart){
            await Cart.findByIdAndDelete(req.params.itemId);
            res.status(200).json("Item has been deleted");
        }
    }catch(err){
        res.status(501).json(err)
    }
});

router.get("/find/:userId", verifyTokenAuthorization, async (req,res)=>{
    try{ 
        const cart = await Cart.find({userId:req.params.userId});
        res.status(200).json(cart);
    }catch(err){
        res.status(501).json(err)
    }
});

router.get("/:user_UUID", async (req, res)=>{
    try{    
        var totalPrice = 0;
        var FetchedItemsCart = [];

        const user_UUID = req.params.user_UUID;
        const cart = await Cart.find({user_UUID:req.params.user_UUID, status:"incart"});
        const count = await Cart.count({user_UUID:req.params.user_UUID, status:"incart"});
 
        // const total =  0;
        
        // const total = await Cart.aggregate([
        //     { $match: { user_UUID: user_UUID } },
        //     {
        //       $group: {
        //         _id: null,
        //         totalPrice: { $sum: '$totalPrice' },
        //       },
        //     }
        //   ]);
        if(cart){
            for(var i=0; i<cart.length; i++){  
                const _quantity = cart[i].product[0].quantity;
                const itemID = cart[i]._id;
    
                const productId = cart[i].product[0].productId;
                const product = await Products.find({_id:productId});
                const productImg = product[0].img;
                const productName = product[0].title;
                const productPrice = product[0].price*_quantity;
                const fetchedProdct = { 
                    _id:itemID,
                    productId:productId,
                    img:productImg,
                    title:productName,
                    quantity:_quantity,
                    price:productPrice,
                };
                FetchedItemsCart.push(fetchedProdct);
                totalPrice = totalPrice + productPrice;
            }
    
            res.status(200).json({items: FetchedItemsCart, quantity:count, total:totalPrice});
        }else{

            res.status(500);
        }

        // const carts = await Cart.find();
        // res.status(200).json(user_UUID);
    }catch(err){
        res.status(500).json(res);
    }
}); 
  
// post new item in cart

router.post("/", async (req, res) =>{

    try {

        var FetchedItemsCart = [];


        const user_UUID = req.body.user_UUID.toString(); 
        const productId = req.body.product._id.toString(); 
        const price = req.body.product.price;  // get the product price from product category list 
        const quantity = req.body.quantity; 
        // const ip = req.headers['x-forwarded-for'] ||
        //     req.socket.remoteAddress ||
        //     null; 
        const ip = null; 

        
        const product = await Products.find({_id:productId});
        const productImg = product[0].img;
        const productName = product[0].title;
        const productPrice = product[0].price*quantity; // prepere for price - ova nikade ne go koristam xD 

        const addCartItem = {
            user_UUID:user_UUID,
            user_ip:ip,
            totalPrice:price*quantity, // tuka stava vrednost ama ne se koristi nikade taka stoi vo db
            product: [ {
                productId:productId,
                quantity:quantity, // quantity product get 
                price:price, // price single product price 
            }],

        }; 

        const newItemInCart = new Cart(addCartItem);
        // console.log(newItemInCart); 
        const savedItemInCart = await newItemInCart.save();
        const itemId = savedItemInCart._id.toString();

        const fetchedProdct = { 
            _id:itemId,
            productId:productId,
            img:productImg,
            title:productName,
            quantity:quantity,
            price:productPrice,
        };
        FetchedItemsCart.push(fetchedProdct);
        // const updateCart = await Cart.findByIdAndUpdate(req.params.id, {
        //     $set: req.body,
        // },{new:true}); 
        res.send({items: FetchedItemsCart});
    }catch(err){
        console.log("fujjjjjjjjjjjjj" + err);
        res.status(500).json(err);
    } 

});

module.exports = router;