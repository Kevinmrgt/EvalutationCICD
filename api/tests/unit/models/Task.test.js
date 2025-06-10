const Task = require('../../../src/models/Task');

describe('Task Model', () => {
  describe('Constructor', () => {
    it('should create a task with valid data', () => {
      const taskData = testHelpers.createTestTask({
        id: 1,
        title: 'Test Task',
        description: 'This is a test task',
        status: 'in-progress',
        priority: 'high',
        assignedTo: 5,
        dueDate: new Date('2024-12-31')
      });

      const task = new Task(taskData);

      expect(task.id).toBe(1);
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('This is a test task');
      expect(task.status).toBe('in-progress');
      expect(task.priority).toBe('high');
      expect(task.assignedTo).toBe(5);
      expect(task.dueDate).toEqual(new Date('2024-12-31'));
      expect(task.created).toBeInstanceOf(Date);
      expect(task.updated).toBeInstanceOf(Date);
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
      expect(task.assignedTo).toBeNull();
      expect(task.dueDate).toBeNull();
      testHelpers.expectDateToBeRecent(task.created);
      testHelpers.expectDateToBeRecent(task.updated);
    });
  });

  describe('Static Methods', () => {
    describe('getValidStatuses', () => {
      it('should return array of valid statuses', () => {
        const statuses = Task.getValidStatuses();

        expect(statuses).toEqual(['pending', 'in-progress', 'completed', 'cancelled']);
        expect(Array.isArray(statuses)).toBe(true);
      });
    });

    describe('getValidPriorities', () => {
      it('should return array of valid priorities', () => {
        const priorities = Task.getValidPriorities();

        expect(priorities).toEqual(['low', 'medium', 'high', 'urgent']);
        expect(Array.isArray(priorities)).toBe(true);
      });
    });

    describe('isValidStatus', () => {
      it('should return true for valid statuses', () => {
        const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];

        validStatuses.forEach(status => {
          expect(Task.isValidStatus(status)).toBe(true);
        });
      });

      it('should return false for invalid statuses', () => {
        const invalidStatuses = ['invalid', 'done', 'todo', '', null, undefined];

        invalidStatuses.forEach(status => {
          expect(Task.isValidStatus(status)).toBe(false);
        });
      });
    });

    describe('isValidPriority', () => {
      it('should return true for valid priorities', () => {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];

        validPriorities.forEach(priority => {
          expect(Task.isValidPriority(priority)).toBe(true);
        });
      });

      it('should return false for invalid priorities', () => {
        const invalidPriorities = ['normal', 'critical', 'super', '', null, undefined];

        invalidPriorities.forEach(priority => {
          expect(Task.isValidPriority(priority)).toBe(false);
        });
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
        expect(task.status).toBe('pending');
        expect(task.priority).toBe('high');
        expect(task.id).toBeDefined();
        testHelpers.expectDateToBeRecent(task.created);
        testHelpers.expectDateToBeRecent(task.updated);
      });

      it('should throw error if title is missing', () => {
        const taskData = {
          description: 'Description without title'
        };

        expect(() => Task.create(taskData)).toThrow('Le titre et la description sont requis');
      });

      it('should throw error if description is missing', () => {
        const taskData = {
          title: 'Title without description'
        };

        expect(() => Task.create(taskData)).toThrow('Le titre et la description sont requis');
      });

      it('should throw error for invalid status', () => {
        const taskData = {
          title: 'Test Task',
          description: 'Test description',
          status: 'invalid-status'
        };

        expect(() => Task.create(taskData)).toThrow('Statut invalide: invalid-status');
      });

      it('should throw error for invalid priority', () => {
        const taskData = {
          title: 'Test Task',
          description: 'Test description',
          priority: 'invalid-priority'
        };

        expect(() => Task.create(taskData)).toThrow('Priorité invalide: invalid-priority');
      });
    });

    describe('filterTasks', () => {
      let tasks;

      beforeEach(() => {
        tasks = [
          new Task({
            id: 1,
            title: 'Task 1',
            description: 'Desc 1',
            status: 'pending',
            priority: 'low',
            assignedTo: 1
          }),
          new Task({
            id: 2,
            title: 'Task 2',
            description: 'Desc 2',
            status: 'in-progress',
            priority: 'high',
            assignedTo: 2
          }),
          new Task({
            id: 3,
            title: 'Task 3',
            description: 'Desc 3',
            status: 'completed',
            priority: 'medium',
            assignedTo: 1
          }),
          new Task({
            id: 4,
            title: 'Task 4',
            description: 'Desc 4',
            status: 'pending',
            priority: 'urgent',
            assignedTo: 3,
            dueDate: new Date('2020-01-01')
          })
        ];
      });

      it('should filter by status', () => {
        const filtered = Task.filterTasks(tasks, { status: 'pending' });

        expect(filtered).toHaveLength(2);
        expect(filtered.every(task => task.status === 'pending')).toBe(true);
      });

      it('should filter by priority', () => {
        const filtered = Task.filterTasks(tasks, { priority: 'high' });

        expect(filtered).toHaveLength(1);
        expect(filtered[0].priority).toBe('high');
      });

      it('should filter by assignedTo', () => {
        const filtered = Task.filterTasks(tasks, { assignedTo: 1 });

        expect(filtered).toHaveLength(2);
        expect(filtered.every(task => task.assignedTo === 1)).toBe(true);
      });

      it('should filter by overdue tasks', () => {
        const filtered = Task.filterTasks(tasks, { overdue: true });

        expect(filtered).toHaveLength(1);
        expect(filtered[0].isOverdue()).toBe(true);
      });

      it('should apply multiple filters', () => {
        const filtered = Task.filterTasks(tasks, {
          status: 'pending',
          assignedTo: 1
        });

        expect(filtered).toHaveLength(1);
        expect(filtered[0].status).toBe('pending');
        expect(filtered[0].assignedTo).toBe(1);
      });

      it('should return all tasks if no filters provided', () => {
        const filtered = Task.filterTasks(tasks, {});

        expect(filtered).toHaveLength(4);
      });
    });
  });

  describe('Instance Methods', () => {
    let task;

    beforeEach(() => {
      task = new Task(
        testHelpers.createTestTask({
          id: 1,
          title: 'Test Task',
          description: 'Test description',
          status: 'pending',
          priority: 'medium',
          assignedTo: 5
        })
      );
    });

    describe('toJSON', () => {
      it('should return task data with computed properties', () => {
        const json = task.toJSON();

        expect(json).toEqual({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          created: task.created,
          updated: task.updated,
          isOverdue: task.isOverdue(),
          daysSinceCreated: task.getDaysSinceCreated()
        });
      });
    });

    describe('update', () => {
      it('should update task properties', () => {
        const updatedTask = task.update({
          title: 'Updated Title',
          description: 'Updated description',
          status: 'in-progress',
          priority: 'high'
        });

        expect(updatedTask.title).toBe('Updated Title');
        expect(updatedTask.description).toBe('Updated description');
        expect(updatedTask.status).toBe('in-progress');
        expect(updatedTask.priority).toBe('high');
        expect(updatedTask).toBe(task); // Should return same instance
      });

      it('should not update invalid status', () => {
        const originalStatus = task.status;
        const updatedTask = task.update({ status: 'invalid-status' });

        expect(updatedTask.status).toBe(originalStatus);
      });

      it('should not update invalid priority', () => {
        const originalPriority = task.priority;
        const updatedTask = task.update({ priority: 'invalid-priority' });

        expect(updatedTask.priority).toBe(originalPriority);
      });

      it('should update the updated timestamp', () => {
        const originalUpdated = task.updated;

        const updatedTask = task.update({ title: 'New Title' });

        expect(updatedTask.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
      });

      it('should handle null values for assignedTo and dueDate', () => {
        task.assignedTo = 5;
        task.dueDate = new Date();

        const updatedTask = task.update({
          assignedTo: null,
          dueDate: null
        });

        expect(updatedTask.assignedTo).toBeNull();
        expect(updatedTask.dueDate).toBeNull();
      });
    });

    describe('changeStatus', () => {
      it('should change status successfully', () => {
        const result = task.changeStatus('in-progress');

        expect(task.status).toBe('in-progress');
        expect(result.oldStatus).toBe('pending');
        expect(result.newStatus).toBe('in-progress');
        expect(result.timestamp).toBeInstanceOf(Date);
        testHelpers.expectDateToBeRecent(result.timestamp);
      });

      it('should throw error for invalid status', () => {
        expect(() => task.changeStatus('invalid-status')).toThrow('Statut invalide: invalid-status');
      });

      it('should update the updated timestamp', () => {
        const originalUpdated = task.updated;

        task.changeStatus('completed');

        expect(task.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
      });
    });

    describe('isOverdue', () => {
      it('should return false if no due date', () => {
        task.dueDate = null;
        expect(task.isOverdue()).toBe(false);
      });

      it('should return false if due date is in the future', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        task.dueDate = futureDate;

        expect(task.isOverdue()).toBe(false);
      });

      it('should return true if due date is in the past and not completed', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        task.dueDate = pastDate;
        task.status = 'pending';

        expect(task.isOverdue()).toBe(true);
      });

      it('should return false if due date is in the past but task is completed', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        task.dueDate = pastDate;
        task.status = 'completed';

        expect(task.isOverdue()).toBe(false);
      });
    });

    describe('getDaysSinceCreated', () => {
      it('should return 0 for newly created task', () => {
        task.created = new Date();
        expect(task.getDaysSinceCreated()).toBe(0);
      });

      it('should return correct number of days', () => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        task.created = threeDaysAgo;

        expect(task.getDaysSinceCreated()).toBe(3);
      });
    });

    describe('isCompleted', () => {
      it('should return true for completed tasks', () => {
        task.status = 'completed';
        expect(task.isCompleted()).toBe(true);
      });

      it('should return false for non-completed tasks', () => {
        task.status = 'pending';
        expect(task.isCompleted()).toBe(false);
      });
    });

    describe('isCancelled', () => {
      it('should return true for cancelled tasks', () => {
        task.status = 'cancelled';
        expect(task.isCancelled()).toBe(true);
      });

      it('should return false for non-cancelled tasks', () => {
        task.status = 'pending';
        expect(task.isCancelled()).toBe(false);
      });
    });

    describe('getPriorityColor', () => {
      it('should return correct colors for each priority', () => {
        const expectedColors = {
          low: '#28a745',
          medium: '#ffc107',
          high: '#fd7e14',
          urgent: '#dc3545'
        };

        Object.entries(expectedColors).forEach(([priority, color]) => {
          task.priority = priority;
          expect(task.getPriorityColor()).toBe(color);
        });
      });

      it('should return medium color for unknown priority', () => {
        task.priority = 'unknown';
        expect(task.getPriorityColor()).toBe('#ffc107');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty object in constructor', () => {
      const task = new Task({});

      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
      expect(task.assignedTo).toBeNull();
      expect(task.dueDate).toBeNull();
      expect(task.created).toBeInstanceOf(Date);
      expect(task.updated).toBeInstanceOf(Date);
    });

    it('should handle null/undefined values gracefully', () => {
      const task = new Task({
        id: 1,
        title: null,
        description: undefined,
        status: null,
        priority: null
      });

      expect(task.title).toBeNull();
      expect(task.description).toBeUndefined();
      expect(task.status).toBe('pending'); // Default fallback
      expect(task.priority).toBe('medium'); // Default fallback
    });
  });
});
