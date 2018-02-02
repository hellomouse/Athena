function parser (raw) {
    this.tags = []
    this.raw = raw.toString(); // Raw string sent from server | This is a const, it should never be changed

    this.arguments = [];
    var argument = "";
    var argument2 = ""; // In commands such as MODE and PRIVMSG argument are after :
    // [RECV] :BWBellairs!~bwbellair@botters/BWBellairs PRIVMSG ##Athena :Argument-1 Argument-2 Argument-3 etc
    //                                          Command ^   Channel ^    ^ argument!!!
    let raw; // Variable for raw message parsing in code

    // IRCv3.2 Message Tags
    if (this.raw.startsWith("@")) {

        [tags, raw] = this.raw.split(" ", 1) // Split raw into tags and other raw...
        tags = tags.replace("@", "", 1) // Let's find the tags!
        tags = tags.split(";"); // Here are the tags!

        for (tag in tags) {

            if ("=" in tag) {

                let tag = tag.split("=", 1);
                let tag_parsed = {};
                tag_parsed[tag[0]] = tag[1]; // Set tag to it's value
                this.tags.push(tag_parsed);

            } else {

                this.tags.push(tag);

            }
        }
    }

    if (raw.startsWith(" :")) { // Check to see if there are arguments

        [raw, argument] = raw.split(" :", 2);
        // [RECV] :BWBellairs!~bwbellair@botters/BWBellairs PRIVMSG ##Athena :Argument-1 Argument-2 Argument-3 etc
        //        ^-------------------------------------------------------^  ^-----------------------------------^
        //          this.raw ^                                                            argument ^
        console.log("BHUSB", argument);

    }

    if (raw.startsWith(":")) {

        raw = raw.slice(1, -1).split(" "); // If the message starts With : then remove it then split it into a list | +1
        this.source = new user(raw[0]);
        this.command = raw[1]
        this.arguments = raw.slice(3);
        this.args = this.arguments; // Alias to this.arguments

        if (raw.length > 2 && this.command != "ACCOUNT") {

            this.target = raw[2];

        }

        if (raw.length > 3) {

            argument2 = raw.slice(3).join(" ");

        }

        if (this.command == "ACCOUNT") {

            argument2 = raw[2];

        }

    } else {

        raw = raw.split(" ")
        this.command = raw[0];

        if (argument.length) {

            if (argument2.length) {

                argument2 = `${argument2} :${argument}`;

            } else {

                argument2 = `:${argument}`;
            }

        }

    }

    if (argument2.startsWith(":")) { argument = argument2.split(":", 1) } else {
        argument2 = argument2.split(" :", 1)
    }

    for (let arg in argument2[0].split(" ")) {

        if (arg.length) {

            this.arguments.push(argument2);

        }

    }

    console.log(argument)
    if (argument.length > 1) {

        this.arguments.push(argument[1]);

    }

}

function user (userhost) {

    this.userhost = userhost;
    [this.nick, this.ident] = this.userhost.split("!");
    if (this.nick === undefined) { this.nick = null; }
    this.host = this.userhost.split("@")[1];

    if (this.host === undefined) { this.host = null;}
    if (this.ident == undefined) { this.ident = null } else {
        this.ident = this.ident.split("@")[0];
    }

}

module.exports = parser;
