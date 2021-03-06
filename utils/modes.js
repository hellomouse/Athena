const modes = {
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
        q: 'Quiet',
        o: 'Operator',
        v: 'Voice'
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

for (const i of Object.values(modes)) {
    // Compress all mods into one array
    allModes = allModes.concat(Object.keys(i));
}

const requiresParams = ['b', 'e', 'f', 'I', 'j', 'k', 'l', 'q'];
const possibleUserModes = ['e', 'I', 'b', 'q', 'o', 'v'];

/**
* @func
* @param {string} mode
* @return {bool} - True if mode requires param
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
* @param {array} modes_ - array of modes to be applied to/in the channel
* @return {object} - The compiled user modes
*/
function compileModes(userhost, channel, modes_) {
    // const msg = Buffer.from(`:${userhost} MODE ${channel} \r\n`); // (Unused)
    // const MSGLEN = 512 - msg.byteLength; // Calculates characters remaining (unused for now)

    const finalmodes = {};

    for (const i of modes_) {
        const reference = i;
        let [mode, target] = reference.split(' '); // ['+o', 'foo']
        let operator;

        [operator, mode] = mode.split(''); // ['+', 'o'];

        if (!isMode(mode)) continue; // We continue to the next mode

        if (!Object.keys(finalmodes).includes(target)) finalmodes[target] = [];

        finalmodes[target].push([operator, mode]);
    }

    return finalmodes;
}

/**
* @func
* @param {array} args  Array in the format [modes, user1, user2...]
* @return {array}      Array in the format: [[mode, user]...]
*/
function parseUserMode(args) {
    const modes_ = args[0];
    const users = args.slice(1);

    let current_mode = '';
    const modes_arr = [];

    /* Iterate over each character of modes_.
     * current_mode represents each individual mode (ie +o)
     * current_mode is reset each time a mode is "completed"
     * A list of seperated modes is added to
     * modes_arr */
    for (const mode of modes_) {
        if (mode === '+' || mode === '-') {
            current_mode = mode;
        } else if (possibleUserModes.includes(mode)) {
            modes_arr.push(current_mode + mode);
        }
    }

    /* Case with only 1 user */
    if (users.length === 1) {
        return [modes_arr.join(''), users[0]];
    }

    const returned = [];
    let i = 0;

    for (const user of users) {
        returned.push([modes_arr[i], user]);
        i++;
    }

    return returned;
}

module.exports = {
    modes,
    requiresParams,
    requiresParam,
    isMode,
    compileModes,
    parseUserMode
};
