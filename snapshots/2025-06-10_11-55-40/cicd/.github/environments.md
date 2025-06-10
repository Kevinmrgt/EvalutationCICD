# 🌍 Configuration des Environnements GitHub

Ce document décrit la configuration des environnements pour le déploiement continu.

## 📋 Environnements configurés

### 🧪 Staging
- **URL**: https://staging.evalutationcicd.com
- **Déclencheur**: Push sur `main`
- **Protection**: Aucune (déploiement automatique)
- **Variables**:
  - `NODE_ENV=staging`
  - `LOG_LEVEL=debug`

### 🌟 Production
- **URL**: https://evalutationcicd.com
- **Déclencheur**: Après succès du staging
- **Protection**: Approbation manuelle requise
- **Reviewers**: @Kevinmrgt
- **Variables**:
  - `NODE_ENV=production`
  - `LOG_LEVEL=info`

## 🔐 Secrets requis

### Repository Secrets
```
SNYK_TOKEN          # Token pour les scans de sécurité Snyk
SEMGREP_APP_TOKEN   # Token pour l'analyse SAST Semgrep
```

### Environment Secrets (Staging)
```
DATABASE_URL        # URL de la base de données staging
REDIS_URL          # URL Redis staging
API_SECRET_KEY     # Clé secrète API staging
```

### Environment Secrets (Production)
```
DATABASE_URL        # URL de la base de données production
REDIS_URL          # URL Redis production
API_SECRET_KEY     # Clé secrète API production
MONITORING_TOKEN   # Token pour le monitoring
SLACK_WEBHOOK      # Webhook Slack pour notifications
```

## 🛠️ Configuration dans GitHub

### 1. Créer les environnements
1. Aller dans **Settings** > **Environments**
2. Créer les environnements `staging` et `production`
3. Configurer les protections et reviewers

### 2. Ajouter les secrets
1. Aller dans **Settings** > **Secrets and variables** > **Actions**
2. Ajouter les repository secrets
3. Ajouter les environment secrets pour chaque environnement

### 3. Configuration des protections

#### Staging
- ✅ Déploiement automatique
- ❌ Pas de reviewers requis
- ⏱️ Pas de délai d'attente

#### Production
- ✅ Reviewers requis: @Kevinmrgt
- ✅ Délai d'attente: 30 minutes
- ✅ Branches autorisées: `main` uniquement

## 🔄 Workflow de déploiement

1. **Push sur `main`** → Déclenche CI
2. **CI réussi** → Build et push de l'image Docker
3. **Image prête** → Déploiement automatique sur staging
4. **Staging validé** → Attente approbation pour production
5. **Approbation** → Déploiement en production
6. **Production déployée** → Notifications et monitoring 