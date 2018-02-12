const winston = require("winston");

module.exports = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ colorize: true }),
        new (winston.transports.File)({ filename: "messages.log" })
    ]
});
