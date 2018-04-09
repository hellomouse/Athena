const colors = {
    WHITE: '\x0300',
    BLACK: '\x0301',
    NAVY: '\x0302',
    GREEN: '\x0303',
    RED: '\x0304',
    BROWN: '\x0305',
    MAROON: '\x0305',
    PURPLE: '\x0306',
    VIOLET: '\x0306',
    ORANGE: '\x0307',
    YELLOW: '\x0308',
    LIGHTGREEN: '\x0309',
    LIME: '\x0309',
    TEAL: '\x0310',
    BLUECYAN: '\x0310',
    CYAN: '\x0311',
    AQUA: '\x0311',
    BLUE: '\x0312',
    ROYAL: '\x0312',
    LIGHTPURPLE: '\x0313',
    PINK: '\x0313',
    FUCHSIA: '\x0313',
    GREY: '\x0314',
    GRAY: '\x0314',
    LIGHTGRAY: '\x0315',
    LIGHTGREY: '\x0315',
    SILVER: '\x0315',

    NORMAL: '\x0F',
    UNDERLINE: '\x1F',
    BOLD: '\x02',
    ITALIC: '\x1D',
    REVERSE: '\u202E'
};

const _rainbow = ['red', 'orange', 'yellow', 'green', 'blue', 'navy', 'violet'];

/**
* Colors a message with rainbow colors
* @param {string} msg - The message you want to add rainbow colors too
* @return {string} - Returns your message returned with rainbow coloring
*/
function make_rainbow(msg) {
    let i = 0;
    let colored = '';

    for (let character of msg) {
        if (i > (_rainbow.length - 1)) // We substract one because i starts at 0 and rainbow.length at 1
            i = 0;

        colored.concat(`${colors[_rainbow[i].toUpperCase()]}${character}`);
        i += 1;
    }

    return colored.concat('\x0F');
}

/**
* Colors a message with rainbow colors
* @param {string} msg - The message you want to add rainbow colors too
* @param {string} bg - The message you want to add rainbow colors too
* @return {string} - Returns your message returned with rainbow coloring
*/
function add_background(msg, bg) {
    let c = msg.indexOf('\x03') !== -1;

    if (c && bg !== null) {
        return `${msg.slice(0, 3)},${colors[bg]}${msg.slice(3)}`;
    } else if (!c && bg !== null) {
        return `${colors.black},${colors[bg]}${msg}\x0F`;
    } else if (bg === null) {
        return msg;
    }
}

/**
* Colors a message with rainbow colors
* @param {string} msg - The message you want to add rainbow colors too
* @param {string} style - The message you want to add rainbow colors too
* @return {string} - Returns your message returned with rainbow coloring
*/
function stylize(msg, style) {
    if (style !== null) {
        return `${colors[style.toUpperCase()]}${msg}`;
    }

    return msg;
}

function addStyling(msg, background, rainbow, style) {
    let myRe = /\${(\w+)}/g;
    let myArray;

    while ((myArray = myRe.exec(msg)) !== null) {
        msg.replace(myArray[0], colors[myArray[1]]);
    }

    if (rainbow) msg = make_rainbow(msg);

    return stylize(add_background(msg, background), style);
}

module.exports = {
    colors,
    make_rainbow,
    add_background,
    stylize,
    addStyling
};
