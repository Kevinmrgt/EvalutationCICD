/**
 * Configuration des variables d'environnement pour les tests
 */

process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Port dynamique pour les tests
process.env.LOG_LEVEL = 'error'; // Réduire les logs pendant les tests
process.env.RATE_LIMIT_WINDOW = '900000';
process.env.RATE_LIMIT_MAX = '1000'; // Plus permissif pour les tests
process.env.JWT_SECRET = 'test-secret-key';

// Désactiver les logs en mode test
process.env.DISABLE_LOGGING = 'true';
