class Sasl {

    constructor (username, password, method) {

        this.username = username;
        this.password = password;
        this.method = method || "plain";
        this.retries = 0;
        this.name = "sasl";

    }

    run (bot, args) {

        const mechanisms = (typeof args != "undefined" && args !== null) ? args : ["EXTERNAL", "PLAIN"];
        this.bot = bot;

        if (mechanisms.indexOf(this.method.toUpperCase()) > -1) {

            if (this.method in ["plain", "external"]) {

                bot.send(`AUTHENTICATE ${this.method.toUpperCase()}`);

            } else {

                throw new Error("Not implemented yet");

            }

        } else {

            throw new Error("Not supported by server");

        }

    }

    on_authenticate (event) {

        let password;
        if (event.arguments[0] == "+") {

            if (this.method == "plain") {

                password = Buffer.from(`${this.username}\x00${this.username}\x00${this.password}`).toString("base64");

            } else if (this.method == "external") {

                password = "+";

            }

            this.bot.send(`AUTHENTICATE ${password}`);
        }

    }

    on_saslfailed (event) {

        this.retries += 1;

        if (this.method == "external") {

            if (this.retries == 2) {

                this.retries = 1;
                this.method = "plain";

                this.bot.send("AUTHENTICATE PLAIN");

            } else {

                this.bot.send("AUTHENTICATE EXTERNAL");

            }

        } else if (this.method == "plain") {

            if (this.retries != 2) {

                this.bot.send("AUTHENTICATE PLAIN");

            } else {

                this.bot.send("AUTHENTICATE *");
                throw new Error("SASL authentication failed!");

            }

        }

    }

    on_saslsuccess (event) {

        this.bot.send("CAP END");

    }
}

Sasl.name = "sasl";
module.exports = Sasl;
