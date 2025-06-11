# 🏷️ Guide de Versioning et Tags Git

## 📋 **Vue d'ensemble**

Ce projet utilise un système de versioning sémantique (SemVer) avec des tags Git automatisés pour gérer les releases et le déploiement.

## 🎯 **Versioning Sémantique (SemVer)**

### Format : `MAJOR.MINOR.PATCH`

- **MAJOR** : Changements incompatibles avec l'API
- **MINOR** : Nouvelles fonctionnalités rétrocompatibles  
- **PATCH** : Corrections de bugs rétrocompatibles

### Exemples :
- `1.0.0` → `1.0.1` : Correction de bug (patch)
- `1.0.1` → `1.1.0` : Nouvelle fonctionnalité (minor)
- `1.1.0` → `2.0.0` : Changement breaking (major)

## 🛠️ **Utilisation du script de release**

### Script automatisé : `scripts/create-release.sh`

```bash
# Créer une version patch (1.1.2 → 1.1.3)
./scripts/create-release.sh patch

# Créer une version minor (1.1.3 → 1.2.0)
./scripts/create-release.sh minor

# Créer une version major (1.2.0 → 2.0.0)
./scripts/create-release.sh major

# Version spécifique
./scripts/create-release.sh 2.1.5
```

### Options disponibles :

```bash
# Voir la version actuelle
./scripts/create-release.sh --current

# Lister les tags existants
./scripts/create-release.sh --list

# Aide
./scripts/create-release.sh --help
```

## 📊 **État actuel du projet**

### Tags existants :
```
v1.1.2  ← Version actuelle
v1.1.1
v1.1.0
v1.0.1
v1.0.0  ← Version initiale
```

### Version dans package.json :
```json
{
  "version": "1.1.2"
}
```

## 🔄 **Processus automatisé**

Le script `create-release.sh` effectue automatiquement :

1. **Calcul de version** : Incrémente selon le type (patch/minor/major)
2. **Mise à jour** : Met à jour `package.json` avec la nouvelle version
3. **Commit** : Crée un commit avec le message `chore: bump version to X.Y.Z`
4. **Tagging** : Crée un tag Git annoté avec métadonnées
5. **Push** : Pousse le commit et le tag vers GitHub
6. **Documentation** : Affiche un résumé de la release

## 📝 **Format des tags**

Chaque tag est créé avec :

```bash
git tag -a "vX.Y.Z" -m "Release vX.Y.Z

Changements dans cette version :
- Mise à jour vers la version X.Y.Z
- Amélioration continue du pipeline CI/CD
- Documentation mise à jour

Date: $(date)
Commit: $(git rev-parse HEAD)"
```

## 🚀 **Intégration CI/CD**

### GitHub Actions déclenché par tags :

```yaml
on:
  push:
    tags:
      - 'v*'
```

### Déploiement automatique :
- **Tags `v*.*.*`** → Déploiement en production
- **Tags `v*.*.*-rc*`** → Déploiement en staging
- **Tags `v*.*.*-beta*`** → Déploiement en test

## 📋 **Bonnes pratiques**

### 1. **Avant de créer une release :**
- ✅ Tous les tests passent
- ✅ Code review effectué
- ✅ Documentation à jour
- ✅ CHANGELOG mis à jour

### 2. **Convention de commit :**
```bash
feat: nouvelle fonctionnalité (minor)
fix: correction de bug (patch)
BREAKING CHANGE: changement incompatible (major)
chore: maintenance (patch)
docs: documentation (patch)
```

### 3. **Branches et versioning :**
- `main` : Versions stables uniquement
- `develop` : Développement en cours
- `feature/*` : Nouvelles fonctionnalités
- `hotfix/*` : Corrections urgentes

## 🔍 **Commandes utiles**

### Voir l'historique des versions :
```bash
git tag --sort=-version:refname
```

### Voir les détails d'un tag :
```bash
git show v1.1.2
```

### Comparer deux versions :
```bash
git diff v1.1.1..v1.1.2
```

### Créer une release GitHub automatique :
```bash
gh release create v1.1.2 --generate-notes
```

## 📈 **Roadmap versioning**

### v1.1.x (Patch)
- Corrections de bugs
- Améliorations de performance
- Mise à jour documentation

### v1.2.0 (Minor)
- Nouvelles fonctionnalités API
- Nouveaux endpoints
- Améliorations monitoring

### v2.0.0 (Major)
- Refactoring architecture
- Breaking changes API
- Migration base de données

## 🛡️ **Sécurité et rollback**

### Tags de sécurité :
- Format : `v1.1.2-security.1`
- Déploiement prioritaire
- Tests de sécurité obligatoires

### Rollback rapide :
```bash
# Revenir à la version précédente
git checkout v1.1.1
./scripts/deploy.sh rollback v1.1.1
```

## 📊 **Métriques et suivi**

### KPIs versioning :
- ✅ Fréquence des releases
- ✅ Temps entre développement et production  
- ✅ Taux de succès des déploiements
- ✅ Temps de rollback en cas d'incident

---

**Dernière mise à jour** : $(date)
**Version du guide** : 1.0.0
**Auteur** : Kevin - Evaluation YNOV DevOps 