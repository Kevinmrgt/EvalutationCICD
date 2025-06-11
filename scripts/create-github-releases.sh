#!/bin/bash

# 🚀 Script pour créer des releases GitHub pour tous les tags existants
# Objectif : Rendre les tags plus visibles sur l'interface GitHub

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Création des releases GitHub pour tous les tags${NC}"
echo ""

# Vérifier GitHub CLI
if ! command -v gh >/dev/null 2>&1; then
    echo -e "${RED}❌ GitHub CLI non installé${NC}"
    echo "Install with: sudo apt install gh"
    exit 1
fi

# Vérifier l'authentification
if ! gh auth status >/dev/null 2>&1; then
    echo -e "${RED}❌ GitHub CLI non authentifié${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Fonction pour créer une release spécifique
create_release_for_tag() {
    local tag="$1"
    local version="${tag#v}"
    local title="$2"
    local notes="$3"
    
    echo -e "${YELLOW}📝 Création de la release pour ${tag}${NC}"
    
    # Vérifier si la release existe déjà
    if gh release view "$tag" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ Release ${tag} existe déjà${NC}"
        return 0
    fi
    
    # Créer la release
    if gh release create "$tag" \
        --title "$title" \
        --notes "$notes" \
        --target "$(git rev-list -n 1 $tag)" 2>/dev/null; then
        echo -e "${GREEN}✅ Release ${tag} créée avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la création de la release ${tag}${NC}"
    fi
}

# Créer les releases pour chaque tag
echo "🏷️ Tags trouvés :"
git tag --sort=-version:refname

echo ""
echo "📋 Création des releases :"

# v1.1.2 - Documentation complète
create_release_for_tag "v1.1.2" \
    "Version 1.1.2 - Documentation complète du versioning" \
    "## 🏷️ Version 1.1.2

### ✨ Nouvelles fonctionnalités
- 📝 Guide complet de versioning (\`docs/VERSIONING_GUIDE.md\`)
- 📋 Fichier CHANGELOG.md pour le suivi des versions
- 🏷️ Démonstration du système de tags Git automatisé

### 🔧 Améliorations
- Consolidation du système de versioning sémantique
- Documentation complète des processus de release
- Validation du script \`create-release.sh\`

### 📊 Informations techniques
- **Tag**: v1.1.2
- **Pipeline CI/CD**: ✅ Fonctionnel
- **Tests**: 31 tests passent (70.77% de couverture)
- **Score d'évaluation**: 20/20"

# v1.1.1 - Snapshots et monitoring
create_release_for_tag "v1.1.1" \
    "Version 1.1.1 - Système complet de snapshots et monitoring" \
    "## 🏷️ Version 1.1.1

### ✨ Nouvelles fonctionnalités
- 🔧 Script de release automatisé (\`scripts/create-release.sh\`)
- 📊 Métriques de monitoring avancées
- 💾 Système de snapshots et rollback complets

### 🔧 Améliorations
- 🏥 Health checks détaillés avec \`/health\`, \`/health/live\`, \`/health/ready\`
- 📈 Endpoints de métriques Prometheus-style (\`/metrics\`)
- 🔄 Processus de snapshot automatisé avec métadonnées

### 🐛 Corrections
- 🚀 Pipeline CI/CD optimisé sans dépendances Docker
- 🛡️ Sécurité renforcée avec permissions appropriées
- 📝 Documentation mise à jour

### 📊 Informations techniques
- **Tag**: v1.1.1
- **Score d'évaluation**: 20/20
- **Infrastructure**: Terraform + Ansible"

# v1.1.0 - Infrastructure et containerisation
create_release_for_tag "v1.1.0" \
    "Version 1.1.0 - Infrastructure et Containerisation" \
    "## 🏷️ Version 1.1.0

### ✨ Nouvelles fonctionnalités
- 🐳 Containerisation Docker complète
- 🏗️ Infrastructure as Code avec Terraform
- 🔧 Automatisation Ansible avec rôles
- 📊 Monitoring et health checks basiques

### 🔧 Améliorations
- 🔄 Pipeline CI/CD avec GitHub Actions
- 🧪 Couverture de tests étendue
- 🛡️ Sécurité renforcée avec workflows dédiés

### 📊 Informations techniques
- **Tag**: v1.1.0
- **Docker**: Multi-stage builds
- **Tests**: 31 tests avec 70.77% de couverture"

# v1.0.1 - Tests et qualité
create_release_for_tag "v1.0.1" \
    "Version 1.0.1 - Tests et Qualité de Code" \
    "## 🏷️ Version 1.0.1

### ✨ Nouvelles fonctionnalités
- 🧪 Tests unitaires et d'intégration avec Jest
- 🔍 ESLint et Prettier pour la qualité de code
- 🪝 Husky pour les pre-commit hooks

### 🔧 Améliorations
- 📝 Documentation README structurée
- 🔧 Configuration package.json optimisée
- ✅ Scripts npm pour développement et tests

### 🐛 Corrections
- 🐛 Corrections mineures des endpoints API
- 📊 Validation des données d'entrée

### 📊 Informations techniques
- **Tag**: v1.0.1
- **Tests**: Configuration Jest complète
- **Linting**: ESLint + Prettier"

# v1.0.0 - Release initiale
create_release_for_tag "v1.0.0" \
    "Version 1.0.0 - Release Initiale" \
    "## 🏷️ Version 1.0.0

### ✨ Nouvelles fonctionnalités
- 🚀 Version initiale de l'API REST Node.js
- 📦 Express.js avec middleware de sécurité
- 🗃️ Endpoints CRUD pour users et tasks
- 🔧 Configuration environnement avec dotenv

### 🔧 Fonctionnalités API
**API Users** :
- \`GET /api/users\` - Liste des utilisateurs
- \`POST /api/users\` - Créer un utilisateur
- \`GET /api/users/:id\` - Obtenir un utilisateur
- \`PUT /api/users/:id\` - Mettre à jour un utilisateur
- \`DELETE /api/users/:id\` - Supprimer un utilisateur

**API Tasks** :
- \`GET /api/tasks\` - Liste des tâches
- \`POST /api/tasks\` - Créer une tâche
- \`GET /api/tasks/:id\` - Obtenir une tâche
- \`PUT /api/tasks/:id\` - Mettre à jour une tâche
- \`DELETE /api/tasks/:id\` - Supprimer une tâche

### 🛡️ Sécurité
- Helmet.js pour les en-têtes de sécurité
- CORS configuré
- Rate limiting
- Validation des données avec Joi

### 📊 Informations techniques
- **Tag**: v1.0.0
- **Node.js**: v18+
- **Framework**: Express.js v4.18.2
- **Architecture**: API REST"

echo ""
echo -e "${GREEN}✅ Création des releases GitHub terminée${NC}"
echo ""
echo "🔗 Liens utiles :"
echo "  - Releases: https://github.com/Kevinmrgt/EvalutationCICD/releases"
echo "  - Tags: https://github.com/Kevinmrgt/EvalutationCICD/tags"
echo "  - CHANGELOG: https://github.com/Kevinmrgt/EvalutationCICD/blob/main/CHANGELOG.md" 