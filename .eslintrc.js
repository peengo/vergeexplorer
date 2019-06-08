module.exports = {
    'env': {
        'commonjs': true,
        'es6': true,
        'node': true,
        // ADDED
        'mocha': true
    },
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'rules': {
        'indent': [
            'error',
            4,
            // ADDED
            { "SwitchCase": 1 }
        ],
        'linebreak-style': [
            'error',
            'windows'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        // ADDED
        'no-console': 'off',
        'no-constant-condition': 'off',
        'comma-dangle': [
            'error',
            'never'
        ],
        'eol-last': [
            'error',
            'always'
        ],
        'newline-after-var': [
            'error',
            'always'
        ],
        'dot-notation': ['error']
    }
};