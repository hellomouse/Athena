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
        return new Color(`${colors.WHITE}${this}${colors.NORMAL}`);
    }

    black() {
        return new Color(`${colors.BLACK}${this}${colors.NORMAL}`);
    }

    navy() {
        return new Color(`${colors.NAVY}${this}${colors.NORMAL}`);
    }

    green() {
        return new Color(`${colors.GREEN}${this}${colors.NORMAL}`);
    }

    red() {
        return new Color(`${colors.RED}${this}${colors.NORMAL}`);
    }

    brown() {
        return new Color(`${colors.BROWN}${this}${colors.NORMAL}`);
    }

    maroon() {
        return new Color(`${colors.MAROON}${this}${colors.NORMAL}`);
    }

    purple() {
        return new Color(`${colors.PURPLE}${this}${colors.NORMAL}`);
    }

    violet() {
        return new Color(`${colors.VIOLET}${this}${colors.NORMAL}`);
    }

    orange() {
        return new Color(`${colors.ORANGE}${this}${colors.NORMAL}`);
    }

    yellow() {
        return new Color(`${colors.YELLOW}${this}${colors.NORMAL}`);
    }

    lightgreen() {
        return new Color(`${colors.LIGHTGREEN}${this}${colors.NORMAL}`);
    }

    lime() {
        return new Color(`${colors.LIME}${this}${colors.NORMAL}`);
    }

    teal() {
        return new Color(`${colors.TEAL}${this}${colors.NORMAL}`);
    }

    bluecyan() {
        return new Color(`${colors.BLUECYAN}${this}${colors.NORMAL}`);
    }

    cyan() {
        return new Color(`${colors.CYAN}${this}${colors.NORMAL}`);
    }

    aqua() {
        return new Color(`${colors.AQUA}${this}${colors.NORMAL}`);
    }

    blue() {
        return new Color(`${colors.BLUE}${this}${colors.NORMAL}`);
    }

    royal() {
        return new Color(`${colors.ROYAL}${this}${colors.NORMAL}`);
    }

    lightpurple() {
        return new Color(`${colors.LIGHTPURPLE}${this}${colors.NORMAL}`);
    }

    pink() {
        return new Color(`${colors.PINK}${this}${colors.NORMAL}`);
    }

    fuchsia() {
        return new Color(`${colors.FUCHSIA}${this}${colors.NORMAL}`);
    }

    grey() {
        return new Color(`${colors.GREY}${this}${colors.NORMAL}`);
    }

    gray() {
        return new Color(`${colors.GRAY}${this}${colors.NORMAL}`);
    }

    lightgray() {
        return new Color(`${colors.LIGHTGRAY}${this}${colors.NORMAL}`);
    }

    lightgrey() {
        return new Color(`${colors.LIGHTGREY}${this}${colors.NORMAL}`);
    }

    silver() {
        return new Color(`${colors.SILVER}${this}${colors.NORMAL}`);
    }


    bold() {
        return new Color(`${colors.BOLD}${this}${colors.NORMAL}`);
    }

    italic() {
        return new Color(`${colors.ITALIC}${this}${colors.NORMAL}`);
    }

    underline() {
        return new Color(`${colors.UNDERLINE}${this}${colors.NORMAL}`);
    }

    reverse() {
        return new Color(`${colors.ITALIC}${this}${colors.NORMAL}`);
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

        return new Color(colored.concat('\x0F'));
    }
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


function addStyling(msg, background, rainbow, style) {
    let myRe = /\${(\w+)}/g;
    let myArray;

    while ((myArray = myRe.exec(msg)) !== null) {
        msg.replace(myArray[0], colors[myArray[1]]);
    }

    return ((...args)=>{})(add_background(msg, background), style);
}

module.exports = {
    Color,
    colors,
    add_background,
    addStyling
};
