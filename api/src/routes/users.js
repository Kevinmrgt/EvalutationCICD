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

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Obtenir une liste paginée des utilisateurs avec filtrage optionnel
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *         description: Filtrer par rôle
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 */
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

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     description: Obtenir les détails d'un utilisateur spécifique
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     description: Créer un nouvel utilisateur dans le système
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Jean Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 default: user
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     description: Modifier les informations d'un utilisateur existant
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Jean Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur mis à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprimer définitivement un utilisateur du système
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur supprimé avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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
