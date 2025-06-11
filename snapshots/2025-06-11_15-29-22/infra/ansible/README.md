# 🔧 Automatisation avec Ansible

Ce dossier contient les playbooks et rôles Ansible pour automatiser la configuration des serveurs de l'infrastructure CI/CD Node.js.

## 📋 Vue d'ensemble

Ansible est utilisé pour :
- 🔧 Configurer les serveurs après leur déploiement par Terraform
- 📱 Déployer l'application Node.js
- 🔄 Gérer les mises à jour et les rollbacks
- 📊 Configurer le monitoring et les logs
- 🔐 Appliquer les politiques de sécurité

## 🏗️ Structure du projet

```
ansible/
├── ansible.cfg                 # Configuration Ansible
├── inventory/
│   ├── hosts.yml              # Inventaire principal
│   ├── group_vars/            # Variables par groupe
│   └── host_vars/             # Variables par host
├── playbooks/
│   ├── site.yml               # Playbook principal
│   ├── deploy.yml             # Déploiement application
│   ├── rollback.yml           # Rollback
│   └── tasks/                 # Tâches communes
├── roles/
│   ├── common/                # Configuration de base
│   ├── security/              # Sécurisation
│   ├── nodejs/                # Installation Node.js/PM2
│   ├── application/           # Déploiement app
│   ├── monitoring/            # Monitoring
│   └── database/              # Configuration DB
├── templates/                 # Templates Jinja2
├── files/                     # Fichiers statiques
├── logs/                      # Logs Ansible
└── scripts/                   # Scripts utilitaires
```

## 🚀 Installation et configuration

### Prérequis

