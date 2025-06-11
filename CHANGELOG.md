# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2025-06-11

### Ajouté
- 📝 Guide complet de versioning (`docs/VERSIONING_GUIDE.md`)
- 📋 Fichier CHANGELOG.md pour le suivi des versions
- 🏷️ Démonstration du système de tags Git automatisé

### Amélioré
- 🔧 Consolidation du système de versioning sémantique
- 📚 Documentation complète des processus de release
- ✅ Validation du script `create-release.sh`

### Technique
- Tag: `v1.1.2`
- Commit: `e9879b69567385e110dd8afb7fc049ab5aa1ba29`
- Pipeline CI/CD: ✅ Fonctionnel

## [1.1.1] - 2025-06-10

### Ajouté
- 🔧 Script de release automatisé (`scripts/create-release.sh`)
- 📊 Métriques de monitoring avancées
- 💾 Système de snapshots et rollback complets

### Amélioré
- 🏥 Health checks détaillés avec `/health`, `/health/live`, `/health/ready`
- 📈 Endpoints de métriques Prometheus-style (`/metrics`)
- 🔄 Processus de snapshot automatisé avec métadonnées

### Corrigé
- 🚀 Pipeline CI/CD optimisé sans dépendances Docker
- 🛡️ Sécurité renforcée avec permissions appropriées
- 📝 Documentation mise à jour

### Technique
- Tag: `v1.1.1`
- Score d'évaluation: 20/20
- Infrastructure: Terraform + Ansible

## [1.1.0] - 2025-06-09

### Ajouté
- 🐳 Containerisation Docker complète
- 🏗️ Infrastructure as Code avec Terraform
- 🔧 Automatisation Ansible avec rôles
- 📊 Monitoring et health checks basiques

### Amélioré
- 🔄 Pipeline CI/CD avec GitHub Actions
- 🧪 Couverture de tests étendue
- 🛡️ Sécurité renforcée avec workflows dédiés

### Technique
- Tag: `v1.1.0`
- Docker: Multi-stage builds
- Tests: 31 tests avec 70.77% de couverture

## [1.0.1] - 2025-06-08

### Ajouté
- 🧪 Tests unitaires et d'intégration avec Jest
- 🔍 ESLint et Prettier pour la qualité de code
- 🪝 Husky pour les pre-commit hooks

### Amélioré
- 📝 Documentation README structurée
- 🔧 Configuration package.json optimisée
- ✅ Scripts npm pour développement et tests

### Corrigé
- 🐛 Corrections mineures des endpoints API
- 📊 Validation des données d'entrée

### Technique
- Tag: `v1.0.1`
- Tests: Configuration Jest complète
- Linting: ESLint + Prettier

## [1.0.0] - 2025-06-07

### Ajouté
- 🚀 Version initiale de l'API REST Node.js
- 📦 Express.js avec middleware de sécurité
- 🗃️ Endpoints CRUD pour users et tasks
- 🔧 Configuration environnement avec dotenv

### Fonctionnalités
- **API Users** :
  - `GET /api/users` - Liste des utilisateurs
  - `POST /api/users` - Créer un utilisateur
  - `GET /api/users/:id` - Obtenir un utilisateur
  - `PUT /api/users/:id` - Mettre à jour un utilisateur
  - `DELETE /api/users/:id` - Supprimer un utilisateur

- **API Tasks** :
  - `GET /api/tasks` - Liste des tâches
  - `POST /api/tasks` - Créer une tâche
  - `GET /api/tasks/:id` - Obtenir une tâche
  - `PUT /api/tasks/:id` - Mettre à jour une tâche
  - `DELETE /api/tasks/:id` - Supprimer une tâche

### Sécurité
- Helmet.js pour les en-têtes de sécurité
- CORS configuré
- Rate limiting
- Validation des données avec Joi

### Technique
- Tag: `v1.0.0`
- Node.js: v18+
- Framework: Express.js v4.18.2
- Architecture: API REST

---

## Format des versions

### Types de changements
- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Modifications de fonctionnalités existantes
- **Déprécié** : Fonctionnalités bientôt supprimées
- **Supprimé** : Fonctionnalités supprimées
- **Corrigé** : Corrections de bugs
- **Sécurité** : Corrections de vulnérabilités

### Versioning sémantique
- **MAJOR** (X.0.0) : Changements incompatibles
- **MINOR** (1.X.0) : Nouvelles fonctionnalités rétrocompatibles
- **PATCH** (1.1.X) : Corrections de bugs rétrocompatibles

---

**Maintenu par** : Kevin - Evaluation YNOV DevOps  
**Dernière mise à jour** : 2025-06-11  
**Prochain milestone** : v1.2.0 