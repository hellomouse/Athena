const { check_ignored } = require('./ignores.js');

/**
@param {object} config
@param {string} host
@param {string} channel
@param {array} [perms=[false, false, false]]
@return {boolean}
*/
function check_perms(config, host, channel, perms=[false, false, false]) {
    let admins = [...config.perms.admins.global, ...config.perms.admins.channels[channel] || []];
    let trustees = [...config.perms.trusted.global, ...config.perms.trusted.channels[channel] || []];

    let is_owner = config.perms.owners.includes(host);
    let is_admin = admins.includes(host);
    let is_trusted = trustees.includes(host);

    let [trusted, admin, owner] = perms;

    let is_bot = host.indexOf('/bot/') !== -1 && !(config.perms.bots.hosts.includes(host));

    if (config.perms.bots.channels.includes(channel))
        is_bot = false;
    let is_ignored = check_ignored(config, host, channel);

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
