const Orders = require("../models/Orders");
const { verifyToken } = require("./verifyToken");
const router = require("express").Router();

 
router.get("/stats/:userId", verifyToken, async (req,res)=>{ 
    try{ 
        const userId = req.params.userId;
        const countOrders = await Orders.count({userId:userId});
        const spend_money = await Orders.aggregate([
            { $match: { userId:userId } },
            {
              $group: {
                _id: null,
                amount: { $sum: '$amount' },
              },
            }
        ]);
        // const spend_money = await Orders.find();
        res.status(200).json({orders:countOrders, spend:spend_money[0].amount});
    }catch(err){
        res.status(501).json(err)
    }
    
});


module.exports = router;