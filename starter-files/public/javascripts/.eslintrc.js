module.exports = {
    "settings": {
        "react": {
            "version": "16.7"
        }
    },
    "env": {
        "browser": true,
        "es6": true
    },
    'parser': 'babel-eslint',
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
      ],
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
