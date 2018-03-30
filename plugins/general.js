/* eslint-disable require-jsdoc */
function ping(bot, event, irc, args) {
    irc.reply(event, 'Pong');
}

ping.opts = {
    perms: [false, false, false],
    min_args: 0,
    hide: false
};
module.exports = {
    ping
};
