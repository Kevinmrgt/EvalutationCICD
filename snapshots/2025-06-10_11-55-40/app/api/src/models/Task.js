class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status || 'pending';
    this.priority = data.priority || 'medium';
    this.assignedTo = data.assignedTo || null;
    this.dueDate = data.dueDate || null;
    this.created = data.created || new Date();
    this.updated = data.updated || new Date();
  }

  // Méthodes statiques pour validation
  static getValidStatuses() {
    return ['pending', 'in-progress', 'completed', 'cancelled'];
  }

  static getValidPriorities() {
    return ['low', 'medium', 'high', 'urgent'];
  }

  static isValidStatus(status) {
    return Task.getValidStatuses().includes(status);
  }

  static isValidPriority(priority) {
    return Task.getValidPriorities().includes(priority);
  }

  // Méthode pour formater la tâche pour l'API
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      assignedTo: this.assignedTo,
      dueDate: this.dueDate,
      created: this.created,
      updated: this.updated,
      isOverdue: this.isOverdue(),
      daysSinceCreated: this.getDaysSinceCreated()
    };
  }

  // Méthode pour mettre à jour la tâche
  update(data) {
    if (data.title) {
      this.title = data.title;
    }
    if (data.description) {
      this.description = data.description;
    }
    if (data.status && Task.isValidStatus(data.status)) {
      this.status = data.status;
    }
    if (data.priority && Task.isValidPriority(data.priority)) {
      this.priority = data.priority;
    }
    if (data.assignedTo !== undefined) {
      this.assignedTo = data.assignedTo;
    }
    if (data.dueDate !== undefined) {
      this.dueDate = data.dueDate;
    }
    this.updated = new Date();
    return this;
  }

  // Méthode pour changer le statut
  changeStatus(newStatus) {
    if (!Task.isValidStatus(newStatus)) {
      throw new Error(`Statut invalide: ${newStatus}`);
    }

    const oldStatus = this.status;
    this.status = newStatus;
    this.updated = new Date();

    return {
      oldStatus,
      newStatus,
      timestamp: this.updated
    };
  }

  // Méthode pour vérifier si la tâche est en retard
  isOverdue() {
    if (!this.dueDate) {
      return false;
    }
    return new Date() > new Date(this.dueDate) && this.status !== 'completed';
  }

  // Méthode pour obtenir le nombre de jours depuis la création
  getDaysSinceCreated() {
    const now = new Date();
    const created = new Date(this.created);
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Méthode pour vérifier si la tâche est terminée
  isCompleted() {
    return this.status === 'completed';
  }

  // Méthode pour vérifier si la tâche est annulée
  isCancelled() {
    return this.status === 'cancelled';
  }

  // Méthode pour obtenir la couleur de priorité
  getPriorityColor() {
    const colors = {
      low: '#28a745', // Vert
      medium: '#ffc107', // Jaune
      high: '#fd7e14', // Orange
      urgent: '#dc3545' // Rouge
    };
    return colors[this.priority] || colors.medium;
  }

  // Méthode statique pour créer une nouvelle tâche
  static create(data) {
    if (!data.title || !data.description) {
      throw new Error('Le titre et la description sont requis');
    }

    if (data.status && !Task.isValidStatus(data.status)) {
      throw new Error(`Statut invalide: ${data.status}`);
    }

    if (data.priority && !Task.isValidPriority(data.priority)) {
      throw new Error(`Priorité invalide: ${data.priority}`);
    }

    return new Task({
      ...data,
      id: data.id || Date.now(), // ID temporaire si pas fourni
      created: new Date(),
      updated: new Date()
    });
  }

  // Méthode statique pour filtrer les tâches
  static filterTasks(tasks, filters = {}) {
    let filteredTasks = [...tasks];

    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    if (filters.assignedTo) {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === filters.assignedTo);
    }

    if (filters.overdue === true) {
      filteredTasks = filteredTasks.filter(task => task.isOverdue());
    }

    return filteredTasks;
  }
}

module.exports = Task;
