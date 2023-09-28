// creating token and saving in cookie.

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTtoken();

  // option of cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // iske value always milisec m de jate h
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
