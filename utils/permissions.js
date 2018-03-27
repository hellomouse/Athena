const { check_ignored } = require('./ignores.js');

/**
@param {object} config
@param {string} host
@param {string} channel
@param {boolean} [owner=false]
@param {boolean} [admin=false]
@param {boolean} [trusted=false]
@return {boolean}
*/
function check_perms(config, host, channel, owner=false, admin=false, trusted=false) {
    let admins = [...config.admins.global];
    let trustees = [...config.trusted.global];

    admins.push(...config.admins.channels[channel] || []);
    trustees.push(...config.trusted.channels[channel] || []);

    let is_owner = host in config.owners;
    let is_admin = host in admins;
    let is_trusted = host in trustees;

    let is_bot = host.find('/bot/') !== -1 && !(host in config.bots.hosts);

    if (channel in config.bots.channels)
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
