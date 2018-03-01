const { range } = require('node-python-funcs');
const { chunks } = require('./utils/general');

/** Class that provides methods for IRC commands */
class ConnectionWrapper {

    /**
    * @func
    * @param {object} self - The `this` object from the upstream class.
    */
    constructor(self) {
        this.bot = self; // We're not extending this class so this is a solution
        this.msg = this.privmsg;
    }

    /**
    * @func
    * @param {string} message - Message being sent to server
    */
    send(message) {
        this.bot.send(message);
    }

    /**
    * @func
    * @param {object} event - The event object created when parsing the incoming messages.
    * @param {string} message - The message you wish to reply with.
    */
    async reply(event, message) {
        if (event.target === this.bot.nickname) {
            await this.privmsg(event.source.nick, message);
        } else {
            await this.privmsg(event.target, message);
        }
    }

    /**
    * @func
    * @param {string} target - The user or channel you wish to send a PRIVMSG to.
    * @param {string} message - The message you wish to send.
    */
    async privmsg(target, message) {
        const channel = target.startsWith('#') ? target : this.bot.state.channels.keys()[0];
        const db = this.bot.state.channels[channel].users[this.bot.nickname];
        // The maximum length for messages is 512 bytes total including nick, ident & host
        const MAXLEN = 512 - 2 - Buffer.byteLength(db.hostmask); // 1 for beggining double colon
        const MSGLEN = MAXLEN - Buffer.byteLength(`PRIVMSG ${target} :\r\n`);
        let msg = Buffer.from(message);

        for (let i of range(0, msg.byteLength, MSGLEN)) {
            await this.bot.send(`PRIVMSG ${target} :${msg.slice(i, i + MSGLEN).toString()}`);
        }
    }

    /**
    * @func
    */
    async ping() {
        await this.bot.send(`PING :${Date.now()}`);
    }

    /**
    * Part the given channel.
    * @func
    * @param {string} chan - The channel you wish to leave.
    */
    async part(chan) {
        await this.bot.send(`PART ${chan}`);
    }

    /**
    * Change your nick to the one specified.
    * @func
    * @param {string} nick - The nick you wish to change to.
    */
    async nick(nick) {
        await this.bot.send(`NICK ${nick}`);
    }

    /**
    * Joins specified channel.
    * @func
    * @param {string} chan - Channel you wish to join.
    * @param {string} [key] - Channel key.
    */
    async join(chan, key) {
        await this.bot.send(`JOIN ${chan} ${key || ''}`);
    }

    /**
    * Inivites specified user to the specified channel
    * @func
    * @param {string} chan - Channel where you wish to invite user to.
    * @param {string} user - User whom you would like to invite to specified channel.
    */
    async invite(chan, user) {
        await this.bot.send(`INVITE ${user} ${chan}`);
    }

    /**
    * Sends an ACTION response to the channel.
    * @func
    * @param {string} channel - The channel you wish to send the ACTION to.
    * @param {string} message - The message you wish to send.
    */
    async action(channel, message) {
        await this.bot.send(`PRIVMSG ${channel} :\x01ACTION ${message}\x01`);
    }

    /**
    * Kicks specified user from the specified channel.
    * @func
    * @param {string} channel - Channel where you wish to kick user from.
    * @param {string} user - User whom you would like to kick from specified channel.
    * @param {string} message - Message with which you'd like to kick the specified user with
    */
    async kick(channel, user, message) {
        user = user.replace(' ', '').replace(':', '');
        await this.bot.send(`KICK ${channel} ${user} :${message}`);
    }

    /**
    * Removes specified user from the specified channel.
    * @func
    * @param {string} channel - Channel where you wish to remove user from.
    * @param {string} user - User whom you would like to remove from specified channel.
    * @param {string} message - Message with which you'd like to remove the specified user with
    */
    async remove(channel, user, message) {
        await this.bot.send(`REMOVE ${channel} ${user} :${message}`);
    }

    /**
    * Gives operator status (+o) specified user from the specified channel.
    * @func
    * @param {string} channel - Channel where you wish to give user from.
    * @param {string|array} nick - User whom you would like to give operator status to in specified channel.
    */
    async op(channel, nick) {
        await this.mode(channel, nick, '+o');
    }

    /**
    * Removes operator status (-o) specified user from the specified channel.
    * @func
    * @param {string} channel - Channel where you wish to give user from.
    * @param {string|array} nick - User whom you would like to remove operator status from specified channel.
    */
    async deop(channel, nick) {
        await this.mode(channel, nick, '-o');
    }

    /**
    * Bans (+b) specified user from the specified channel.
    * @func
    * @param {string} channel - Channel where you wish to ban the user from.
    * @param {string|array} nick - User whom you would like to ban from specified channel.
    */
    async ban(channel, nick) {
        await this.mode(channel, nick, '+b');
    }

    /**
    * Unbans (-b) specified user from the specified channel.
    * @func
    * @param {string} channel - Channel where you wish to unban the user from.
    * @param {string|array} nick - User whom you would like to unban from specified channel.
    */
    async unban(channel, nick) {
        await this.mode(channel, nick, '-b');
    }

    /**
    * @param {string} channel
    * @param {string|array} nick
    */
    async quiet(channel, nick) {
        await this.mode(channel, nick, '+q');
    }

    /**
    * @param {string} channel
    * @param {string|array} nick
    */
    async unquiet(channel, nick) {
        await this.mode(channel, nick, '-q');
    }

    /**
    * @param {string} channel
    * @param {string|array} nick
    */
    async unvoice(channel, nick) {
        await this.mode(channel, nick, '-v');
    }

    /**
    * @param {string} channel
    * @param {string|arry} nick
    */
    async voice(channel, nick) {
        await this.mode(channel, nick, '+v');
    }

    /**
    * @param {string} channel
    * @param {string|array} nick
    * @param {string} mode
    */
    async mode(channel, nick, mode) {
        if (nick instanceof Array) {
            for (let i of chunks(nick, this.bot.ISUPPORT.MODES)) {
                await this.bot.send(`MODE ${channel} ${mode[0].concat(mode.slice(1).repeat(i.length))} ${i.join(' ')}`);
            }
        } else {
            await this.bot.send(`MODE ${channel} ${mode} ${nick}`);
        }
    }

    /**
    * @param {string} user
    * @param {string} message
    */
    async notice(user, message) {
        await this.bot.send(`NOTICE ${user} :${message}`);
    }

    /**
    * @param {string} message
    */
    async quit(message) {
        await this.bot.send(`QUIT :${message}`);
    }

    /**
    * @param {string} user
    * @param {string} message
    */
    async ctcp(user, message) {
        await this.privmsg(user, `\x01${message}\x01\x01`);
    }

}

module.exports = ConnectionWrapper;
