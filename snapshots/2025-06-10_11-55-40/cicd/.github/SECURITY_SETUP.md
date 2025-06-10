# 🔒 Configuration de sécurité GitHub

## 📋 Résolution des erreurs de déploiement

### 🚨 Problèmes identifiés

Votre pipeline CI/CD rencontre plusieurs erreurs liées aux permissions et à la configuration GitHub :

1. **"Resource not accessible by integration"** - Problèmes de permissions
2. **"Code scanning is not enabled"** - Code scanning non activé
3. **Fichiers SARIF manquants** - Problèmes de génération des rapports
4. **TruffleHog "BASE and HEAD commits are the same"** - Problème de commits

---

## ✅ Solutions étape par étape

### 1. Activer GitHub Security Features

#### 📍 **Code Scanning & Secret Scanning**
1. Allez dans **Settings** → **Security & analysis** de votre repository
2. Activez :
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Secret scanning** (si disponible)
   - ✅ **Code scanning** → **Set up** → **GitHub Actions**

#### 📍 **Permissions GitHub Actions**
1. Allez dans **Settings** → **Actions** → **General**
2. Dans **Workflow permissions**, sélectionnez :
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

### 2. Configurer les Secrets nécessaires

#### 📍 **Secrets obligatoires** (Settings → Secrets → Actions)
```bash
# Optionnels mais recommandés :
SNYK_TOKEN=your_snyk_token_here
SEMGREP_APP_TOKEN=your_semgrep_token_here
```

### 3. Configuration Repository

#### 📍 **Branches protégées**
1. **Settings** → **Branches** → **Add rule**
2. Pattern : `main`
3. Activez :
   - ✅ **Require status checks to pass**
   - ✅ **Require branches to be up to date**
   - ✅ **Include administrators**

---

## 🔧 Workflows disponibles

### 📁 Workflow principal de sécurité
- **Fichier** : `.github/workflows/security.yml`
- **Usage** : Complet avec toutes les fonctionnalités
- **Prérequis** : Permissions complètes + Code scanning activé

### 📁 Workflow de sécurité basique
- **Fichier** : `.github/workflows/security-basic.yml`
- **Usage** : Version simplifiée sans permissions spéciales
- **Prérequis** : Aucun - fonctionne immédiatement

---

## 🚀 Actions immédiates recommandées

### 1. **Désactiver temporairement le workflow principal**
```yaml
# Dans security.yml, ajoutez cette condition au début :
on:
  # push:
  #   branches: [main, develop]
  workflow_dispatch:  # Manual trigger only
```

### 2. **Utiliser le workflow basique en attendant**
Le workflow `security-basic.yml` va :
- ✅ Effectuer des vérifications de base
- ✅ Scanner les Dockerfiles
- ✅ Vérifier les dépendances npm
- ✅ Générer des rapports simples

### 3. **Tester progressivement**
```bash
# 1. Committer les modifications
git add .
git commit -m "fix: Update security workflows and add basic scanning"
git push

# 2. Déclencher manuellement le workflow basique
# GitHub → Actions → "Basic Security Checks" → "Run workflow"
```

---

## 📊 Vérification de la configuration

### ✅ Checklist avant déploiement

- [ ] Code scanning activé dans Settings
- [ ] Workflow permissions configurées en Read/Write
- [ ] Branches protégées configurées
- [ ] Workflow basique testé et fonctionnel
- [ ] Pas d'erreurs dans les logs GitHub Actions

### 🔍 Tests de validation

1. **Test du workflow basique** :
   ```bash
   # Doit passer sans erreurs
   GitHub Actions → "Basic Security Checks"
   ```

2. **Test du build Docker** :
   ```bash
   docker build -t test:latest --target production .
   ```

3. **Test de l'API** :
   ```bash
   npm start &
   node test-api.js
   ```

---

## 📚 Ressources supplémentaires

- [GitHub Security Documentation](https://docs.github.com/en/code-security)
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [SARIF Format Documentation](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning)

---

## 🆘 Support

Si vous continuez à avoir des problèmes :

1. **Vérifiez les logs détaillés** dans GitHub Actions
2. **Testez le workflow basique** en premier
3. **Activez les fonctionnalités une par une** pour identifier les blocages
4. **Utilisez `continue-on-error: true`** pour les étapes optionnelles

---

*Généré automatiquement - Mise à jour : $(date)* 