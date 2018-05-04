function _get_info(event, args) {
    let target, nick;

    if (args.length >= 1) {
        if (args[0].startsWith('#')) {
            target = args[0];
            args.shift();
            nick = args.length ? args : event.source.nick;
        } else {
            target = event.target;
            nick = args;
        }
    } else {
        target = event.target;
        nick = event.source.nick;
    }

    return [target, nick];
}
function op(bot, event, irc, args) {
    let [target, nick] = _get_info(event, args);

    irc.op(target, nick);
}
op.opts = {
    perms: [false, true, false],
    min_args: 0,
    category: 'channel'
};
function deop(bot, event, irc, args) {
    let [target, nick] = _get_info(event, args);

    irc.deop(target, nick);
}
deop.opts = {
    perms: [false, true, false],
    min_args: 0,
    category: 'channel'
};

module.exports = {
    op,
    deop
};
