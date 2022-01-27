const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

//cors!
app.use(cors());
app.options("*", cors());

const api = process.env.API_URL;

const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const ordersRouter = require("./routes/orders");
const usersRouter = require("./routes/users");

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

//Routes
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);
//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 3000;
//Server
app.listen(PORT, () => {
  console.log("Server is running on port http://localhost:3000");
});
