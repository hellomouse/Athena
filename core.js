const log = require('./utils/logging');
const Plugins = require('./utils/plugins');

/** Contains vital methods used to interact with the irc server properly */
class Core {

    /** */
    constructor() {}

    init(events, config, state) {
        this.events = events;
        this.config = config;
        this.state = state;
        this.plugins = new Plugins(this);

        this.nickname = this.config.nickname;

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

        this.on_name = this.events.on('353', (irc, event) => {
            const channel = event.arguments[1];
            const users = event.arguments[0].split(' ');

            if (!this.state.channels.hasOwnProperty(channel)) {
                this.state.channels[channel] = {
                    users: users,
                    flags: [],
                    modes: [],
                    key: null
                };
            }
        });

        this.on_cap = this.events.on('CAP', (irc, event) => this.caps.handler(event));

        this.on_authenticate = this.events.on('AUTHENTICATE', (irc, event) => this.sasl.on_authenticate(event));

        this.on_saslfailed = this.events.on('904', (irc, event) => this.sasl.on_saslfailed(event));

        this.on_saslsuccess = this.events.on('903', (irc, event) => this.sasl.on_saslsuccess(event));

        this.on_alreadyregistered = this.events.on('462', (irc, event) => { /* eslint-disable max-len */
            log.error('[ERROR] Either you aren\'t registered and are trying to use SASL or you\'re trying to re-do the USER command');
        });

        this.on_nick = this.events.on('NICK', (irc, event) => {
            if (event.source.nick === this.config.nickname) {
                this.config.nickname = event.arguments[0];
            }
        });

        this.on_privmsg = this.events.on('PRIVMSG', (irc, event) => {
            let args = event.arguments.join(' ').split(' '); // Split arguments by spaces

            if (args[0].startsWith('*')) {
                args[0] = args[0].slice(1);
                this.plugins.call_command(event, irc, args);
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
        log.debug('[SENT] %s', message);
    }

}

module.exports = Core;
