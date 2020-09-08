const { createLogger, format, transports } = require("winston"); // Logger
const logger = createLogger({
    level: "info",
    format: format.combine(
      format.splat(),
      format.simple()
    ),
    transports: [
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `info.log`
      new transports.File({ filename: "error.log", level: "error" }),
      new transports.File({ filename: "info.log" }),
    ],
  });
  module.exports = Logger = logger;
