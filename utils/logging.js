const winston = require("winston");

function timestamps () {

    return `[${new Date().toLocaleString()}]`;

}

const logger = new (winston.Logger)({
     transports: [
         new (winston.transports.Console)({ colorize: true, timestamp: timestamps, level: "debug" }),
         new (winston.transports.File)({ filename: "messages.log", timestamp: true })
     ]
});

winston.addColors({
    silly: "blue",
    debug: "cyan",
    info: "white",
    warn: "yellow",
    error: "red",
    verbose: "magenta"
});

module.exports = logger;
