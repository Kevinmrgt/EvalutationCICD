#!/bin/bash

# Script pour créer une nouvelle release avec versionnement sémantique
# Usage: ./scripts/create-release.sh [patch|minor|major] "Description des changements"

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo -e "${BLUE}🏷️  Script de création de release${NC}"
    echo ""
    echo "Usage: $0 [TYPE] [DESCRIPTION]"
    echo ""
    echo "Types de release:"
    echo "  patch  - Correction de bugs (1.0.0 -> 1.0.1)"
    echo "  minor  - Nouvelles fonctionnalités (1.0.0 -> 1.1.0)"
    echo "  major  - Changements majeurs (1.0.0 -> 2.0.0)"
    echo ""
    echo "Exemple:"
    echo "  $0 patch \"Fix security vulnerabilities\""
    echo "  $0 minor \"Add new API endpoints\""
    echo "  $0 major \"Breaking changes in API\""
}

# Vérifier les arguments
if [ $# -ne 2 ]; then
    echo -e "${RED}❌ Erreur: Arguments manquants${NC}"
    show_help
    exit 1
fi

RELEASE_TYPE=$1
DESCRIPTION=$2

# Vérifier le type de release
if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}❌ Erreur: Type de release invalide${NC}"
    show_help
    exit 1
fi

# Obtenir la dernière version
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo -e "${BLUE}📋 Dernière version: ${LAST_TAG}${NC}"

# Extraire les numéros de version
VERSION=${LAST_TAG#v}
IFS='.' read -ra VERSION_PARTS <<< "$VERSION"
MAJOR=${VERSION_PARTS[0]:-0}
MINOR=${VERSION_PARTS[1]:-0}
PATCH=${VERSION_PARTS[2]:-0}

# Calculer la nouvelle version
case $RELEASE_TYPE in
    "patch")
        PATCH=$((PATCH + 1))
        ;;
    "minor")
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    "major")
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
esac

NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

echo -e "${GREEN}🆕 Nouvelle version: ${NEW_VERSION}${NC}"

# Vérifier que le workspace est propre
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Changements non commités détectés${NC}"
    echo -e "${YELLOW}Voulez-vous continuer? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Release annulée${NC}"
        exit 1
    fi
fi

# Créer le tag
echo -e "${BLUE}🏷️  Création du tag ${NEW_VERSION}...${NC}"
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION: $DESCRIPTION"

# Pousser le tag
echo -e "${BLUE}🚀 Push du tag vers GitHub...${NC}"
git push origin "$NEW_VERSION"

# Pousser les commits si nécessaire
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${BLUE}📤 Push des changements vers GitHub...${NC}"
    git push origin main
fi

echo -e "${GREEN}✅ Release ${NEW_VERSION} créée avec succès!${NC}"
echo -e "${BLUE}📍 Consultez la release sur GitHub:${NC}"
echo -e "${BLUE}   https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[\/:]//;s/.git$//')/releases/tag/${NEW_VERSION}${NC}" 