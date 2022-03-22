const Products = require("../models/Products");
const Categories = require("../models/Categories");
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

// create product

// router.post("/", verifyTokenAndAdmin, async (req,res)=>{
router.post("/", async (req,res)=>{

    const newProduct = new Products(req.body);

    try{
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    }catch(err){
        res.status(500).json(err);
    }

});


router.get("/admin", async (req,res)=>{

    try{ 
        const products = await Products.find(); 
        res.status(200).json(products);
    }catch(err){
        res.status(500).json(err);
    }

});
 

router.put("/:id", verifyTokenAndAdmin, async (req, res) =>{
 
    try {
        const updateProduct = await Products.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        },{new:true});
        res.status(200).json(updateProduct);
    }catch(err){
        res.status(500).json(err);
    }


    res.send("user test is successfuly")
});

router.delete("/:id", verifyTokenAndAdmin, async (req,res)=>{
    try{
        await Products.findByIdAndDelete(req.params.id);
        res.status(200).json("Product has been deleted");
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


router.get("/", async (req,res)=>{
      const pageSize = req.query.shown || 12;
      const page = Number(req.query.pageNumber) || 1;
      const name = req.query.name || '';
      const category = req.query.category || '';
      const order = req.query.order || '';
      const min =
        req.query.min && Number(req.query.min) !== 0 ? Number(req.query.min) : 0;
      const max =
        req.query.max && Number(req.query.max) !== 0 ? Number(req.query.max) : 0;
   
      const nameFilter = name ? { title: { $regex: name, $options: 'i' } } : {};
    //   const categoryFilter = category ? { categories:{$in:[category],} } : {};
      const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {};
      const sortOrder =
        order === 'cheapest'
          ? { price: 1 }
          : order === 'expensives'
          ? { price: -1 } 
          : { _id: -1 };
    try{  
        
        const catfilter = await Categories.find({category_url:{
            $in:[category],
        }}); 

        const categoryFilter = category ? { categories:[catfilter[0]._id.toString()] } : {};


        const count = await Products.count({
            ...nameFilter,
            ...categoryFilter,
            ...priceFilter,
        });
        const maxPrice = await Products.find({
            // ...nameFilter,
            ...categoryFilter,
            // ...priceFilter,
        }).sort({price:-1}).limit(1);

        const products = await Products.find({
            ...nameFilter,
            ...categoryFilter,
            ...priceFilter,
        })
        // .populate('seller', 'seller.name seller.logo')
        .sort(sortOrder)
        .skip(pageSize * (page - 1))
        .limit(pageSize);
    //   res.send({ products, page, pages: Math.ceil(count / pageSize) });
        res.send({products, pages: Math.ceil(count / pageSize), maxprice: maxPrice[0].price, totalproducts:count});
    }catch(err){
        res.status(501).json(err);
    }
    });

// router.get("/", async (req,res)=>{
//     const qNew = req.query.new;
//     const qCategories = req.query.category;
//     const qMinPrice = req.query.minprice;
//     const qMaxPrice = req.query.maxprice;
//     try{  
//         let products_Pro;

//         if(qNew){
//             products_Pro = await Products.find().sort({createdAt:-1}).limit(5);
//         }else if (qMinPrice && qMaxPrice && qCategories){
//             const category = await Categories.find({category_url:{
//                 $in:[qCategories],
//             }}) ;
//             category_id = category[0]._id.toString();

//             products_Pro = await Products.find({categories:{
//                 $in:[category_id],
//             },price: {$gte: qMinPrice, $lte: qMaxPrice}});

//         }else if (qMinPrice && qMaxPrice ){
 
//             // products_Pro = await Products.find({price: {$gte: qMinPrice, $lte: qMaxPrice}}).sort({price:1});
//             products_Pro = await Products.find({ price: {$gte: qMinPrice, $lte: qMaxPrice} });

//         }else if(qCategories){
            
//             const category = await Categories.find({category_url:{
//                 $in:[qCategories],
//             }}) ;
//             category_id = category[0]._id.toString();

//             products_Pro = await Products.find({categories:{
//                 $in:[category_id],
//             }});
//         }else{
//             products_Pro = await Products.find();
//         }


//         res.status(200).json(products_Pro);
//     }catch(err){
//         res.status(501).json(err)
//     } 
// });



router.get("/maxp", async (req,res)=>{
    const qCategories = req.query.category; 
    try{  
        let products_Pro;
        
        if(qCategories){    
            const category = await Categories.find({category_url:{
                $in:[qCategories],
            }}) ;
            category_id = category[0]._id.toString();

            products_Pro = await Products.find({categories:{
                $in:[category_id],
            }}).sort({price:-1}).limit(1);
        }else{
            products_Pro = await Products.find().sort({price:-1}).limit(1);
        }


        res.status(200).json(products_Pro);
    }catch(err){
        res.status(501).json(err)
    } 
});



 
// router.post("/userposttest", (req, res)=>{
//     const username = req.body.username;
//     console.log(username); 
// });

module.exports = router;