const Categories = require("../models/Categories");
const { route } = require("./user");
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

// create product

// router.post("/", verifyTokenAndAdmin, async (req,res)=>{
router.post("/", async (req,res)=>{

    const newCategory = new Categories(req.body); 
    try{
        const savedCategory = await newCategory.save();
        res.status(200).json(savedCategory);
    }catch(err){
        res.status(500).json(err);
    }

}); 

// router.put("/:id", verifyTokenAndAdmin, async (req, res) =>{
router.put("/:id", async (req, res) =>{
 
    try {
        const updatedCategory = await Categories.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        },{new:true});
        res.status(200).json(updatedCategory);
    }catch(err){
        res.status(500).json(err);
    }
});

// router.delete("/:id", verifyTokenAndAdmin, async (req,res)=>{
router.delete("/:id", async (req,res)=>{
    try{
        await Categories.findByIdAndDelete(req.params.id);
        res.status(200).json("Category has been deleted");
    }catch(err){
        res.status(501).json(err)
    } 
});

router.get("/find/:id", async (req,res)=>{
    try{ 
        const categoryFinally = await Categories.findById(req.params.id);
        res.status(200).json(categoryFinally);
    }catch(err){
        res.status(501).json(err)
    }
});
 
router.get("/", async (req,res)=> { 

    try{
        const categoreisLoad = await Categories.find();
        res.status(200).json(categoreisLoad);
    }catch(err){
        res.send(501).json(err);
    }

});
  

module.exports = router;