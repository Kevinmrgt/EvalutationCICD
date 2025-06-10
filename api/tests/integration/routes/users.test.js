const request = require('supertest');
const app = require('../../../src/app');

describe('Users API Routes', () => {
  let server;

  beforeAll(async () => {
    // Démarrer le serveur sur un port disponible
    server = app.listen(0);
  });

  afterAll(async () => {
    // Fermer le serveur après les tests
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app).get('/api/users').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      const response = await request(app).get('/api/users/1').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/99999').expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      const response = await request(app).post('/api/users').send(newUser).expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(newUser.name);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUser = {
        name: 'Missing Email',
      };

      const response = await request(app).post('/api/users').send(incompleteUser).expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/:id', () => {
    let createdUserId;

    beforeEach(async () => {
      const user = {
        name: 'Update Test User',
        email: 'update@example.com',
        role: 'user',
      };

      const response = await request(app).post('/api/users').send(user).expect(201);
      createdUserId = response.body.data.id;
    });

    it('should update user successfully', async () => {
      const updates = {
        name: 'Updated Name',
      };

      const response = await request(app).put(`/api/users/${createdUserId}`).send(updates).expect(200);

      expect(response.body.data.name).toBe(updates.name);
    });
  });

  describe('DELETE /api/users/:id', () => {
    let createdUserId;

    beforeEach(async () => {
      const user = {
        name: 'Delete Test User',
        email: 'delete@example.com',
        role: 'user',
      };

      const response = await request(app).post('/api/users').send(user).expect(201);
      createdUserId = response.body.data.id;
    });

    it('should delete user successfully', async () => {
      const response = await request(app).delete(`/api/users/${createdUserId}`).expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
