class Caps {
    constructor(bot) {
        const self = this;
        self.bot = bot;
        self.caps = self.bot.config.caps || [];
        self.availablecaps = [];
        self.stringcaps = [];
        self.args = {};

        // Iterate over list provided of caps and check if it is a string or a function
        for (let cap in self.caps) {
            if (typeof cap != "string") {
                self.stringcaps.push(cap.name);
            } else {
                self.stringcaps.push(cap);
            }
        }
    }

    handler(received) {
        // Main handling code for CAP
        const self = this;
        const servcaps = received.split(':')[-1].split(' ');
        const arguments = received.
        let cap;
        if (event.arguments[0] == "LS") {
            // Don't blindly assume server supports our requested caps, even though server sends a CAP NACK response
            for (let c in servcaps) {
                let [cap, args] = c.split("=");
                if (cap in self.stringcaps) {
                    self.availablecaps.push(cap);
                    if (typeof args != undefined) {
                        self.args[cap] = args.split(',');
                    } else {
                        self.args[cap] = null;
                    }
                }

                if (!self.availablecaps) {
                    self.bot.send("CAP END");
                } else {
                    self.bot.send(`CAP REQ :${self.availablecaps.join(" ")}`);
                }
            }
        } else if (event.arguments[0] == "ACK") {
            for (cap in self.caps) {
                if (typeof cap != "string" && cap.run != undefined) {
                    if (cap.name in servcaps) {
                        cap.run(self.bot, args = self.args[cap.name]);
                    }
                }
            }
            self.done = true;
        } else if (event.arguments[0] == "NEW") {
            let newcaps = [];
            for (let c in self.stringcaps) {
                if (c in servcaps) {
                    self.availablecaps.push(c);
                    newcaps.push(c);
                }
            }
            if (newcaps.length) {
                self.bot.send(`CAP REQ :${newcaps.join()}`);
            }
        } else if (event.arguments[0] == "DEL") {
            for (c in servcaps) {
                if (c in self.availablecaps) {
                    self.availablecaps.remove(c);
                }
                if (c in self.stringcaps) {
                    let index = self.stringcaps.index(c);
                    self.stringcaps.remove(c);
                    self.caps.splice(index, 1)
                }
            }
        }
    }
}

module.exports = Cap;
