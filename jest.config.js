module.exports = {
  // Environnement de test
  testEnvironment: 'node',
  
  // Répertoires de tests
  testMatch: [
    '**/api/tests/**/*.test.js',
    '**/api/tests/**/*.spec.js'
  ],
  
  // Fichiers à ignorer
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Configuration de la couverture
  collectCoverage: true,
  collectCoverageFrom: [
    'api/src/**/*.js',
    '!api/src/app.js',  // Exclure le point d'entrée
    '!**/node_modules/**'
  ],
  
  // Répertoire de sortie de la couverture
  coverageDirectory: 'coverage',
  
  // Formats de rapport de couverture
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  
  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
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
  maxWorkers: '50%'
}; 