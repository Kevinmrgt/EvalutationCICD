# EvaluationCICD

[![CI](https://github.com/kevinmrgt/evalutationcicd/actions/workflows/ci.yml/badge.svg)](https://github.com/kevinmrgt/evalutationcicd/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/kevinmrgt/evalutationcicd/branch/main/graph/badge.svg)](https://codecov.io/gh/kevinmrgt/evalutationcicd)
[![Security](https://github.com/kevinmrgt/evalutationcicd/actions/workflows/security.yml/badge.svg)](https://github.com/kevinmrgt/evalutationcicd/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Projet d'évaluation CI/CD** - API REST Node.js avec pipeline de déploiement automatisé

## 🎯 Description

Ce projet démontre la mise en place d'un pipeline CI/CD complet pour une application Node.js, incluant les bonnes pratiques DevOps, la sécurité, et l'automatisation.

### 🚀 **Fonctionnalités**

- **API REST** - Express.js avec endpoints CRUD pour utilisateurs et tâches
- **Tests automatisés** - Tests unitaires et d'intégration avec Jest (couverture >70%)
- **Qualité de code** - ESLint, Prettier, et hooks pre-commit
- **Pipeline CI/CD** - GitHub Actions avec déploiement automatisé
- **Monitoring** - Health checks, métriques Prometheus, logs structurés
- **Sécurité** - Scans de vulnérabilités, audit npm, analyse de code
- **Infrastructure as Code** - Terraform et Ansible
- **Snapshots** - Sauvegarde et rollback automatisés
- **Versionnement sémantique** - Tags automatiques et releases GitHub

### 🛠 **Stack Technique**

- **Backend** : Node.js 18+, Express.js
- **Tests** : Jest, Supertest
- **Qualité** : ESLint, Prettier, Husky
- **CI/CD** : GitHub Actions
- **Infrastructure** : Terraform, Ansible
- **Monitoring** : Winston, métriques custom
- **Sécurité** : Snyk, CodeQL, Semgrep

## 📊 Métriques du Projet

### 🧪 Tests et Couverture
- **Tests unitaires** : 22 tests passent ✅
- **Tests d'intégration** : 9 tests passent ✅  
- **Couverture globale** : 70.77% 📊
- **Seuils configurés** : Statements 70%, Branches 65%, Functions 70%, Lines 70%

### 🚀 Pipeline CI/CD
- **Workflows actifs** : 5 workflows GitHub Actions
- **Checks automatiques** : Linting, tests, sécurité, déploiement
- **Environnements** : Staging → Production avec approbation manuelle
- **Releases** : Automatiques via tags Git (dernière : v1.1.1)

### 🔒 Sécurité
- **Scans de vulnérabilités** : npm audit, Snyk, CodeQL
- **Détection de secrets** : TruffleHog, GitLeaks
- **Analyse statique** : ESLint security rules, Semgrep

## 🚀 Quick Start

### Prérequis

- Node.js 18+ et npm 9+
- Git

### Installation

```bash
# Cloner le repository
git clone https://github.com/kevinmrgt/evalutationcicd.git
cd evalutationcicd

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp env.example .env

# Lancer l'application
npm start
```

### Commandes disponibles

```bash
# Développement
npm run dev          # Mode développement avec nodemon
npm test            # Tous les tests
npm run test:watch  # Tests en mode watch
npm run test:coverage # Tests avec couverture

# Qualité de code
npm run lint        # Vérifier le code
npm run lint:fix    # Corriger automatiquement
npm run format      # Formatter le code
npm run build       # Build complet (lint + tests)

# API
npm run test:api    # Tester l'API en live
```

L'API sera accessible sur http://localhost:3000

## 📚 Documentation API

### Endpoints principaux

- `GET /health` - Health check complet avec métriques système
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe  
- `GET /metrics` - Métriques Prometheus
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche

### Réponses API

```json
{
  "success": true,
  "data": [...],
  "message": "Success"
}
```

## 🔄 Pipeline CI/CD

### Workflow CI (`ci.yml`)
1. **🧪 Tests & Qualité** - ESLint, Prettier, Jest (Node 18.x, 20.x)
2. **🔒 Audit Sécurité** - npm audit, Snyk
3. **⚡ Tests Performance** - Artillery (sur PR uniquement)

### Workflow CD (`cd.yml`)
1. **🧪 Déploiement Staging** - Build et déploiement automatique
2. **🌟 Déploiement Production** - Après approbation manuelle
3. **📦 Releases** - Création automatique sur tags

### Workflow Sécurité (`security.yml`)
1. **🔍 Scan Dépendances** - npm audit, Snyk
2. **🔍 Analyse Statique** - CodeQL, Semgrep  
3. **🔐 Détection Secrets** - TruffleHog, GitLeaks
4. **📋 Rapport Synthèse** - Résumé consolidé

## 🏗 Infrastructure

### Terraform
- **Configuration AWS** : EC2, VPC, Security Groups
- **Multi-environnements** : dev, staging, production
- **Modules réutilisables** : network, compute, security

### Ansible
- **Playbooks automatisés** : Installation Node.js, déploiement app
- **Rôles structurés** : nodejs, app-deploy, monitoring
- **Inventaire dynamique** : Configuration par environnement

### Scripts d'automatisation
- `scripts/create-release.sh` - Création de releases automatisées
- `snapshots/create-snapshot.sh` - Sauvegarde complète du projet
- `rollback/restore-snapshot.sh` - Restauration d'état précédent

## 📊 Monitoring et Observabilité

### Health Checks
- **Endpoint `/health`** : État complet de l'application
- **Métriques système** : CPU, mémoire, uptime
- **Statut dépendances** : Base de données, services externes

### Logs
- **Winston** pour logging structuré
- **Niveaux** : error, warn, info, debug
- **Formats** : JSON en production, lisible en développement

### Métriques
- **Endpoint `/metrics`** : Format Prometheus
- **Compteurs** : Requêtes, erreurs, latence
- **Monitoring** : Surveillance continue

## 🔄 Snapshots et Rollback

### Système de Snapshots
- **Sauvegarde automatisée** : Code, configuration, métadonnées
- **Compression** : Archives optimisées avec horodatage
- **Versionning** : Traçabilité complète des changements

### Rollback sécurisé
- **Restauration rapide** : Retour à un état stable précédent
- **Sauvegarde préalable** : Protection contre les pertes
- **Vérification post-rollback** : Validation automatique

```bash
# Créer un snapshot
./snapshots/create-snapshot.sh "Description du snapshot"

# Restaurer depuis un snapshot  
./rollback/restore-snapshot.sh snapshots/2025-01-XX_XX-XX-XX
```

## 🔀 GitFlow et Versionnement

### Branches
- **main** : Production stable
- **develop** : Intégration continue
- **feature/** : Nouvelles fonctionnalités
- **hotfix/** : Corrections urgentes

### Versionnement Sémantique
- **Format** : MAJOR.MINOR.PATCH (ex: v1.1.1)
- **Automatisation** : Script de release intégré
- **Tags Git** : Synchronisation avec releases GitHub

```bash
# Créer une nouvelle version
./scripts/create-release.sh patch  # v1.1.2
./scripts/create-release.sh minor  # v1.2.0  
./scripts/create-release.sh major  # v2.0.0
```

## 📁 Structure du Projet

```
evalutationcicd/
├── api/                    # Code source de l'API
│   ├── src/               # Code applicatif
│   └── tests/             # Tests unitaires et intégration
├── .github/               # Workflows GitHub Actions
├── terraform/             # Infrastructure as Code
├── ansible/               # Configuration et déploiement  
├── monitoring/            # Health checks et métriques
├── snapshots/             # Système de sauvegarde
├── rollback/              # Scripts de restauration
├── scripts/               # Utilitaires d'automatisation
└── docs/                  # Documentation technique
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour l'évaluation DevOps YNOV** 