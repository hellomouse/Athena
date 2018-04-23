const Dict = require('node-python-funcs').dict;
const { hasattr, callable, partition } = require('node-python-funcs');
const log = require('./utils/logging');
const Plugins = require('./utils/plugins');
const { strip_formatting } = require('./utils/general');

/* eslint-disable no-extend-native, no-invalid-this */
Array.prototype.remove = function(index) {
    if (typeof index !== 'number') new TypeError('index Should be a number');
    let new_array = [];

    for (let i=0; i < this.length; i++) {
        if (i === index) continue;
        new_array.push(this[i]);
    }

    return new_array;
};
/* eslint-enable no-extend-native, no-invalid-this */

/**
* @func
* @param {object} thing
* @return {boolean}
*/
function isObject(thing) {
    return thing instanceof Object && !(thing instanceof Array);
}

/** Contains vital methods used to interact with the irc server properly */
class Core {

    /** */
    constructor() {}

    /**
    * Init the class
    * @func
    * @param {object} events - Events emmiter
    * @param {object} config - Bot config
    * @param {object} state - Temporary bot db
    */
    init(events, config, state) {
        this.events = events;
        this.config = config;
        this.state = state;
        this.plugins = new Plugins(this);

        this.nickname = this.config.nickname;
        this.ISUPPORT = this.state.server.ISUPPORT = {};
        this.server = this.state.server;
        this.channels = this.state.channels;

        this.on_error = this.events.on('ERROR', (irc, event) => {
            if (event.arguments.join(' ').indexOf('Closing link') === -1)
                irc.privmsg('##Athena', 'An error occured, check the console. !att-Athena-admins');
            log.error(event.arguments.join(' '));
        });

        this.on_ping = this.events.on('PING', irc => {
            // Respond to ping event
            this.send('PONG');
        });

        this.on_nick_in_use = this.events.on('433', (irc, event) => {
            this.nickname = this.nickname.concat('_');
            irc.nick(this.nickname);
        });

        this.on_welcome = this.events.on('001', (irc, event) => {
            Object.keys(this.config.channels).forEach(channel => {
                irc.join(channel, this.config.channels[channel].key);
            });
        });

        this.on_join = this.events.on('JOIN', (irc, event) => {
            let channel = event.target;
            let args = event.arguments;

            if (event.source.nick === this.nickname) {
                log.info('Joining %s', channel);
                if (!this.state.channels.hasOwnProperty(channel)) {
                    log.debug('Created db for channel %s', channel);
                    this.state.channels[channel] = new Dict({
                        users: {},
                        names: [],
                        flags: [],
                        modes: [],
                        key: null
                    });
                }

                this.send(`WHO ${event.target} nuhs%nhuacr`);
                this.send(`NAMES ${event.target}`);
                irc.mode(event.target, '', ''); // Get modes for the DB
            } else {
                // Extended join methods
                if (args.length > 0) {
                    let nick = event.source.nick;
                    let hostmask = event.source.userhost;
                    let account = args[0] !== '*' ? args[0] : null;

                    this.state.channels.add_entry(channel, nick, hostmask, account);
                }

                this.send(`WHO ${event.source.nick} nuhs%nhuacr`);
            }
        });

        this.on_name = this.events.on('353', (irc, event) => {
            const channel = event.arguments[1];
            const users = event.arguments[2].split(' ');

            for (let i of users) {
                let user;

                if (i.startsWith('@+')) {
                    user = i.slice(2);
                } else if (i.startsWith('@') || i.startsWith('+')) {
                    user = i.slice(1);
                } else {
                    user = i;
                }

                if (!this.channels[channel].names.includes(user)) {
                    this.channels[channel].names.push(user);
                }
            }
        });

        this.on_whox = this.events.on('354', (irc, event) => {
            let nick = event.arguments[3];

            if (nick !== 'ChanServ') {
                let args = event.arguments;
                let [channel, ident, host, account, realname] = args;
                let hostmask = `${nick}!${ident}@${host}`;

                account = account !== '0' ? account : null;

                this.state.channels.add_entry(channel, nick, hostmask, account, realname);
            }
        });

        this.on_channelmodeis = this.events.on('324', (irc, event) => {
            this.state.channels[event.arguments[0]].modes.push(...event.arguments[1].slice(1).split(''));
        });

        this._update_user_modes = (irc, event, mode) => {
            let [channel, user] = arguments.slice(0, 2);
            // let [channel, user, setby, timestamp] = event.arguments;

            if (user.startsWith('$a:')) {
                user = user.slice(3);
                this.channels[channel].users[user].modes.push(mode);
            } else {
                this.channels[channel].users[user].modes.push(mode);
            }
        };

        this.on_exceptlist = this.events.on('348', (irc, event) => this._update_user_modes(irc, event, 'e'));

        this.on_banlist = this.events.on('367', (irc, event) => this._update_user_modes(irc, event, 'b'));

        this.on_quietlist = this.events.on('728', (irc, event) => this._update_user_modes(irc, event, 'q'));

        this.on_account = this.events.on('ACCOUNT', (irc, event) => {
            this.userdb.change_attr(event.source.nick, 'account', event.target);
        });

        this.on_chghost = this.events.on('CHGHOST', (irc, event) => {
            let args = event.arguments;

            if (args.length) {
                this.channels.change_attr(event.source.nick, 'ident', event.target);
                this.channels.change_attr(event.source.nick, 'host', args[0]);
            } else
                this.userdb.change_attr(event.source.nick, 'host', event.target);
        });

        this.on_cap = this.events.on('CAP', (irc, event) => this.caps.handler(event));

        this.on_authenticate = this.events.on('AUTHENTICATE', (irc, event) => this.sasl.on_authenticate(event));

        this.on_saslfailed = this.events.on('904', (irc, event) => this.sasl.on_saslfailed(event));

        this.on_saslsuccess = this.events.on('903', (irc, event) => this.sasl.on_saslsuccess(event));

        this.on_alreadyregistered = this.events.on('462', (irc, event) => { /* eslint-disable max-len */
            log.error('Either you aren\'t registered and are trying to use SASL or you\'re trying to re-do the USER command');
        });

        this.on_nick = this.events.on('NICK', (irc, event) => {
            if (event.source.nick === this.nickname) {
                this.nickname = event.arguments[0];
            }
        });

        this.on_privmsg = this.events.on('PRIVMSG', (irc, event) => {
            let args = event.arguments.join(' ').split(' '); // Split arguments by spaces
            let prefix = this.config.prefix || '.';

            if (args[0].startsWith(prefix)) {
                args[0] = args[0].slice(prefix.length);
                this.plugins.call_command(event, irc, args);
            } else if ( [this.nickname.concat(':'), this.nickname.concat(',')].includes(args[0])) {
                args.shift(); // nickname[:/,] isn't the commmand
                this.plugins.call_command(event, irc, args);
            }
            if (event.target.startsWith('#'))
                this._update_seen_db(event, irc, event.source.nick, args.join(' '));
        });

        this._get_time = tags => {
            let timestamp;

            if (tags.length) {
                for (let i of tags) {
                    if (i['time'] !== undefined) {
                        timestamp = Date.parse(i['time']);
                    } else {
                        continue;
                    }
                }
            } else {
                timestamp = Date.now();
            }

            return timestamp;
        };

        this._update_seen_db = (event, irc, nick, str_args) => {
            let timestamp = this._get_time(event.tags);
            let udb = this.channels[event.target].users[nick];

            if (udb !== undefined) {
                if (udb.seen === null || udb.seen === undefined)
                    udb.seen = [];
                udb.seen.push({ time: timestamp, message: strip_formatting(str_args) });

                udb.seen.sort((a, b)=> a.time > b.time);
                udb.seen = udb.seen.slice(-5);
            } else {
                this.send(`WHO ${event.target} nuhs%nhuacr`);
            }
        };

        this.on_ctcp = this.events.on('CTCP', (irc, event) => {
            if (hasattr(this, 'ctcp')) {
                let ctcp_message = ' '.join(event.arguments).toUpperCase();

                if (Object.keys(this.ctcp).includes(ctcp_message)) {
                    let result;

                    if (callable(this.ctcp[ctcp_message])) {
                        result = this.ctcp[ctcp_message]();
                    } else {
                        result = this.ctcp[ctcp_message];
                    }

                    irc.notice(event.source.nick, `${ctcp_message} ${result}`);
                }
            }
        });

        this.on_featurelist = this.events.on('005', (irc, event) => {
            for (let param of event.arguments.slice(0, -1)) {
                let [name, value] = partition(param, '=').remove(1);

                if (!Object.keys(this.ISUPPORT).includes(name)) {
                    this.ISUPPORT[name] = {};
                }
                if (value !== '') {
                    if (value.indexOf(',') > -1) {
                        for (let param1 of value.split(',')) {
                            if (value.indexOf(')') > -1) {
                                let name1, value1;

                                if (param1.indexOf(')') > -1) {
                                    [name1, value1] = partition(param1, ':').remove(1);
                                }
                                this.ISUPPORT[name][name1] = value1;
                            } else {
                                if (Object.keys(this.ISUPPORT).includes(name) && isObject(this.ISUPPORT[name])) {
                                    this.ISUPPORT[name] = [];
                                }
                                this.ISUPPORT[name].push(param1);
                            }
                        }
                    } else {
                        if (name === 'PREFIX') {
                            let count = 0;

                            value = value.split(')');
                            value[0] = value[0].replace('(', '');
                            let types = value[0].split(new RegExp('^(.*o)(.*h)?(.*)$')).slice(1, -1);
                            let levels = {
                                op: types[0],
                                halfop: types[1] || '',
                                voice: types[2]
                            };

                            this.server.prefixes = {};

                            for (let mode of value[0]) {
                                let name1 = mode;
                                let value1 = value[1][count];

                                count += 1;
                                for (let level of Object.entries(levels)) {
                                    if (level[1].indexOf(mode) > -1) {
                                        this.server.prefixes[value1] = {
                                            mode: mode,
                                            level: level[0]
                                        };
                                        break;
                                    }
                                }
                                this.ISUPPORT[name][name1] = value1;
                            }
                        } else {
                            this.ISUPPORT[name] = value;
                        }
                    }
                } else if (value.indexOf(')') > -1) {
                    let [name1, value1] = value.split(':');

                    this.ISUPPORT[name][name1] = value1;
                } else {
                    this.ISUPPORT[name] = value;
                }
            }
        });
    }

    /**
    * Function to send messages and log them aferwards
    * @func
    * @param {string} message - The message you want to send
    */
    send(message) {
        this.socket.write(`${message}\r\n`);
        log.debug('[SENT] %s', strip_formatting(message));
    }

}

module.exports = Core;
