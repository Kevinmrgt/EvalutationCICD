# Variables générales du projet
variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "cicd-nodejs"
}

variable "environment" {
  description = "Environnement de déploiement (dev, staging, production)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

# Configuration AWS
variable "aws_region" {
  description = "Région AWS pour déployer l'infrastructure"
  type        = string
  default     = "eu-west-1"
}

variable "availability_zones" {
  description = "Liste des zones de disponibilité"
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b"]
}

# Configuration réseau
variable "vpc_cidr" {
  description = "CIDR block pour le VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "allowed_ssh_cidrs" {
  description = "Liste des CIDR autorisés pour SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"] # À restreindre en production
}

# Configuration de l'application
variable "app_port" {
  description = "Port de l'application Node.js"
  type        = number
  default     = 3000
}

variable "node_version" {
  description = "Version de Node.js à installer"
  type        = string
  default     = "18"
}

variable "ami_id" {
  description = "AMI ID pour les instances EC2"
  type        = string
  default     = "ami-0c02fb55956c7d316" # Amazon Linux 2 en us-east-1, à adapter selon la région
}

variable "instance_type" {
  description = "Type d'instance EC2"
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "Nom de la clé SSH pour accéder aux instances"
  type        = string
  default     = "" # À définir lors du déploiement
}

# Configuration Auto Scaling
variable "min_instances" {
  description = "Nombre minimum d'instances dans l'Auto Scaling Group"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Nombre maximum d'instances dans l'Auto Scaling Group"
  type        = number
  default     = 3
}

variable "desired_instances" {
  description = "Nombre désiré d'instances dans l'Auto Scaling Group"
  type        = number
  default     = 2
}

# Configuration base de données
variable "create_rds" {
  description = "Créer une instance RDS"
  type        = bool
  default     = false # Désactivé par défaut pour éviter les coûts
}

variable "db_engine" {
  description = "Moteur de base de données"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Version du moteur de base de données"
  type        = string
  default     = "14.9"
}

variable "db_instance_class" {
  description = "Classe d'instance RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Stockage alloué pour la base de données (GB)"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Nom de la base de données"
  type        = string
  default     = "nodejs_app"
}

variable "db_username" {
  description = "Nom d'utilisateur de la base de données"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Mot de passe de la base de données"
  type        = string
  sensitive   = true
  default     = "" # À définir via terraform.tfvars ou variable d'environnement
}

variable "db_port" {
  description = "Port de la base de données"
  type        = number
  default     = 5432 # PostgreSQL par défaut
}

# Configuration des tags par défaut
variable "default_tags" {
  description = "Tags par défaut à appliquer à toutes les ressources"
  type        = map(string)
  default = {
    Terraform = "true"
    Project   = "cicd-nodejs"
  }
} 