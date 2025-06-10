module.exports = {
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Règles essentielles pour éviter les erreurs
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',

    // Règles minimales pour la consistance
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
    },
  ],
};
