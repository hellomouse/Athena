module.exports = {
    env: {
        es6: true,
        node: true
    },
    parserOptions: {
        ecmaVersion: 9,
        sourceType: 'module'
    },
    extends: ['eslint:recommended', '@hellomouse/eslint-config-wolfy1339'],
    rules: {
        indent: ['error', 4]
    }
};
