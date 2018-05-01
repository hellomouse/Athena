const { check_perms } = require('../utils/permissions');

/* eslint-disable require-jsdoc */
function todo(bot, event, irc, args) {
    let has_perms = check_perms(bot.config, event.source.host, event.target, [true, false, false]);

    if (bot.todo === undefined) bot.todo = require('../todo.json');
    if (args[0] === 'add' && has_perms) {
        irc.reply(event, `Added to the todo list. No. ${bot.todo.push(args.slice(1).join(' '))}`);
    } else if (args[0] === 'remove' && has_perms) {
        let index = parseInt(args[1]);
        let text = '';

        for (let i of bot.todo[index]) {
            text += `\u0336${i}`;
        }
        text += '- Done!';
        bot.todo[index] = text;
    } else {
        irc.reply(event, 'To-do List:');
        if (bot.todo.length === 0) {
            irc.reply(event, 'Empty');

            return;
        }
        for (let i of Object.entries(bot.todo)) {
            irc.reply(event, i.join('. '));
        }
    }
}

todo.opts = {
    perms: [false, false, false],
    hide: false,
    min_args: 0
};

function ping(bot, event, irc, args) {
    irc.reply(event, 'Pong');
}

ping.opts = {
    perms: [false, false, false],
    min_args: 0,
    hide: false
};

function join(bot, event, irc, args) {
    irc.join(args[0], args[1]);
}
join.opts = {
    perms: [false, true, true],
    min_args: 1,
    hide: false
};


function quit(bot, event, irc, args) {
    irc.quit(args.join(' ') || 'Athena - https://github.com/BWBellairs/Athena');
}

quit.opts = {
    perms: [false, true, true],
    min_args: 0,
    hide: false
};

function Eval(bot, event, irc, args) {
    try {
        let result = eval(args.join(' '));

        try {
            if (result instanceof Object && JSON.stringify(result) !== undefined) {
                irc.reply(event, JSON.stringify(result).replace(/\r\n|\n|\r/g, ''));
            } else
                irc.reply(event, String(result).replace(/\r\n|\n|\r/g, ''));
        } catch (e) {
            irc.reply(event, result);
        }
    } catch (e) {
        irc.reply(event, e.toString());
    }
}

function list(bot, event, irc, args) {
    irc.reply(event, Object.keys(bot.plugins).filter(x => {
        if (x !== 'bot') {
            return !bot.plugins[x].opts.hide;
        }
    }).join(', '));
}

list.opts = {
    perms: [false, false, false],
    min_args: 0,
    hide: false
};

Eval.opts = {
    perms: [false, false, true],
    min_args: 1,
    hide: false
};

module.exports = {
    todo,
    ping,
    quit,
    eval: Eval,
    list,
    join
};
