
/** TODO: Separate channel modes into actual channels modes
* and modes that can be set on users in channels
*/
let modes = {
    umodes: {
        g: 'Ignore private messages from unidentified users',
        i: 'Invisible',
        Q: 'Disable forwarding',
        R: 'Block unidentified users',
        w: 'See wallops',
        Z: 'Secure connection'
    },
    'channel-users': {
        a: 'Admin',
        b: 'Ban',
        e: 'Ban exemption',
        I: 'Invite exemption',
        q: 'Quiet'
    },
    channel: {
        B: 'amsg restriction',
        c: 'resrict colour codes',
        C: 'CTCP restriction',
        f: 'Forward',
        F: 'Enable forwaring',
        g: 'Allow open inviting',
        i: 'Invite only',
        j: 'Join throttle',
        k: 'Password protected',
        l: 'Join limit',
        m: 'Moderated',
        n: 'Prevent external messages',
        p: 'Private',
        Q: 'Block forwarded users',
        r: 'Block unidentified users',
        s: 'Secret',
        S: 'SSL only',
        t: 'Topic lock',
        z: 'Reduced moderation'
    },
    services: {
        A: 'Network Admin restricted channel',
        F: 'Channel trusted filter',
        H: 'Help Oper restricted channel',
        O: 'Network oper restricted channel',
        r: 'Registered channel'
    }
};

let allModes = [];

for (let i of Object.values(modes)) {
    // Compress all mods into one array
    allModes.concat(Object.keys(i));
}

let requiresParams = ['b', 'e', 'f', 'I', 'j', 'k', 'l', 'q'];

/**
* @func
* @param {string} mode
* @return {bool}
*/
function requiresParam(mode) {
    return requiresParams.includes(mode);
}


/**
* @func
* @param {string} mode
* @return {bool}
*/
function isMode(mode) {
    return allModes.includes(mode);
}

/**
* @func
* @param {string} userhost - userhost of bot
* @param {string} channel - Channel modes could be applied to
* @param {array} modes - array of modes to be applied to/in the channel
*/
function compileModes(userhost, channel, modes) {
    const MSGLEN = 512 - Buffer.byteLength(`:${userhost} MODE ${channel} \r\n`); // Calculates characters remaining

    let finalmodes = {};

    for (let i of modes) {
        let reference = i;
        let [mode, target] = reference.split(' '); // ['+o', 'foo']
        let operator;

        [operator, mode] = mode.split(''); // ['+', 'o'];

        if (!isMode(mode)) continue; // We continue to the next mode

        if (!Object.keys(finalmodes).includes(target)) finalmodes[target] = [];

        finalmodes[target].append([operator, mode]);
    }
}

module.exports = {
    modes,
    requiresParams,
    requiresParam
};
