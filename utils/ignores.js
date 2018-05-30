const logging = require('./logging');

/**
* Function to check if a user is ignored
* @param {object} config - The bot config
* @param {string} host - The host of the user of which you want to check if they're ignored
* @param {string} channel - The channel in which you want to check if the user's ignored
* @return {boolean}
*/
function checkIgnored(config, host, channel) {
    const ignores = config.ignores.global;

    if (Object.keys(config.ignores.channels).includes(channel)) {
        ignores.push(...config.ignores.channels[channel]);
    }

    for (const i of ignores) {
        for (const [uhost, expires] of i) {
            // if duration isn't null, check if it's in the past, else say true
            const isPast = expires !== null ? Date.now() > expires : true;

            if (host === uhost && isPast) {
                return true;
            } else if (host === uhost && !isPast) {
                delete config.ignores.channels[channel][host];
                break;
            }
        }
    }

    return false;
}

/**
* Function to add an ignore
* @param {object} config - The bot config
* @param {ConnectionWrapper} irc - The IRC command wrappers object
* @param {string} event - The IRC event class object
* @param {array} args - The IRC args
*/
function addIgnore(config, irc, event, args) {
    const host = args[0];
    const base_message = 'Ignoring %s for %s seconds';
    const indefinite = 'Ignoring %s indefinately';
    let duration, expires;

    if (args.length > 1) {
        if (args[1] === 'random') {
            duration = Math.floor((Math.random() * 10000) + 100);
            expires = duration + Date.now();
        } else {
            duration = parseInt(args[1]);
            expires = duration + Date.now();
        }
    } else {
        expires = null;
    }

    const channel = args.length > 2 ? args[2] : null;
    let ignores;

    if (channel !== null) {
        ignores = config.ignores.channels[channel] = config.ignores.channels[channel] || [];
    } else {
        ignores = config.ignores.global;
    }
    ignores.push([host, expires]);


    if (expires !== null) {
        logging.info(channel !== null ? base_message.concat(' in %s') : base_message, host, duration, channel);
    } else {
        logging.info(channel !== null ? indefinite.concat(' in %s') : indefinite, host, channel);
    }
}
module.exports = {
    checkIgnored,
    addIgnore
};
