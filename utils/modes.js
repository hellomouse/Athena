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

for (let i of Object.values(modes)) {
    // Compress all mods into one array
    allModes = allModes.concat(Object.keys(i));
}

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

    let finalmodes = {};

    for (let i of modes_) {
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
* @author Bradley Shaw
* @param {object} ISUPPORT
* @param {string} channel
* @param {array} args  Array of arguments from the server in the format [modes, target1, target2...]
* @return {array}      Array in the format: [[mode, target, optionalarg]...]
*/
function parseModes(ISUPPORT, channel, args) {
    let channelModes = ISUPPORT.CHANMODES || ['e', 'I', 'b', 'q', 'k', 'f', 'l', 'j'];
    let prefix = Object.keys(ISUPPORT.PREFIX || { o: '@', v: '+' });
    let set = [...channelModes.slice(0, 3), ...prefix].join('');
    let unset = [...channelModes.slice(0, 2), ...prefix].join('');
    // ["eIbq","k","flj","CFLMPQScgimnprstz"] -ISUPPORT CHANMODES
    // ^ Requires param when un(setting)
    //          ^ Require param when unsetting. Param '*' sent by server un unsetting
    //              ^ Require param when setting
    // Other modes don't require parameters
    let [modes, ...targets] = args;

    let finalmodes = []; // final parsed modes

    let setMode = true; // bool to track whether we're setting/unsetting modes
    let argumentPosition = 0; // positon of target in targets array
    let readyModes = []; // ['+k', '##Athena', 'potato'] - mode, target, optionalarg

    for (let currentMode of modes) {
        if (currentMode === '+') {
            setMode = true; continue;
        } else if (currentMode === '-') { setMode = false; continue; }

        if (setMode) {
            if (set.includes(currentMode)) {
                readyModes = [`+${currentMode}`, channel, `${targets[argumentPosition]}`];
                argumentPosition++;
            } else { readyModes = [`+${currentMode}`, channel]; }
        } else {
            if (unset.includes(currentMode)) {
                readyModes = [`-${currentMode}`, channel, `${targets[argumentPosition]}`];
                argumentPosition++;
            } else { readyModes = [`-${currentMode}`, channel]; }
        }

        finalmodes.push(readyModes);
        readyModes = [];
    }

    return finalmodes;
}

module.exports = {
    modes,
    requiresParams,
    requiresParam,
    isMode,
    compileModes,
    parseModes
};
