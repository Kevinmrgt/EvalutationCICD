#!/bin/bash

# 🔄 Script de restauration de snapshot
# Objectif : Restaurer l'application à partir d'un snapshot existant

set -e

# Vérifier les paramètres
if [ "$#" -ne 1 ]; then
    echo "❌ Usage: $0 <timestamp_snapshot>"
    echo "📋 Exemples de snapshots disponibles:"
    ls -1 snapshots/ 2>/dev/null | grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}$" || echo "Aucun snapshot trouvé"
    exit 1
fi

SNAPSHOT_TIMESTAMP="$1"
SNAPSHOT_DIR="snapshots/${SNAPSHOT_TIMESTAMP}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔄 Restauration du snapshot : ${SNAPSHOT_TIMESTAMP}"

# Vérifier que le snapshot existe
if [ ! -d "${SNAPSHOT_DIR}" ]; then
    echo "❌ Snapshot non trouvé : ${SNAPSHOT_DIR}"
    echo "📋 Snapshots disponibles:"
    ls -1 snapshots/ 2>/dev/null | grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}$" || echo "Aucun snapshot trouvé"
    exit 1
fi

# Créer une sauvegarde de l'état actuel avant restauration
BACKUP_TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="rollback/backup-before-restore-${BACKUP_TIMESTAMP}"

echo "💾 Création d'une sauvegarde avant restauration..."
mkdir -p "${BACKUP_DIR}"
cp -r "${PROJECT_ROOT}/api" "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️ Pas de dossier api/ à sauvegarder"
cp -r "${PROJECT_ROOT}/src" "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️ Pas de dossier src/ à sauvegarder"
cp "${PROJECT_ROOT}/package.json" "${BACKUP_DIR}/" 2>/dev/null || true

echo "📋 Affichage des informations du snapshot..."
if [ -f "${SNAPSHOT_DIR}/metadata.json" ]; then
    cat "${SNAPSHOT_DIR}/metadata.json"
fi

echo ""
echo "⚠️ ATTENTION : Cette opération va remplacer les fichiers actuels."
echo "🔄 Début de la restauration dans 3 secondes..."
sleep 3

# 1. Restaurer l'application
if [ -d "${SNAPSHOT_DIR}/app" ]; then
    echo "📦 Restauration de l'application..."
    
    # Supprimer les anciens fichiers
    rm -rf "${PROJECT_ROOT}/api" 2>/dev/null || true
    rm -rf "${PROJECT_ROOT}/src" 2>/dev/null || true
    rm -f "${PROJECT_ROOT}/package.json" 2>/dev/null || true
    rm -f "${PROJECT_ROOT}/package-lock.json" 2>/dev/null || true
    
    # Restaurer depuis le snapshot
    cp -r "${SNAPSHOT_DIR}/app/"* "${PROJECT_ROOT}/" 2>/dev/null || echo "⚠️ Erreur lors de la restauration de l'application"
    echo "✅ Application restaurée"
else
    echo "⚠️ Pas de données application dans le snapshot"
fi

# 2. Restaurer la configuration
if [ -d "${SNAPSHOT_DIR}/config" ]; then
    echo "⚙️ Restauration de la configuration..."
    cp "${SNAPSHOT_DIR}/config/"* "${PROJECT_ROOT}/" 2>/dev/null || echo "⚠️ Erreur lors de la restauration de la configuration"
    echo "✅ Configuration restaurée"
else
    echo "⚠️ Pas de données configuration dans le snapshot"
fi

# 3. Restaurer l'infrastructure (optionnel - peut nécessiter une validation manuelle)
if [ -d "${SNAPSHOT_DIR}/infra" ]; then
    echo "🏗️ Infrastructure disponible dans le snapshot"
    echo "⚠️ La restauration de l'infrastructure nécessite une validation manuelle"
    echo "📁 Données disponibles dans : ${SNAPSHOT_DIR}/infra"
else
    echo "⚠️ Pas de données infrastructure dans le snapshot"
fi

# 4. Réinstaller les dépendances si package.json a été restauré
if [ -f "${PROJECT_ROOT}/package.json" ]; then
    echo "📦 Réinstallation des dépendances..."
    cd "${PROJECT_ROOT}"
    npm install
    echo "✅ Dépendances réinstallées"
fi

# 5. Vérification post-restauration
echo "🔍 Vérification post-restauration..."

# Vérifier que les fichiers essentiels existent
ESSENTIAL_FILES=("package.json")
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "${PROJECT_ROOT}/${file}" ]; then
        echo "✅ ${file} présent"
    else
        echo "❌ ${file} manquant"
    fi
done

# Créer un rapport de restauration
cat > "rollback/restore-report-${BACKUP_TIMESTAMP}.md" << EOF
# Rapport de Restauration

## 📊 Informations

- **Date** : $(date)
- **Snapshot restauré** : ${SNAPSHOT_TIMESTAMP}
- **Sauvegarde créée** : ${BACKUP_DIR}

## ✅ Éléments restaurés

- Application : $([ -d "${SNAPSHOT_DIR}/app" ] && echo "✅ Restauré" || echo "❌ Non disponible")
- Configuration : $([ -d "${SNAPSHOT_DIR}/config" ] && echo "✅ Restauré" || echo "❌ Non disponible")
- Infrastructure : $([ -d "${SNAPSHOT_DIR}/infra" ] && echo "⚠️ Disponible (validation manuelle)" || echo "❌ Non disponible")

## 🔍 Tests recommandés

1. Démarrer l'application : \`npm start\`
2. Tester les endpoints API
3. Vérifier les logs
4. Valider les fonctionnalités critiques

## 🔄 Rollback de cette restauration

En cas de problème, vous pouvez revenir à l'état précédent :
\`\`\`bash
cp -r ${BACKUP_DIR}/* ${PROJECT_ROOT}/
\`\`\`
EOF

echo "✅ Restauration terminée avec succès !"
echo "📋 Rapport généré : rollback/restore-report-${BACKUP_TIMESTAMP}.md"
echo "💾 Sauvegarde avant restauration : ${BACKUP_DIR}"
echo ""
echo "🔍 Tests recommandés :"
echo "  1. npm start"
echo "  2. Tester les endpoints API"
echo "  3. Vérifier les logs" 