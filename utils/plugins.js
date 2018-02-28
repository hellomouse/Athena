/* eslint-disable require-jsdoc */
const log = require('./logging.js');

class Plugins {
    constructor(bot) {
        this.bot = bot;
    }

    add_cmd(name, func) {
        this[name] = func;
    }

    call_command(event, irc, args) {
        if (this[args[0]] !== undefined) {
            try {
                let cmd = this[args[0]];

                cmd(this.bot, event, irc, args);
            } catch (e) {
                log.error(e.stack);
            }
        } else {
            irc.reply(event, `Invalid Command: ${args[0]}`);
        }
    }
}

module.exports = Plugins;
