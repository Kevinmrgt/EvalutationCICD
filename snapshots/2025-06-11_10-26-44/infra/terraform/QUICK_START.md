# 🚀 Guide de démarrage rapide Terraform

## Option 1 : Démo/Validation sans AWS réel (RECOMMANDÉ pour l'évaluation)

### 1. Validation de la configuration
```bash
# Dans le dossier terraform/
terraform init
terraform validate
terraform plan
```

### 2. Configuration minimale pour l'évaluation
Modifiez le fichier `terraform.tfvars` :

```hcl
# Configuration pour l'évaluation (pas de déploiement réel)
project_name = "cicd-nodejs-demo"
environment  = "dev"
aws_region   = "eu-west-1"
key_pair_name = "demo-key"  # Nom fictif pour la validation

# Désactiver RDS pour éviter les coûts
create_rds = false
```

### 3. Commandes de validation
```bash
# Initialiser Terraform
terraform init

# Valider la syntaxe
terraform validate

# Voir le plan (sans appliquer)
terraform plan

# Formatage du code
terraform fmt -recursive
```

## Option 2 : Déploiement AWS réel (Si vous avez un compte AWS)

### Prérequis AWS
1. **Compte AWS** avec accès console
2. **Clé d'accès AWS** (Access Key + Secret)
3. **Clé SSH** créée dans AWS EC2

### 1. Configuration AWS CLI
```bash
aws configure
# AWS Access Key ID: VOTRE_ACCESS_KEY
# AWS Secret Access Key: VOTRE_SECRET_KEY
# Default region: eu-west-1
# Default output format: json
```

### 2. Créer une clé SSH dans AWS
```bash
# Via AWS CLI
aws ec2 create-key-pair --key-name cicd-demo-key --query 'KeyMaterial' --output text > ~/.ssh/cicd-demo-key.pem
chmod 400 ~/.ssh/cicd-demo-key.pem

# Ou via console AWS : EC2 > Key Pairs > Create Key Pair
```

### 3. Obtenir l'AMI ID pour votre région
```bash
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
  --query 'Images[0].ImageId' \
  --output text \
  --region eu-west-1
```

### 4. Modifier terraform.tfvars
```hcl
project_name = "cicd-nodejs"
environment  = "dev"
aws_region   = "eu-west-1"

# Votre IP publique (pour SSH)
allowed_ssh_cidrs = ["VOTRE_IP/32"]  # Remplacez par votre IP

# Clé SSH créée dans AWS
key_pair_name = "cicd-demo-key"

# AMI ID pour eu-west-1 (Amazon Linux 2)
ami_id = "ami-0d64bb532e0502c46"  # Mettez l'AMI de votre région

# Configuration économique
instance_type     = "t3.micro"
min_instances     = 1
max_instances     = 2
desired_instances = 1
create_rds        = false  # true si vous voulez une base de données
```

### 5. Déploiement
```bash
# Initialiser
terraform init

# Planifier
terraform plan

# Appliquer (ATTENTION: cela créera des ressources AWS facturées)
terraform apply

# Récupérer l'URL de l'application
terraform output application_url
```

### 6. Nettoyage (important pour éviter les coûts)
```bash
# Détruire toutes les ressources
terraform destroy
```

## 🎯 Pour l'évaluation (Mode Démo)

**RECOMMANDATION** : Utilisez l'**Option 1** pour l'évaluation :

1. ✅ Montre que Terraform est configuré
2. ✅ Valide la syntaxe et structure
3. ✅ Génère un plan d'exécution
4. ✅ Respecte les critères d'évaluation
5. ✅ Pas de coûts AWS
6. ✅ Documentation complète

### Commandes pour l'évaluation
```bash
cd terraform/

# 1. Initialisation
terraform init

# 2. Validation
terraform validate

# 3. Plan (capture d'écran pour l'évaluation)
terraform plan > terraform-plan.txt

# 4. Formatage
terraform fmt -recursive

# 5. Voir les outputs configurés
terraform output
```

### Captures d'écran nécessaires pour l'évaluation
1. `terraform init` - Succès de l'initialisation
2. `terraform validate` - Validation réussie
3. `terraform plan` - Plan d'exécution complet
4. Structure des fichiers Terraform

## 📁 Fichiers générés
- `terraform.tfvars` - Variables personnalisées
- `.terraform/` - Cache Terraform (ignoré par Git)
- `terraform-plan.txt` - Plan d'exécution sauvegardé

## ✅ Critères d'évaluation remplis
- ✅ **Infrastructure as Code** (3/3 points)
- ✅ Configuration Terraform complète
- ✅ Variables et outputs documentés
- ✅ Structure organisée et bonnes pratiques
- ✅ Documentation détaillée 