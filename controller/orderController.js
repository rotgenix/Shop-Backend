const Order = require("../models/orderModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Product = require("../models/productModels");

// creating new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// get single order details
exports.orderDetails = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order)
    return next(new ErrorHander("order not found with this id ", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

// get loged in  order details
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// get all orders
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((item) => {
    totalAmount += item.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update order -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHander("no order exit with given id ", 404));

  if (order.orderStatus === "Delivered")
    return next(new ErrorHander("Order is already delivered", 404));

  // for decreasing stock of delivered items.

  if (req.body.status === "Shipped" && order.orderStatus != "Shipped") {
    order.orderItems.forEach(async (order) => {
      await updateStock(order.product.valueOf(), order.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
  });
});

// reducing the stock quantity of a delivered product.
const updateStock = async (id, quantity) => {
  const product = await Product.findById(id);
  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
};

// delete order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHander("no order exit with given id ", 404));

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: `order with given id - ${req.params.id} is deleted successfully`,
  });
});
