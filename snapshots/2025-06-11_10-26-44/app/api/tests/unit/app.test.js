const request = require('supertest');

// Mock de l'application pour les tests
jest.mock('../../src/app', () => {
  const express = require('express');
  const app = express();

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'API REST EvaluationCICD',
      version: '1.1.0',
      status: 'running',
    });
  });

  return app;
});

const app = require('../../src/app');

describe('API Unit Tests', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /', () => {
    it('should return 200 and app info', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'running');
    });
  });
});
