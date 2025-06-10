module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  },
  extends: ['eslint:recommended', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    // Style et syntaxe
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],

    // Variables
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',

    // Fonctions
    'no-unused-expressions': 'error',
    'no-undef': 'error',
    'no-console': 'warn',

    // Objets et arrays
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],

    // Espaces
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', 'never'],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',

    // Complexité
    complexity: ['warn', 10],
    'max-depth': ['warn', 4],
    'max-len': ['warn', { code: 120, ignoreUrls: true }],
    'max-lines': ['warn', 500],

    // Bonnes pratiques
    curly: 'error',
    'dot-notation': 'error',
    eqeqeq: ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-return-assign': 'error',
    'no-throw-literal': 'error',
    'prefer-arrow-callback': 'warn',

    // Async/Promise
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'prefer-promise-reject-errors': 'error',

    // ES6+
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'object-shorthand': 'warn',
    'prefer-template': 'warn',

    // Sécurité
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      globals: {
        testHelpers: 'readonly'
      },
      rules: {
        'no-console': 'off',
        'max-lines': 'off',
        'space-before-function-paren': 'off'
      }
    },
    {
      files: ['jest.config.js', '.eslintrc.js'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
