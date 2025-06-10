const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./config/logger');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const {
  requestCounter,
  detailedHealthCheck,
  getMetricsPrometheus,
  livenessProbe,
  readinessProbe
} = require('../../monitoring/health-checks');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request counting middleware
app.use(requestCounter);

// Health check endpoints
app.get('/health', async (req, res) => {
  try {
    const health = await detailedHealthCheck();
    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Kubernetes-style probes
app.get('/health/live', livenessProbe);
app.get('/health/ready', readinessProbe);

// Metrics endpoint (Prometheus-style)
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(getMetricsPrometheus());
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API d'évaluation CI/CD",
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Arrêt gracieux du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Arrêt gracieux du serveur...');
  process.exit(0);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 URL: http://localhost:${PORT}`);
  });
}

module.exports = app;
