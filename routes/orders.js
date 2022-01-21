const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { User } = require("../models/user");
const { OrderItem } = require("../models/order-items");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

//get single
router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id).populate({
    path: "orderItems",
    populate: {
      path: "product",
      populate: "category",
    },
  });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
  let orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  let order = new Order({
    orderItems: orderItemsIdsResolved,
    status: req.body.status,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    zip: req.body.zip,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();
  if (!order) {
    res.status(400).json("The order cannot be created");
  }
  res.send(order);
});

//update
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  if (!order) {
    return res.status(400).send("The order cannot be updated");
  }
  res.send(order);
});

//delete
router.delete("/:id", async (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        res.status(200).json({ success: true, message: "order deleted" });
      } else {
        res.status(404).json({ success: false, message: "order not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
});

//SUM
router.get(`/get/totalsales`, async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    res.status(400).send("The sum could not be done");
  }
  res.send({ totalsales: totalSales.pop().totalsales });
});

//COUNT
router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments();
  if (!orderCount) {
    res.status(500).send({ success: false });
  }
  res.send({ orderCount: orderCount });
});

//orders by user

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderId = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });
  if (!userOrderId) {
    res.status(500).send({ success: false });
  }
  res.send(userOrderId);
});

module.exports = router;
