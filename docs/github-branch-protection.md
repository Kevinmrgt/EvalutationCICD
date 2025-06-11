# 🔒 Guide de Configuration - Protection des Branches GitHub

## 📋 **Vue d'ensemble**

Ce guide vous explique comment configurer la protection des branches sur GitHub pour sécuriser votre workflow GitFlow et garantir la qualité du code.

---

## 🎯 **Objectifs de la Protection des Branches**

- ✅ Empêcher les push directs sur la branche `main`
- ✅ Forcer les pull requests pour les modifications
- ✅ Exiger des reviews avant le merge
- ✅ Vérifier que les checks de statut passent
- ✅ Maintenir un historique propre et tracé

---

## 🔧 **Configuration Étape par Étape**

### **1. Accéder aux Paramètres du Repository**

1. **Ouvrir votre repository GitHub**
   - Naviguez vers votre repository : `https://github.com/VOTRE_USERNAME/EvaluationCICD`

2. **Accéder aux Settings**
   - Cliquez sur l'onglet `Settings` (en haut à droite)
   - Dans le menu de gauche, cliquez sur `Branches`

### **2. Configurer la Protection de la Branche Main**

#### **2.1 Créer une Règle de Protection**

1. **Ajouter une nouvelle règle**
   - Cliquez sur `Add rule`
   - Dans le champ `Branch name pattern`, saisissez : `main`

#### **2.2 Paramètres Recommandés**

##### **🔹 Require a pull request before merging**
```
☑️ Activé
├── ☑️ Require approvals (1 approbation minimum)
├── ☑️ Dismiss stale reviews when new commits are pushed
├── ☑️ Require review from CODEOWNERS (si applicable)
└── ☑️ Restrict pushes that create files that don't have owners (optionnel)
```

##### **🔹 Require status checks to pass before merging**
```
☑️ Activé
├── ☑️ Require branches to be up to date before merging
├── Status checks trouvés (sélectionner) :
│   ├── ☑️ CI / test (Node.js 18.x)
│   ├── ☑️ CI / test (Node.js 20.x)  
│   ├── ☑️ CI / lint
│   ├── ☑️ CI / build
│   └── ☑️ Security / audit
```

##### **🔹 Autres Paramètres de Sécurité**
```
☑️ Require conversation resolution before merging
☑️ Require signed commits (optionnel mais recommandé)
☑️ Require linear history (pour un historique propre)
☑️ Include administrators (appliquer les règles aux admins)
□ Allow deletions (décoché pour sécurité)
□ Allow force pushes (décoché pour sécurité)
```

### **3. Configuration Avancée (Optionnelle)**

#### **3.1 Protection de la Branche Develop**

Répétez le processus pour la branche `develop` avec des règles légèrement assouplies :

```
Branch name pattern: develop
☑️ Require a pull request before merging
├── Require approvals: 1
└── Dismiss stale reviews: activé

☑️ Require status checks to pass before merging
├── Require branches to be up to date: activé
└── Status checks: CI, lint, build

☑️ Require conversation resolution before merging
□ Require linear history (peut être désactivé pour develop)
```

#### **3.2 Protection des Branches Feature**

Pour les branches `feature/*` (optionnel) :

```
Branch name pattern: feature/*
☑️ Require status checks to pass before merging
├── Status checks: CI, lint
└── Require branches to be up to date: activé

□ Require a pull request (peut être désactivé pour les features)
```

---

## ✅ **Vérification de la Configuration**

### **1. Test de Protection**

Essayez de faire un push direct sur `main` :

```bash
# Ceci devrait échouer avec la protection activée
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "Test protection"
git push origin main
```

**Résultat attendu :** 
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
```

### **2. Workflow de Travail Correct**

Avec la protection activée, voici le workflow à suivre :

```bash
# 1. Créer une branche feature
git checkout develop
git pull origin develop
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et committer
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 3. Créer une Pull Request via GitHub UI
# 4. Attendre les reviews et checks
# 5. Merger via GitHub (squash ou merge commit)
```

---

## 📊 **Status Checks Configurés**

Voici les checks qui doivent passer avant le merge :

### **CI Pipeline (GitHub Actions)**
- ✅ **Tests unitaires** : `npm test`
- ✅ **Tests d'intégration** : `npm run test:integration`
- ✅ **Linting** : `npm run lint`
- ✅ **Build** : `npm run build`
- ✅ **Audit sécurité** : `npm audit`

### **Couverture de Code**
- ✅ **Seuil minimum** : 70% (configuré dans Jest)
- ✅ **Rapport de couverture** : Généré automatiquement

### **Vérifications de Sécurité**
- ✅ **Vulnérabilités** : Scan automatique
- ✅ **Secrets** : Vérification des secrets exposés

---

## 🚨 **Cas d'Urgence - Bypass des Protections**

### **Désactivation Temporaire** (Administrateurs uniquement)

En cas d'urgence critique :

1. **Aller dans Settings > Branches**
2. **Cliquer sur "Edit" sur la règle**
3. **Décocher temporairement "Include administrators"**
4. **Effectuer les modifications urgentes**
5. **IMMÉDIATEMENT réactiver les protections**

### **Procédure d'Urgence Documentée**

```bash
# 1. Documenter la raison dans un issue GitHub
# 2. Notifier l'équipe
# 3. Effectuer le fix minimal
# 4. Créer une PR de suivi pour review a posteriori
# 5. Réactiver les protections
```

---

## 📈 **Métriques et Suivi**

### **Indicateurs à Surveiller**

- ✅ **Nombre de PR créées** vs **push directs tentés**
- ✅ **Temps moyen de review** des PR
- ✅ **Taux de passage des CI checks**
- ✅ **Fréquence des bypasses d'urgence**

### **Insights GitHub**

Consultez régulièrement :
- **Insights > Network** : Visualiser les branches et merges
- **Insights > Pulse** : Activité du repository
- **Security > Advisories** : Alertes de sécurité

---

## 🎯 **Bénéfices de la Configuration**

### **Qualité du Code**
- ✅ Review obligatoire = moins de bugs
- ✅ CI automatique = détection précoce des problèmes
- ✅ Tests obligatoires = couverture maintenue

### **Sécurité**
- ✅ Pas de push direct = traçabilité complète
- ✅ Audit automatique = vulnérabilités détectées
- ✅ Signatures commits = authentification

### **Collaboration**
- ✅ PR = discussion et partage de connaissance
- ✅ Reviews = montée en compétences
- ✅ Historique propre = debug facilité

---

## 📚 **Ressources Supplémentaires**

- [Documentation GitHub - About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions - Status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-status-checks)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

## ✅ **Checklist de Validation**

- [ ] Règle créée pour la branche `main`
- [ ] PR obligatoires configurées
- [ ] Reviews requises (minimum 1)
- [ ] Status checks sélectionnés
- [ ] Linear history activé
- [ ] Include administrators activé
- [ ] Test de protection effectué
- [ ] Documentation partagée avec l'équipe

**🎉 Configuration terminée ! Votre repository est maintenant protégé et suit les bonnes pratiques GitFlow.** 