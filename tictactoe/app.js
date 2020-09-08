// Required Modules
const {
  express,
  session,
  mongoose,
  path,
  ERROR_STATUS,
  OK_STATUS,
} = require("./constants");
const Logger = require("./controllers/logger-controller");
const User = require("./models/user");
const userRouter = require("./controllers/user-controller");
const gameRouter = require("./controllers/game-controller");

// App Variables & Configuration
const app = express();
const port = process.env.PORT || "8000";
const router = express.Router();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "cheryl",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
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
    logger.error(`Failed to connect MongoDb: ${JSNO.stringify(error)}`);
  });

// Routing handling
app.get("/", (req, res) => {
  const currUser = req.session.user;
  if (currUser) {
    // email & username
    Logger.info(`Current Logged in user: ${currUser.email}`);
    // Redirect to Game Main Page
    return res.redirect("/games", { username: currUser.username });
  }
  res.redirect("/login"); // Need Log In
});

// Hadnle Log in requests
app
  .route("/login")
  .get((req, res) => {
    if (req.session.user) {
      return res.redirect("/games");
    }
    res.render("login"); // Render Log In Page
  })
  .post(async (req, res) => {
    const { email, password } = req.body;
    const loggedUser = await User.findOne(
      {
        email,
        password,
        active: true,
      },
      "username human wopr"
    ).exec();

    if (loggedUser) {
      const user = {
        email,
        username: loggedUser.username,
        score: (loggedUser.human - loggedUser.wopr)
      };
      req.session.user = user;
      return res.json({ status: OK_STATUS });
    }

    const errMsg = "Invalid email or password.";
    Logger.error(errMsg);
    res.json({ status: ERROR_STATUS, error: errMsg });
  });

// Go to User requests handling
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Hadnle Log out requests
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      Logger.error(`Failed to Log out: ${JSON.stringify(err)}`);
      res.json({
        status: ERROR_STATUS,
        error: "Failed to log out due to server error",
      });
    } else {
      res.json({ status: OK_STATUS });
    }
  });
});

router.get("/302", (req, res) => {
  res.send("302 - Server error");
});

router.get("/404", (req, res) => {
  res.send("404 -Not Found");
});
/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
