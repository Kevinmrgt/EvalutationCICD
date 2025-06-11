const express = require('express');
const Joi = require('joi');
const router = express.Router();
const logger = require('../config/logger');
const { validateRequest } = require('../middleware/errorMiddleware');

// Simulation d'une base de données en mémoire
const tasks = [
  {
    id: 1,
    title: 'Configurer le pipeline CI/CD',
    description: "Mettre en place GitHub Actions pour l'automatisation",
    status: 'in-progress',
    priority: 'high',
    assignedTo: 1,
    created: new Date(),
    updated: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
  },
  {
    id: 2,
    title: 'Écrire les tests unitaires',
    description: 'Couvrir au moins 80% du code avec des tests Jest',
    status: 'pending',
    priority: 'medium',
    assignedTo: 2,
    created: new Date(),
    updated: new Date(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours
  },
];
let nextId = 3;

// Schémas de validation
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'cancelled').default('pending'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  assignedTo: Joi.number().integer().positive().optional(),
  dueDate: Joi.date().greater('now').optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'cancelled').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  assignedTo: Joi.number().integer().positive().allow(null).optional(),
  dueDate: Joi.date().allow(null).optional(),
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Récupérer toutes les tâches
 *     description: Obtenir une liste paginée des tâches avec filtrage optionnel
 *     tags: [Tasks]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *         description: Filtrer par statut
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filtrer par priorité
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: Filtrer par utilisateur assigné
 *     responses:
 *       200:
 *         description: Liste des tâches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   type: object
 *                 filters:
 *                   type: object
 */
router.get('/', (req, res) => {
  logger.info('Récupération de toutes les tâches');

  const { page = 1, limit = 10, status, priority, assignedTo } = req.query;

  let filteredTasks = tasks;

  // Filtrage par statut
  if (status) {
    filteredTasks = filteredTasks.filter((task) => task.status === status);
  }

  // Filtrage par priorité
  if (priority) {
    filteredTasks = filteredTasks.filter((task) => task.priority === priority);
  }

  // Filtrage par assignation
  if (assignedTo) {
    filteredTasks = filteredTasks.filter((task) => task.assignedTo === parseInt(assignedTo));
  }

  // Tri par date de création (plus récent en premier)
  filteredTasks.sort((a, b) => new Date(b.created) - new Date(a.created));

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  res.json({
    data: paginatedTasks,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredTasks.length / limit),
      totalTasks: filteredTasks.length,
      hasNext: endIndex < filteredTasks.length,
      hasPrev: startIndex > 0,
    },
    filters: {
      status: status || null,
      priority: priority || null,
      assignedTo: assignedTo ? parseInt(assignedTo) : null,
    },
  });
});

// GET /api/tasks/:id - Récupérer une tâche par ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    logger.warn(`Tâche non trouvée: ID ${id}`);
    return res.status(404).json({
      error: {
        message: 'Tâche non trouvée',
        statusCode: 404,
      },
    });
  }

  logger.info(`Récupération de la tâche ID: ${id}`);
  res.json({ data: task });
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Créer une nouvelle tâche
 *     description: Créer une nouvelle tâche dans le système
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "Finaliser le projet CI/CD"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: "Compléter la documentation et les tests"
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *                 default: pending
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               assignedTo:
 *                 type: integer
 *                 example: 1
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-31"
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', validateRequest(createTaskSchema), (req, res) => {
  const taskData = req.validatedBody;

  const newTask = {
    id: nextId++,
    ...taskData,
    created: new Date(),
    updated: new Date(),
  };

  tasks.push(newTask);
  logger.info(`Nouvelle tâche créée: ${newTask.title}`);

  res.status(201).json({
    message: 'Tâche créée avec succès',
    data: newTask,
  });
});

// PUT /api/tasks/:id - Mettre à jour une tâche
router.put('/:id', validateRequest(updateTaskSchema), (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: {
        message: 'Tâche non trouvée',
        statusCode: 404,
      },
    });
  }

  const updatedData = req.validatedBody;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updatedData,
    updated: new Date(),
  };

  logger.info(`Tâche mise à jour: ID ${id}`);
  res.json({
    message: 'Tâche mise à jour avec succès',
    data: tasks[taskIndex],
  });
});

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: {
        message: 'Tâche non trouvée',
        statusCode: 404,
      },
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  logger.info(`Tâche supprimée: ID ${id} (${deletedTask.title})`);

  res.json({
    message: 'Tâche supprimée avec succès',
    data: deletedTask,
  });
});

// PATCH /api/tasks/:id/status - Mettre à jour le statut d'une tâche
router.patch('/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: {
        message: 'Statut invalide',
        validStatuses,
        statusCode: 400,
      },
    });
  }

  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: {
        message: 'Tâche non trouvée',
        statusCode: 404,
      },
    });
  }

  const oldStatus = tasks[taskIndex].status;
  tasks[taskIndex].status = status;
  tasks[taskIndex].updated = new Date();

  logger.info(`Statut de la tâche ID ${id} changé de "${oldStatus}" à "${status}"`);

  res.json({
    message: 'Statut de la tâche mis à jour avec succès',
    data: tasks[taskIndex],
  });
});

module.exports = router;
