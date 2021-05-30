const { check_ignored } = require('./ignores.js');

/**
@param {object} config
@param {string} host
@param {string} channel
@param {array} [perms=Array] - Defaults to [false, false, false]
@return {boolean}
*/
function check_perms(config, host, channel, perms=[false, false, false]) {
    const admins = [...config.perms.admins.global, ...config.perms.admins.channels[channel] || []];
    const trustees = [...config.perms.trusted.global, ...config.perms.trusted.channels[channel] || []];

    const is_owner = config.perms.owners.includes(host);
    const is_admin = admins.includes(host);
    const is_trusted = trustees.includes(host);

    const [trusted, admin, owner] = perms;

    let is_bot = host.includes('/bot/') && !(config.perms.bots.hosts.includes(host));

    if (config.perms.bots.channels.includes(channel))
        is_bot = false;
    const is_ignored = check_ignored(config, host, channel);

    if (owner && is_owner)
        return true;
    else if (admin && (is_admin || is_owner))
        return true;
    else if (trusted && (is_trusted || is_admin || is_owner) && !is_ignored)
        return true;
    else if (!(owner || admin || trusted) && !is_ignored && !is_bot)
        return true;

    return false;
}

module.exports = {
    check_perms
};
