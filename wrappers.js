/** Class that provides methods for IRC commands */
class ConnectionWrapper {

    /**
    * @func
    * @param {object} self - The `this` object from the upstream class.
    */
    constructor(self) {
        this.bot = self; // We're not extending this class so this is a solution
        this.send = self.send;
        this.msg = this.privmsg;
    }

    /**
    * @func
    * @param {object} event - The event object created when parsing the incoming messages.
    * @param {string} message - The message you wish to reply with.
    */
    reply(event, message) {
        this.privmsg(event.target, message);
    }

    /**
    * @func
    * @param {string} target - The user or channel you wish to send a PRIVMSG to.
    * @param {string} message - The message you wish to send.
    */
    privmsg(target, message) {
        this.bot.send(`PRIVMSG ${target} :${message}`);
    }

    ping() {
        this.bot.send(`PING :${(new Date()).getTime()}`);
    }

    /**
    * Part the given channel.
    * @func
    * @param {string} chan - The channel you wish to leave.
    */
    part(chan) {
        this.bot.send(`PART ${chan}`);
    }

    /**
    * Change your nick to the one specified.
    * @func
    * @param {string} nick - The nick you wish to change to.
    */
    nick(nick) {
        this.bot.send(`NICK ${nick}`);
    }

    /**
    * Joins specified channel.
    * @func
    * @param {string} chan - Channel you wish to join.
    * @param {string} [key] - Channel key.
    */
    join(chan, key) {
        this.bot.send(typeof key == 'string' ? `JOIN ${chan} ${key}` : `JOIN ${chan}`);
    }

    /**
    * Inivites specified user to the specified channel
    * @func
    * @param {string} chan - Channel where you wish to invite user to.
    * @param {string} user - User whom you would like to invite to specified channel.
    */
    invite(chan, user) {
        this.bot.send(`INVITE ${user} ${chan}`);
    }

    /**
    * Sends an ACTION response to the channel.
    * @func
    * @param {string} channel - The channel you wish to send the ACTION to.
    * @param {string} message - The message you wish to send.
    */
    action(channel, message) {
        this.bot.send(`PRIVMSG ${channel} :\x01ACTION ${message}\x01`);
    }

    /**
    * Kicks specified user from the specified channel.
    * @func
    * @param {string} channel - Channel where you wish to kick user from.
    * @param {string} user - User whom you would like to kick from specified channel.
    * @param {string} message - Message with which you'd like to kick the specified user with
    */
    kick(channel, user, message) {
        user = user.replace(' ', '').replace(':', '');
        this.bot.send(`KICK ${channel} ${user} :${message}`);
    }

    /**
    * Removes specified user from the specified channel.
    * @func
    * @param {string} channel - Channel where you wish to remove user from.
    * @param {string} user - User whom you would like to remove from specified channel.
    * @param {string} message - Message with which you'd like to remove the specified user with
    */
    remove(channel, user, message) {
        this.bot.send(`REMOVE ${channel} ${user} :${message}`);
    }

    op(channel, nick) {
        this.bot.send(`MODE ${channel} +o ${nick}`);
    }

    deop(channel, nick) {
        this.bot.send(`MODE ${channel} -o ${nick}`);
    }

    ban(channel, nick) {
        this.bot.send(`MODE ${channel} +b ${nick}`);
    }

    unban(channel, nick) {
        this.bot.send(`MODE ${channel} -b ${nick}`);
    }

    quiet(channel, nick) {
        this.bot.send(`MODE ${channel} +q ${nick}`);
    }

    unquiet(channel, nick) {
        this.bot.send(`MODE ${channel} -q ${nick}`);
    }

    unvoice(channel, nick) {
        this.bot.send(`MODE ${channel} -v ${nick}`);
    }

    voice(channel, nick) {
        this.bot.send(`MODE ${channel} +v ${nick}`);
    }

    mode(channel, nick, mode) {
        this.bot.send(`MODE ${channel} ${mode} ${nick}`);
    }

    notice(user, message) {
        this.bot.send(`NOTICE ${user} :${message}`);
    }

    quit(message) {
        this.bot.send(`QUIT :${message}`);
    }

    ctcp(user, message) {
        this.privmsg(user, `\x01${message}\x01\x01`);
    }

}

module.exports = ConnectionWrapper;
