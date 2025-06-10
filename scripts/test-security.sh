#!/bin/bash

# =============================================================================
# Script de test de sécurité local
# Usage: ./scripts/test-security.sh
# =============================================================================

set -e

echo "🔒 Test de sécurité local - CI/CD Evaluation"
echo "============================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️ $1"
}

# Test 1: Vérification des dépendances
echo "1️⃣ Test des dépendances npm..."
if command -v npm &> /dev/null; then
    print_success "npm disponible"
    
    if [ -f "package.json" ]; then
        print_success "package.json trouvé"
        
        # Vérifier les vulnérabilités
        echo "   🔍 Audit des dépendances..."
        if npm audit --audit-level moderate; then
            print_success "Aucune vulnérabilité critique trouvée"
        else
            print_warning "Des vulnérabilités ont été trouvées"
        fi
    else
        print_error "package.json manquant"
    fi
else
    print_error "npm n'est pas installé"
fi
echo ""

# Test 2: Vérification Docker
echo "2️⃣ Test de la configuration Docker..."
if command -v docker &> /dev/null; then
    print_success "Docker disponible"
    
    # Test build du Dockerfile
    echo "   🐳 Test de build du Dockerfile..."
    if docker build -t security-test:latest --target production . > /dev/null 2>&1; then
        print_success "Build Docker réussi"
        
        # Vérifier la taille de l'image
        IMAGE_SIZE=$(docker images security-test:latest --format "table {{.Size}}" | tail -n 1)
        print_info "Taille de l'image: $IMAGE_SIZE"
        
        # Nettoyer l'image de test
        docker rmi security-test:latest > /dev/null 2>&1
    else
        print_error "Échec du build Docker"
    fi
else
    print_error "Docker n'est pas installé"
fi
echo ""

# Test 3: Scan des patterns de sécurité
echo "3️⃣ Scan des patterns de sécurité..."

# Recherche de secrets potentiels
echo "   🔍 Recherche de secrets potentiels..."
SECRETS_FOUND=0

# Patterns de secrets courants
PATTERNS=(
    "password\s*=\s*['\"][^'\"]*['\"]"
    "secret\s*=\s*['\"][^'\"]*['\"]"
    "token\s*=\s*['\"][^'\"]*['\"]"
    "api_key\s*=\s*['\"][^'\"]*['\"]"
    "private_key"
)

for pattern in "${PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" --include="*.js" --include="*.json" . --exclude-dir=node_modules > /dev/null 2>&1; then
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
        print_warning "Pattern suspect trouvé: $pattern"
    fi
done

if [ $SECRETS_FOUND -eq 0 ]; then
    print_success "Aucun secret suspect trouvé"
else
    print_warning "$SECRETS_FOUND pattern(s) suspect(s) trouvé(s)"
fi

# Recherche d'eval()
echo "   🔍 Recherche d'eval()..."
if grep -r "eval(" --include="*.js" . --exclude-dir=node_modules > /dev/null 2>&1; then
    print_warning "Usage d'eval() trouvé (potentiellement dangereux)"
else
    print_success "Aucun usage d'eval() trouvé"
fi

# Recherche de console.log
echo "   🔍 Recherche de console.log en production..."
if find ./api -name "*.js" -exec grep -l "console\.log" {} \; 2>/dev/null | grep -q .; then
    print_warning "console.log trouvé dans le code de production"
else
    print_success "Aucun console.log trouvé"
fi
echo ""

# Test 4: Vérification des fichiers de configuration
echo "4️⃣ Vérification des fichiers de configuration..."

# Vérifier .dockerignore
if [ -f ".dockerignore" ]; then
    print_success ".dockerignore présent"
    if grep -q "node_modules" .dockerignore; then
        print_success "node_modules exclu dans .dockerignore"
    else
        print_warning "node_modules devrait être exclu dans .dockerignore"
    fi
else
    print_warning ".dockerignore manquant"
fi

# Vérifier .gitignore
if [ -f ".gitignore" ]; then
    print_success ".gitignore présent"
    if grep -q "node_modules" .gitignore; then
        print_success "node_modules exclu dans .gitignore"
    else
        print_warning "node_modules devrait être exclu dans .gitignore"
    fi
else
    print_warning ".gitignore manquant"
fi

# Vérifier les variables d'environnement
if [ -f "env.example" ]; then
    print_success "env.example présent"
else
    print_warning "env.example manquant"
fi
echo ""

# Test 5: Vérification des workflows GitHub
echo "5️⃣ Vérification des workflows GitHub..."

if [ -d ".github/workflows" ]; then
    print_success "Dossier workflows présent"
    
    WORKFLOW_COUNT=$(find .github/workflows -name "*.yml" -o -name "*.yaml" | wc -l)
    print_info "$WORKFLOW_COUNT workflow(s) trouvé(s)"
    
    # Vérifier les workflows spécifiques
    if [ -f ".github/workflows/security.yml" ]; then
        print_success "Workflow de sécurité principal présent"
    fi
    
    if [ -f ".github/workflows/security-basic.yml" ]; then
        print_success "Workflow de sécurité basique présent"
    fi
    
    if [ -f ".github/workflows/ci.yml" ]; then
        print_success "Workflow CI présent"
    fi
    
    if [ -f ".github/workflows/cd.yml" ]; then
        print_success "Workflow CD présent"
    fi
else
    print_error "Dossier .github/workflows manquant"
fi
echo ""

# Test 6: Test de l'API (si disponible)
echo "6️⃣ Test de l'API..."
if [ -f "test-api.js" ]; then
    print_success "Script de test API présent"
    
    # Vérifier si le serveur est en cours d'exécution
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_success "API accessible sur localhost:3000"
        
        echo "   🧪 Exécution des tests API..."
        if node test-api.js > /dev/null 2>&1; then
            print_success "Tests API passés"
        else
            print_warning "Tests API échoués (serveur éteint?)"
        fi
    else
        print_warning "API non accessible (serveur éteint?)"
        print_info "Démarrez le serveur avec: npm start"
    fi
else
    print_warning "Script de test API manquant"
fi
echo ""

# Résumé final
echo "🏁 Résumé des tests de sécurité"
echo "==============================="
echo ""
echo "✅ Tests effectués:"
echo "   - Audit des dépendances npm"
echo "   - Build et sécurité Docker"
echo "   - Scan des patterns de sécurité"
echo "   - Vérification des fichiers de config"
echo "   - Validation des workflows GitHub"
echo "   - Test de l'API (si disponible)"
echo ""
echo "📋 Actions recommandées:"
echo "   1. Corriger les warnings trouvés"
echo "   2. Activer GitHub Security features"
echo "   3. Tester le workflow security-basic.yml"
echo "   4. Configurer les permissions GitHub Actions"
echo ""
echo "📚 Consultez .github/SECURITY_SETUP.md pour plus d'infos"
echo ""
print_success "Test de sécurité local terminé !" 