// Common modules
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

// Common constant values
const ERROR_STATUS = "ERROR";
const OK_STATUS = "OK";

module.exports = {
  express,
  router,
  nodemailer,
  crypto,
  session,
  mongoose,
  path,
  ERROR_STATUS,
  OK_STATUS,
};
