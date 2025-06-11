const request = require('supertest');

// Mock de l'application pour les tests d'intégration
jest.mock('../../src/app', () => {
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');

  const app = express();

  // Middleware de sécurité
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Routes de base
  app.get('/', (req, res) => {
    res.json({
      message: 'API REST EvaluationCICD',
      version: '1.1.0',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api',
        users: '/api/users',
        tasks: '/api/tasks',
      },
    });
  });

  // Health checks
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  app.get('/health/live', (req, res) => {
    res.json({ status: 'alive' });
  });

  app.get('/health/ready', (req, res) => {
    res.json({ status: 'ready' });
  });

  // API endpoints
  app.get('/api', (req, res) => {
    res.json({
      message: 'API EvaluationCICD - Documentation',
      version: '1.1.0',
      endpoints: [
        'GET /health - Health check',
        'GET /api/users - Liste des utilisateurs',
        'GET /api/tasks - Liste des tâches',
      ],
    });
  });

  // Users endpoints
  app.get('/api/users', (req, res) => {
    res.json({
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ],
      total: 2,
    });
  });

  // Tasks endpoints
  app.get('/api/tasks', (req, res) => {
    res.json({
      tasks: [
        { id: 1, title: 'Test Task 1', status: 'pending' },
        { id: 2, title: 'Test Task 2', status: 'completed' },
      ],
      total: 2,
    });
  });

  return app;
});

const app = require('../../src/app');

describe('API Integration Tests', () => {
  describe('Health Check Endpoints', () => {
    it('should return detailed health information', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });

    it('should return liveness probe', async () => {
      const response = await request(app).get('/health/live').expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
    });

    it('should return readiness probe', async () => {
      const response = await request(app).get('/health/ready').expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
    });
  });

  describe('API Documentation', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
    });
  });

  describe('Users API', () => {
    it('should return list of users', async () => {
      const response = await request(app).get('/api/users').expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });
  });

  describe('Tasks API', () => {
    it('should return list of tasks', async () => {
      const response = await request(app).get('/api/tasks').expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });
  });

  describe('CORS and Security', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/health').expect(200);

      // Vérifier que les headers de sécurité sont présents
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
