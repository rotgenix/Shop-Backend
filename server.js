const app = require("./app.js");
const dotenv = require("dotenv");
const connectDb = require("./config/database.js");

// handle uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server due to uncaught exception`);
  process.exit(1);
});

// config
dotenv.config({ path: "Backend/config/config.env" });

// connecting data base
connectDb();

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
