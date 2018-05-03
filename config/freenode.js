/* eslint-disable no-unused-vars */
const fs = require('fs');

module.exports = {
    irc: {
        host: 'irc.freenode.net',
        port: 6697
    },
    nickname: 'Athena',
    realname: 'Totally not Athena',
    ident: 'Athena',
    prefix: '.',
    channels: {
        '##Athena': {}
    },
    caps: ['account-notify', 'extended-join', 'multi-prefix', 'chghost'],
    sasl: {
        method: null,
        username: null,
        cert: null, // fs.readFileSync('../freenode.crt'),
        key: null, // fs.readFileSync('../freenode.key'),
        key_passphrase: null
    },
    ssl: true,
    bindhost: null,
    perms: {
        bots: {
            hosts: [],
            channels: []
        },
        trusted: {
            global: [],
            channels: {}
        },
        admins: {
            global: [],
            channels: {}
        },
        owners: []
    },
    ignores: {
        global: [],
        channels: {}
    }
};
