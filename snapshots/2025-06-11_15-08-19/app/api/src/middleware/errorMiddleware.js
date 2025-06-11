const logger = require('../config/logger');

// Middleware pour les routes non trouvées
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  logger.warn(`Route non trouvée: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  res.status(404);
  next(error);
};

// Middleware de gestion des erreurs
const errorHandler = (err, req, res) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Log de l'erreur
  logger.error('Erreur serveur:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode,
  });

  res.status(statusCode);

  const errorResponse = {
    message: err.message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // En développement, inclure la stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.json({
    error: errorResponse,
  });
};

// Middleware de validation des données
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      logger.warn('Validation error:', {
        details: error.details,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
      });

      return res.status(400).json({
        error: {
          message: 'Données de requête invalides',
          details: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  notFound,
  errorHandler,
  validateRequest,
};
