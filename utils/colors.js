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
* Colors a message
*/
class Color extends String {
    /**
    * @param {string} message - The message you want to add rainbow colors too
    */
    constructor(message) {
        super(message);
    }

    white() {
        super(`${colors.WHITE}${this}${colors.NORMAL}`);

        return this;
    }

    black() {
        super(`${colors.BLACK}${this}${colors.NORMAL}`);

        return this;
    }

    navy() {
        super(`${colors.NAVY}${this}${colors.NORMAL}`);

        return this;
    }

    green() {
        super(`${colors.GREEN}${this}${colors.NORMAL}`);

        return this;
    }

    red() {
        super(`${colors.RED}${this}${colors.NORMAL}`);

        return this;
    }

    brown() {
        super(`${colors.BROWN}${this}${colors.NORMAL}`);

        return this;
    }

    maroon() {
        super(`${colors.MAROON}${this}${colors.NORMAL}`);

        return this;
    }

    purple() {
        super(`${colors.PURPLE}${this}${colors.NORMAL}`);

        return this;
    }

    violet() {
        super(`${colors.VIOLET}${this}${colors.NORMAL}`);

        return this;
    }

    orange() {
        super(`${colors.ORANGE}${this}${colors.NORMAL}`);

        return this;
    }

    yellow() {
        super(`${colors.YELLOW}${this}${colors.NORMAL}`);

        return this;
    }

    lightgreen() {
        super(`${colors.LIGHTGREEN}${this}${colors.NORMAL}`);

        return this;
    }

    lime() {
        super(`${colors.LIME}${this}${colors.NORMAL}`);

        return this;
    }

    teal() {
        super(`${colors.TEAL}${this}${colors.NORMAL}`);

        return this;
    }

    bluecyan() {
        super(`${colors.BLUECYAN}${this}${colors.NORMAL}`);

        return this;
    }

    cyan() {
        super(`${colors.CYAN}${this}${colors.NORMAL}`);

        return this;
    }

    aqua() {
        super(`${colors.AQUA}${this}${colors.NORMAL}`);

        return this;
    }

    blue() {
        super(`${colors.BLUE}${this}${colors.NORMAL}`);

        return this;
    }

    royal() {
        super(`${colors.ROYAL}${this}${colors.NORMAL}`);

        return this;
    }

    lightpurple() {
        super(`${colors.LIGHTPURPLE}${this}${colors.NORMAL}`);

        return this;
    }

    pink() {
        super(`${colors.PINK}${this}${colors.NORMAL}`);

        return this;
    }

    fuchsia() {
        super(`${colors.FUCHSIA}${this}${colors.NORMAL}`);

        return this;
    }

    grey() {
        super(`${colors.GREY}${this}${colors.NORMAL}`);

        return this;
    }

    gray() {
        super(`${colors.GRAY}${this}${colors.NORMAL}`);

        return this;
    }

    lightgray() {
        super(`${colors.LIGHTGRAY}${this}${colors.NORMAL}`);

        return this;
    }

    lightgrey() {
        super(`${colors.LIGHTGREY}${this}${colors.NORMAL}`);

        return this;
    }

    silver() {
        super(`${colors.SILVER}${this}${colors.NORMAL}`);

        return this;
    }


    bold() {
        super(`${colors.BOLD}${this}${colors.NORMAL}`);

        return this;
    }

    italic() {
        super(`${colors.ITALIC}${this}${colors.NORMAL}`);

        return this;
    }

    underline() {
        super(`${colors.UNDERLINE}${this}${colors.NORMAL}`);

        return this;
    }

    reverse() {
        super(`${colors.ITALIC}${this}${colors.NORMAL}`);

        return this;
    }

    /**
    * Colors a message with rainbow colors
    * @return {string} - Returns your message returned with rainbow coloring
    */
    rainbow() {
        let i = 0;
        let colored = '';

        for (let character of this) {
            if (i > (_rainbow.length - 1)) // We substract one because i starts at 0 and rainbow.length at 1
                i = 0;

            colored += `${colors[_rainbow[i].toUpperCase()]}${character}`;
            i += 1;
        }

        return colored.concat('\x0F');
    }
}

function make_rainbow(msg) {
    let i = 0;
    let colored = '';

    for (let character of msg) {
        if (i > (_rainbow.length - 1)) // We substract one because i starts at 0 and rainbow.length at 1
            i = 0;

        colored += `${colors[_rainbow[i].toUpperCase()]}${character}`;
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
        return `${msg.slice(0, 3)},${colors[bg.toUpperCase()].slice(1)}${msg.slice(3)}`;
    } else if (!c && bg !== null) {
        return `${colors.BLACK},${colors[bg.toUpperCase()].slice(1)}${msg}\x0F`;
    } else if (bg === null) {
        return msg;
    }
}


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
