const request = require('supertest');
const app = require('../../../src/app');

describe('Tasks API Routes', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  describe('GET /api/tasks', () => {
    it('should return list of tasks', async () => {
      const response = await request(app).get('/api/tasks').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('filters');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Vérifier la structure d'une tâche
      const task = response.body.data[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('created');
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/api/tasks?page=1&limit=1').expect(200);

      expect(response.body.pagination).toEqual({
        currentPage: 1,
        totalPages: expect.any(Number),
        totalTasks: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: false
      });

      expect(response.body.data).toHaveLength(1);
    });

    it('should support status filtering', async () => {
      const response = await request(app).get('/api/tasks?status=pending').expect(200);

      if (response.body.data.length > 0) {
        response.body.data.forEach(task => {
          expect(task.status).toBe('pending');
        });
      }

      expect(response.body.filters.status).toBe('pending');
    });

    it('should support priority filtering', async () => {
      const response = await request(app).get('/api/tasks?priority=high').expect(200);

      if (response.body.data.length > 0) {
        response.body.data.forEach(task => {
          expect(task.priority).toBe('high');
        });
      }

      expect(response.body.filters.priority).toBe('high');
    });

    it('should support assignedTo filtering', async () => {
      const response = await request(app).get('/api/tasks?assignedTo=1').expect(200);

      if (response.body.data.length > 0) {
        response.body.data.forEach(task => {
          expect(task.assignedTo).toBe(1);
        });
      }

      expect(response.body.filters.assignedTo).toBe(1);
    });

    it('should support multiple filters', async () => {
      const response = await request(app).get('/api/tasks?status=pending&priority=high').expect(200);

      expect(response.body.filters).toEqual({
        status: 'pending',
        priority: 'high',
        assignedTo: null
      });
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task by ID', async () => {
      const response = await request(app).get('/api/tasks/1').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(1);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('priority');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).get('/api/tasks/99999').expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Tâche non trouvée');
    });

    it('should handle invalid ID format', async () => {
      const response = await request(app).get('/api/tasks/invalid').expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Test Task',
        description: 'This is a new test task created by integration tests',
        status: 'pending',
        priority: 'high',
        assignedTo: 1
      };

      const response = await request(app).post('/api/tasks').send(newTask).expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.title).toBe(newTask.title);
      expect(response.body.data.description).toBe(newTask.description);
      expect(response.body.data.status).toBe(newTask.status);
      expect(response.body.data.priority).toBe(newTask.priority);
      expect(response.body.data.assignedTo).toBe(newTask.assignedTo);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('created');
    });

    it('should use default values if not provided', async () => {
      const minimalTask = {
        title: 'Minimal Task',
        description: 'This task has minimal required fields'
      };

      const response = await request(app).post('/api/tasks').send(minimalTask).expect(201);

      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.priority).toBe('medium');
      expect(response.body.data.assignedTo).toBeNull();
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteTask = {
        title: 'Missing Description'
      };

      const response = await request(app).post('/api/tasks').send(incompleteTask).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Données de requête invalides');
      expect(response.body.error).toHaveProperty('details');
    });

    it('should return 400 for invalid status', async () => {
      const invalidTask = {
        title: 'Invalid Status Task',
        description: 'This task has an invalid status',
        status: 'invalid-status'
      };

      const response = await request(app).post('/api/tasks').send(invalidTask).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });

    it('should return 400 for invalid priority', async () => {
      const invalidTask = {
        title: 'Invalid Priority Task',
        description: 'This task has an invalid priority',
        priority: 'invalid-priority'
      };

      const response = await request(app).post('/api/tasks').send(invalidTask).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });

    it('should handle title length validation', async () => {
      const shortTitleTask = {
        title: 'AB', // Trop court
        description: 'This task has a title that is too short'
      };

      const response = await request(app).post('/api/tasks').send(shortTitleTask).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });

    it('should handle description length validation', async () => {
      const shortDescTask = {
        title: 'Short Description Task',
        description: 'Short' // Trop court
      };

      const response = await request(app).post('/api/tasks').send(shortDescTask).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });

    it('should validate future due date', async () => {
      const pastDueTask = {
        title: 'Past Due Task',
        description: 'This task has a due date in the past',
        dueDate: '2020-01-01'
      };

      const response = await request(app).post('/api/tasks').send(pastDueTask).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let createdTaskId;

    beforeEach(async () => {
      // Créer une tâche pour les tests de mise à jour
      const task = {
        title: 'Update Test Task',
        description: 'This task will be updated during tests',
        status: 'pending',
        priority: 'medium'
      };

      const response = await request(app).post('/api/tasks').send(task).expect(201);

      createdTaskId = response.body.data.id;
    });

    it('should update task successfully', async () => {
      const updates = {
        title: 'Updated Task Title',
        description: 'Updated task description',
        status: 'in-progress',
        priority: 'high',
        assignedTo: 2
      };

      const response = await request(app).put(`/api/tasks/${createdTaskId}`).send(updates).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.priority).toBe(updates.priority);
      expect(response.body.data.assignedTo).toBe(updates.assignedTo);
      expect(response.body.data).toHaveProperty('updated');
    });

    it('should update partial data', async () => {
      const updates = {
        title: 'Only Title Updated'
      };

      const response = await request(app).put(`/api/tasks/${createdTaskId}`).send(updates).expect(200);

      expect(response.body.data.title).toBe(updates.title);
      // Les autres champs doivent rester inchangés
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 404 for non-existent task', async () => {
      const updates = {
        title: 'Non-existent Task'
      };

      const response = await request(app).put('/api/tasks/99999').send(updates).expect(404);

      expect(response.body.error.message).toBe('Tâche non trouvée');
    });

    it('should return 400 for invalid status in update', async () => {
      const updates = {
        status: 'invalid-status'
      };

      const response = await request(app).put(`/api/tasks/${createdTaskId}`).send(updates).expect(400);

      expect(response.body.error.message).toBe('Données de requête invalides');
    });

    it('should handle null values for optional fields', async () => {
      const updates = {
        assignedTo: null,
        dueDate: null
      };

      const response = await request(app).put(`/api/tasks/${createdTaskId}`).send(updates).expect(200);

      expect(response.body.data.assignedTo).toBeNull();
      expect(response.body.data.dueDate).toBeNull();
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let createdTaskId;

    beforeEach(async () => {
      // Créer une tâche pour les tests de suppression
      const task = {
        title: 'Delete Test Task',
        description: 'This task will be deleted during tests'
      };

      const response = await request(app).post('/api/tasks').send(task).expect(201);

      createdTaskId = response.body.data.id;
    });

    it('should delete task successfully', async () => {
      const response = await request(app).delete(`/api/tasks/${createdTaskId}`).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Tâche supprimée avec succès');
      expect(response.body.data.id).toBe(createdTaskId);

      // Vérifier que la tâche a bien été supprimée
      await request(app).get(`/api/tasks/${createdTaskId}`).expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).delete('/api/tasks/99999').expect(404);

      expect(response.body.error.message).toBe('Tâche non trouvée');
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    let createdTaskId;

    beforeEach(async () => {
      const task = {
        title: 'Status Test Task',
        description: 'This task will have its status changed',
        status: 'pending'
      };

      const response = await request(app).post('/api/tasks').send(task).expect(201);

      createdTaskId = response.body.data.id;
    });

    it('should change task status successfully', async () => {
      const statusUpdate = {
        status: 'in-progress'
      };

      const response = await request(app).patch(`/api/tasks/${createdTaskId}/status`).send(statusUpdate).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.data.status).toBe('in-progress');
      expect(response.body.data).toHaveProperty('updated');
    });

    it('should return 400 for invalid status', async () => {
      const statusUpdate = {
        status: 'invalid-status'
      };

      const response = await request(app).patch(`/api/tasks/${createdTaskId}/status`).send(statusUpdate).expect(400);

      expect(response.body.error.message).toBe('Statut invalide');
      expect(response.body.error).toHaveProperty('validStatuses');
    });

    it('should return 400 for missing status', async () => {
      const response = await request(app).patch(`/api/tasks/${createdTaskId}/status`).send({}).expect(400);

      expect(response.body.error.message).toBe('Statut invalide');
    });

    it('should return 404 for non-existent task', async () => {
      const statusUpdate = {
        status: 'completed'
      };

      const response = await request(app).patch('/api/tasks/99999/status').send(statusUpdate).expect(404);

      expect(response.body.error.message).toBe('Tâche non trouvée');
    });

    it('should handle all valid status transitions', async () => {
      const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];

      for (const status of validStatuses) {
        const response = await request(app).patch(`/api/tasks/${createdTaskId}/status`).send({ status }).expect(200);

        expect(response.body.data.status).toBe(status);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send('invalid-json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return proper error structure', async () => {
      const response = await request(app).get('/api/tasks/99999').expect(404);

      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('statusCode');
      expect(response.body.error.statusCode).toBe(404);
    });

    it('should handle validation errors with details', async () => {
      const invalidTask = {
        title: '', // Titre vide
        description: 'Valid description',
        status: 'invalid-status'
      };

      const response = await request(app).post('/api/tasks').send(invalidTask).expect(400);

      expect(response.body.error).toHaveProperty('details');
      expect(Array.isArray(response.body.error.details)).toBe(true);
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency across operations', async () => {
      // Créer une tâche
      const task = {
        title: 'Consistency Test Task',
        description: 'Testing data consistency',
        priority: 'high'
      };

      const createResponse = await request(app).post('/api/tasks').send(task).expect(201);

      const taskId = createResponse.body.data.id;

      // Vérifier la récupération
      const getResponse = await request(app).get(`/api/tasks/${taskId}`).expect(200);

      expect(getResponse.body.data.title).toBe(task.title);
      expect(getResponse.body.data.priority).toBe(task.priority);

      // Mettre à jour
      const updates = {
        title: 'Updated Consistency Task',
        status: 'completed'
      };

      const updateResponse = await request(app).put(`/api/tasks/${taskId}`).send(updates).expect(200);

      expect(updateResponse.body.data.title).toBe(updates.title);
      expect(updateResponse.body.data.status).toBe(updates.status);
      expect(updateResponse.body.data.priority).toBe(task.priority); // Unchanged

      // Vérifier la suppression
      await request(app).delete(`/api/tasks/${taskId}`).expect(200);

      await request(app).get(`/api/tasks/${taskId}`).expect(404);
    });
  });
});
