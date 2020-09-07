/**
 * Required External Modules
 */
const express = require("express");
const session = require("express-session");
const path = require("path"); // Solve relative path problem
const mongoose = require("mongoose");

const Logger = require('./controllers/logger');
const Game = require('./models/game');
const User = require('./models/user');
const userRouter = require('./controllers/users');
const gameRouter = require('./controllers/games');

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
const router = express.Router();

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug"); // Jade has renamed into pug

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "cheryl",
    resave: false,
    saveUninitialized: true,
  })
);
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
  const currSession = req.session;
  if (currSession.user) {
    Logger.info(`--- Current Logged in user: ${currSession.email}`);
    return res.redirect("/games", {username: currSession.user.username});
  }
  res.redirect("/login");
});

app
  .route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    console.log('Enter....');
  });

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post("/logout", (req, res) => {});

/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
