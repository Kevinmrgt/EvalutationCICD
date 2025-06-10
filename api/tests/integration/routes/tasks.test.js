const request = require('supertest');
const app = require('../../../src/app');

describe('Tasks API Routes', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('GET /api/tasks', () => {
    it('should return list of tasks', async () => {
      const response = await request(app).get('/api/tasks').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support filtering', async () => {
      const response = await request(app).get('/api/tasks?status=pending').expect(200);

      expect(response.body).toHaveProperty('filters');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task by ID', async () => {
      const response = await request(app).get('/api/tasks/1').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).get('/api/tasks/99999').expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Test Task',
        description: 'This is a new test task',
        status: 'pending',
        priority: 'high',
      };

      const response = await request(app).post('/api/tasks').send(newTask).expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.title).toBe(newTask.title);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteTask = {
        title: 'Missing Description',
      };

      const response = await request(app).post('/api/tasks').send(incompleteTask).expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let createdTaskId;

    beforeEach(async () => {
      const task = {
        title: 'Update Test Task',
        description: 'Task for update testing',
      };

      const response = await request(app).post('/api/tasks').send(task).expect(201);
      createdTaskId = response.body.data.id;
    });

    it('should update task successfully', async () => {
      const updates = {
        title: 'Updated Task Title',
      };

      const response = await request(app).put(`/api/tasks/${createdTaskId}`).send(updates).expect(200);

      expect(response.body.data.title).toBe(updates.title);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let createdTaskId;

    beforeEach(async () => {
      const task = {
        title: 'Delete Test Task',
        description: 'Task for deletion testing',
      };

      const response = await request(app).post('/api/tasks').send(task).expect(201);
      createdTaskId = response.body.data.id;
    });

    it('should delete task successfully', async () => {
      const response = await request(app).delete(`/api/tasks/${createdTaskId}`).expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
