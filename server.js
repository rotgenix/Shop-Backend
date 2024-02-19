const app = require("./app.js");
const cloudinary = require("cloudinary");
const connectDb = require("./config/database.js");
require("dotenv").config({ path: "./config/config.env" });
app.use(cors({}));

// handle uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server due to uncaught exception`);
  process.exit(1);
});

// config
// console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "Backend/config/config.env" });
}

// connecting data base
connectDb();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// creating server
const Port = process.env.PORT;
const server = app.listen(Port, () => {
  console.log(`server created succesfully and running on port number: ${Port}`);
});

// unhandled promise rejection

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
