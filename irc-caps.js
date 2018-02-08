class Caps {

    constructor (bot) {

        const self = this;
        self.bot = bot;
        self.caps = self.bot.config.caps || [];
        self.availablecaps = [];
        self.stringcaps = [];
        self.args = {};

        // Iterate over list provided of caps and check if it is a string or a function
        for (const cap of self.caps) {

            if (typeof cap != "string") {

                self.stringcaps.push(cap.name);

            } else {

                self.stringcaps.push(cap);

            }

        }

    }

    handler (event) {

        // Main handling code for CAP
        const self = this;
        const servcaps = event.arguments[1] != "*" ? event.arguments[1].split(" ") : event.arguments[2].split(" ");
        let args, cap;

        if (event.arguments[0] == "LS") {

            // Don't blindly assume server supports our requested caps, even though server sends a CAP NACK response
            for (const c of servcaps) {

                [cap, args] = c.trim().split("=");

                if (self.stringcaps.indexOf(cap) > -1) {

                    self.availablecaps.push(cap);

                    if (typeof args != "undefined") {

                        self.args[cap] = args.split(",");

                    } else {

                        self.args[cap] = null;

                    }

                }

            }

            if (event.arguments[1] != "*") {

                if (!self.availablecaps.length) {

                    self.bot.send("CAP END");

                } else {

                    self.bot.send(`CAP REQ :${self.availablecaps.join(" ")}`);

                }

            }

        } else if (event.arguments[0] == "ACK") {

            for (cap of self.caps) { // Iterate over self.caps so we have access to classes

                if (typeof cap != "string" && self.availablecaps.indexOf(cap.name) > -1) { // Check that the cap is in self.availablecaps
                    //if (cap.hasOwnProperty("run")) { // Check if the cap has the `run` property

                        cap.run(self.bot, self.args[cap.name]); // Run the cap with the arguments collected during CAP LS

                    //}
                }

            }

        } else if (event.arguments[0] == "NEW") {

            const newcaps = [];

            for (const c of self.stringcaps) {

                if (servcaps.indexOf(c) > -1) { // Check if the server supports the CAPs we want

                    self.availablecaps.push(c); // Add the new CAP to the list of available CAPs
                    newcaps.push(c);

                }

            }

            if (newcaps.length) {

                self.bot.send(`CAP REQ :${newcaps.join(" ")}`); // Request the new CAP

            }

        } else if (event.arguments[0] == "DEL") {

            for (const c of servcaps) {

                if (self.availablecaps.indexOf(c) > -1) {

                    self.availablecaps.splice(self.availablecaps.indexOf(c), 1);

                }

                if (self.stringcaps.indexOf(c) > -1) {

                    const index = self.stringcaps.indexOf(c);

                    self.stringcaps.splice(index, 1);
                    self.caps.splice(index, 1);

                }

            }

        }

    }

}

module.exports = Caps;
