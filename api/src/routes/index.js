const express = require('express');
const router = express.Router();

const usersRoutes = require('./users');
const tasksRoutes = require('./tasks');

// Documentation de l'API
router.get('/', (req, res) => {
  res.json({
    message: 'API d\'évaluation CI/CD',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
      health: '/health'
    },
    documentation: {
      swagger: '/api/docs',
      postman: '/api/postman'
    }
  });
});

// Routes pour les utilisateurs
router.use('/users', usersRoutes);

// Routes pour les tâches
router.use('/tasks', tasksRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint de documentation
router.get('/docs', (req, res) => {
  res.json({
    message: 'Documentation API',
    version: '1.0.0',
    endpoints: [
      {
        path: '/api/users',
        methods: ['GET', 'POST'],
        description: 'Gestion des utilisateurs'
      },
      {
        path: '/api/users/:id',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Opérations sur un utilisateur spécifique'
      },
      {
        path: '/api/tasks',
        methods: ['GET', 'POST'],
        description: 'Gestion des tâches'
      },
      {
        path: '/api/tasks/:id',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Opérations sur une tâche spécifique'
      }
    ]
  });
});

module.exports = router;
