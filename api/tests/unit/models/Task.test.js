const Task = require('../../../src/models/Task');

describe('Task Model', () => {
  describe('Constructor', () => {
    it('should create a task with valid data', () => {
      const taskData = {
        id: 1,
        title: 'Test Task',
        description: 'This is a test task',
        status: 'in-progress',
        priority: 'high'
      };

      const task = new Task(taskData);

      expect(task.id).toBe(1);
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('This is a test task');
      expect(task.status).toBe('in-progress');
      expect(task.priority).toBe('high');
    });

    it('should set default values if not provided', () => {
      const taskData = {
        id: 1,
        title: 'Simple Task',
        description: 'Simple description'
      };

      const task = new Task(taskData);

      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
    });
  });

  describe('Static Methods', () => {
    describe('isValidStatus', () => {
      it('should return true for valid statuses', () => {
        expect(Task.isValidStatus('pending')).toBe(true);
        expect(Task.isValidStatus('completed')).toBe(true);
      });

      it('should return false for invalid statuses', () => {
        expect(Task.isValidStatus('invalid')).toBe(false);
      });
    });

    describe('create', () => {
      it('should create a new task with valid data', () => {
        const taskData = {
          title: 'New Task',
          description: 'This is a new task',
          status: 'pending',
          priority: 'high'
        };

        const task = Task.create(taskData);

        expect(task).toBeInstanceOf(Task);
        expect(task.title).toBe('New Task');
        expect(task.description).toBe('This is a new task');
      });

      it('should throw error if title is missing', () => {
        const taskData = {
          description: 'Description without title'
        };

        expect(() => Task.create(taskData)).toThrow('Le titre et la description sont requis');
      });
    });
  });

  describe('Instance Methods', () => {
    let task;

    beforeEach(() => {
      task = new Task({
        id: 1,
        title: 'Test Task',
        description: 'Test description',
        status: 'pending',
        priority: 'medium'
      });
    });

    describe('toJSON', () => {
      it('should return task data as JSON object', () => {
        const json = task.toJSON();

        expect(json).toHaveProperty('id');
        expect(json).toHaveProperty('title');
        expect(json).toHaveProperty('description');
      });
    });

    describe('update', () => {
      it('should update task title', () => {
        const updatedTask = task.update({ title: 'Updated Title' });

        expect(updatedTask.title).toBe('Updated Title');
      });
    });
  });
});
