const mongoose = require("mongoose");

module.exports = connectDb = () => {
  // console.log(process.env.DB_URL);
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) =>
      console.log("database connected succesfully", data.connection.host)
    );
};
