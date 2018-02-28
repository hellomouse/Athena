/* eslint-disable require-jsdoc */
function ping(bot, event, irc, args) {
    irc.reply(event, 'Pong');
}

module.exports = {
    ping
};
