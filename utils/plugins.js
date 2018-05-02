const log = require('./logging');
const { check_perms } = require('./permissions');
const { readdir } = require('fs');
const { join } = require('path');


/**
 * getDefault - Returns object[key], otherwise
 * the default value if it's not set
 *
 * @param  {Object} object Object to check for property
 * @param  {string} key    Key to look for
 * @param  {*} def         Default value if key is not found
 * @return {*}
 */
function getDefault(object, key, def) {
    return object[key] !== undefined ? object[key] : def;
}


/**
* Class that holds methods for calling and adding commands
* @class
*/
class Plugins {
    /**
    * @param {object} bot - The `this` object from the upstream class.
    */
    constructor(bot) {
        this.bot = bot;
        this.plugins = {};
        readdir('./plugins', (err, files) => {
            for (let file of files) {
                const plugin = require('../' + join('plugins', file));

                for (let cmd of Object.keys(plugin)) {
                    this.set_defaults(plugin[cmd]);
                    this.add_cmd(cmd, plugin[cmd]);
                }
            }
        });
    }

    /**
    * Sets default properties for cmd.opts
    * @func
    * @param {function} cmd
    */
    set_defaults(cmd) {
        let opts = cmd.opts;

        opts.restrictions = getDefault(opts, 'restrictions', {});
        opts.category = getDefault(opts, 'category', 'general');

        // Display name, if different from function name
        opts.display_name = getDefault(opts, 'display_name', cmd.name);

        opts.hide = getDefault(opts, 'hide', false);
        opts.help_text = getDefault(opts, 'help_text', 'No help text provided');

        // Format: [trusted?, admin?, owner?]
        opts.perms = getDefault(opts, 'perms', [false, false, false]);

        opts.min_args = getDefault(opts, 'min_args', 0);

        // Return help_text if command errors
        opts.auto_help = getDefault(opts, 'auto_help', false);

        // Array of aliases that can be used to call the command instead
        opts.aliases = getDefault(opts, 'aliases', []);
    }

    /**
    * Adds a comand to the class
    * @func
    * @param {string} name
    * @param {function} func
    */
    add_cmd(name, func) {
        this.plugins[name] = func;
        for (let alias of func.opts.aliases) {
            this.plugins[alias] = func;
        }
    }

    /**
    * Calls a command previously added to the class
    * @param {Parser} event
    * @param {ConnectionWrapper} irc
    * @param {array} args
    */
    call_command(event, irc, args) {
        if (this.plugins[args[0]] !== undefined) {
            try {
                let cmd = this.plugins[args[0]];
                let { perms, min_args } = cmd.opts;

                if (check_perms(this.bot.config, event.source.host, event.target, perms)) {
                    if (args.length >= min_args) {
                        cmd(this.bot, event, irc, args.slice(1));
                    } else {
                        // Auto help
                        if (cmd.opts.auto_help) {
                            irc.reply(event, cmd.opts.help_text);
                        } else {
                            irc.reply(event, 'Oops, looks like you forgot an argument there.');
                        }
                    }
                } else {
                    irc.reply(event, `No permission to use command ${args[0]}`);
                }
            } catch (e) {
                log.error(e.stack);
            }
        } else {
            irc.notice(event.source.nick, `Invalid Command: ${args[0]}`);
        }
    }
}

module.exports = Plugins;
