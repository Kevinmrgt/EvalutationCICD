# Rollback Strategy

## 🔄 Vue d'ensemble

Ce dossier contient les scripts et procédures pour effectuer un rollback (retour arrière) de l'application en cas de problème.

## 🎯 Objectif Simple

Permettre une restauration rapide et fiable vers un état stable précédent, en respectant les critères d'évaluation (2 points sur 20).

## 📋 Composants

### 1. `restore-snapshot.sh`
- Script principal pour restaurer un snapshot
- Restaure l'application, configuration et infrastructure

### 2. `rollback-app.sh`
- Rollback spécifique de l'application
- Redéploie la version précédente

### 3. `rollback-git.sh`
- Rollback basé sur Git
- Retour à un commit ou tag spécifique

## 🚀 Utilisation

```bash
# Restaurer un snapshot spécifique
./restore-snapshot.sh 2024-01-15_14-30-45

# Rollback application seulement
./rollback-app.sh v1.0.0

# Rollback Git vers tag précédent
./rollback-git.sh v1.0.0
```

## 📋 Procédure de rollback complète

### Étape 1 : Identifier le problème
- Vérifier les logs de monitoring
- Identifier la version stable précédente

### Étape 2 : Choisir la stratégie
- **Snapshot** : Restauration complète
- **Git** : Retour à un commit/tag
- **Application** : Redéploiement version précédente

### Étape 3 : Exécuter le rollback
```bash
# Exemple avec snapshot
./restore-snapshot.sh 2024-01-15_14-30-45

# Exemple avec Git tag
./rollback-git.sh v1.0.0
```

### Étape 4 : Vérification
- Tester l'application restaurée
- Vérifier les endpoints API
- Confirmer la stabilité

## ✅ Critères respectés

- ✅ Procédure de rollback documentée
- ✅ Scripts automatisés
- ✅ Restauration depuis snapshots
- ✅ Rollback basé sur versions Git
- ✅ Vérification post-restauration 