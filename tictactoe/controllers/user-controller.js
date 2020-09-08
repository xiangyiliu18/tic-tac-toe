const {
  router,
  nodemailer,
  crypto,
  ERROR_STATUS,
  OK_STATUS,
} = require("../constants");
const Logger = require("./logger-controller");
const User = require("../models/user");
const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "[Replace with own gamil account",
    pass: "[Replace with your own password]",
  },
});

/**
 *  User Creation
 */
router.post("/addUser", async (req, res) => {
  const { username, email, password } = req.body;
  Logger.info(`Start creating new user with username: ${username}`);

  const code = crypto
    .createHmac("sha256", "password")
    .update(password)
    .digest("hex");
  const newUser = new User({
    username,
    email,
    password,
    code,
  });

  try {
    await newUser.save();
    //Sending email with key
    const host = req.get("host"),
      link = `http://${host}/users/verify?email=${email}&code=${code}`;
    const mailOptions = {
      to: email,
      subject: "Email Confirmation",
      html: `<div>
                <h2>Welcome to the Tic-Tac-Toe Game</h2>
                <p>Your confirmation code is</p><hr>
                ${code}<hr>
                <p>Please click on the link, <a href=${link}> the email confirmation</a></p>
            </div>`,
    };
    smtpTransport.sendMail(mailOptions, (err, response) => {
      if (err) {
        Logger.error(
          `Failed to send email [${email}] through SMTP Transport: ${JSON.stringify(
            err
          )}`
        );
        res.json({
          status: ERROR_STATUS,
          error: `Failed to send verification code into ${email}`,
        });
      }
    });
    smtpTransport.close();

    req.session.user = { username, email };
    res.json({ status: OK_STATUS });
  } catch (err) {
    Logger.error(
      `Failed to create new user [${username}] :  ${JSON.stringify(err)}`
    );
    res.json({
      status: ERROR_STATUS,
      error: "Failed to create new account due to server error",
    });
  }
});

/**
 *  Email Configuration
 */
router
  .route("/verify")
  .get(async (req, res) => {
    if (Object.keys(req.query).length > 0) {
      // Query: key=&code=
      const { email, code } = req.query;
      try {
        const result = await User.updateOne(
          { email, code },
          { $set: { active: true } }
        );
        if (result.n === 1) {
          return res.redirect("/login"); // Go to Log In page
        }
      } catch (err) {
        Logger.error(
          `Failed to verify the email [${email}] with code [${code}]: ${JSON.stringify(
            err
          )}`
        );
      }
    }
    res.render("verify"); // Go to Email Confirmation page
  })
  .post(async (req, res) => {
    const { email, code } = req.body;
    const result = await User.updateOne(
      { email, code },
      { $set: { active: true } }
    );
    result.n === 1
      ? res.json({ status: OK_STATUS })
      : res.json({
          status: ERROR_STATUS,
          error: `Failed to verify the email ${email}, please check your email and code.`,
        });
  });

module.exports = router;
