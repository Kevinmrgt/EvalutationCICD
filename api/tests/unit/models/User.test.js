const User = require('../../../src/models/User');

describe('User Model', () => {
  describe('Constructor', () => {
    it('should create a user with valid data', () => {
      const userData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
      };

      const user = new User(userData);

      expect(user.id).toBe(1);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('admin');
    });

    it("should set default role to 'user' if not provided", () => {
      const userData = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const user = new User(userData);

      expect(user.role).toBe('user');
    });
  });

  describe('Static Methods', () => {
    describe('isValidEmail', () => {
      it('should return true for valid emails', () => {
        expect(User.isValidEmail('test@example.com')).toBe(true);
      });

      it('should return false for invalid emails', () => {
        expect(User.isValidEmail('invalid-email')).toBe(false);
      });
    });

    describe('create', () => {
      it('should create a new user with valid data', () => {
        const userData = {
          name: 'New User',
          email: 'new@example.com',
          role: 'admin',
        };

        const user = User.create(userData);

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe('New User');
        expect(user.email).toBe('new@example.com');
      });

      it('should throw error if name is missing', () => {
        const userData = {
          email: 'test@example.com',
        };

        expect(() => User.create(userData)).toThrow("Le nom et l'email sont requis");
      });
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(() => {
      user = new User({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });
    });

    describe('toJSON', () => {
      it('should return user data as JSON object', () => {
        const json = user.toJSON();

        expect(json).toHaveProperty('id');
        expect(json).toHaveProperty('name');
        expect(json).toHaveProperty('email');
      });
    });

    describe('update', () => {
      it('should update user name', () => {
        const updatedUser = user.update({ name: 'Updated Name' });

        expect(updatedUser.name).toBe('Updated Name');
      });
    });
  });
});
