class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role || 'user';
    this.created = data.created || new Date();
    this.updated = data.updated || new Date();
  }

  // Méthode pour valider l'email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Méthode pour valider le rôle
  static isValidRole(role) {
    const validRoles = ['admin', 'user'];
    return validRoles.includes(role);
  }

  // Méthode pour formater l'utilisateur pour l'API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      created: this.created,
      updated: this.updated
    };
  }

  // Méthode pour mettre à jour l'utilisateur
  update(data) {
    if (data.name) {
      this.name = data.name;
    }
    if (data.email && User.isValidEmail(data.email)) {
      this.email = data.email;
    }
    if (data.role && User.isValidRole(data.role)) {
      this.role = data.role;
    }
    this.updated = new Date();
    return this;
  }

  // Méthode pour vérifier si l'utilisateur est admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Méthode statique pour créer un nouvel utilisateur
  static create(data) {
    if (!data.name || !data.email) {
      throw new Error('Le nom et l\'email sont requis');
    }

    if (!User.isValidEmail(data.email)) {
      throw new Error('Format d\'email invalide');
    }

    return new User({
      ...data,
      id: data.id || Date.now(), // ID temporaire si pas fourni
      created: new Date(),
      updated: new Date()
    });
  }
}

module.exports = User;
