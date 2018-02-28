/* eslint-disable require-jsdoc */
const log = require('./logging.js');
const { readdir } = require('fs');
const { join } = require('path');

class Plugins {
    constructor(bot) {
        this.bot = bot;
        readdir('./plugins', (err, files) => {
            for (let file of files) {
                const plugin = require('../' + join('plugins', file));

                for (let cmd of Object.keys(plugin)) {
                    this.add_cmd(cmd, plugin[cmd]);
                }
            }
        });
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
