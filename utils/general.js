/**
* Strips formatting from IRC messages
* @param {string} msg
* @return {string}
*/
function strip_formatting(msg) {
    /* eslint-disable no-control-regex */
    let ccodes = ['\u0000f', '\u00016', '\u0001d', '\u0001f', '\u00002'];

    ccodes.push(new RegExp('\\u00003([1-9][0-6]?)?,?([1-9][0-6]?)?', 'g'));
    /* eslint-enable no-control-regex */

    for (let cc of ccodes)
        msg = msg.replace(cc, '');

    return msg;
}

module.exports = {
  strip_formatting
};
