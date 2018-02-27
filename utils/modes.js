let modes = {
    'umodes': {
        'g': 'Ignore private messages from unidentified users',
        'i': 'Invisible',
        'Q': 'Disable forwarding',
        'R': 'Block unidentified users',
        'w': 'See wallops',
        'Z': 'Secure connection'
    },
    'channel': {
        'a': 'Admin',
        'b': 'Ban',
        'B': 'amsg restriction',
        'c': 'resrict colour codes',
        'C': 'CTCP restriction',
        'e': 'Ban exemption',
        'f': 'Forward',
        'F': 'Enable forwaring',
        'g': 'Allow open inviting',
        'i': 'Invite only',
        'I': 'Invite exemption',
        'j': 'Join throttle',
        'k': 'Password protected',
        'l': 'Join limit',
        'm': 'Moderated',
        'n': 'Prevent external messages',
        'p': 'Private',
        'q': 'Quiet',
        'Q': 'Block forwarded users',
        'r': 'Block unidentified users',
        's': 'Secret',
        'S': 'SSL only',
        't': 'Topic lock',
        'z': 'Reduced moderation'
    },
    'services': {
        'A': 'Network Admin restricted channel',
        'F': 'Channel trusted filter',
        'H': 'Help Oper restricted channel',
        'O': 'Network oper restricted channel',
        'r': 'Registered channel'
    }
};

let requiresParams = ['b', 'e', 'f', 'I', 'j', 'k', 'l', 'q'];

/**
* @func
* @param {string} mode
* @return {bool} - True if mode requires param
*/
function requiresParam(mode) {
    return requiresParams.includes(mode);
}

module.exports = {
    modes: modes,
    requiresParams: requiresParams,
    requiresParam: requiresParam
};
