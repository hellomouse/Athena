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


function make_rainbow(string) {
    let i = 0;
    let colored = '';

    for (let character of string) {
        if (i > (_rainbow.length - 1)) // We substract one because i starts at 0 and rainbow.length at 1
            i = 0;

        colored.concat(`${colors[_rainbow[i].toUpper()]}${character}`);
        i += 1;
    }

    return colored.concat('\x0F');
}

function add_background(string, bg) {
    let c = string.indexOf('\x03') !== -1;

    if (c && bg !== null) {
        return `${string.slice(0, 3)},${colors[bg]}${string.slice(3)}`;
    } else if (!c && bg !== null) {
        return `${colors.black},${colors[bg]}${string}\x0F`;
    } else if (bg === null) {
        return string;
    }
}

function stylize(string, style) {
    if (style !== null) {
        return `${colors[style.upper()]}${string}`;
    }

    return string;
}

function addStyling(msg, background, rainbow, style) {
    let myRe = /\${(\w+)}/g;
    let myArray;

    while ((myArray = myRe.exec(msg)) !== null) {
        msg.replace(myArray[0], colors.colors[myArray[1]]);
    }

    if (rainbow) msg = make_rainbow(msg);
    msg = stylize(add_background(msg, background), style);
}

module.export = {
    colors,
    make_rainbow,
    add_background,
    stylize,
    addStyling
};
