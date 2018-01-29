class Caps {
    constructor(caps) {
        const self = this;
        self.caps = caps || [];
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

    handler(event) {
        const self = this;
        const servcaps = event.arguments[1].split(' ');
        let cap;
        if (event.arguments[0] == "LS") {
            for (let c in servcaps) {
                let cap = c.split("=")[0];
                if (cap in self.stringcaps) {
                    self.availablecaps.push(cap);
                    if (c.find('=') != -1) {
                        let args = c.split('=')[1];
                        self.args[cap] = args.split(',');
                    } else {
                        self.args[cap] = null;
                    }
                }

                if (!self.availablecaps) {
                    self.bot.send("CAP END");
                } else {
                    self.bot.send("CAP REQ :" + self.availablecaps.join(" "));
                }
            }
        } else if (event.arguments[0] == "ACK") {
            for (cap in self.caps) {
                if (typeof cap.run != undefined) {
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
                self.bot.send("CAP REQ :" + " ".join(newcaps));
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

    run(bot) {
        this.bot = bot;
        this.bot.listen(self.handler, "cap");
        this.bot.send("CAP LS 302");
    }
}

module.exports = Cap;
