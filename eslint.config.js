module.exports = {
    extends: [ 'eslint:recommended', "plugin:react/recommended" ],
    root: true,

    ecmaFeatures: {
        modules: true
    },

    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
    },

    env: {
        browser: true,
        node: true,
        es6: true
    },

    rules: {
        'camelcase': 2,
        'comma-spacing': [ 2, { before: false, after: true } ],
        'curly': 2,
        'func-names': 2,
        'indent': [ 2, 4, { SwitchCase: 1 } ],
        'no-trailing-spaces': [ 2, { skipBlankLines : true } ],
        'quotes': [ 2, 'single', 'avoid-escape' ],
        'semi': [ 2, 'always' ],
        'semi-spacing': [ 2, { before: false, after: true } ],
        'space-in-parens': 2,
        'no-console': 0
    }
};