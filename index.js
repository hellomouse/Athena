const socket = require("net");
const tls = require("tls");
const fs = require("fs");
const events = require("events");

const config = require("./utils/configHandler.js");
const core = require("./core.js");
const wrappers = require('./wrappers.js');
const caps = require("./irc-caps.js");

// TODO: Add more options to config: e.g ssl, sasl, nick etc
// Main Bot Class
class bot extends core {

    constructor (config_file_path) {

        super();

        this.config_file_path = config_file_path;

        // Event handler
        this.events =  new events.EventEmitter();
        this.irc = new wrappers(this);

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

        this.socket = new socket.Socket();
        if (config.ssl) this.socket = new tls.TLSSocket(this.socket, {"cert": config.sasl.cert, "key": config.sasl.key, "passphrase": config.sasl.key_passphrase})

        this.caps = new caps(this)
    }

    connect () {

        this.socket.connect(6667, "irc.freenode.net", () => {
            console.log('Connected');

            // TODO: Move to auth module
            this.send("NICK `Athena")
            this.send("USER Athena Athena irc.freenode.net :Totally not Athena")
            this.send("CAP LS")

        })

        this.socket.on('data', (data) => {

            let parsed = data.toString().split("\r\n");
            for (let i=0; i < parsed.length ;i++) {

                let data = parsed[i];

                if (!data){ continue } // Get rid of pesky new lines

                console.log("[RECV]",  data);

                let received = data.toString().split(" "); // Easier to parse

                if (received[0].startsWith(":")) {
                    // handle all numerics and commands
                    this.events.emit(received[1], received, data)
                } else {
                    // Handle PING
                    this.events.emit(received[0], received, data);
                }


            }
        })

    }

}

let freenode = new bot("./config/irc.freenode.net");
freenode.connect();
