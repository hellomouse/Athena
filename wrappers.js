class connection_wrapper {
    constructor (self) {

        this.bot = self; // We're not extending this class so this is a solution
        this.send = self.send;
        this.msg = this.privmsg;

    }

    reply (event, message) {

        this.privmsg(event.target, message);

    }

    privmsg (target, message) {

        this.bot.send(`PRIVMSG ${target} :${message}`);

    }

    ping () {

        this.bot.send(`PING :${(new Date()).getTime()}`);

    }

    part (chan) {

        this.bot.send(`PART ${chan}`);

    }

    nick (nick) {

        this.bot.send(`NICK ${nick}`);

    }

    join (chan, key) {

        this.bot.send(typeof key == "string" ? `JOIN ${chan} ${key}` : `JOIN ${chan}`);

    }

    invite (chan, user) {

        this.bot.send(`INVITE ${user} ${chan}`);

    }

    action (channel, message) {

        this.bot.send(`PRIVMSG ${channel} :\x01ACTION ${message}\x01`);

    }

    kick (channel, user, message) {

        user = user.replace(" ", "").replace(":", "");
        this.bot.send(`KICK ${channel} ${user} :${message}`);

    }

    remove (channel, user, message) {

        this.bot.send(`REMOVE ${channel} ${user} :${message}`);

    }

    op (channel, nick) {

        this.bot.send(`MODE ${channel} +o ${nick}`);

    }

    deop (channel, nick) {

        this.bot.send(`MODE ${channel} -o ${nick}`);
    }

    ban (channel, nick) {

        this.bot.send(`MODE ${channel} +b ${nick}`);

    }

    unban (channel, nick) {

        this.bot.send(`MODE ${channel} -b ${nick}`);

    }

    quiet (channel, nick) {

        this.bot.send(`MODE ${channel} +q ${nick}`);

    }

    unquiet (channel, nick) {

        this.bot.send(`MODE ${channel} -q ${nick}`);

    }

    unvoice (channel, nick) {

        this.bot.send(`MODE ${channel} -v ${nick}`);

    }

    voice (channel, nick) {

        this.bot.send(`MODE ${channel} +v ${nick}`);

    }

    mode (channel, nick, mode) {

        this.bot.send(`MODE ${channel} ${mode} ${nick}`);

    }

    notice (user, message) {

        this.bot.send(`NOTICE ${user} :${message}`);

    }

    quit (message) {

        this.bot.send(`QUIT :${message}`);

    }

    ctcp (user, message) {

        this.privmsg(user, `\x01${message}\x01\x01`);

    }
}

module.exports = connection_wrapper;
