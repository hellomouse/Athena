# Athena [![Codacy Badge](https://api.codacy.com/project/badge/Grade/a6fd391f6f9a41e8aef5d063a898ffa7)](https://app.codacy.com/app/Athena/Athena?utm_source=github.com&utm_medium=referral&utm_content=BWBellairs/Athena&utm_campaign=badger)

Simple, functional IRC Bot written in node

## Get the source
```bash
git clone https://github.com/hellomouse/Athena.git
```

## Installation

```bash
cd Athena
npm install
```

## Configuration

A template server file is given in the config/ directory. Multiple configs can be created in this directory.  
Upon running the bot new instances of itself will be created for each server given in the config

```javascript
{

    "irc": {
        "host": "irc.freenode.net", // Server to connect to
        "port": 6697 // What port the bot should connect to the server with
    },
    "nickname": "Athena", // Nickname of the bot
    "realname": "Totally not Athena", // Realname
    "ident": "Athena", // Ident
    "prefix": ".", // Prefix
    "channels": {
        "##Athena": {} // Channels should all be keys with empty object {} as value
    },
    "caps": ["account-notify", "extended-join", "multi-prefix", "chghost"],
    "sasl": {
        "method": null, // Method of authentication [null,plain,external]
        "username": null,
        "password": null,
        "cert": null,
        "key": null,
        "key_passphrase": null
    },
    "ssl": true, // Recommended
    "bindhost": null,
    "perms": {
        "bots": {
            "hosts": [],
            "channels": []
        },
        "trusted": {
            "global": [],
            "channels": {}
        },
        "admins": {
            "global": [],
            "channels": {}
        },
        "owners": [] // Array of vhosts (cloaks) e.g. ['*!*@botters/BWBellairs']
    },
    "ignores": {
        "global": [],
        "channels": {}
    }
}
```
**Note:** If you are copying this config above please remove all comments (Or use the templaye in config/). All config files are JSON (.json)

## Running
```bash
node index.js
```
**Note:** Node version must be >= 9.x
