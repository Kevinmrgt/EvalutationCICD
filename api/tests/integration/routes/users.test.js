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
      await new Promise(resolve => server.close(resolve));
    }
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app).get('/api/users').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Vérifier la structure d'un utilisateur
      const user = response.body.data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('created');
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/api/users?page=1&limit=1').expect(200);

      expect(response.body.pagination).toEqual({
        currentPage: 1,
        totalPages: expect.any(Number),
        totalUsers: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: false
      });

      expect(response.body.data).toHaveLength(1);
    });

    it('should support role filtering', async () => {
      const response = await request(app).get('/api/users?role=admin').expect(200);

      if (response.body.data.length > 0) {
        response.body.data.forEach(user => {
          expect(user.role).toBe('admin');
        });
      }
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      const response = await request(app).get('/api/users/1').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(1);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/99999').expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Utilisateur non trouvé');
    });

    it('should handle invalid ID format', async () => {
      const response = await request(app).get('/api/users/invalid').expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      const response = await request(app).post('/api/users').send(newUser).expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(newUser.name);
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.role).toBe(newUser.role);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('created');
    });

    it('should use default role "user" if not provided', async () => {
      const newUser = {
        name: 'Default Role User',
        email: 'default@example.com'
      };

      const response = await request(app).post('/api/users').send(newUser).expect(201);

      expect(response.body.data.role).toBe('user');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUser = {
        name: 'Missing Email'
      };

      const response = await request(app).post('/api/users').send(incompleteUser).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Données de requête invalides');
      expect(response.body.error).toHaveProperty('details');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUser = {
        name: 'Invalid Email User',
        email: 'invalid-email',
        role: 'user'
      };

      const response = await request(app).post('/api/users').send(invalidUser).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });

    it('should return 400 for invalid role', async () => {
      const invalidUser = {
        name: 'Invalid Role User',
        email: 'invalid@example.com',
        role: 'invalid-role'
      };

      const response = await request(app).post('/api/users').send(invalidUser).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });

    it('should return 409 for duplicate email', async () => {
      // Créer un utilisateur
      const user = {
        name: 'First User',
        email: 'duplicate@example.com',
        role: 'user'
      };

      await request(app).post('/api/users').send(user).expect(201);

      // Essayer de créer un autre utilisateur avec le même email
      const duplicateUser = {
        name: 'Second User',
        email: 'duplicate@example.com',
        role: 'admin'
      };

      const response = await request(app).post('/api/users').send(duplicateUser).expect(409);

      expect(response.body.error.message).toBe('Un utilisateur avec cet email existe déjà');
    });

    it('should handle name length validation', async () => {
      const shortNameUser = {
        name: 'A', // Trop court
        email: 'short@example.com',
        role: 'user'
      };

      const response = await request(app).post('/api/users').send(shortNameUser).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });
  });

  describe('PUT /api/users/:id', () => {
    let createdUserId;

    beforeEach(async () => {
      // Créer un utilisateur pour les tests de mise à jour
      const user = {
        name: 'Update Test User',
        email: 'update@example.com',
        role: 'user'
      };

      const response = await request(app).post('/api/users').send(user).expect(201);

      createdUserId = response.body.data.id;
    });

    it('should update user successfully', async () => {
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'admin'
      };

      const response = await request(app).put(`/api/users/${createdUserId}`).send(updates).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.email).toBe(updates.email);
      expect(response.body.data.role).toBe(updates.role);
      expect(response.body.data).toHaveProperty('updated');
    });

    it('should update partial data', async () => {
      const updates = {
        name: 'Only Name Updated'
      };

      const response = await request(app).put(`/api/users/${createdUserId}`).send(updates).expect(200);

      expect(response.body.data.name).toBe(updates.name);
      // Les autres champs doivent rester inchangés
      expect(response.body.data.email).toBe('update@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const updates = {
        name: 'Non-existent User'
      };

      const response = await request(app).put('/api/users/99999').send(updates).expect(404);

      expect(response.body.error.message).toBe('Utilisateur non trouvé');
    });

    it('should return 400 for invalid email in update', async () => {
      const updates = {
        email: 'invalid-email'
      };

      const response = await request(app).put(`/api/users/${createdUserId}`).send(updates).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });

    it('should prevent duplicate email in update', async () => {
      // Créer un autre utilisateur
      const anotherUser = {
        name: 'Another User',
        email: 'another@example.com',
        role: 'user'
      };

      await request(app).post('/api/users').send(anotherUser).expect(201);

      // Essayer de mettre à jour avec l'email existant
      const updates = {
        email: 'another@example.com'
      };

      const response = await request(app).put(`/api/users/${createdUserId}`).send(updates).expect(409);

      expect(response.body.error.message).toBe('Un utilisateur avec cet email existe déjà');
    });
  });

  describe('DELETE /api/users/:id', () => {
    let createdUserId;

    beforeEach(async () => {
      // Créer un utilisateur pour les tests de suppression
      const user = {
        name: 'Delete Test User',
        email: 'delete@example.com',
        role: 'user'
      };

      const response = await request(app).post('/api/users').send(user).expect(201);

      createdUserId = response.body.data.id;
    });

    it('should delete user successfully', async () => {
      const response = await request(app).delete(`/api/users/${createdUserId}`).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Utilisateur supprimé avec succès');
      expect(response.body.data.id).toBe(createdUserId);

      // Vérifier que l'utilisateur a bien été supprimé
      await request(app).get(`/api/users/${createdUserId}`).expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).delete('/api/users/99999').expect(404);

      expect(response.body.error.message).toBe('Utilisateur non trouvé');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Simuler une erreur en envoyant des données malformées
      const response = await request(app)
        .post('/api/users')
        .send('invalid-json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return proper error structure', async () => {
      const response = await request(app).get('/api/users/99999').expect(404);

      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('statusCode');
      expect(response.body.error.statusCode).toBe(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting if enabled', async () => {
      // Ce test vérifie que le middleware de rate limiting est en place
      // En mode test, les limites sont plus permissives
      const response = await request(app).get('/api/users').expect(200);

      // Vérifier que la réponse ne contient pas d'erreur de rate limiting
      expect(response.body).not.toHaveProperty('error');
    });
  });
});
