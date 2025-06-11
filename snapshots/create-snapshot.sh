#!/bin/bash

# 📸 Script de création de snapshot complet
# Objectif : Sauvegarder l'état actuel de l'application et infrastructure

set -e

# Variables
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SNAPSHOT_DIR="snapshots/${TIMESTAMP}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Création du snapshot : ${TIMESTAMP}"

# Créer le répertoire de snapshot
mkdir -p "${SNAPSHOT_DIR}"/{app,config,infra}

echo "📁 Création des dossiers..."

# 1. Snapshot de l'application
echo "📦 Sauvegarde de l'application..."
cp -r "${PROJECT_ROOT}/api" "${SNAPSHOT_DIR}/app/" 2>/dev/null || echo "⚠️ Dossier api/ non trouvé"
cp -r "${PROJECT_ROOT}/src" "${SNAPSHOT_DIR}/app/" 2>/dev/null || echo "⚠️ Dossier src/ non trouvé"
cp "${PROJECT_ROOT}/package.json" "${SNAPSHOT_DIR}/app/" 2>/dev/null || echo "⚠️ package.json non trouvé"
cp "${PROJECT_ROOT}/package-lock.json" "${SNAPSHOT_DIR}/app/" 2>/dev/null || true

# 2. Snapshot de la configuration
echo "⚙️ Sauvegarde de la configuration..."
cp "${PROJECT_ROOT}/.env"* "${SNAPSHOT_DIR}/config/" 2>/dev/null || true
cp "${PROJECT_ROOT}/env.example" "${SNAPSHOT_DIR}/config/" 2>/dev/null || true

# 3. Snapshot de l'infrastructure
echo "🏗️ Sauvegarde de l'infrastructure..."
cp -r "${PROJECT_ROOT}/terraform" "${SNAPSHOT_DIR}/infra/" 2>/dev/null || echo "⚠️ Dossier terraform/ non trouvé"
cp -r "${PROJECT_ROOT}/ansible" "${SNAPSHOT_DIR}/infra/" 2>/dev/null || echo "⚠️ Dossier ansible/ non trouvé"

# 4. Snapshot des workflows CI/CD
echo "🔄 Sauvegarde des workflows CI/CD..."
mkdir -p "${SNAPSHOT_DIR}/cicd"
cp -r "${PROJECT_ROOT}/.github" "${SNAPSHOT_DIR}/cicd/" 2>/dev/null || echo "⚠️ Dossier .github/ non trouvé"

# 5. Créer les métadonnées
echo "📋 Création des métadonnées..."
cat > "${SNAPSHOT_DIR}/metadata.json" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "date": "$(date)",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'non-disponible')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'non-disponible')",
  "git_tag": "$(git describe --tags --exact-match 2>/dev/null || echo 'aucun-tag')",
  "snapshot_size": "$(du -sh ${SNAPSHOT_DIR} | cut -f1)",
  "components": {
    "application": "$([ -d ${SNAPSHOT_DIR}/app ] && echo 'inclus' || echo 'absent')",
    "configuration": "$([ -d ${SNAPSHOT_DIR}/config ] && echo 'inclus' || echo 'absent')",
    "infrastructure": "$([ -d ${SNAPSHOT_DIR}/infra ] && echo 'inclus' || echo 'absent')",
    "cicd": "$([ -d ${SNAPSHOT_DIR}/cicd ] && echo 'inclus' || echo 'absent')"
  }
}
EOF

# 6. Créer un README pour ce snapshot
cat > "${SNAPSHOT_DIR}/README.md" << EOF
# Snapshot ${TIMESTAMP}

## 📊 Informations

- **Date** : $(date)
- **Commit Git** : $(git rev-parse HEAD 2>/dev/null || echo 'non-disponible')
- **Branche** : $(git branch --show-current 2>/dev/null || echo 'non-disponible')
- **Tag** : $(git describe --tags --exact-match 2>/dev/null || echo 'aucun-tag')

## 📁 Contenu

- \`app/\` : Code de l'application
- \`config/\` : Fichiers de configuration
- \`infra/\` : Infrastructure (Terraform/Ansible)
- \`cicd/\` : Workflows CI/CD
- \`metadata.json\` : Métadonnées du snapshot

## 🔄 Restauration

Pour restaurer ce snapshot, utilisez :
\`\`\`bash
../rollback/restore-snapshot.sh ${TIMESTAMP}
\`\`\`
EOF

# 7. Compression optionnelle (pour économiser l'espace)
if command -v tar >/dev/null; then
    echo "🗜️ Compression du snapshot..."
    tar -czf "${SNAPSHOT_DIR}.tar.gz" -C snapshots "${TIMESTAMP}"
    echo "✅ Snapshot compressé : ${SNAPSHOT_DIR}.tar.gz"
fi

echo "✅ Snapshot créé avec succès : ${SNAPSHOT_DIR}"
echo "📊 Taille : $(du -sh ${SNAPSHOT_DIR} | cut -f1)"
echo "📋 Métadonnées : ${SNAPSHOT_DIR}/metadata.json" 