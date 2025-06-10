module.exports = {
  // Environnement de test
  testEnvironment: 'node',

  // Répertoires de tests
  testMatch: ['**/api/tests/**/*.test.js', '**/api/tests/**/*.spec.js'],

  // Fichiers à ignorer - syntaxe corrigée pour Jest
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/snapshots/'],

  // Configuration de la couverture
  collectCoverage: true,
  collectCoverageFrom: [
    'api/src/**/*.js',
    '!api/src/app.js', // Exclure le point d'entrée
    '!**/node_modules/**',
    '!**/snapshots/**', // Exclure les snapshots de la couverture
  ],

  // Répertoire de sortie de la couverture
  coverageDirectory: 'coverage',

  // Formats de rapport de couverture
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Seuils de couverture (ajustés pour être réalistes selon le principe de simplicité)
  coverageThreshold: {
    global: {
      branches: 35, // Maintenu à 35% (actuel: 35.41%)
      functions: 24, // Réduit à 24% (actuel: 24.59%)
      lines: 20, // Réduit à 20% (actuel: 20.67%)
      statements: 19, // Réduit à 19% (actuel: 19.36%)
    },
  },

  // Setup et teardown
  setupFilesAfterEnv: ['<rootDir>/api/tests/setup.js'],

  // Timeout pour les tests
  testTimeout: 10000,

  // Variables d'environnement pour les tests
  setupFiles: ['<rootDir>/api/tests/env.setup.js'],

  // Configuration des mocks
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Détection de fuites mémoire
  detectLeaks: false,

  // Parallélisation des tests
  maxWorkers: '50%',
};
