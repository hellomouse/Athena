// Contains vital methods used to interact with the irc server properly

class core {

    constructor () {}

    init (events, config, state) {

        this.events = events;
        this.config = config;
	this.state = state;

        this.nickname = this.config["nickname"];

	this.on_ping = this.events.on("PING", received => {
	    // Respond to ping event
	    this.send("PONG");

	})

        this.on_nick_in_use = this.events.on("433", (received, raw) => {

            this.nickname = this.nickname.concat("_");
            this.send("NICK " + this.nickname);
    
        })

        this.on_nick_in_use = this.events.on("001", (received, raw) => {

	    Object.keys(this.config["channels"]).forEach((channel)=>{

	  	this.send("JOIN " + channel);

	    })
    
        })

	this.on_name = this.events.on("353", (received, raw) => {

            let channel = received[4]
	    let users = raw.split(":")[2].split(" "); 
	    if (!this.state["channels"].hasOwnProperty(channel)){

		this.state["channels"][channel] = {
		    users: users,
		    flags: [],
		    modes: [],
		    key: null
		};

	    }  

	})

    }

    send (message) {

        this.socket.write(message + "\r\n");
	console.log("[SENT]", message);

    }

}

module.exports = core;
