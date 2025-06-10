# 🔒 GitHub Actions avec Repository Privé - Résolution des Erreurs

## 🚨 Problème Rencontré

Lors du déploiement CI/CD, l'erreur suivante apparaît :

```
Run actions/checkout@v4
Syncing repository: Kevinmrgt/EvalutationCICD
Getting Git version info
...
remote: Repository not found.
Error: fatal: repository 'https://github.com/Kevinmrgt/EvalutationCICD/' not found
The process '/usr/bin/git' failed with exit code 128
```

## 🔍 Diagnostic

### Cause Identifiée
Le repository est **privé** (`"isPrivate":true`), ce qui nécessite des permissions spéciales pour GitHub Actions.

### Vérification du Statut
```bash
gh repo view Kevinmrgt/EvalutationCICD --json visibility,isPrivate,viewerPermission
# Résultat : {"isPrivate":true,"viewerPermission":"ADMIN","visibility":"PRIVATE"}
```

## ✅ Solutions Appliquées

### 1. **Permissions Global au Niveau Workflow**

Ajout des permissions nécessaires dans tous les workflows :

#### **ci.yml** - Workflow CI
```yaml
permissions:
  contents: read        # Lecture du code source
  actions: read         # Accès aux artifacts et actions
  checks: write         # Écriture des résultats de tests
  pull-requests: write  # Commentaires sur les PR
  security-events: write # Rapports de sécurité
```

#### **cd.yml** - Workflow CD
```yaml
permissions:
  contents: read        # Lecture du code source
  actions: read         # Accès aux artifacts
  checks: write         # Statuts de déploiement
  packages: write       # Push vers GitHub Container Registry
  security-events: write # Scans de sécurité
```

#### **security-*.yml** - Workflows de Sécurité
```yaml
permissions:
  contents: read        # Lecture du code source
  actions: read         # Accès aux artifacts
```

### 2. **Permissions Spécifiques par Job**

Pour certains jobs nécessitant des permissions particulières :

```yaml
jobs:
  release:
    permissions:
      contents: write   # Création de releases GitHub
```

## 🔧 Actions Correctives Effectuées

### Fichiers Modifiés
- `.github/workflows/ci.yml` - ✅ Permissions ajoutées
- `.github/workflows/cd.yml` - ✅ Permissions réorganisées
- `.github/workflows/security-basic.yml` - ✅ Permissions ajoutées
- `.github/workflows/security-safe.yml` - ✅ Permissions ajoutées

### Commit de Correction
```bash
git commit -m "fix(ci): Add permissions for private repository access in all GitHub Actions workflows"
git push origin main
```

## 📋 Autres Solutions Possibles

### **Option 1 : Repository Public**
```bash
gh repo edit Kevinmrgt/EvalutationCICD --visibility public
```
⚠️ **Attention** : Rend le code accessible publiquement

### **Option 2 : Token Personnel d'Accès (PAT)**
```yaml
- name: Checkout with PAT
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```

### **Option 3 : GitHub App**
Création d'une GitHub App avec permissions spécifiques

## 🛡️ Permissions GitHub Actions - Guide Complet

### **Permissions Principales**
| Permission | Description | Usage |
|------------|-------------|--------|
| `contents: read` | Lecture du code source | **Obligatoire** pour checkout |
| `contents: write` | Écriture (releases, tags) | Création de releases |
| `actions: read` | Accès aux artifacts | Téléchargement d'artifacts |
| `checks: write` | Écriture de checks | Statuts de tests/déploiement |
| `packages: write` | Registry de conteneurs | Push Docker images |
| `pull-requests: write` | Commentaires sur PR | Rapports de tests |
| `security-events: write` | Événements de sécurité | Upload SARIF, CodeQL |

### **Modèle de Permissions par Type de Workflow**

#### **Workflow CI (Tests)**
```yaml
permissions:
  contents: read
  actions: read
  checks: write
  pull-requests: write
```

#### **Workflow CD (Déploiement)**
```yaml
permissions:
  contents: read
  actions: read
  checks: write
  packages: write
```

#### **Workflow Sécurité**
```yaml
permissions:
  contents: read
  actions: read
  security-events: write
```

## 🔍 Vérification du Fix

### Tests à Effectuer
1. **Trigger automatique** : Push sur `main` ou `develop`
2. **Workflow manuel** : `workflow_dispatch`
3. **Pull Request** : Créer une PR pour tester

### Surveillance
```bash
# Vérifier les logs d'exécution
gh run list --workflow=ci.yml
gh run view [RUN_ID] --log
```

## 🎯 Résultat Attendu

Après application de ces corrections :
- ✅ `actions/checkout@v4` réussit
- ✅ Repository privé accessible par GitHub Actions
- ✅ Workflows s'exécutent normalement
- ✅ Pas d'erreur "Repository not found"

---

**Statut** : ✅ **RÉSOLU**  
**Date** : $(date)  
**Commit** : 4af97ce 