1. **Ansible** >= 2.9 installé
2. **Python** >= 3.6
3. **SSH** configuré pour accéder aux serveurs
4. **AWS CLI** (pour l'intégration avec Terraform)

```bash
# Installation d'Ansible sur Ubuntu/Debian
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install ansible

# Installation via pip
pip3 install ansible boto3 botocore

# Vérification
ansible --version
```

### Configuration initiale

1. **Clonez et configurez l'environnement :**
```bash
cd ansible

# Créez les répertoires de logs
mkdir -p logs reports

# Copiez la configuration d'exemple
cp inventory/hosts.yml.example inventory/hosts.yml
```

2. **Configurez votre inventaire dans `inventory/hosts.yml` :**
```yaml
all:
  children:
    development:
      children:
        web_servers_dev:
          hosts:
            dev-web-01:
              ansible_host: 10.0.1.10
              ansible_user: ec2-user
              ansible_ssh_private_key_file: ~/.ssh/my-key.pem
```

3. **Testez la connectivité :**
```bash
ansible all -m ping
```

## 🎯 Utilisation

### Déploiement complet

```bash
# Déploiement complet sur tous les serveurs
ansible-playbook playbooks/site.yml

# Déploiement sur un environnement spécifique
ansible-playbook playbooks/site.yml -l development

# Déploiement avec des variables personnalisées
ansible-playbook playbooks/site.yml -e "app_version=v1.2.3 environment=staging"

# Mode dry-run (simulation)
ansible-playbook playbooks/site.yml --check --diff
```

### Déploiement par composants

```bash
# Configuration de base seulement
ansible-playbook playbooks/site.yml --tags "common,security"

# Installation Node.js seulement
ansible-playbook playbooks/site.yml --tags "nodejs"

# Déploiement application seulement
ansible-playbook playbooks/deploy.yml

# Configuration monitoring seulement
ansible-playbook playbooks/site.yml --tags "monitoring"
```

### Commandes utiles

```bash
# Lister les hosts
ansible-inventory --list

# Vérifier la syntaxe d'un playbook
ansible-playbook playbooks/site.yml --syntax-check

# Exécuter une commande ad-hoc
ansible web_servers -m command -a "systemctl status nodejs"

# Voir les facts d'un serveur
ansible dev-web-01 -m setup

# Redémarrer l'application
ansible web_servers -m systemd -a "name=pm2-nodejs state=restarted" --become
```

## 📱 Déploiement d'application

### Déploiement standard

```bash
# Déploiement avec la dernière version
ansible-playbook playbooks/deploy.yml

# Déploiement d'une version spécifique
ansible-playbook playbooks/deploy.yml -e "app_version=v1.2.3"

# Déploiement avec stratégie rolling (par défaut)
ansible-playbook playbooks/deploy.yml -e "deployment_strategy=rolling"

# Déploiement blue-green
ansible-playbook playbooks/deploy.yml -e "deployment_strategy=blue_green"
```

### Variables de déploiement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `app_version` | Version à déployer | `latest` |
| `deployment_strategy` | Stratégie (rolling/blue_green) | `rolling` |
| `app_port` | Port de l'application | `3000` |
| `health_check_retries` | Tentatives de health check | `5` |
| `rollback_enabled` | Activer le rollback auto | `true` |

### Rollback

```bash
# Rollback vers la version précédente
ansible-playbook playbooks/rollback.yml

# Rollback vers une version spécifique
ansible-playbook playbooks/rollback.yml -e "rollback_version=v1.1.0"

# Rollback d'urgence (sans health checks)
ansible-playbook playbooks/rollback.yml -e "emergency_rollback=true"
```

## 🔧 Rôles disponibles

### 1. Common (rôle de base)
- ✅ Configuration système de base
- ✅ Installation des packages essentiels
- ✅ Configuration des utilisateurs
- ✅ Optimisations système pour Node.js
- ✅ Configuration des logs

### 2. Security (sécurisation)
- ✅ Configuration SSH durcie
- ✅ Firewall (iptables/firewalld)
- ✅ Fail2ban pour la protection
- ✅ Audit des accès
- ✅ Désactivation des services inutiles

### 3. Node.js (environnement d'exécution)
- ✅ Installation Node.js (version configurable)
- ✅ Configuration npm
- ✅ Installation et configuration PM2
- ✅ Service systemd pour PM2
- ✅ Scripts de gestion

### 4. Application (déploiement)
- ✅ Déploiement du code applicatif
- ✅ Gestion des dépendances npm
- ✅ Configuration des variables d'environnement
- ✅ Health checks
- ✅ Gestion des releases

### 5. Monitoring (observabilité)
- ✅ Configuration CloudWatch Agent
- ✅ Métriques système et applicatives
- ✅ Logs centralisés
- ✅ Alerting de base
- ✅ Dashboards

### 6. Database (base de données)
- ✅ Configuration PostgreSQL/MySQL
- ✅ Optimisation des performances
- ✅ Sauvegardes automatiques
- ✅ Monitoring spécifique DB

## 🔄 Intégration CI/CD

### Avec GitHub Actions

```yaml
# .github/workflows/deploy.yml
- name: Deploy with Ansible
  run: |
    cd ansible
    ansible-playbook playbooks/deploy.yml \
      -e "app_version=${{ github.sha }}" \
      -e "environment=production"
```

### Avec Jenkins

```groovy
// Jenkinsfile
stage('Deploy') {
    steps {
        sh '''
            cd ansible
            ansible-playbook playbooks/deploy.yml \
                -e "app_version=${BUILD_NUMBER}" \
                -e "environment=${ENVIRONMENT}"
        '''
    }
}
```

## 📊 Monitoring et logs

### Logs Ansible
```bash
# Voir les logs en temps réel
tail -f logs/ansible.log

# Logs par date
ls logs/ansible-*.log

# Rapports de déploiement
ls reports/deployment-*.yml
```

### Health checks
```bash
# Vérifier l'état des services
ansible web_servers -m systemd -a "name=pm2-nodejs" --become

# Status de l'application
ansible web_servers -m uri -a "url=http://localhost:3000/health"

# Métriques système
ansible web_servers -m shell -a "/usr/local/bin/system-health.sh"
```

## 🔐 Sécurité

### Gestion des secrets

1. **Utilisez Ansible Vault pour les données sensibles :**
```bash
# Créer un fichier chiffré
ansible-vault create group_vars/production/vault.yml

# Éditer un fichier chiffré
ansible-vault edit group_vars/production/vault.yml

# Déployer avec vault
ansible-playbook playbooks/site.yml --ask-vault-pass
```

2. **Variables sensibles dans vault.yml :**
```yaml
# group_vars/production/vault.yml
vault_db_password: "super_secret_password"
vault_api_keys:
  github: "ghp_xxxxxxxxxxxx"
  aws: "AKIAXXXXXXXXXX"
```

### SSH et clés

```bash
# Générer une clé SSH pour Ansible
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ansible-key

# Copier la clé sur les serveurs
ssh-copy-id -i ~/.ssh/ansible-key.pub ec2-user@server-ip

# Utiliser la clé dans ansible.cfg
private_key_file = ~/.ssh/ansible-key
```

## 🆘 Dépannage

### Erreurs courantes

**Erreur de connexion SSH :**
```
UNREACHABLE! => {"changed": false, "msg": "Failed to connect to the host"}
```
**Solutions :**
- Vérifiez la connectivité réseau
- Contrôlez les clés SSH
- Vérifiez les Security Groups AWS

**Erreur de permissions :**
```
FAILED! => {"msg": "Missing sudo password"}
```
**Solutions :**
- Ajoutez `--ask-become-pass`
- Configurez sudo sans mot de passe
- Vérifiez la configuration de `ansible.cfg`

**Timeout de connexion :**
```
FAILED! => {"msg": "Timeout (12s) waiting for privilege escalation prompt"}
```
**Solutions :**
- Augmentez le timeout dans `ansible.cfg`
- Vérifiez la configuration SSH
- Contrôlez les ressources du serveur

### Debug et logs

```bash
# Mode verbose
ansible-playbook playbooks/site.yml -vvv

# Debug d'une tâche spécifique
ansible-playbook playbooks/site.yml --start-at-task="Install Node.js"

# Mode step-by-step
ansible-playbook playbooks/site.yml --step

# Dry-run avec diff
ansible-playbook playbooks/site.yml --check --diff
```

## 🔧 Personnalisation

### Variables par environnement

```bash
# group_vars/development/main.yml
environment: development
app_instances: 1
log_level: debug
monitoring_enabled: false

# group_vars/production/main.yml
environment: production
app_instances: 4
log_level: info
monitoring_enabled: true
backup_enabled: true
```

### Templates personnalisés

```bash
# Modifier un template
vim templates/ecosystem.config.js.j2

# Ajouter des variables
vim group_vars/all/main.yml
```

## 📚 Ressources

- [Documentation Ansible](https://docs.ansible.com/)
- [Ansible Galaxy](https://galaxy.ansible.com/) - Rôles communautaires
- [Ansible Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/vault.html) - Gestion des secrets 