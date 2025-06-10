#!/bin/bash

# 🏷️ Script de création de release avec versionnement sémantique
# Objectif : Automatiser la création de tags et releases (1 point sur 20)

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo "🏷️ Script de création de release avec versionnement sémantique"
    echo ""
    echo "Usage: $0 [major|minor|patch|VERSION]"
    echo ""
    echo "Exemples:"
    echo "  $0 patch         # 1.0.0 -> 1.0.1"
    echo "  $0 minor         # 1.0.1 -> 1.1.0"
    echo "  $0 major         # 1.1.0 -> 2.0.0"
    echo "  $0 1.2.3         # Version spécifique"
    echo ""
    echo "Options:"
    echo "  --help           # Afficher cette aide"
    echo "  --current        # Afficher la version actuelle"
    echo "  --list           # Lister les tags existants"
}

# Fonction pour obtenir la version actuelle
get_current_version() {
    # Essayer de récupérer depuis package.json
    if [ -f "package.json" ]; then
        VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
        if [ ! -z "$VERSION" ]; then
            echo "$VERSION"
            return
        fi
    fi
    
    # Sinon depuis le dernier tag Git
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    if [ ! -z "$LATEST_TAG" ]; then
        echo "$LATEST_TAG" | sed 's/^v//'
        return
    fi
    
    # Version par défaut
    echo "0.0.0"
}

# Fonction pour calculer la nouvelle version
calculate_version() {
    local current_version="$1"
    local bump_type="$2"
    
    # Extraire les composants de version
    IFS='.' read -ra VERSION_PARTS <<< "$current_version"
    local major="${VERSION_PARTS[0]:-0}"
    local minor="${VERSION_PARTS[1]:-0}"
    local patch="${VERSION_PARTS[2]:-0}"
    
    case "$bump_type" in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch")
            patch=$((patch + 1))
            ;;
        *)
            echo "Type de bump invalide: $bump_type" >&2
            exit 1
            ;;
    esac
    
    echo "${major}.${minor}.${patch}"
}

# Fonction pour valider le format de version
validate_version() {
    local version="$1"
    if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "❌ Format de version invalide: $version" >&2
        echo "   Format attendu: X.Y.Z (ex: 1.2.3)" >&2
        exit 1
    fi
}

# Fonction pour mettre à jour package.json
update_package_version() {
    local new_version="$1"
    
    if [ -f "package.json" ]; then
        echo "📝 Mise à jour de package.json vers v${new_version}"
        
        # Sauvegarde
        cp package.json package.json.backup
        
        # Mise à jour avec sed
        sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"${new_version}\"/" package.json
        
        # Vérifier le changement
        if grep -q "\"version\": \"${new_version}\"" package.json; then
            echo "✅ package.json mis à jour"
            rm -f package.json.backup
        else
            echo "❌ Erreur lors de la mise à jour de package.json"
            mv package.json.backup package.json
            exit 1
        fi
    fi
}

# Fonction principale de création de release
create_release() {
    local new_version="$1"
    local tag_name="v${new_version}"
    
    echo -e "${BLUE}🏷️ Création de la release ${tag_name}${NC}"
    
    # Vérifier l'état Git
    if [[ -n $(git status --porcelain) ]]; then
        echo -e "${YELLOW}⚠️ Il y a des modifications non commitées${NC}"
        echo "   Voulez-vous continuer ? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "❌ Opération annulée"
            exit 1
        fi
    fi
    
    # Mettre à jour package.json
    update_package_version "$new_version"
    
    # Créer un commit pour la nouvelle version si package.json a été modifié
    if [[ -n $(git status --porcelain package.json) ]]; then
        echo "📝 Commit de la nouvelle version"
        git add package.json
        git commit -m "chore: bump version to ${new_version}"
    fi
    
    # Créer le tag
    echo "🏷️ Création du tag ${tag_name}"
    git tag -a "$tag_name" -m "Release ${tag_name}

Changements dans cette version :
- Mise à jour vers la version ${new_version}
- Amélioration continue du pipeline CI/CD
- Documentation mise à jour

Date: $(date)
Commit: $(git rev-parse HEAD)"

    echo -e "${GREEN}✅ Tag ${tag_name} créé avec succès${NC}"
    
    # Pousser vers le repository distant
    echo "📤 Push du tag vers le repository distant"
    git push origin main || true
    git push origin "$tag_name"
    
    echo -e "${GREEN}✅ Release ${tag_name} créée et poussée avec succès${NC}"
    
    # Afficher le résumé
    echo ""
    echo "📊 Résumé de la release:"
    echo "  - Version: ${new_version}"
    echo "  - Tag: ${tag_name}"
    echo "  - Commit: $(git rev-parse HEAD)"
    echo "  - Date: $(date)"
    echo ""
    echo "🔗 Prochaines étapes suggérées:"
    echo "  - Vérifier la release sur GitHub"
    echo "  - Déclencher le déploiement en production"
    echo "  - Mettre à jour la documentation"
}

# Parser les arguments
case "${1:-}" in
    "--help"|"-h")
        show_help
        exit 0
        ;;
    "--current")
        echo "Version actuelle: $(get_current_version)"
        exit 0
        ;;
    "--list")
        echo "📋 Tags existants:"
        git tag -l | sort -V | tail -10
        exit 0
        ;;
    "major"|"minor"|"patch")
        CURRENT_VERSION=$(get_current_version)
        NEW_VERSION=$(calculate_version "$CURRENT_VERSION" "$1")
        ;;
    "")
        echo "❌ Argument requis"
        show_help
        exit 1
        ;;
    *)
        # Version spécifique fournie
        NEW_VERSION="$1"
        validate_version "$NEW_VERSION"
        ;;
esac

# Afficher les informations
CURRENT_VERSION=$(get_current_version)
echo -e "${BLUE}📊 Informations de versionnement${NC}"
echo "  Version actuelle: ${CURRENT_VERSION}"
echo "  Nouvelle version: ${NEW_VERSION}"
echo ""

# Confirmer avec l'utilisateur
echo "❓ Créer la release v${NEW_VERSION} ? (y/N)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    create_release "$NEW_VERSION"
else
    echo "❌ Opération annulée"
    exit 1
fi 