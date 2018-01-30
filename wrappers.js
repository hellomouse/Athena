class connection_wrapper {
    constructor(self) {
        this.send = self.send;
        this.msg = this.privmsg;
    }
    
    reply(event, message) {
        this.privmsg(event.target, message);
    }
    
    privmsg(target, message) {
        this.send(`PRIVMSG ${target} :${message}`);
    }

    ping() {
        this.send(`PING :${(new Date()).getTime()}`);
    }

    part(chan) {
        this.send(`PART ${chan}`)
    }

    nick(nick) {
        this.send(`NICK ${nick}`)
    }

    join(chan, key) {
        if (typeof key == "string") {
            this.send(`JOIN ${chan} ${key}`)
        } else {
            this.send(`JOIN ${chan}`)
        }
    }

    invite(chan, user) {
        this.send(`INVITE ${user} ${chan}`)
    }

    action(channel, message) {
        this.send(`PRIVMSG ${channel} :\x01ACTION ${message}\x01`)
    }

    kick(channel, user, message) {
        user = user.replace(" ", "").replace(":", "")
        this.send(`KICK ${channel} ${user} :${message}`)
    }

    remove(channel, user, message) {
        this.send(`REMOVE ${channel} ${user} :${message}`)
    }

    op(channel, nick) {
        this.send(`MODE ${channel} +o ${nick}`)
    }

    deop(channel, nick) {
        this.send(`MODE ${channel} -o ${nick}`)
    }

    ban(channel, nick) {
        this.send(`MODE ${channel} +b ${nick}`)
    }

    unban(channel, nick) {
        this.send(`MODE ${channel} -b ${nick}`)
    }

    quiet(channel, nick) {
        this.send(`MODE ${channel} +q ${nick}`)
    }

    unquiet(channel, nick) {
        this.send(`MODE ${channel} -q ${nick}`)
    }

    unvoice(channel, nick) {
        this.send(`MODE ${channel} -v ${nick}`)
    }

    voice(channel, nick) {
        this.send(`MODE ${channel} +v ${nick}`)
    }

    mode(channel, nick, mode) {
        this.send(`MODE ${channel} ${mode} ${nick}`)
    }

    notice(user, message) {
        this.send(`NOTICE ${user} :${message}`)
    }

    quit(message) {
        this.send(`QUIT :${message}`)
    }

    ctcp(user, message) {
        this.privmsg(user, `\x01${message}\x01\x01`)
    }
}
