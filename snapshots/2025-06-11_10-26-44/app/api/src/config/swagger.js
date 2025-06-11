const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: "API d'évaluation CI/CD",
    version: '1.1.1',
    description: 'API REST pour une application mobile avec pipeline CI/CD complet',
    contact: {
      name: 'Kevin - Evaluation YNOV DevOps',
      email: 'kevin@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Serveur de développement',
    },
    {
      url: 'https://staging.example.com/api',
      description: 'Serveur de staging',
    },
    {
      url: 'https://production.example.com/api',
      description: 'Serveur de production',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          id: {
            type: 'integer',
            description: "Identifiant unique de l'utilisateur",
            example: 1,
          },
          name: {
            type: 'string',
            description: "Nom de l'utilisateur",
            example: 'Jean Dupont',
          },
          email: {
            type: 'string',
            format: 'email',
            description: "Adresse email de l'utilisateur",
            example: 'jean.dupont@example.com',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création',
            example: '2023-12-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière modification',
            example: '2023-12-01T10:00:00Z',
          },
        },
      },
      Task: {
        type: 'object',
        required: ['title', 'userId'],
        properties: {
          id: {
            type: 'integer',
            description: 'Identifiant unique de la tâche',
            example: 1,
          },
          title: {
            type: 'string',
            description: 'Titre de la tâche',
            example: 'Finaliser le projet CI/CD',
          },
          description: {
            type: 'string',
            description: 'Description détaillée de la tâche',
            example: 'Compléter la documentation et les tests',
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed'],
            description: 'Statut de la tâche',
            example: 'pending',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Priorité de la tâche',
            example: 'high',
          },
          userId: {
            type: 'integer',
            description: "ID de l'utilisateur assigné",
            example: 1,
          },
          dueDate: {
            type: 'string',
            format: 'date',
            description: "Date d'échéance",
            example: '2023-12-31',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création',
            example: '2023-12-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière modification',
            example: '2023-12-01T10:00:00Z',
          },
        },
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['OK', 'WARNING', 'ERROR'],
            description: 'Statut général du service',
            example: 'OK',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp de la vérification',
            example: '2023-12-01T10:00:00Z',
          },
          version: {
            type: 'string',
            description: "Version de l'application",
            example: '1.1.1',
          },
          environment: {
            type: 'string',
            description: "Environnement d'exécution",
            example: 'development',
          },
          uptime: {
            type: 'string',
            description: 'Temps de fonctionnement',
            example: '2h 30m 45s',
          },
          memory: {
            type: 'object',
            properties: {
              used: {
                type: 'string',
                example: '45.2 MB',
              },
              free: {
                type: 'string',
                example: '154.8 MB',
              },
              total: {
                type: 'string',
                example: '200.0 MB',
              },
              percentage: {
                type: 'number',
                example: 22.6,
              },
            },
          },
          cpu: {
            type: 'object',
            properties: {
              usage: {
                type: 'number',
                example: 15.2,
              },
              loadAverage: {
                type: 'array',
                items: {
                  type: 'number',
                },
                example: [0.5, 0.3, 0.1],
              },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: "Message d'erreur",
            example: 'Ressource non trouvée',
          },
          message: {
            type: 'string',
            description: 'Message détaillé',
            example: "L'utilisateur avec l'ID 999 n'existe pas",
          },
          status: {
            type: 'integer',
            description: 'Code de statut HTTP',
            example: 404,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: "Timestamp de l'erreur",
            example: '2023-12-01T10:00:00Z',
          },
        },
      },
    },
    responses: {
      NotFound: {
        description: 'Ressource non trouvée',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      ValidationError: {
        description: 'Erreur de validation',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      ServerError: {
        description: 'Erreur serveur interne',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Users',
      description: 'Gestion des utilisateurs',
    },
    {
      name: 'Tasks',
      description: 'Gestion des tâches',
    },
    {
      name: 'Health',
      description: "Monitoring et santé de l'application",
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./api/src/routes/*.js', './api/src/app.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
