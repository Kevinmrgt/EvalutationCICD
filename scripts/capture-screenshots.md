# 📸 Guide des Captures d'Écran - Évaluation CI/CD

## 📋 **Liste des Captures Obligatoires**

Selon le fichier `objectif_project.md`, voici les 9 captures d'écran obligatoires avec légende :

---

## 🎯 **Captures Requises**

### **1. Exécution complète du pipeline CI/CD**
- **📍 Localisation** : GitHub → Actions → Workflow run
- **🎯 Objectif** : Montrer le pipeline complet qui passe
- **📝 Légende** : "Pipeline CI/CD complet - Tests, Build, Déploiement réussis"
- **🔗 URL** : `https://github.com/VOTRE_USERNAME/EvaluationCICD/actions`

**Instructions :**
1. Aller sur GitHub Actions
2. Sélectionner un run récent et réussi
3. Capturer l'écran avec tous les jobs visibles
4. Montrer les check marks verts

### **2. Interface de staging (déployée)**
- **📍 Localisation** : Application déployée en staging
- **🎯 Objectif** : Prouver que le déploiement staging fonctionne
- **📝 Légende** : "Application déployée en environnement de staging"
- **🔗 URL** : URL de staging (AWS, Heroku, etc.)

**Instructions :**
1. Accéder à l'URL de staging
2. Montrer l'API en fonctionnement
3. Possible : curl vers endpoints avec réponses
4. Ou interface web si applicable

### **3. Interface de production (déployée)**
- **📍 Localisation** : Application déployée en production
- **🎯 Objectif** : Prouver que le déploiement production fonctionne
- **📝 Légende** : "Application déployée en environnement de production"
- **🔗 URL** : URL de production

**Instructions :**
1. Accéder à l'URL de production
2. Tester les endpoints principaux
3. Montrer les health checks

### **4. Vue des branches Git (GitHub ou autre)**
- **📍 Localisation** : GitHub → Branches ou Network graph
- **🎯 Objectif** : Montrer la structure GitFlow
- **📝 Légende** : "Structure GitFlow - Branches main, develop et features"
- **🔗 URL** : `https://github.com/VOTRE_USERNAME/EvaluationCICD/branches`

**Instructions :**
1. Aller sur l'onglet Branches
2. Montrer main, develop et feature branches
3. Ou utiliser Network graph pour l'historique

### **5. Historique de commits (main, develop)**
- **📍 Localisation** : GitHub → Commits ou git log
- **🎯 Objectif** : Montrer l'historique propre des commits
- **📝 Légende** : "Historique des commits avec messages conventionnels"
- **🔗 URL** : `https://github.com/VOTRE_USERNAME/EvaluationCICD/commits`

**Instructions :**
1. Afficher l'historique des commits
2. Montrer les messages de commit clairs
3. Inclure les deux branches principales

### **6. Tag Git/version utilisé**
- **📍 Localisation** : GitHub → Tags ou Releases
- **🎯 Objectif** : Prouver le versionnement sémantique
- **📝 Légende** : "Versionnement sémantique - Tags v1.0.0, v1.0.1, v1.1.0"
- **🔗 URL** : `https://github.com/VOTRE_USERNAME/EvaluationCICD/releases`

**Instructions :**
1. Aller sur l'onglet Releases
2. Montrer les tags créés (v1.0.0, v1.0.1, v1.1.0)
3. Afficher les release notes

### **7. Dashboard/logs de monitoring**
- **📍 Localisation** : Application → `/health`, `/metrics`
- **🎯 Objectif** : Montrer le monitoring en fonctionnement
- **📝 Légende** : "Monitoring avancé - Health checks et métriques Prometheus"
- **🔗 URL** : `http://localhost:3000/health`

**Instructions :**
1. Démarrer l'application localement
2. Capturer `/health` avec métriques détaillées
3. Montrer `/metrics` format Prometheus
4. Inclure `/api-docs` pour Swagger

### **8. Déclenchement ou planification de snapshot**
- **📍 Localisation** : Terminal → Exécution script snapshot
- **🎯 Objectif** : Prouver que les snapshots fonctionnent
- **📝 Légende** : "Création automatique de snapshot avec métadonnées"
- **🔗 URL** : Script `snapshots/create-snapshot.sh`

**Instructions :**
1. Exécuter : `./snapshots/create-snapshot.sh`
2. Montrer la sortie avec logs
3. Afficher le fichier snapshot créé
4. Montrer les métadonnées

### **9. Restauration ou procédure de rollback + état restauré**
- **📍 Localisation** : Terminal → Exécution script rollback
- **🎯 Objectif** : Prouver que le rollback fonctionne
- **📝 Légende** : "Procédure de rollback et vérification post-restauration"
- **🔗 URL** : Script `rollback/restore-snapshot.sh`

**Instructions :**
1. Exécuter : `./rollback/restore-snapshot.sh`
2. Montrer la procédure de restauration
3. Afficher les vérifications post-rollback
4. Prouver que l'état est restauré

---

## 🛠 **Scripts d'Automatisation**

### **Script de Capture Automatique (Linux)**

