let modes = {
    umodes: {
        g: 'Ignore private messages from unidentified users',
        i: 'Invisible',
        Q: 'Disable forwarding',
        R: 'Block unidentified users',
        w: 'See wallops',
        Z: 'Secure connection'
    },
    channel: {
        a: 'Admin',
        b: 'Ban',
        B: 'amsg restriction',
        c: 'resrict colour codes',
        C: 'CTCP restriction',
        e: 'Ban exemption',
        f: 'Forward',
        F: 'Enable forwaring',
        g: 'Allow open inviting',
        i: 'Invite only',
        I: 'Invite exemption',
        j: 'Join throttle',
        k: 'Password protected',
        l: 'Join limit',
        m: 'Moderated',
        n: 'Prevent external messages',
        p: 'Private',
        q: 'Quiet',
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

let requiresParams = ['b', 'e', 'f', 'I', 'j', 'k', 'l', 'q'];
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
* @param {string} userhost - userhost of bot
* @param {string} channel - Channel modes could be applied to
* @param {array} modes - array of modes to be applied to/in the channel
* @return {object} - The compiled user modes
*/
function compileModes(userhost, channel, modes) {
    const msg = Buffer.from(`:${userhost} MODE ${channel} \r\n`)
    const MSGLEN = 512 - msg.byteLength; // Calculates characters remaining

    let finalmodes = {};

    for (let i of modes) {
        let reference = i;
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
* @return {array}      Array in the format:
*/
function parseUserMode(args) {
    let modes = args[0];
    let users = args.slice(1);

    let current_mode = '';
    let modes_arr = [];

    /* Iterate over each character of modes.
     * current_mode represents each individual mode (ie +o)
     * current_mode is reset each time a mode is "completed"
     * A list of seperated modes is added to
     * modes_arr */
    for(let mode of modes) {
        if(mode === '+' || mode === '-') {
            current_mode = mode;
        }
        else if(possibleUserModes.includes(mode)) {
            modes_arr.push(current_mode + mode);
        }
    }

    /* Case with only 1 user */
    if(users.length == 1) {
        return [modes_arr.join(''), users[0]];
    }

    let returned = [];
    let i = 0;

    for(let user of users) {
        returned.push([modes_arr[i], user]);
        i++;
    }

    return returned;
}

module.exports = {
    modes,
    requiresParams,
    requiresParam,
    compileModes,
    parseUserMode
};
