const winston = require('winston');

const timestamps = winston.format((info, opts) => {
    if (opts.format) {
        info.timestamp = typeof opts.format === 'function' ?
            opts.format() :
            require('fecha').format(new Date(), opts.format);
    }

    if (!info.timestamp) {
        info.timestamp = new Date().toLocaleString();
    }

    if (opts.alias) {
        info[opts.alias] = info.timestamp;
    }

    return info;
});

const formatter = winston.format(info => {
    const MESSAGE = Symbol.for('message');

    info[MESSAGE] = `[${info.timestamp}] [${info.level}] ${info.message}`;

    return info;
});

/* eslint-disable new-cap */
const logger = new (winston.createLogger)({
    /* elsint-enable new-cap */
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: () => new Date().toLocaleString(),
            level: 'debug',
            json: false,
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.splat(),
                timestamps(),
                formatter()
            )
        }),
        new (winston.transports.File)({
            filename: 'messages.log',
            timestamp: true,
            level: 'debug',
            json: false,
            format: winston.format.combine(
                winston.format.splat(),
                timestamps(),
                formatter()
            )
        })
    ]
});

winston.addColors({
    silly: 'blue',
    debug: 'cyan',
    info: 'white',
    warn: 'yellow',
    error: 'red',
    verbose: 'magenta'
});

module.exports = logger;