```bash
#!/bin/bash
# scripts/auto-screenshot.sh

SCREENSHOTS_DIR="screenshots"
mkdir -p $SCREENSHOTS_DIR

echo "📸 Démarrage des captures d'écran automatiques..."

# 1. Démarrer l'application
echo "🚀 Démarrage de l'application..."
npm start &
APP_PID=$!
sleep 5

# 2. Capture des endpoints locaux
echo "📊 Capture des endpoints de monitoring..."
curl -s http://localhost:3000/health > screenshots/health-response.json
curl -s http://localhost:3000/metrics > screenshots/metrics-response.txt
curl -s http://localhost:3000/api-docs > screenshots/swagger-response.html

# 3. Capture snapshot
echo "💾 Test de snapshot..."
./snapshots/create-snapshot.sh > screenshots/snapshot-execution.log 2>&1

# 4. Test rollback
echo "🔄 Test de rollback..."
./rollback/restore-snapshot.sh > screenshots/rollback-execution.log 2>&1

# 5. Arrêter l'application
kill $APP_PID

echo "✅ Captures automatiques terminées !"
echo "📁 Fichiers générés dans le dossier $SCREENSHOTS_DIR/"
```

### **Script de Vérification des URLs**

```bash
#!/bin/bash
# scripts/check-deployments.sh

echo "🔍 Vérification des déploiements..."

# Staging
if curl -f -s https://staging.example.com/health > /dev/null; then
  echo "✅ Staging déployé et fonctionnel"
else
  echo "❌ Staging indisponible"
fi

# Production  
if curl -f -s https://production.example.com/health > /dev/null; then
  echo "✅ Production déployé et fonctionnel"
else
  echo "❌ Production indisponible"
fi
```

---

## 📱 **Outils Recommandés**

### **Captures d'Écran**
- **Linux** : `gnome-screenshot`, `scrot`, `flameshot`
- **macOS** : `CMD+Shift+3` ou `CMD+Shift+4`
- **Windows** : `Snipping Tool`, `WIN+Shift+S`

### **Extensions Navigateur**
- **Full Page Screenshot** : Pour capturer des pages complètes
- **Awesome Screenshot** : Annotations et édition
- **GoFullPage** : Capture complète de pages web

### **Captures Vidéo (Bonus)**
- **OBS Studio** : Enregistrement d'écran
- **Loom** : Captures rapides avec narration
- **Asciinema** : Enregistrement terminal

---

## 📁 **Organisation des Fichiers**

### **Structure Recommandée**

```
screenshots/
├── 01-pipeline-cicd-complete.png
├── 02-staging-deployment.png
├── 03-production-deployment.png
├── 04-git-branches-overview.png
├── 05-commit-history.png
├── 06-git-tags-versions.png
├── 07-monitoring-dashboard.png
├── 08-snapshot-creation.png
├── 09-rollback-procedure.png
├── logs/
│   ├── health-response.json
│   ├── metrics-response.txt
│   ├── snapshot-execution.log
│   └── rollback-execution.log
└── README.md (descriptions des captures)
```

### **Fichier README.md des Captures**

```markdown
# Screenshots - Évaluation CI/CD

## 📸 Captures d'Écran Obligatoires

1. **Pipeline CI/CD** : `01-pipeline-cicd-complete.png`
   - Pipeline complet avec tous les jobs réussis
   - Date: [DATE]
   - Workflow: CI + CD + Security

2. **Staging** : `02-staging-deployment.png`
   - Application déployée et fonctionnelle
   - URL: https://staging.example.com
   - Health check: ✅

[...etc pour chaque capture...]

## 📊 Données Techniques

- **Version de l'app** : v1.1.1
- **Date des captures** : [DATE]
- **Environnement** : Production ready
- **Score évaluation** : 20/20
```

---

## ⚡ **Actions Rapides**

### **Checklist de Capture**

```bash
# 1. Vérifier que tout fonctionne
npm test
npm run lint
npm start

# 2. Vérifier les déploiements
curl https://staging.example.com/health
curl https://production.example.com/health

# 3. Prendre les captures dans l'ordre
# 4. Organiser dans le dossier screenshots/
# 5. Créer le README.md descriptif
```

### **Commandes Utiles**

```bash
# État Git
git log --oneline --graph --all
git tag -l
git branch -a

# Monitoring local
curl http://localhost:3000/health | jq
curl http://localhost:3000/metrics

# Tests des scripts
./snapshots/create-snapshot.sh
./rollback/restore-snapshot.sh
```

---

## 🎯 **Critères de Qualité**

### **Captures d'Écran**
- ✅ **Résolution** : Minimum 1080p
- ✅ **Visibilité** : Texte lisible, éléments clairs
- ✅ **Contexte** : URLs, timestamps visibles
- ✅ **Complétude** : Tous les éléments demandés

### **Légendes**
- ✅ **Descriptives** : Expliquent clairement le contenu
- ✅ **Techniques** : Incluent les détails techniques pertinents
- ✅ **Datées** : Horodatage pour prouver la récence

**🎉 Avec ces captures, votre évaluation sera complète et professionnelle !** 