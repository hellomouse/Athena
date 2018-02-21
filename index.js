const events = require('events');
const socket = require('net');
const tls = require('tls');
const fs = require('fs');

const log = require('./utils/logging');
const config = require('./utils/configHandler');
const Parser = require('./utils/messageParser');
const Wrappers = require('./wrappers');
const Caps = require('./irc-caps');
const Core = require('./core');
const Sasl = require('./caps/sasl.js');

// TODO: Add more options to config: e.g ssl, sasl, nick etc

/**
* Main Bot Class
* @extends Core
*/
class Bot extends Core {

    /**
    * @param {string} config_file_path - The path to the config file chosen
    */
    constructor(config_file_path) {
        super();

        this.irc = new Wrappers(this);

        // Event handler
        this.events = new events.EventEmitter();

        // Config
        this.config_file_path = config_file_path;
        this.config_handler = new config.ConfigHandler(config_file_path); // Initalise a new object with the config file
        this.config_handler.load(true); // Load the config
        this.config = this.config_handler.config; // Set a shorter variable name since accessing it is easier now

        if (this.config.ssl) {
            this.socket = tls.connect(this.config.irc.port, this.config.irc.host, {
                'cert': this.config.sasl.cert,
                'key': this.config.sasl.key,
                'passphrase': this.config.sasl.key_passphrase
            });
        } else {
            this.socket = socket.connect(this.config.irc.port, this.config.irc.host);
         }

        // Temporary database for storing channel data etc (Should this be moved to an actual proper db?)
        this.state = {
            'channels': {}
        };

        super.init(this.events, this.config, this.state); // Init the core class with these arguments as they couldn't be registered before it's initalisation

        this.sasl = new Sasl(this.config.sasl.username, this.config.sasl.password, 'external');
        this.config.caps.push(this.sasl);
        this.caps = new Caps(this);
    }

    /**
    * Socket connection related stuff.
    * @function
    */
    connect() {
        this.socket.once('connect', () => {
            log.info('Connected');

            // TODO: Move to auth module
            this.send(`NICK ${this.config.nickname}`);
            this.send(`USER ${this.config.ident} * * :${this.config.realname}`);
            this.send('CAP LS 302');
        });

        this.socket.on('data', recv => {
            const parsed = recv.toString().split('\r\n');

            for (let i = 0; i < parsed.length; i++) {
                const data = parsed[i];

                if (!data) continue; // Get rid of pesky new lines

                const parse = new Parser(data);

                log.debug('[RECV] %s', data);

                this.events.emit(parse.command, this.irc, parse);
                this.events.emit('all', this.irc, parse);
            }
        });
    }

}

const clients = {};

fs.readdir('config', (error, contents) => {
    if (error) log.error('[FATAL]', error);
    else {
        for (let _ = 0; _ < contents.length; _++) {
            const configFile = contents[_];

            clients[configFile] = new Bot(`./config/${configFile}`);
            clients[configFile].connect();
        }
    }
});
