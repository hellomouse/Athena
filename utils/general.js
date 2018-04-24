const { range, len } = require('node-python-funcs');

/**
* Strips formatting from IRC messages
* @param {string} msg
* @return {string}
*/
function strip_formatting(msg) {
    /* eslint-disable no-control-regex */
    let ccodes = ['\\x0f', '\\x16', '\\x1d', '\\x1f', '\\x02', '\\x03([0-9][0-6]?)?,?([0-9][0-6]?)?'];
    /* eslint-enable no-control-regex */

    for (let cc of ccodes)
        msg = msg.replace(new RegExp(cc, 'g'), '');

    return msg;
}

/**
* Yield successive n-sized chunks from l.
* @param {array} l
* @param {number} n
* @yield {array}
*/
function* chunks(l, n) {
    for (let i of range(0, len(l), n)) {
        yield l.slice(i, i + n);
    }
}

module.exports = {
  strip_formatting,
  chunks
};
