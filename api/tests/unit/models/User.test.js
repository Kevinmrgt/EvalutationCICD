const User = require('../../../src/models/User');

describe('User Model', () => {
  describe('Constructor', () => {
    it('should create a user with valid data', () => {
      const userData = testHelpers.createTestUser({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
      });

      const user = new User(userData);

      expect(user.id).toBe(1);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('admin');
      expect(user.created).toBeInstanceOf(Date);
      expect(user.updated).toBeInstanceOf(Date);
    });

    it('should set default role to "user" if not provided', () => {
      const userData = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      const user = new User(userData);

      expect(user.role).toBe('user');
    });

    it('should set default dates if not provided', () => {
      const userData = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      };

      const user = new User(userData);

      testHelpers.expectDateToBeRecent(user.created);
      testHelpers.expectDateToBeRecent(user.updated);
    });
  });

  describe('Static Methods', () => {
    describe('isValidEmail', () => {
      it('should return true for valid emails', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'admin+tag@company.org',
          'user123@test-domain.com'
        ];

        validEmails.forEach(email => {
          expect(User.isValidEmail(email)).toBe(true);
        });
      });

      it('should return false for invalid emails', () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          'user@.com',
          'user name@domain.com',
          'user@domain.',
          ''
        ];

        invalidEmails.forEach(email => {
          expect(User.isValidEmail(email)).toBe(false);
        });
      });
    });

    describe('isValidRole', () => {
      it('should return true for valid roles', () => {
        expect(User.isValidRole('admin')).toBe(true);
        expect(User.isValidRole('user')).toBe(true);
      });

      it('should return false for invalid roles', () => {
        const invalidRoles = ['manager', 'guest', 'superadmin', '', null, undefined];

        invalidRoles.forEach(role => {
          expect(User.isValidRole(role)).toBe(false);
        });
      });
    });

    describe('create', () => {
      it('should create a new user with valid data', () => {
        const userData = {
          name: 'New User',
          email: 'new@example.com',
          role: 'admin'
        };

        const user = User.create(userData);

        expect(user).toBeInstanceOf(User);
        expect(user.name).toBe('New User');
        expect(user.email).toBe('new@example.com');
        expect(user.role).toBe('admin');
        expect(user.id).toBeDefined();
        testHelpers.expectDateToBeRecent(user.created);
        testHelpers.expectDateToBeRecent(user.updated);
      });

      it('should throw error if name is missing', () => {
        const userData = {
          email: 'test@example.com'
        };

        expect(() => User.create(userData)).toThrow('Le nom et l\'email sont requis');
      });

      it('should throw error if email is missing', () => {
        const userData = {
          name: 'Test User'
        };

        expect(() => User.create(userData)).toThrow('Le nom et l\'email sont requis');
      });

      it('should throw error for invalid email format', () => {
        const userData = {
          name: 'Test User',
          email: 'invalid-email'
        };

        expect(() => User.create(userData)).toThrow('Format d\'email invalide');
      });
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(() => {
      user = new User(
        testHelpers.createTestUser({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        })
      );
    });

    describe('toJSON', () => {
      it('should return user data as JSON object', () => {
        const json = user.toJSON();

        expect(json).toEqual({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created: user.created,
          updated: user.updated
        });
      });
    });

    describe('update', () => {
      it('should update user name', () => {
        const originalUpdated = user.updated;

        // Attendre un peu pour voir la différence de timestamp
        setTimeout(() => {
          const updatedUser = user.update({ name: 'Updated Name' });

          expect(updatedUser.name).toBe('Updated Name');
          expect(updatedUser.updated).not.toEqual(originalUpdated);
          expect(updatedUser).toBe(user); // Should return same instance
        }, 10);
      });

      it('should update user email if valid', () => {
        const updatedUser = user.update({ email: 'newemail@example.com' });

        expect(updatedUser.email).toBe('newemail@example.com');
      });

      it('should not update email if invalid', () => {
        const originalEmail = user.email;
        const updatedUser = user.update({ email: 'invalid-email' });

        expect(updatedUser.email).toBe(originalEmail);
      });

      it('should update user role if valid', () => {
        const updatedUser = user.update({ role: 'admin' });

        expect(updatedUser.role).toBe('admin');
      });

      it('should not update role if invalid', () => {
        const originalRole = user.role;
        const updatedUser = user.update({ role: 'invalid-role' });

        expect(updatedUser.role).toBe(originalRole);
      });

      it('should update multiple fields at once', () => {
        const updatedUser = user.update({
          name: 'Multi Update',
          email: 'multi@example.com',
          role: 'admin'
        });

        expect(updatedUser.name).toBe('Multi Update');
        expect(updatedUser.email).toBe('multi@example.com');
        expect(updatedUser.role).toBe('admin');
      });

      it('should update the updated timestamp', () => {
        const originalUpdated = user.updated;

        const updatedUser = user.update({ name: 'New Name' });

        expect(updatedUser.updated.getTime()).toBeGreaterThan(originalUpdated.getTime());
      });
    });

    describe('isAdmin', () => {
      it('should return true for admin users', () => {
        user.role = 'admin';
        expect(user.isAdmin()).toBe(true);
      });

      it('should return false for non-admin users', () => {
        user.role = 'user';
        expect(user.isAdmin()).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty object in constructor', () => {
      const user = new User({});

      expect(user.role).toBe('user');
      expect(user.created).toBeInstanceOf(Date);
      expect(user.updated).toBeInstanceOf(Date);
    });

    it('should handle null/undefined values gracefully', () => {
      const user = new User({
        id: 1,
        name: null,
        email: undefined,
        role: null
      });

      expect(user.name).toBeNull();
      expect(user.email).toBeUndefined();
      expect(user.role).toBe('user'); // Default fallback
    });
  });
});
