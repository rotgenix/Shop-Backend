const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotpassword,
  resetPassword,
  getUserDetails,
  updateUserPassword,
  updateProfile,
  getAllUsers,
  getSingleUsers,
  updateUserRole,
  deleteUser,
} = require("../controller/userController");

const { isAuthenticatedUser, authorizedRole } = require("../middlewares/auth");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotpassword);
router.route("/logout").get(logoutUser);
router.route("/password/reset/:token").put(resetPassword);
router.route("/password/update").put(isAuthenticatedUser, updateUserPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizedRole("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizedRole("admin"), getSingleUsers)
  .put(isAuthenticatedUser, authorizedRole("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizedRole("admin"), deleteUser);

module.exports = router;
