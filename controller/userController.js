const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: { public_id: "123455432", url: "343443434" },
  });

  sendToken(user, 201, res);
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHander("please enter email and password", 404));

  const user = await User.findOne({ email: email }).select("+password"); // finding user in database

  if (!user) return next(new ErrorHander("User not exists", 404));

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched)
    return next(new ErrorHander("Incorrect credentials", 404));

  sendToken(user, 200, res);
});

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "logout successfully",
  });
});

// forgot password
exports.forgotpassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User doesn't exits", 404));
  }

  // Get reset password token

  const resetToken = await user.getPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `your password reset token is :- \n ${resetPasswordUrl} \n\n If you have not requested this email then ignore it
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "ecommerce password recovery",
      message: message,
    });

    res.status(200).json({
      success: true,
      message: `message sended succesfully to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

// reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset password token is invalid or has been expired",
        404
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password doesn't match", 404));
  }

  user.password = req.body.password;

  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();
  sendToken(user, 200, res);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update user password
exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched)
    return next(new ErrorHander("Old Password is incorrect", 404));

  if (req.body.newPassword !== req.body.confirmNewPassword)
    return next(new ErrorHander("New Password doesn't match", 404));

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "profile updated successfully",
  });
});

// get all user
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    success: true,
    user,
  });
});

// get single user (admin)
exports.getSingleUsers = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) next(new ErrorHander("user doesn't exist with given id ", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

// update user role  --Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "profile updated successfully",
  });
});

// delete user --admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHander("User not exit with given id", 404));
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

