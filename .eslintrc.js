module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaFeatures": {
            "impliedStrict": true
        },
        "ecmaVersion": 8
    },
    "rules": {
        "indent": ["error", 4, {"SwitchCase": 1, "MemberExpression": 1}],
        "linebreak-style": ["error","unix"],
        "quotes": ["error","double"],
        "semi": ["error","always"],
        "no-console":["error",{"allow": ["log","info", "warn", "error"]}],
        "switch-colon-spacing": "error"
    }
};