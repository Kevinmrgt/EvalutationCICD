// 📊 Module de monitoring et health checks
// Objectif : Fournir des métriques simples pour le monitoring (2 points sur 20)

const os = require('os');

// Métriques globales simples
const metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0
  },
  startTime: Date.now()
};

/**
 * Middleware pour compter les requêtes
 */
const requestCounter = (req, res, next) => {
  metrics.requests.total++;

  // Intercepter la réponse pour compter succès/erreurs
  const originalSend = res.send;
  res.send = function (data) {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.errors++;
    }
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Health check basique
 */
const basicHealthCheck = () => {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
};

/**
 * Health check détaillé
 */
const detailedHealthCheck = async () => {
  const basic = basicHealthCheck();

  return {
    ...basic,
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        system: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024)
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: os.loadavg()
      }
    },
    application: {
      pid: process.pid,
      startTime: new Date(metrics.startTime).toISOString(),
      requests: {
        total: metrics.requests.total,
        success: metrics.requests.success,
        errors: metrics.requests.errors,
        errorRate: metrics.requests.total > 0 ? Math.round((metrics.requests.errors / metrics.requests.total) * 100) : 0
      }
    }
  };
};

/**
 * Métriques Prometheus-style (simple)
 */
const getMetricsPrometheus = () => {
  const uptime = Math.floor(process.uptime());
  const memoryUsage = process.memoryUsage();

  return `# HELP nodejs_app_uptime_seconds Uptime of the application
# TYPE nodejs_app_uptime_seconds counter
nodejs_app_uptime_seconds ${uptime}

# HELP nodejs_app_requests_total Total number of requests
# TYPE nodejs_app_requests_total counter
nodejs_app_requests_total ${metrics.requests.total}

# HELP nodejs_app_requests_success_total Total number of successful requests
# TYPE nodejs_app_requests_success_total counter
nodejs_app_requests_success_total ${metrics.requests.success}

# HELP nodejs_app_requests_errors_total Total number of error requests
# TYPE nodejs_app_requests_errors_total counter
nodejs_app_requests_errors_total ${metrics.requests.errors}

# HELP nodejs_memory_heap_used_bytes Memory heap used
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memoryUsage.heapUsed}

# HELP nodejs_memory_heap_total_bytes Memory heap total
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memoryUsage.heapTotal}`;
};

/**
 * Vérifier la santé des services externes (simulé)
 */
const checkExternalServices = async () => {
  // Simulation de vérification de services externes
  const services = [
    { name: 'database', status: 'healthy', responseTime: Math.floor(Math.random() * 50) + 10 },
    { name: 'redis', status: 'healthy', responseTime: Math.floor(Math.random() * 20) + 5 },
    { name: 'external_api', status: 'healthy', responseTime: Math.floor(Math.random() * 100) + 50 }
  ];

  return services;
};

/**
 * Endpoint de liveness probe
 */
const livenessProbe = (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
};

/**
 * Endpoint de readiness probe
 */
const readinessProbe = async (req, res) => {
  try {
    // Vérifications de base
    const services = await checkExternalServices();

    // Vérifier si tous les services sont healthy
    const allHealthy = services.every(service => service.status === 'healthy');

    if (allHealthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        services
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  requestCounter,
  basicHealthCheck,
  detailedHealthCheck,
  getMetricsPrometheus,
  checkExternalServices,
  livenessProbe,
  readinessProbe,
  metrics
};
