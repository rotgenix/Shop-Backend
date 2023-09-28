const express = require("express");
const { isAuthenticatedUser, authorizedRole } = require("../middlewares/auth");
const {
  newOrder,
  orderDetails,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controller/orderController");
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, orderDetails);
router.route("/orders/me").get(isAuthenticatedUser, myOrders);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizedRole("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizedRole("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizedRole("admin"), deleteOrder);

   
module.exports = router;
