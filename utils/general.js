/**
* Strips formatting from IRC messages
* @param {string} msg
* @return {string}
*/
function strip_formatting(msg) {
    /* eslint-disable no-control-regex */
    let ccodes = ['\\x0f', '\\x16', '\\x1d', '\\x1f', '\\x02', '\\x03([1-9][0-6]?)?,?([1-9][0-6]?)?'];
    /* eslint-enable no-control-regex */

    for (let cc of ccodes)
        msg = msg.replace(new RegExp(cc, 'g'), '');

    return msg;
}

module.exports = {
  strip_formatting
};
