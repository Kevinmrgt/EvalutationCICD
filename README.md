# 🚀 Projet d'Évaluation CI/CD - API REST Node.js

## 📋 Description du Projet

Ce projet fait partie d'une évaluation complète de mise en œuvre d'un pipeline CI/CD. Il s'agit d'une API REST Node.js destinée à une application mobile, avec une infrastructure DevOps complète incluant :

- ✅ **Infrastructure as Code** avec Terraform
- ✅ **Configuration automatisée** avec Ansible  
- ✅ **Pipeline CI/CD complet** avec GitHub Actions
- ✅ **GitFlow structuré** pour la gestion des branches
- ✅ **Versionnement sémantique** 
- ✅ **Monitoring et logs**
- ✅ **Stratégies de sauvegarde** (snapshots)
- ✅ **Procédures de rollback**

## 🏗️ Technologies Utilisées

### Backend
- **Node.js** (v18+) - Runtime JavaScript
- **Express.js** - Framework web
- **Winston** - Logging avancé
- **Joi** - Validation des données
- **Jest** - Tests unitaires et d'intégration
- **Helmet** - Sécurité HTTP
- **CORS** - Gestion des requêtes cross-origin

### DevOps & Infrastructure
- **Docker** - Containerisation
- **Terraform** - Infrastructure as Code
- **Ansible** - Configuration management
- **GitHub Actions** - CI/CD Pipeline
- **ESLint + Prettier** - Qualité de code

### Monitoring & Logging
- **Winston** - Logs structurés
- **Morgan** - Logs HTTP
- **Express Rate Limit** - Protection contre les attaques

## 📁 Structure du Projet

```
EvaluationCICD/
├── api/                          # Code de l'API REST
│   ├── src/
│   │   ├── config/              # Configuration (logger, etc.)
│   │   ├── middleware/          # Middlewares Express
│   │   ├── models/              # Modèles de données
│   │   ├── routes/              # Définition des routes
│   │   └── app.js               # Point d'entrée de l'application
│   └── tests/
│       ├── unit/                # Tests unitaires
│       └── integration/         # Tests d'intégration
├── terraform/                   # Scripts Infrastructure as Code
├── ansible/                     # Playbooks et rôles Ansible
├── .github/workflows/           # Pipelines GitHub Actions
├── monitoring/                  # Configuration monitoring + logs
│   └── logs/                   # Fichiers de logs
├── rollback/                    # Scripts de restauration
├── snapshots/                   # Configuration snapshots
├── docs/                        # Documentation
├── package.json                 # Dépendances Node.js
├── .gitignore                   # Fichiers ignorés par Git
└── README.md                    # Ce fichier
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (optionnel)

### Installation
```bash
# Cloner le repository
git clone <your-repo-url>
cd EvaluationCICD

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp env.example .env
# Éditer .env selon vos besoins
```

### Démarrage
```bash
# Mode développement
npm run dev

# Mode production
npm start

# Avec Docker
npm run docker:build
npm run docker:run
```

## 📡 API Endpoints

### Documentation
- `GET /` - Page d'accueil avec informations sur l'API
- `GET /api` - Documentation des endpoints disponibles
- `GET /api/docs` - Documentation détaillée de l'API
- `GET /health` - Health check du serveur

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (avec pagination)
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Tâches
- `GET /api/tasks` - Liste des tâches (avec filtres)
- `GET /api/tasks/:id` - Détails d'une tâche
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Mettre à jour une tâche
- `DELETE /api/tasks/:id` - Supprimer une tâche
- `PATCH /api/tasks/:id/status` - Changer le statut d'une tâche

## 🧪 Tests et Qualité

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Formatage du code
npm run format
npm run format:check
```

## 📊 Fonctionnalités Implementées

### ✅ Étape 1 - Structure de Base (TERMINÉE)
- [x] Initialisation du projet npm
- [x] Structure des dossiers selon les exigences
- [x] Configuration package.json avec scripts
- [x] API REST basique avec Express.js
- [x] Endpoints CRUD pour utilisateurs et tâches
- [x] Middleware de sécurité et validation
- [x] Logger configuré avec Winston
- [x] Gestion d'erreurs centralisée
- [x] Variables d'environnement

### 🔄 Prochaines Étapes
- [ ] **Étape 2** - Tests unitaires et d'intégration
- [ ] **Étape 3** - Configuration Docker
- [ ] **Étape 4** - Scripts Terraform
- [ ] **Étape 5** - Playbooks Ansible
- [ ] **Étape 6** - Pipeline GitHub Actions
- [ ] **Étape 7** - Monitoring et alertes
- [ ] **Étape 8** - Snapshots et rollback

## 🔧 Configuration

### Variables d'Environnement
Voir le fichier `env.example` pour la liste complète des variables configurables.

### Logs
Les logs sont configurés avec Winston et stockés dans :
- `monitoring/logs/combined.log` - Tous les logs
- `monitoring/logs/error.log` - Logs d'erreurs uniquement
- Console - En mode développement

## 🤝 Contribution

Ce projet suit les conventions GitFlow :
- `main` - Branche de production
- `develop` - Branche de développement
- `feature/*` - Nouvelles fonctionnalités
- `release/*` - Préparation des releases
- `hotfix/*` - Corrections urgentes

## 📝 Logs et Monitoring

L'application inclut :
- Logs structurés JSON avec Winston
- Logs HTTP avec Morgan
- Health checks sur `/health`
- Métriques de performance
- Gestion des erreurs centralisée

## 🔒 Sécurité

- Helmet.js pour la sécurité HTTP
- Rate limiting configuré
- Validation des données avec Joi
- Gestion sécurisée des variables d'environnement
- CORS configuré

## 📈 Statut du Projet

- **Version actuelle** : 1.0.0
- **Statut** : ✅ Étape 1 Terminée
- **Prochaine étape** : Tests et qualité de code
- **Dernière mise à jour** : $(date)

---

**Auteur** : Kevin - Évaluation YNOV DevOps  
**Licence** : MIT 