const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // Generate the key based on password

const Logger = require("./logger");
const User = require("../models/user");
const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cherylliu.work@gmail.com",
    pass: "630future52work",
  },
});
const ERROR_STATUS = "ERROR";
const OK_STATUS = "OK";

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
    // await newUser.save();
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
        res.json({ status: ERROR_STATUS });
      }
    });
    smtpTransport.close();
    res.json({ status: OK_STATUS });
  } catch (err) {
    Logger.error(
      `Failed to create new user [${username}] :  ${JSON.stringify(err)}`
    );
    res.json({ status: ERROR_STATUS });
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
          return res.render("login");
        }
      } catch (err) {
        Logger.info(
          `Failed to verify the email [${email}] with code [${code}]: ${JSON.stringify(
            err
          )}`
        );
      }
    }
    res.render("verify");
  })
  .post(async (req, res) => {
    const { email, code } = req.body;
    const result = await User.updateOne(
      { email, code },
      { $set: { active: true } }
    );
    result.n === 1
      ? res.json({ status: OK_STATUS })
      : res.json({ status: ERROR_STATUS });
  });

module.exports = router;
