const { check_perms } = require('../utils/permissions');
const log = require('../utils/logging');

/* eslint-disable require-jsdoc */
function todo(bot, event, irc, args) {
    let has_perms = check_perms(bot.config, event.source.host, event.target, [true, false, false]);

    if (bot.todo === undefined) bot.todo = require('../todo.json');
    if (args[0] === 'add' && has_perms) {
        irc.reply(event, `Added to the todo list. No. ${bot.todo.push(args.slice(1).join(' '))}`);
    } else if (args[0] === 'remove' && has_perms) {
        let index = parseInt(args[1]) - 1; // Parse args[1] and substract 1 to get the Array index
        let text = '';

        for (let i of bot.todo[index]) {
            text += `\u0336${i}`;
        }
        text += '- Done!';
        bot.todo[index] = text;
        irc.reply(event, `Removed ${index} from todo list`);
    } else if (args[0] === 'save') {
        const fs = require('fs');

        fs.writeFile('todo.json', JSON.stringify(bot.todo, null, 2) + '\n', err => {
            if (err) log.error('An error occured while saving file'); log.error(err.stack);
        });
    } else {
        irc.reply(event, 'To-do List:');
        if (bot.todo.length === 0) {
            irc.reply(event, 'Empty');

            return;
        }
        for (let i of Object.entries(bot.todo)) {
            irc.reply(event, `${parseInt(i[0])+1}. ${i[1]}`);
        }
    }
}

todo.opts = {
    min_args: 0,
    category: 'general'
};

function ping(bot, event, irc, args) {
    irc.reply(event, 'Pong');
}

ping.opts = {
    min_args: 0,
    category: 'general'
};

function join(bot, event, irc, args) {
    irc.join(args[0], args[1]);
}
join.opts = {
    perms: [false, true, true],
    min_args: 1,
    category: 'general'
};


function quit(bot, event, irc, args) {
    irc.quit(args.join(' ') || 'Athena - https://github.com/BWBellairs/Athena');
}

quit.opts = {
    perms: [false, true, true],
    min_args: 0,
    category: 'general'
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
    if (args.length === 0) {
        // TODO use colours util to create bolded text
        irc.reply(event, `\x02Categories:\x0f ${bot.plugins.categories.join(', ')}`);
    } else {
        let commands = Object.keys(bot.plugins.plugins).filter(x => {
            let is_right_category = bot.plugins.plugins[x].opts.category.toLowerCase() === args[0];

            return !bot.plugins.plugins[x].opts.hide && is_right_category;
        }).join(', ');

        irc.reply(event, `\x02Commands in ${args[0].replace(/\W/g, '')}:\x0f ${commands}`);
    }
}

list.opts = {
    min_args: 0,
    category: 'general'
};

Eval.opts = {
    perms: [false, false, true],
    min_args: 1,
    category: 'general'
};

module.exports = {
    todo,
    ping,
    quit,
    eval: Eval,
    list,
    join
};
