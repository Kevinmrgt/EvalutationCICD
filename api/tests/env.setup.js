/**
 * Configuration des variables d'environnement pour les tests
 */

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.API_PREFIX = '/api';
process.env.LOG_LEVEL = 'silent';
process.env.RATE_LIMIT_WINDOW = '900000';
process.env.RATE_LIMIT_MAX = '1000'; // Plus permissif pour les tests
// Test JWT secret - this is only for testing purposes
process.env.JWT_SECRET = Buffer.from('test-jwt-key-for-testing-only').toString('base64');

// Désactiver les logs pendant les tests
process.env.SILENT_MODE = 'true';
