# 🏗️ Infrastructure as Code avec Terraform

Ce dossier contient l'infrastructure Terraform pour déployer l'application Node.js CI/CD sur AWS.

## 📋 Architecture déployée

### Composants principaux
- **VPC** avec subnets publics et privés sur 2 AZ
- **Application Load Balancer** pour la distribution du trafic
- **Auto Scaling Group** avec instances EC2 configurées
- **RDS PostgreSQL** (optionnel)
- **Security Groups** avec règles de sécurité appropriées
- **CloudWatch** pour le monitoring

### Ressources créées
- 1 VPC avec Internet Gateway
- 2 Subnets publics et 2 subnets privés
- 1 Application Load Balancer
- 1 Auto Scaling Group (1-3 instances)
- 1 Launch Template pour les instances EC2
- Security Groups pour web et base de données
- 1 Instance RDS (si activée)

## 🚀 Utilisation

### Prérequis
1. **AWS CLI** configuré avec les bonnes permissions
2. **Terraform** >= 1.0 installé
3. **Clé SSH** créée dans AWS EC2 Key Pairs
4. **Permissions AWS** appropriées

```bash
# Installation de Terraform (si nécessaire)
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Vérification
terraform version
```

### Configuration

1. **Copiez le fichier d'exemple des variables :**
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. **Modifiez `terraform.tfvars` selon vos besoins :**
```hcl
# Configuration de base
project_name = "mon-projet-cicd"
environment  = "dev"
aws_region   = "eu-west-1"

# Sécurité - IMPORTANT: Remplacez par votre IP
allowed_ssh_cidrs = ["YOUR_IP/32"]

# Clé SSH existante dans AWS
key_pair_name = "ma-cle-ssh"

# Configuration optionnelle de la base de données
create_rds    = false  # true pour créer une instance RDS
db_password   = "MotDePasseSecurise123!"
```

3. **Obtenez l'AMI ID pour votre région :**
```bash
# Exemple pour eu-west-1
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
  --query 'Images[*].[ImageId,CreationDate]' \
  --output table \
  --region eu-west-1
```

### Déploiement

1. **Initialisation de Terraform :**
```bash
cd terraform
terraform init
```

2. **Planification :**
```bash
terraform plan
```

3. **Application :**
```bash
terraform apply
```

4. **Récupération des outputs :**
```bash
terraform output
```

### Commandes utiles

```bash
# Voir l'état actuel
terraform show

# Lister les ressources
terraform state list

# Voir les outputs
terraform output -json

# Destruction (ATTENTION: supprime tout)
terraform destroy

# Validation de la configuration
terraform validate

# Formatage du code
terraform fmt -recursive
```

## 📊 Outputs importants

Après le déploiement, Terraform fournit ces informations importantes :

```bash
# URL de l'application
terraform output application_url

# DNS du Load Balancer
terraform output load_balancer_dns_name

# ID du VPC
terraform output vpc_id

# Données pour Ansible
terraform output ansible_inventory_data
```

## 🔧 Personnalisation

### Variables principales

| Variable | Description | Défaut | Obligatoire |
|----------|-------------|--------|-------------|
| `project_name` | Nom du projet | `cicd-nodejs` | Non |
| `environment` | Environnement (dev/staging/prod) | `dev` | Non |
| `aws_region` | Région AWS | `eu-west-1` | Non |
| `key_pair_name` | Nom de la clé SSH AWS | - | **Oui** |
| `allowed_ssh_cidrs` | IP autorisées pour SSH | `["0.0.0.0/0"]` | Non |
| `instance_type` | Type d'instance EC2 | `t3.micro` | Non |
| `min_instances` | Minimum d'instances | `1` | Non |
| `max_instances` | Maximum d'instances | `3` | Non |
| `create_rds` | Créer une base RDS | `false` | Non |

### Environnements multiples

Pour gérer plusieurs environnements, utilisez des workspaces Terraform :

```bash
# Créer un workspace pour la production
terraform workspace new production

# Lister les workspaces
terraform workspace list

# Changer de workspace
terraform workspace select production

# Appliquer avec des variables spécifiques
terraform apply -var-file="production.tfvars"
```

### Backend distant (recommandé pour la production)

1. **Créez un bucket S3 pour l'état Terraform :**
```bash
aws s3 mb s3://mon-projet-terraform-state
```

2. **Décommentez la section backend dans `main.tf` :**
```hcl
backend "s3" {
  bucket = "mon-projet-terraform-state"
  key    = "cicd-project/terraform.tfstate"
  region = "eu-west-1"
}
```

3. **Réinitialisez Terraform :**
```bash
terraform init
```

## 🔐 Sécurité

### Bonnes pratiques implémentées
- ✅ Security Groups restrictifs
- ✅ Subnets privés pour les bases de données
- ✅ Traffic chiffré entre ALB et instances
- ✅ IAM roles avec permissions minimales
- ✅ Chiffrement des volumes EBS
- ✅ CloudWatch logging activé

### À faire pour la production
- [ ] Restreindre les CIDR SSH aux IP de votre organisation
- [ ] Activer le chiffrement RDS
- [ ] Configurer AWS WAF devant l'ALB
- [ ] Implémenter AWS Secrets Manager pour les mots de passe
- [ ] Activer AWS Config pour la conformité
- [ ] Configurer VPC Flow Logs
- [ ] Mettre en place AWS Inspector pour l'analyse de vulnérabilités

## 🆘 Dépannage

### Erreurs courantes

**Erreur de clé SSH :**
```
Error: InvalidKeyPair.NotFound
```
**Solution :** Vérifiez que la clé SSH existe dans la bonne région AWS.

**Erreur de quota :**
```
Error: You have requested more instances than your current instance limit
```
**Solution :** Demandez une augmentation de quota AWS ou réduisez le nombre d'instances.

**Erreur de permissions :**
```
Error: UnauthorizedOperation
```
**Solution :** Vérifiez les permissions IAM de votre utilisateur/rôle AWS.

### Logs et debugging

```bash
# Logs détaillés
export TF_LOG=DEBUG
terraform apply

# Voir l'état d'une ressource spécifique
terraform state show aws_instance.example

# Import d'une ressource existante
terraform import aws_instance.example i-1234567890abcdef0
```

## 🔄 Intégration avec Ansible

Une fois l'infrastructure déployée, vous pouvez configurer Ansible :

```bash
# Générer l'inventaire Ansible depuis les outputs Terraform
terraform output -json ansible_inventory_data > ../ansible/terraform-outputs.json

# Mettre à jour l'inventaire Ansible
cd ../ansible
python3 scripts/generate-inventory.py
```

## 📚 Ressources

- [Documentation Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html) 