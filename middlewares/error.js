const ErrorHander = require("../utils/errorhander");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // cast error in wrong mongodb id

  if (err.name === "CastError") {
    err.message = `Resource not found. Invalid ${err.path}`;
    err.statusCode = 400;
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHander(message, 400);
  }

  // wrong jwt error

  if (err.name === "JsonWebTokenError") {
    const message = "Json web token is invalid, Plese try again";
    err = new ErrorHander(message, 400);
  }

  // jwt expire error

  if (err.name === "TokenExpiredError") {
    const message = "Json web token is expired, Try again🙏";
    err = new ErrorHander(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
