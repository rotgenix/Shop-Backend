const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");


// routes import
const productRouter = require("./routes/productsRoutes");
const userRouter = require("./routes/userRoutes");
const orderRouter = require("./routes/orderRoute");

app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use("/api/v1", productRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1",orderRouter);


// middlewares
app.use(errorMiddleware);

// app.use(express.json());

module.exports = app;
