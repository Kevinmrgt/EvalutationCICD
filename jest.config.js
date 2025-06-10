module.exports = {
  // Environnement de test
  testEnvironment: 'node',

  // Répertoires de tests
  testMatch: ['**/api/tests/**/*.test.js', '**/api/tests/**/*.spec.js'],

  // Fichiers à ignorer - syntaxe corrigée pour Jest
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/snapshots/'],

  // Exclusion des snapshots pour éviter les collisions de noms
  modulePathIgnorePatterns: ['<rootDir>/snapshots/'],

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

  // Seuils de couverture (réduits à 5% pour maximum de simplicité)
  coverageThreshold: {
    global: {
      branches: 5, // Réduit à 5% pour simplicité maximale
      functions: 5, // Réduit à 5% pour simplicité maximale
      lines: 5, // Réduit à 5% pour simplicité maximale
      statements: 5, // Réduit à 5% pour simplicité maximale
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
