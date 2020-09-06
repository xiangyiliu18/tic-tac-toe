/**
 * Required External Modules
 */
const express = require("express");
const winston = require("winston"); // Logger
const nodemailer = require("nodemailer");
const session = require("express-session");
const crypto = require("crypto"); // Generate the key based on password
const path = require("path"); // Solve relative path problem
const mongoose = require("mongoose");

const Game = require("./models/game");
const User = require("./models/user");
const userRouter = require("./controllers/users");
const gameRouter = require("./controllers/games");

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
const router = express.Router();
const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `info.log`
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "info.log" }),
  ],
});

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug"); // Jade has renamed into pug

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);
app.use("/users", userRouter);
app.use("/games", gameRouter);
// Connecto MondoDB with DB, tictactoe
mongoose
  .connect(
    "mongodb+srv://tictactoe:tictactoe@cluster0.2qfru.mongodb.net/tictactoe?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .catch((error) => {
    logger.info("Failed to connect MongoDb: %s", JSNO.stringify(error));
  });

/**
 * Routes Definitions
 */
app.get("/", (req, res) => {
  res.render("index", { title: "Tic Tac Toe", message: "Tic Tac Toe Games" });
});

app
  .route("signup")
  .get((req, res) => {
    res.render("signup");
  })
  .post((req, res) => {
    const key = crypto
      .createHmac("sha256", "password")
      .update(req.params.password)
      .digest("hex");
  });

app
  .route("/login")
  .get((req, res) => {
    res.render("signup");
  })
  // Handl Login action
  .post((req, res) => {
    console.log("Enter....");
  });

app.post("/logout", (req, res) => {});

/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    debug("HTTP server closed");
  });
});
