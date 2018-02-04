function parser (raw) {
    this.tags = []
    this.raw = raw.toString(); // Raw string sent from server | This is a const, it should never be changed

    this.arguments = [];
    this.args = this.arguments; // Alias to this.arguments

    var argument = "";
    var argument2 = ""; // In commands such as MODE and PRIVMSG argument are after :
    // [RECV] :BWBellairs!~bwbellair@botters/BWBellairs PRIVMSG ##Athena :Argument-1 Argument-2 Argument-3 etc
    //                                          Command ^   Channel ^    ^ argument!!!
    let raw_msg = this.raw; // Variable for raw message parsing in code

    // IRCv3.2 Message Tags
    if (raw_msg.startsWith("@")) {

        let tags;
        [tags, raw_msg] = split(this.raw, " ", 1) // Split raw into tags and other raw...
        tags = tags.replace("@", "", 1) // Let's find the tags!
        tags = tags.split(";"); // Here are the tags!

        for (let tag in tags) {

            if ("=" in tag) {

                tag = split(tag, "=", 1);
                let tag_parsed = {};
                tag_parsed[tag[0]] = tag[1]; // Set tag to it's value
                this.tags.push(tag_parsed);

            } else {

                this.tags.push(tag);

            }
        }
    }

    if (raw_msg.indexOf(" :") > -1) { // Check to see if there are arguments

        [raw_msg, argument] = split(raw_msg, " :", 1);
        // [RECV] :BWBellairs!~bwbellair@botters/BWBellairs PRIVMSG ##Athena :Argument-1 Argument-2 Argument-3 etc
        //        ^-------------------------------------------------------^  ^-----------------------------------^
        //          this.raw ^                                                            argument ^
        console.log("BHUSB", argument);

    }

    if (raw_msg.startsWith(":")) {

        raw_msg = raw_msg.slice(1).split(" "); // If the message starts With : then remove it then split it into a list | +1
        this.source = new user(raw_msg[0]);
        this.command = raw_msg[1];

        if (raw_msg.length > 2 && this.command != "ACCOUNT") {

            this.target = raw_msg[2];

        }

        if (raw_msg.length > 3) {

            argument2 = raw_msg.slice(3).join(" ");

        }

        if (this.command == "ACCOUNT") {

            argument2 = raw_msg[2];

        }

    } else {

        raw_msg = raw_msg.split(" ")
        this.command = raw_msg[0];

    }

    if (argument.length) {

        if (argument2.length) {

            argument2 = `${argument2} :${argument}`;

        } else {

            argument2 = `:${argument}`;
        }

    }

    argument2 = argument2.startsWith(":") ? split(argument2, ":", 1) : split(argument2, " :", 1);

    for (let arg in argument2[0].split(" ")) {

        if (arg.length > 1) {

            this.arguments.push(arg);

        }

    }

    console.log(argument)
    if (argument2.length > 1) {

        this.arguments.push(argument2[1]);

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


function split (string, sep, maxCount) {

    // Function to imitate Python's str.split method, since JavaScript can't split x times
    string = string.split(sep);
    let first = string.slice(0, maxCount);
    let second = string.slice(maxCount).join(sep);
    return [...first, second];

}

module.exports = parser;
