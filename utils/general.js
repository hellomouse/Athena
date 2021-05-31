const { range, len } = require('node-python-funcs');
const log = require('./logging');
const request = require('request');

/**
* Strips formatting from IRC messages
* @param {string} msg
* @return {string}
*/
function strip_formatting(msg) {
    if (!msg) return msg;
    /* eslint-disable no-control-regex */
    const ccodes = ['\\x0f', '\\x16', '\\x1d', '\\x1f', '\\x02', '\\x03([0-9][0-6]?)?,?([0-9][0-6]?)?'];
    /* eslint-enable no-control-regex */

    for (const cc of ccodes)
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
    for (const i of range(0, len(l), n)) {
        yield l.slice(i, i + n);
    }
}


/**
 * Submit the error to dpaste and send a link back
 * @param  {Error} error - The Error object
 * @param  {ConnectionWrapper} irc
 * @param  {Parser} event
 */
function post_error(error, irc, event) {
    try {
        const data = {
            title: `Athena Error: ${error.toString()}`,
            content: error.stack.toString(),
            syntax: 'javascript',
            'expiry-days': '10',
            poster: 'wolfy1339'
        };

        request.post({
            url: 'http://dpaste.com/api/v2/',
            json: true,
            body: data,
            timeout: 60000
        }, (err, req, res) => {
            if (err) {
                irc.privmsg('##Athena', `An error happened while pasting an error: ${err.toString()}`);
                log.error(err.stack.toString());
            } else {
                irc.msg('##Athena', 'Error: {0}'.format(res.split('\n')[0]));
            }
        });
    } catch (e) {
        irc.privmsg('##Athena', `An error happened while pasting an error: ${e.toString()}`);
        log.error(e.stack.toString());
    }
}

module.exports = {
    post_error,
    strip_formatting,
    chunks
};
