#!/bin/bash

# Script de déploiement complet - Terraform + Ansible
# Ce script automatise le déploiement de l'infrastructure et la configuration des serveurs

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$PROJECT_DIR/terraform"
ANSIBLE_DIR="$PROJECT_DIR/ansible"
LOGS_DIR="$PROJECT_DIR/logs"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Fonction d'aide
usage() {
    cat << EOF
🚀 Script de déploiement CI/CD Node.js

Usage: $0 [OPTIONS] COMMAND

COMMANDS:
    init            Initialiser le projet (Terraform init)
    plan            Planifier le déploiement (Terraform plan)
    deploy          Déployer l'infrastructure et configurer les serveurs
    configure       Configurer les serveurs seulement (Ansible)
    destroy         Détruire l'infrastructure (ATTENTION: supprime tout)
    status          Afficher le statut de l'infrastructure
    logs            Afficher les logs de déploiement

OPTIONS:
    -e, --env ENVIRONMENT    Environnement (dev/staging/prod) [défaut: dev]
    -v, --version VERSION    Version de l'application à déployer [défaut: latest]
    -f, --force             Forcer le déploiement sans confirmation
    -d, --dry-run           Mode simulation (plan seulement)
    -h, --help              Afficher cette aide
    --skip-terraform        Ignorer Terraform (Ansible seulement)
    --skip-ansible          Ignorer Ansible (Terraform seulement)

EXAMPLES:
    $0 init                                 # Initialiser le projet
    $0 deploy -e staging                    # Déployer en staging
    $0 deploy -e prod -v v1.2.3            # Déployer version spécifique en prod
    $0 configure -e dev                     # Configurer les serveurs dev seulement
    $0 status                               # Voir le statut
    $0 destroy -e dev --force               # Détruire l'env dev sans confirmation

EOF
    exit 1
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    local missing_tools=()
    
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    if ! command -v ansible &> /dev/null; then
        missing_tools+=("ansible")
    fi
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        error "Outils manquants: ${missing_tools[*]}"
        error "Veuillez installer ces outils avant de continuer"
        exit 1
    fi
    
    # Vérifier la configuration AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI n'est pas configuré ou les credentials sont invalides"
        exit 1
    fi
    
    success "Tous les prérequis sont satisfaits"
}

# Initialisation du projet
init_project() {
    log "Initialisation du projet..."
    
    # Créer les répertoires nécessaires
    mkdir -p "$LOGS_DIR"
    mkdir -p "$ANSIBLE_DIR/logs"
    mkdir -p "$ANSIBLE_DIR/reports"
    
    # Initialiser Terraform
    cd "$TERRAFORM_DIR"
    log "Initialisation de Terraform..."
    terraform init
    
    # Vérifier la configuration Ansible
    cd "$ANSIBLE_DIR"
    if [ ! -f "inventory/hosts.yml" ]; then
        warning "Fichier d'inventaire Ansible non trouvé"
        log "Création d'un inventaire d'exemple..."
        cp "inventory/hosts.yml.example" "inventory/hosts.yml" 2>/dev/null || true
    fi
    
    success "Projet initialisé avec succès"
}

# Planification Terraform
plan_terraform() {
    local env=$1
    
    log "Planification Terraform pour l'environnement: $env"
    
    cd "$TERRAFORM_DIR"
    
    local tfvars_file="terraform.tfvars"
    if [ "$env" != "dev" ]; then
        tfvars_file="${env}.tfvars"
    fi
    
    if [ ! -f "$tfvars_file" ]; then
        warning "Fichier $tfvars_file non trouvé, utilisation des valeurs par défaut"
        terraform plan -var="environment=$env"
    else
        terraform plan -var-file="$tfvars_file" -var="environment=$env"
    fi
}

# Déploiement Terraform
deploy_terraform() {
    local env=$1
    local force=$2
    
    log "Déploiement Terraform pour l'environnement: $env"
    
    cd "$TERRAFORM_DIR"
    
    local tfvars_file="terraform.tfvars"
    if [ "$env" != "dev" ]; then
        tfvars_file="${env}.tfvars"
    fi
    
    local tf_command="terraform apply"
    
    if [ ! -f "$tfvars_file" ]; then
        warning "Fichier $tfvars_file non trouvé, utilisation des valeurs par défaut"
        tf_command="$tf_command -var='environment=$env'"
    else
        tf_command="$tf_command -var-file='$tfvars_file' -var='environment=$env'"
    fi
    
    if [ "$force" = true ]; then
        tf_command="$tf_command -auto-approve"
    fi
    
    eval $tf_command
    
    # Sauvegarder les outputs pour Ansible
    terraform output -json > "$ANSIBLE_DIR/terraform-outputs.json"
    
    success "Infrastructure Terraform déployée avec succès"
}

# Configuration Ansible
configure_ansible() {
    local env=$1
    local app_version=$2
    
    log "Configuration des serveurs avec Ansible..."
    
    cd "$ANSIBLE_DIR"
    
    # Vérifier si l'inventaire est configuré
    if ! ansible-inventory --list &> /dev/null; then
        warning "Inventaire Ansible non configuré"
        log "Génération automatique de l'inventaire depuis Terraform..."
        
        if [ -f "terraform-outputs.json" ]; then
            python3 scripts/generate-inventory.py 2>/dev/null || {
                warning "Script de génération d'inventaire non trouvé"
                log "Veuillez configurer manuellement inventory/hosts.yml"
            }
        fi
    fi
    
    # Test de connectivité
    log "Test de connectivité..."
    if ! ansible all -m ping &> /dev/null; then
        error "Impossible de se connecter aux serveurs"
        error "Vérifiez la configuration SSH et l'inventaire Ansible"
        exit 1
    fi
    
    # Exécution du playbook principal
    log "Exécution du playbook de configuration..."
    ansible-playbook playbooks/site.yml \
        -e "environment=$env" \
        -e "app_version=$app_version" \
        -e "target_environment=$env"
    
    success "Configuration Ansible terminée avec succès"
}

