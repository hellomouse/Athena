/**
* Strips formatting from IRC messages
* @param {string} msg
* @return {string}
*/
function strip_formatting(msg) {
    /* eslint-disable no-control-regex */
    let ccodes = ['\x0f', '\x16', '\x1d', '\x1f', '\x02'];

    ccodes.push(new RegExp('\\x03([1-9][0-6]?)?,?([1-9][0-6]?)?', 'g'));
    /* eslint-enable no-control-regex */

    for (let cc of ccodes)
        msg = msg.replace(cc, '');

    return msg;
}

module.exports = {
  strip_formatting
};
