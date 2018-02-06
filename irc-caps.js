class Caps {

    constructor (bot) {

        const self = this;
        self.bot = bot;
        self.caps = self.bot.config.caps || [];
        self.availablecaps = [];
        self.stringcaps = [];
        self.args = {};

        // Iterate over list provided of caps and check if it is a string or a function
        for (const cap in self.caps) {
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
        const servcaps = event.arguments[1] != "*" ? event.arguments[1] : event.arguments[2];
        let args, cap;

        if (event.arguments[0] == "LS") {

            // Don't blindly assume server supports our requested caps, even though server sends a CAP NACK response
            for (const c in servcaps) {

                [cap, args] = c.split("=");

                if (cap in self.stringcaps) {

                    self.availablecaps.push(cap);

                    if (typeof args !== undefined) {

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

            for (cap in self.caps) {

                if (typeof cap != "string" && cap.run !== undefined) {

                    if (cap.name in servcaps) {

                        cap.run(self.bot, self.args[cap.name]);

                    }

                }

            }

        } else if (event.arguments[0] == "NEW") {

            const newcaps = [];

            for (const c in self.stringcaps) {

                if (c in servcaps) {

                    self.availablecaps.push(c);
                    newcaps.push(c);

                }

            }

            if (newcaps.length) {

                self.bot.send(`CAP REQ :${newcaps.join()}`);

            }

        } else if (event.arguments[0] == "DEL") {

            for (const c in servcaps) {

                if (c in self.availablecaps) {

                    self.availablecaps.splice(self.availablecaps.indexOf(c), 1);

                }

                if (c in self.stringcaps) {

                    const index = self.stringcaps.indexOf(c);

                    self.stringcaps.splice(index, 1);
                    self.caps.splice(index, 1);

                }

            }

        }

    }

}

module.exports = Caps;
