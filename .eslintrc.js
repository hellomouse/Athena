module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parserOptions": {
        "ecmaVersion": 8,
        "sourceType": "module",
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "extends": ["eslint:recommended", "google"],
    "rules": {
        "require-jsdoc": "off",
        "space-before-function-paren": [
            "error",
            "always"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "comma-dangle": [
            "error",
            "never"
        ],
        "padded-blocks": [
            "error",
            {
                "blocks": "always"
            }
        ],
        "arrow-parens": [
            "error",
            "as-needed"
        ],
        "no-console": "off",
        "one-var": "off",
        "camelcase": "off",
        "max-len": [
            "error",
            {
                "code": 120,
                "tabWidth": 4,
                "ignoreComments": true,
                "ignoreTrailingComments": true,
                "ignoreUrls": true,
            }
        ],
        "id-match": "off", // Google sets this
        "curly": "off", // Can't configure this enough
        "block-spacing": [
            "error",
            "always"
        ],
        "brace-style": [
            "error",
            "1tbs",
            {
                "allowSingleLine": true
            }
        ]
    }
}
