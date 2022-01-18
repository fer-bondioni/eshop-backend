const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const orders = await Order.find();
  if (!orders) {
    res.status(500).json({ success: false });
  }
  res.send(orders).status(200);
});

module.exports = router;
