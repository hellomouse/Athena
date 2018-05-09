const { range, len } = require('node-python-funcs');
const log = require('./logging');
const request = require('request');

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


function post_error(error, irc, event) {
    try {
        let data = {
            title: `Athena Error: ${error.toStringr()}`,
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
        }, (err, req, res)=> {
            if (err) {
                irc.privmsg('##Athena', `An error happened while pasting an error: ${e.toString()}`);
                log.error(e.stack.toString());
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
