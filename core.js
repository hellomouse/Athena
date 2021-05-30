const Dict = require('node-python-funcs').dict;
const { hasattr, callable, partition } = require('node-python-funcs');
const log = require('./utils/logging');
const Plugins = require('./utils/plugins');
const { strip_formatting } = require('./utils/general');
const FloodProtection = require('./utils/flood-protection');

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

        this.nickname = this.config.nickname;
        this.ISUPPORT = this.state.server.ISUPPORT = {};
        this.server = this.state.server;
        this.channels = this.state.channels;

        this.floodProtection = new FloodProtection(this);
        this.plugins = new Plugins(this);

        this.on_error = (irc, event) => {
            if (!event.arguments.join(' ').includes('Closing link')) {
                irc.privmsg('##Athena', 'An error occured, check the console. !att-Athena-admins');
                log.error(event.arguments.join(' '));
            }
        };

        this.on_ping = irc => {
            // Respond to ping event
            this.send('PONG');
        };

        this.on_nicknameinuse = (irc, event) => {
            this.nickname = this.nickname.concat('_');
            irc.nick(this.nickname);
        };
        this.on_unavailresource = this.on_nicknameinuse;

        this.on_welcome = (irc, event) => {
            Object.keys(this.config.channels).forEach(channel => {
                irc.join(channel, this.config.channels[channel].key);
            });
        };

        this.on_join = (irc, event) => {
            const channel = event.target;
            const args = event.arguments;

            if (event.source.nick === this.nickname) {
                log.info('Joining %s', channel);
                if (!Object.prototype.hasOwnProperty.call(this.state.channels, channel)) {
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
                    const nick = event.source.nick;
                    const hostmask = event.source.userhost;
                    const account = args[0] !== '*' ? args[0] : null;

                    this.state.channels.add_entry(channel, nick, hostmask, account);
                }

                this.send(`WHO ${event.source.nick} nuhs%nhuacr`);
                this.nextWHOChannel = event.target;
            }
        };

        this.on_part = (irc, event) => {
            if (event.source.nick === this.nickname) {
                if (event.args[0].startsWith('requested by')) {
                    log.info('Ninja\'d from channel %s, rejoining.', event.target);
                    irc.join(event.target);
                } else {
                    log.info('Left channel %s', event.target);
                }
            }
        };

        this.on_namereply = (irc, event) => {
            const channel = event.arguments[1];
            const users = event.arguments[2].split(' ');

            for (const i of users) {
                let user;

                const prefixes = Object.keys(this.server.prefixes);

                if (i.startsWith(prefixes.join(''))) {
                    user = i.slice(2);
                    const modes = [this.server.prefixes[i[0]].mode, this.server.prefixes[i[1]].mode];

                    this.channels[channel].users[user].modes.push(...modes);
                } else if (prefixes.includes(i[0])) {
                    user = i.slice(1);
                    this.channels[channel].users[user].modes.push(this.server.prefixes[i[0]].mode);
                } else {
                    user = i;
                }

                if (!this.channels[channel].names.includes(user)) {
                    this.channels[channel].names.push(user);
                }
            }
        };

        this.on_whospcrpl = (irc, event) => {
            const nick = event.arguments[3];

            if (nick !== 'ChanServ') {
                let [channel, ident, host, , account, realname] = event.arguments;
                const hostmask = `${nick}!${ident}@${host}`;

                account = account !== '0' ? account : null;
                if (this.nextWHOChannel) channel = channel !== this.nextWHOChannel ? this.nextWHOChannel : channel;

                this.state.channels.add_entry(channel, nick, hostmask, account, realname);
            }
        };

        this.on_channelmodeis = (irc, event) => {
            this.state.channels[event.arguments[0]].modes.push(...event.arguments[1].slice(1).split(''));
        };

        this._update_user_modes = (irc, event, mode) => {
            let [channel, user] = event.arguments.slice(0, 2);
            // let [channel, user, setby, timestamp] = event.arguments;

            if (user.startsWith('$a:')) {
                user = user.slice(3);
                this.channels[channel].users[user].modes.push(mode);
            } else {
                const re = new RegExp(user.replace(/\*/g, '.+'));
                const users = this.channels[channel].users.key().filter(x => {
                    return re.test(this.channels[channel].users[x].hostmask);
                });

                for (const u of users)
                    this.channels[channel].users[u].modes.push(mode);
            }
        };

        this.on_exceptlist = (irc, event) => this._update_user_modes(irc, event, 'e');

        this.on_banlist = (irc, event) => this._update_user_modes(irc, event, 'b');

        this.on_quietlist = (irc, event) => this._update_user_modes(irc, event, 'q');

        this.on_account = (irc, event) => {
            this.channels.change_attr(event.source.nick, 'account', event.target === '*' ? null : event.target);
        };

        this.on_CHGHOST = (irc, event) => {
            const args = event.arguments;

            if (args.length) {
                this.channels.change_attr(event.source.nick, 'ident', event.target);
                this.channels.change_attr(event.source.nick, 'host', args[0]);
            } else
                this.channels.change_attr(event.source.nick, 'host', event.target);
        };

        this.on_cap = (irc, event) => this.caps.handler(event);

        this.on_authenticate = (irc, event) => this.sasl.on_authenticate(event);

        this.on_saslfailed = (irc, event) => this.sasl.on_saslfailed(event);

        this.on_saslsuccess = (irc, event) => this.sasl.on_saslsuccess(event);

        this.on_alreadyregistered = (irc, event) => { /* eslint-disable max-len */
            log.error('Either you aren\'t registered and are trying to use SASL or you\'re trying to re-do the USER command');
        };

        this.on_nick = (irc, event) => {
            if (event.source.nick === this.nickname) {
                this.nickname = event.arguments[0];
            } else {
                const nick = event.source.nick;
                const to_nick = event.arguments[0];

                for (const chan of this.channels.keys()) {
                    const chandb = this.channels[chan].users;

                    for (const user of chandb.values()) {
                        if (user.host === event.source.host) {
                            this.channels[chan].users[to_nick] = chandb[nick];
                            this.channels[chan].users[to_nick].hostmask = event.source;
                            delete bot.channels[chan].users[nick];
                            break;
                        }
                    }
                    break;
                }
            }
        };

        this.on_privmsg = (irc, event) => {
            const args = event.arguments.join(' ').split(' '); // Split arguments by spaces
            const prefix = this.config.prefix || '';

            if (args[0].startsWith(prefix)) {
                args[0] = args[0].slice(prefix.length);
                this.plugins.call_command(event, irc, args);
            } else if (event.target[0] !== '#') {
                this.plugins.call_command(event, irc, args);
            } else if ( [this.nickname, this.nickname.concat(':'), this.nickname.concat(',')].includes(args[0])) {
                args.shift(); // nickname[:/,] isn't the commmand
                this.plugins.call_command(event, irc, args);
            }
            if (event.target.startsWith('#'))
                this._update_seen_db(event, irc, event.source.nick, args.join(' '));

            this.plugins.hooks.call_regex(irc, event);
            this.plugins.hooks.call_privmsg(irc, event);
            this.plugins.hooks.call_includes(irc, event);
        };

        this.events.on('PRIVMSG', (irc, event) => {
            if (event.target === '##Athena-git' && event.source.nick === 'Athena[Git]') {
                irc.privmsg('##Athena', event.args.join(' '));
            }
        });

        this._get_time = tags => {
            let timestamp;

            if (tags.length) {
                const timeTag = tags.filter(tag => tag.time !== undefined)[0];

                timestamp = timeTag ? Date.parse(timeTag['time']) : Date.now();
            } else {
                timestamp = Date.now();
            }

            return timestamp;
        };

        this._update_seen_db = (event, irc, nick, str_args) => {
            const timestamp = this._get_time(event.tags);
            const udb = this.channels[event.target].users[nick];

            if (udb !== undefined) {
                if (udb.seen === null || udb.seen === undefined)
                    udb.seen = [];
                udb.seen.push({ time: timestamp, message: strip_formatting(str_args) });

                udb.seen.sort((a, b) => a.time > b.time);
                udb.seen = udb.seen.slice(-5);
            } else {
                this.send(`WHO ${event.target} nuhs%nhuacr`);
            }
        };

        this.on_ctcp = (irc, event) => {
            if (hasattr(this, 'ctcp')) {
                const ctcp_message = ' '.join(event.arguments).toUpperCase();

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
        };

        this.on_featurelist = (irc, event) => {
            for (const param of event.arguments.slice(0, -1)) {
                let [name, , value] = partition(param, '=');

                if (!Object.keys(this.ISUPPORT).includes(name)) {
                    this.ISUPPORT[name] = {};
                }
                if (value !== '') {
                    if (value.includes(',')) {
                        for (const param1 of value.split(',')) {
                            if (value.includes(')')) {
                                let name1, value1;

                                if (param1.includes(')')) {
                                    [name1, , value1] = partition(param1, ':');
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
                            const types = value[0].split(new RegExp('^(.*o)(.*h)?(.*)$')).slice(1, -1);
                            const levels = {
                                op: types[0],
                                halfop: types[1] || '',
                                voice: types[2]
                            };

                            this.server.prefixes = {};

                            for (const mode of value[0]) {
                                const name1 = mode;
                                const value1 = value[1][count];

                                count += 1;
                                for (const level of Object.entries(levels)) {
                                    if (level[1].includes(mode)) {
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
                } else if (value.includes(')')) {
                    const [name1, value1] = value.split(':');

                    this.ISUPPORT[name][name1] = value1;
                } else {
                    this.ISUPPORT[name] = value;
                }
            }
        };

        this.on_kick = (irc, event) => {
            if (event.args[0] === this.nickname) {
                log.info('Kicked from %s, rejoining', event.args[0]);
                irc.join(event.target);
            }
        };

        for (const i of Object.keys(this)) {
            if (i.startsWith('on_')) {
                const names = require('./resources/names.json');
                const name = i.split('on_')[1];

                this.events.on(names[name] || name.toUpperCase(), this[i]);
            }
        }
    }

    /**
    * Function to send messages and log them aferwards
    * @func
    * @param {string} message - The message you want to send
    */
    immediateSend(message) {
        this.socket.write(`${message}\r\n`);
        log.debug('[SENT] %s', strip_formatting(message));
    }

}

module.exports = Core;
