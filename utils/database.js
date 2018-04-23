const { dict } = require('node-python-funcs');
const fs = require('fs');
const log = require('./logging');

/* eslint-disable require-jsdoc, new-cap */
class ChannelDB extends dict {
    constructor(wrappers) {
        let contents = {};

        try {
            contents = JSON.parse(fs.readFileSync('userdb.json').toString());
        } catch (err) {
            log.error('An error occured while loading the database file.');
            log.error(err.stack);
        }
        super(contents);
        let irc = Symbol();

        this[irc] = wrappers;
    }

    change_attr(name, attr, value, channel=null) {
        if (channel !== null) {
            this[channel].users[name][attr] = value;
        } else {
            for (let chan of Object.keys(this)) {
                try {
                    this[chan].users[name][attr] = value;
                } catch (e) {
                    continue;
                }
            }
        }
    }

    remove_entry(event, nick) {
        try {
            delete this[event.target].users[nick];
        } catch (e) {
            for (let i of this[event.target].users.values()) {
                if (i.host === event.source.host) {
                    delete this[event.target].users[i.hostmask.split('!')[0]];
                    break;
                }
            }
        }
    }

    add_entry(channel, nick, hostmask, account, realname) {
        let temp = {
            hostmask,
            host: hostmask.split('@')[1],
            account,
            realname,
            seen: null,
            modes: []
        };

        if (this[channel].users.keys().includes(nick)) {
            delete temp.seen;
            this[channel].users[nick].update(temp);
        } else {
            this[channel].users[nick] = new dict(temp);
        }
    }

    get_user_host(channel, nick) {
        let host;

        try {
            host = `*!*@${this[channel].users[nick].host}`;
        } catch (e) {
            this[Symbol.from('irc')].send(`WHO ${channel} nuhs%nhuacr`);
            host = `*!*@${this[channel].users[nick].host}`;
        }

        return host;
    }

    flush() {
        fs.writeFile('userdb.json', JSON.stringify(this, null, 2) + '\n', err => {
            if (err) {
                log.error('An error was thrown while writing the user DB');
                log.error(err.stack);
            }
        });
    }
}

module.exports = ChannelDB;
