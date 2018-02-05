const events = require("events");
const socket = require("net");
const tls = require("tls");
const fs = require("fs");

const config = require("./utils/configHandler");
const parser = require("./utils/messageParser");
const wrappers = require('./wrappers');
const caps = require("./irc-caps");
const core = require("./core");

// TODO: Add more options to config: e.g ssl, sasl, nick etc
// Main Bot Class
class bot extends core {

    constructor (config_file_path) {

        super();

        this.irc = new wrappers(this);
        this.config_file_path = config_file_path;

        this.socket = new socket.Socket();
        if (config.ssl) this.socket = new tls.TLSSocket(this.socket, {"cert": config.sasl.cert, "key": config.sasl.key, "passphrase": config.sasl.key_passphrase})

        // Event handler
        this.events =  new events.EventEmitter();

        // Config
        this.config_file_path = this.config_file_path;
        this.config_handler =  new config.config_handler(config_file_path); // Initalise a new object with the config file
        this.config_handler.load(true); // Load the config
        this.config = this.config_handler.config; // Set a shorter variable name since accessing it is easier now

        // Temporary database for storing channel data etc (Should this be moved to an actual proper db?)
        this.state = {
            "channels": {}
        }

        super.init(this.events, this.config, this.state); // Init the core class with these arguments as they couldn't be registered before the initalisation of the core class

        this.caps = new caps(this)
    }

    connect () {

        this.socket.connect(6667, "irc.freenode.net", () => {
            console.log('Connected');

            // TODO: Move to auth module
            this.send(`NICK ${this.config.nickname}`);
            this.send(`USER ${this.config.ident} * * :${this.config.realname}`);
            this.send("CAP LS 302");

        })

        this.socket.on('data', (data) => {

            let parsed = data.toString().split("\r\n");
            for (let i=0; i < parsed.length ;i++) {

                let data = parsed[i];

                if (!data){ continue } // Get rid of pesky new lines

                let parse = new parser(data);

                console.debug("[RECV]",  data);

                this.events.emit(parse.command, this.irc, parse);
                this.events.emit("all", this.irc, parse);

            }
        })

    }

}

let freenode = new bot("./config/irc.freenode.net");
freenode.connect();
