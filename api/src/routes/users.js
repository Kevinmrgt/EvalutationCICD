const express = require('express');
const Joi = require('joi');
const router = express.Router();
const logger = require('../config/logger');
const { validateRequest } = require('../middleware/errorMiddleware');

// Simulation d'une base de données en mémoire
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', created: new Date() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', created: new Date() },
];
let nextId = 3;

// Schémas de validation
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'user').default('user'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'user').optional(),
});

// GET /api/users - Récupérer tous les utilisateurs
router.get('/', (req, res) => {
  logger.info('Récupération de tous les utilisateurs');

  const { page = 1, limit = 10, role } = req.query;

  let filteredUsers = users;

  // Filtrage par rôle si spécifié
  if (role) {
    filteredUsers = users.filter((user) => user.role === role);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.json({
    data: paginatedUsers,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredUsers.length / limit),
      totalUsers: filteredUsers.length,
      hasNext: endIndex < filteredUsers.length,
      hasPrev: startIndex > 0,
    },
  });
});

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    logger.warn(`Utilisateur non trouvé: ID ${id}`);
    return res.status(404).json({
      error: {
        message: 'Utilisateur non trouvé',
        statusCode: 404,
      },
    });
  }

  logger.info(`Récupération de l'utilisateur ID: ${id}`);
  res.json({ data: user });
});

// POST /api/users - Créer un nouvel utilisateur
router.post('/', validateRequest(createUserSchema), (req, res) => {
  const { name, email, role = 'user' } = req.validatedBody;

  // Vérifier si l'email existe déjà
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      error: {
        message: 'Un utilisateur avec cet email existe déjà',
        statusCode: 409,
      },
    });
  }

  const newUser = {
    id: nextId++,
    name,
    email,
    role,
    created: new Date(),
    updated: new Date(),
  };

  users.push(newUser);
  logger.info(`Nouvel utilisateur créé: ${name} (${email})`);

  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    data: newUser,
  });
});

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', validateRequest(updateUserSchema), (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      error: {
        message: 'Utilisateur non trouvé',
        statusCode: 404,
      },
    });
  }

  const updatedData = req.validatedBody;

  // Vérifier si le nouvel email existe déjà (si modifié)
  if (updatedData.email) {
    const existingUser = users.find((u) => u.email === updatedData.email && u.id !== id);
    if (existingUser) {
      return res.status(409).json({
        error: {
          message: 'Un utilisateur avec cet email existe déjà',
          statusCode: 409,
        },
      });
    }
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updatedData,
    updated: new Date(),
  };

  logger.info(`Utilisateur mis à jour: ID ${id}`);
  res.json({
    message: 'Utilisateur mis à jour avec succès',
    data: users[userIndex],
  });
});

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      error: {
        message: 'Utilisateur non trouvé',
        statusCode: 404,
      },
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];
  logger.info(`Utilisateur supprimé: ID ${id} (${deletedUser.email})`);

  res.json({
    message: 'Utilisateur supprimé avec succès',
    data: deletedUser,
  });
});

module.exports = router;
