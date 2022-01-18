const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  order: Number,
});

exports.Order = mongoose.model("Order", orderSchema);