# Affichage du statut
show_status() {
    log "Statut de l'infrastructure..."
    
    cd "$TERRAFORM_DIR"
    
    if [ ! -f "terraform.tfstate" ]; then
        warning "Aucun état Terraform trouvé - infrastructure non déployée"
        return
    fi
    
    echo ""
    echo "=== INFRASTRUCTURE TERRAFORM ==="
    terraform output 2>/dev/null || echo "Aucun output disponible"
    
    echo ""
    echo "=== SERVEURS ANSIBLE ==="
    cd "$ANSIBLE_DIR"
    if ansible-inventory --list &> /dev/null; then
        ansible all -m ping 2>/dev/null || echo "Serveurs non accessibles"
        echo ""
        ansible web_servers -m shell -a "systemctl status pm2-nodejs --no-pager" 2>/dev/null || echo "Service PM2 non trouvé"
    else
        echo "Inventaire Ansible non configuré"
    fi
}

# Destruction de l'infrastructure
destroy_infrastructure() {
    local env=$1
    local force=$2
    
    warning "ATTENTION: Cette action va détruire toute l'infrastructure pour l'environnement: $env"
    
    if [ "$force" != true ]; then
        echo -n "Êtes-vous sûr de vouloir continuer? (tapez 'yes' pour confirmer): "
        read -r confirmation
        if [ "$confirmation" != "yes" ]; then
            log "Destruction annulée"
            exit 0
        fi
    fi
    
    log "Destruction de l'infrastructure..."
    
    cd "$TERRAFORM_DIR"
    
    local tfvars_file="terraform.tfvars"
    if [ "$env" != "dev" ]; then
        tfvars_file="${env}.tfvars"
    fi
    
    local tf_command="terraform destroy"
    
    if [ ! -f "$tfvars_file" ]; then
        tf_command="$tf_command -var='environment=$env'"
    else
        tf_command="$tf_command -var-file='$tfvars_file' -var='environment=$env'"
    fi
    
    if [ "$force" = true ]; then
        tf_command="$tf_command -auto-approve"
    fi
    
    eval $tf_command
    
    success "Infrastructure détruite avec succès"
}

# Affichage des logs
show_logs() {
    log "Affichage des logs de déploiement..."
    
    echo ""
    echo "=== LOGS TERRAFORM ==="
    if [ -f "$TERRAFORM_DIR/terraform.log" ]; then
        tail -n 50 "$TERRAFORM_DIR/terraform.log"
    else
        echo "Aucun log Terraform trouvé"
    fi
    
    echo ""
    echo "=== LOGS ANSIBLE ==="
    if [ -f "$ANSIBLE_DIR/logs/ansible.log" ]; then
        tail -n 50 "$ANSIBLE_DIR/logs/ansible.log"
    else
        echo "Aucun log Ansible trouvé"
    fi
}

# Variables par défaut
ENVIRONMENT="dev"
APP_VERSION="latest"
FORCE=false
DRY_RUN=false
SKIP_TERRAFORM=false
SKIP_ANSIBLE=false

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--version)
            APP_VERSION="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-terraform)
            SKIP_TERRAFORM=true
            shift
            ;;
        --skip-ansible)
            SKIP_ANSIBLE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        init|plan|deploy|configure|destroy|status|logs)
            COMMAND="$1"
            shift
            ;;
        *)
            error "Option inconnue: $1"
            usage
            ;;
    esac
done

# Vérifier qu'une commande est spécifiée
if [ -z "$COMMAND" ]; then
    error "Aucune commande spécifiée"
    usage
fi

# Validation de l'environnement
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    error "Environnement invalide: $ENVIRONMENT (doit être: dev, staging, ou production)"
    exit 1
fi

# Exécution de la commande
log "🚀 Démarrage du déploiement CI/CD Node.js"
log "Environnement: $ENVIRONMENT"
log "Version: $APP_VERSION"
log "Commande: $COMMAND"

case $COMMAND in
    init)
        check_prerequisites
        init_project
        ;;
    plan)
        check_prerequisites
        plan_terraform "$ENVIRONMENT"
        ;;
    deploy)
        check_prerequisites
        if [ "$DRY_RUN" = true ]; then
            plan_terraform "$ENVIRONMENT"
        else
            if [ "$SKIP_TERRAFORM" != true ]; then
                deploy_terraform "$ENVIRONMENT" "$FORCE"
            fi
            if [ "$SKIP_ANSIBLE" != true ]; then
                configure_ansible "$ENVIRONMENT" "$APP_VERSION"
            fi
        fi
        ;;
    configure)
        check_prerequisites
        configure_ansible "$ENVIRONMENT" "$APP_VERSION"
        ;;
    destroy)
        check_prerequisites
        destroy_infrastructure "$ENVIRONMENT" "$FORCE"
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        error "Commande inconnue: $COMMAND"
        usage
        ;;
esac

success "✅ Opération terminée avec succès!" 