/**
 * Setup global pour Jest
 */

// Configuration globale des timeouts
jest.setTimeout(10000);

// Mock console en mode test pour réduire le bruit
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    // Garder les erreurs importantes
    error: jest.fn(),
    warn: jest.fn(),
    // Masquer les logs de développement
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
}

// Helper global pour les tests
global.testHelpers = {
  // Helper pour créer un utilisateur de test
  createTestUser: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  }),

  // Helper pour créer une tâche de test
  createTestTask: (overrides = {}) => ({
    title: 'Test Task',
    description: 'This is a test task for unit testing',
    status: 'pending',
    priority: 'medium',
    ...overrides
  }),

  // Helper pour attendre un délai
  wait: ms => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper pour les assertions de dates
  expectDateToBeRecent: (date, maxAgeMs = 1000) => {
    const now = new Date();
    const testDate = new Date(date);
    const age = now - testDate;
    expect(age).toBeLessThan(maxAgeMs);
  }
};

// Setup et cleanup avant/après chaque test
beforeEach(() => {
  // Reset des mocks avant chaque test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup après chaque test si nécessaire
});
