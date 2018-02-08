const events = require("events");
const socket = require("net");
const tls = require("tls");
const fs = require("fs");

const config = require("./utils/configHandler");
const Parser = require("./utils/messageParser");
const Wrappers = require("./wrappers");
const Caps = require("./irc-caps");
const Core = require("./core");
const Sasl = require("./caps/sasl.js");

// TODO: Add more options to config: e.g ssl, sasl, nick etc

// Main Bot Class
class Bot extends Core {

    constructor (config_file_path) {

        super();

        this.irc = new Wrappers(this);
        this.config_file_path = config_file_path;

        // Event handler
        this.events = new events.EventEmitter();

        // Config
        this.config_file_path = this.config_file_path;
        this.config_handler = new config.ConfigHandler(config_file_path); // Initalise a new object with the config file
        this.config_handler.load(true); // Load the config
        this.config = this.config_handler.config; // Set a shorter variable name since accessing it is easier now

        this.socket = this.config.ssl ? tls.connect(this.config.irc.port, this.config.irc.host, {"cert": this.config.sasl.cert, "key": this.config.sasl.key, "passphrase": this.config.sasl.key_passphrase}) : socket.connect(this.config.irc.port, this.config.irc.host);

        // Temporary database for storing channel data etc (Should this be moved to an actual proper db?)
        this.state = {
            "channels": {}
        };

        super.init(this.events, this.config, this.state); // Init the core class with these arguments as they couldn't be registered before it's initalisation

        this.sasl = new Sasl(this.config.sasl.username, this.config.sasl.password, "external");
        this.config.caps.push(this.sasl);
        this.caps = new Caps(this);

    }

    connect () {

        this.socket.once("connect", () => {

            console.log("Connected");

            // TODO: Move to auth module
            this.send(`NICK ${this.config.nickname}`);
            this.send(`USER ${this.config.ident} * * :${this.config.realname}`);
            this.send("CAP LS 302");

        });

        this.socket.on("data", (data) => {

            const parsed = data.toString().split("\r\n");
            for (let i = 0; i < parsed.length; i++) {

                const data = parsed[i];

                if (!data){ continue; } // Get rid of pesky new lines

                const parse = new Parser(data);

                console.log("[RECV]",  data);

                this.events.emit(parse.command, this.irc, parse);
                this.events.emit("all", this.irc, parse);

            }

        });

    }

}

const clients = {};
fs.readdir("config", (error, contents) => {

    if (error) { console.log("[FATAL]", error); } else {

        for (let _ = 0; _ < contents.length; _++) {

            const configFile = contents[_];
            clients[configFile] = new Bot(`./config/${configFile}`);
            clients[configFile].connect();

        }

    }

});
