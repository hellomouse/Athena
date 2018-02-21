class Caps {

    constructor(bot) {
        this.bot = bot;
        this.caps = this.bot.config.caps || [];
        this.availablecaps = [];
        this.stringcaps = [];
        this.args = {};

        // Iterate over list provided of caps and check if it is a string or a function
        for (const cap of this.caps) {
            this.stringcaps.push(cap.name || cap);
        }
    }

    handler(event) {
        // Main handling code for CAP
        const servcaps = event.arguments[1] !== '*' ? event.arguments[1].split(' ') : event.arguments[2].split(' ');
        let args, cap;

        if (event.arguments[0] === 'LS') {
            // Don't blindly assume server supports our requested caps, even though server sends a CAP NACK response
            for (const c of servcaps) {
                [cap, args] = c.trim().split('=');

                if (this.stringcaps.indexOf(cap) > -1) {
                    this.availablecaps.push(cap);

                    if (typeof args !== 'undefined') {
                        this.args[cap] = args.split(',');
                    } else {
                        this.args[cap] = null;
                    }
                }
            }

            if (event.arguments[1] !== '*') {
                if (!this.availablecaps.length) {
                    this.bot.send('CAP END');
                } else {
                    this.bot.send(`CAP REQ :${this.availablecaps.join(' ')}`);
                }
            }
        } else if (event.arguments[0] === 'ACK') {
            for (cap of this.caps) { // Iterate over this.caps so we have access to classes
                if (typeof cap !== 'string' && this.availablecaps.indexOf(cap.name) > -1) { // Check that the cap is in this.availablecaps
                    if (typeof cap.run === 'function') { // Check if the cap has the `run` property
                        cap.run(this.bot, this.args[cap.name]); // Run the cap with the arguments collected during CAP LS
                    } else {
                        continue;
                    }
                }
            }
        } else if (event.arguments[0] === 'NEW') {
            const newcaps = [];

            for (const c of this.stringcaps) {
                if (servcaps.indexOf(c) > -1) { // Check if the server supports the CAPs we want
                    this.availablecaps.push(c); // Add the new CAP to the list of available CAPs
                    newcaps.push(c);
                }
            }

            if (newcaps.length) {
                this.bot.send(`CAP REQ :${newcaps.join(' ')}`); // Request the new CAP
            }
        } else if (event.arguments[0] === 'DEL') {
            for (const c of servcaps) {
                if (this.availablecaps.indexOf(c) > -1) {
                    this.availablecaps.splice(this.availablecaps.indexOf(c), 1);
                }

                if (this.stringcaps.indexOf(c) > -1) {
                    const index = this.stringcaps.indexOf(c);

                    this.stringcaps.splice(index, 1);
                    this.caps.splice(index, 1);
                }
            }
        }
    }

}

module.exports = Caps;
