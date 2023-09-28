const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
  },
  email: {
    type: String,
    required: [true, "please enter your email address"],
    unique: true,
    validate: [validator.isEmail, "please enter a valid email"], // to validate email address.
  },
  password: {
    type: String,
    required: [true, "please enter password"],
    minLength: 8,
    select: false, // to hender password, when we call find it will give all data but do not give password it is for data security.
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "User",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT token
userSchema.methods.getJWTtoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compare passwords

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generating password reset token

userSchema.methods.getPasswordResetToken = function () {
  // generating token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hashing and adding resetPasswordToken to user schema

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = new mongoose.model("User", userSchema);
