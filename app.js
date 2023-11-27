const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "Backend/config/config.env" });
}

// routes import
const productRouter = require("./routes/productsRoutes");
const userRouter = require("./routes/userRoutes");
const orderRouter = require("./routes/orderRoute");
const paymentRouter = require("./routes/paymentRoute");

app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/api/v1", productRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", paymentRouter);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

// middlewares
app.use(errorMiddleware);

// app.use(express.json());

module.exports = app;
