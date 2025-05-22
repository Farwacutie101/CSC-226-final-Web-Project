const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Route to get summary of orders and top-selling products
router.get('/summary', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: ["$orderItems.quantity", "$orderItems.price"]
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 } // optional: top 5 products
    ]);

    const totalOrders = await Order.countDocuments();

    res.json({
      totalOrders,
      topProducts: stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Analytics error', error });
  }
});

// Debug route to view real orders and inspect structure
router.get('/debug-orders', async (req, res) => {
  try {
    const orders = await Order.find({}).limit(1);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
