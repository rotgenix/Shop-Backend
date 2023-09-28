const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// it tells whether the user is login or not

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHander("Please login to continue", 401));
  }

  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodeData.id);

  next();
});

exports.authorizedRole = (...roles) => {
  return (req, res, next) => {

    if (roles.includes(req.user.role)) {
      return next();
    }

    return next(
      new ErrorHander("you are not allowed to excess this resources", 403)
    );
  };
};
