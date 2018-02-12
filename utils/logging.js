const winston = require("winston");
const clc = require("cli-color");

function timestamps () {

    return `[${new Date().toLocaleString()}]`;

}

const logger = new (winston.Logger)({
     transports: [
         new (winston.transports.Console)({ colorize: true, timestamp: timestamps }),
         new (winston.transports.File)({ filename: "messages.log", timestamp: true })
     ]
});

winston.addColors({
    silly: clc.blue,
    debug: clc.cyan,
    info: clc.green,
    warn: clc.yellow,
    error: clc.red,
    verbose: clc.magenta
});

module.exports = logger;
