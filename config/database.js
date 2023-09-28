const mongoose = require("mongoose");

module.exports = connectDb = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("database connected succesfully"))
};
