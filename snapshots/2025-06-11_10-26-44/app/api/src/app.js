const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const logger = require('./config/logger');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const swaggerSpec = require('./config/swagger');
const {
  requestCounter,
  detailedHealthCheck,
  getMetricsPrometheus,
  livenessProbe,
  readinessProbe,
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
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  },
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request counting middleware
app.use(requestCounter);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check détaillé
 *     description: Endpoint de vérification de santé avec métriques détaillées
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service en bonne santé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service indisponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/health', async (req, res) => {
  try {
    const health = await detailedHealthCheck();
    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Endpoint de vérification de vie (Kubernetes-style)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service vivant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 */
app.get('/health/live', livenessProbe);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Endpoint de vérification de disponibilité (Kubernetes-style)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service prêt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 */
app.get('/health/ready', readinessProbe);

// Metrics endpoint (Prometheus-style)
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(getMetricsPrometheus());
});

// Swagger Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation - CI/CD Evaluation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }),
);

// API routes
app.use('/api', routes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Point d'entrée de l'API
 *     description: Endpoint racine fournissant les informations de base de l'API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Informations de l'API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bienvenue sur l'API d'évaluation CI/CD"
 *                 version:
 *                   type: string
 *                   example: "1.1.1"
 *                 documentation:
 *                   type: string
 *                   example: "/api-docs"
 *                 health:
 *                   type: string
 *                   example: "/health"
 */
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API d'évaluation CI/CD",
    version: '1.1.1',
    documentation: '/api-docs',
    health: '/health',
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
