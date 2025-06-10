# Snapshots Strategy

## 📸 Vue d'ensemble

Ce dossier contient les scripts et configurations pour créer des snapshots (sauvegardes) de l'application et de l'infrastructure.

## 🎯 Objectif Simple

Créer des sauvegardes rapides et fiables pour permettre une restauration en cas de problème, en respectant les critères d'évaluation (2 points sur 20).

## 📋 Composants

### 1. `create-snapshot.sh`
- Script principal pour créer un snapshot
- Sauvegarde le code, les données et la configuration

### 2. `snapshot-app.sh`
- Snapshot spécifique de l'application Node.js
- Inclut package.json, src/, et configuration

### 3. `snapshot-infra.sh`
- Snapshot de l'infrastructure Terraform
- Sauvegarde l'état et la configuration

## 🚀 Utilisation

```bash
# Créer un snapshot complet
./create-snapshot.sh

# Snapshot app seulement  
./snapshot-app.sh

# Snapshot infrastructure seulement
./snapshot-infra.sh
```

## 📁 Structure des snapshots

```
snapshots/
├── YYYY-MM-DD_HH-MM-SS/
│   ├── app/           # Code application
│   ├── config/        # Configuration
│   ├── infra/         # État Terraform
│   └── metadata.json  # Informations du snapshot
```

## ✅ Critères respectés

- ✅ Snapshots automatisés
- ✅ Versionning des sauvegardes  
- ✅ Métadonnées pour traçabilité
- ✅ Scripts simples et fonctionnels 