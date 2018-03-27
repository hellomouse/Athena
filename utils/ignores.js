const logging = require('./logging');
/* eslint-disable require-jsdoc, no-extend-native */

Date.prototype.getUnixTime = function() { return this.getTime()/1000|0; };
if (!Date.now) Date.now = function() { return new Date(); };
Date.prototype.time = function() { return this.getUnixTime(); };

function check_ignored(config, host, channel) {
    const ignores = config.ignores.global;

    if (Object.keys(config.ignores.channels).includes(channel)) {
        ignores.concat(config.ignores.channels[channel]);
    }

    for (const i of ignores) {
        for (const [uhost, expires] of i) {
            // if duration isn't null, check if it's in the past, else say true
            const is_past = expires !== null ? new Date().time() > expires : true;

            if (host === uhost && is_past) {
                return true;
            } else if (host === uhost && !is_past) {
                delete config.ignores.channels[channel][host];
                break;
            }
        }
    }

    return false;
}

function add_ignore(config, irc, event, args) {
    const host = args[0];
    const base_message = 'Ignoring %s for %s seconds';
    const indefinite = 'Ignoring %s indefinately';
    let duration, expires, i;

    if (args.length > 1) {
        if (args[1] === 'random') {
            duration = Math.floor((Math.random() * 10000) + 100);
            expires = duration + new Date().getTime();
        } else {
            duration = parseInt(args[1]);
            expires = duration + new Date().getTime();
        }
    } else {
        expires = null;
    }
    const channel = args.length > 2 ? args[2] : null;

    if (channel !== null) {
        try {
            i = config.ignores.channels[channel];
        } catch (e) {
            i = config.ignores.channels[channel] = [];
        }
        i.push([host, expires]);
    } else {
        i = config.ignores.global;
        i.push([host, expires]);
    }
    if (expires !== null) {
        logging.info(channel !== null ? base_message.concat(' in %s') : base_message, host, duration, channel);
    } else {
        logging.info(channel !== null ? indefinite.concat(' in %s') : indefinite, host, channel);
    }
}
module.exports = {
    check_ignored,
    add_ignore
};
