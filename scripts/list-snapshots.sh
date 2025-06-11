#!/bin/bash

# =================================================================
# 📸 Liste des Snapshots Disponibles
# =================================================================
# 
# Script pour lister tous les snapshots disponibles avec leurs
# métadonnées pour faciliter la sélection lors d'un rollback.
#
# Usage: ./scripts/list-snapshots.sh [--format=json|table|simple]
#
# =================================================================

set -euo pipefail

# Configuration
SNAPSHOTS_DIR="snapshots/data"
REGISTRY_DIR="snapshots/registry"
DEFAULT_FORMAT="table"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo "📸 Liste des Snapshots Disponibles"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --format=FORMAT    Format de sortie (json|table|simple)"
    echo "  --help            Afficher cette aide"
    echo ""
    echo "Formats disponibles:"
    echo "  table    - Tableau formaté (par défaut)"
    echo "  json     - Format JSON"
    echo "  simple   - Liste simple"
    echo ""
    echo "Exemples:"
    echo "  $0                     # Format tableau"
    echo "  $0 --format=json       # Format JSON"
    echo "  $0 --format=simple     # Format simple"
}

# Parse des arguments
FORMAT="$DEFAULT_FORMAT"

for arg in "$@"; do
    case $arg in
        --format=*)
            FORMAT="${arg#*=}"
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Argument inconnu: $arg"
            show_help
            exit 1
            ;;
    esac
done

# Validation du format
case $FORMAT in
    json|table|simple)
        ;;
    *)
        echo "❌ Format invalide: $FORMAT"
        echo "Formats supportés: json, table, simple"
        exit 1
        ;;
esac

# Fonction pour obtenir les informations d'un snapshot
get_snapshot_info() {
    local snapshot_id="$1"
    local metadata_file="$SNAPSHOTS_DIR/${snapshot_id}.json"
    local archive_file="$SNAPSHOTS_DIR/${snapshot_id}.tar.gz"
    
    # Informations par défaut
    local version="unknown"
    local timestamp="unknown"
    local deployment="unknown"
    local commit="unknown"
    local size="unknown"
    local status="unknown"
    
    # Lire les métadonnées si disponibles
    if [[ -f "$metadata_file" ]]; then
        if command -v jq >/dev/null 2>&1; then
            version=$(jq -r '.version // "unknown"' "$metadata_file" 2>/dev/null || echo "unknown")
            timestamp=$(jq -r '.timestamp // "unknown"' "$metadata_file" 2>/dev/null || echo "unknown")
            deployment=$(jq -r '.deployment // "unknown"' "$metadata_file" 2>/dev/null || echo "unknown")
            commit=$(jq -r '.commit // "unknown"' "$metadata_file" 2>/dev/null || echo "unknown")
            status=$(jq -r '.status // "unknown"' "$metadata_file" 2>/dev/null || echo "unknown")
        else
            # Fallback sans jq
            version=$(grep '"version"' "$metadata_file" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
            timestamp=$(grep '"timestamp"' "$metadata_file" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
            deployment=$(grep '"deployment"' "$metadata_file" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
            commit=$(grep '"commit"' "$metadata_file" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
            status=$(grep '"status"' "$metadata_file" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
        fi
    fi
    
    # Taille du fichier d'archive
    if [[ -f "$archive_file" ]]; then
        if command -v numfmt >/dev/null 2>&1; then
            size=$(stat -c%s "$archive_file" 2>/dev/null | numfmt --to=iec || echo "unknown")
        else
            size=$(stat -c%s "$archive_file" 2>/dev/null | awk '{printf "%.1fMB", $1/1024/1024}' || echo "unknown")
        fi
    fi
    
    # Format de sortie selon le type demandé
    case $FORMAT in
        json)
            echo "{\"id\":\"$snapshot_id\",\"version\":\"$version\",\"timestamp\":\"$timestamp\",\"deployment\":\"$deployment\",\"commit\":\"${commit:0:8}\",\"size\":\"$size\",\"status\":\"$status\"}"
            ;;
        table)
            printf "%-30s %-12s %-20s %-25s %-10s %-8s %-10s\n" "$snapshot_id" "$version" "$timestamp" "$deployment" "${commit:0:8}" "$size" "$status"
            ;;
        simple)
            echo "$snapshot_id"
            ;;
    esac
}

# Fonction principale pour lister les snapshots
list_snapshots() {
    # Vérifier que le répertoire existe
    if [[ ! -d "$SNAPSHOTS_DIR" ]]; then
        echo "❌ Répertoire de snapshots introuvable: $SNAPSHOTS_DIR"
        exit 1
    fi
    
    # Rechercher tous les fichiers .tar.gz
    local snapshots=()
    while IFS= read -r -d '' file; do
        local basename=$(basename "$file" .tar.gz)
        snapshots+=("$basename")
    done < <(find "$SNAPSHOTS_DIR" -name "*.tar.gz" -print0 2>/dev/null | sort -z)
    
    # Vérifier qu'il y a des snapshots
    if [[ ${#snapshots[@]} -eq 0 ]]; then
        echo "📋 Aucun snapshot trouvé dans $SNAPSHOTS_DIR"
        exit 0
    fi
    
    # En-tête selon le format
    case $FORMAT in
        json)
            echo "{"
            echo "  \"snapshots\": ["
            ;;
        table)
            echo -e "${BLUE}📸 Snapshots Disponibles${NC}"
            echo "=================================================================================================================================="
            printf "${CYAN}%-30s %-12s %-20s %-25s %-10s %-8s %-10s${NC}\n" "SNAPSHOT ID" "VERSION" "TIMESTAMP" "DEPLOYMENT" "COMMIT" "SIZE" "STATUS"
            echo "=================================================================================================================================="
            ;;
        simple)
            echo "📸 Snapshots disponibles:"
            ;;
    esac
    
    # Lister chaque snapshot
    local count=0
    for snapshot in "${snapshots[@]}"; do
        if [[ $FORMAT == "json" ]]; then
            if [[ $count -gt 0 ]]; then
                echo ","
            fi
            echo -n "    "
        fi
        
        get_snapshot_info "$snapshot"
        ((count++))
    done
    
    # Pied de page selon le format
    case $FORMAT in
        json)
            echo ""
            echo "  ],"
            echo "  \"total\": $count,"
            echo "  \"directory\": \"$SNAPSHOTS_DIR\""
            echo "}"
            ;;
        table)
            echo "=================================================================================================================================="
            echo -e "${GREEN}📋 Total: $count snapshot(s) disponible(s)${NC}"
            ;;
        simple)
            echo "📋 Total: $count snapshot(s)"
            ;;
    esac
}

# Fonction pour afficher les détails d'un snapshot spécifique
show_snapshot_details() {
    local snapshot_id="$1"
    local metadata_file="$SNAPSHOTS_DIR/${snapshot_id}.json"
    local archive_file="$SNAPSHOTS_DIR/${snapshot_id}.tar.gz"
    
    echo -e "${BLUE}📸 Détails du Snapshot: $snapshot_id${NC}"
    echo "=============================================="
    
    if [[ -f "$metadata_file" ]]; then
        echo -e "${CYAN}📋 Métadonnées:${NC}"
        if command -v jq >/dev/null 2>&1; then
            jq '.' "$metadata_file" 2>/dev/null || cat "$metadata_file"
        else
            cat "$metadata_file"
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️ Fichier de métadonnées manquant${NC}"
    fi
    
    if [[ -f "$archive_file" ]]; then
        local size=$(stat -c%s "$archive_file" 2>/dev/null || echo "0")
        local readable_size=$(echo "$size" | numfmt --to=iec 2>/dev/null || echo "${size} bytes")
        echo -e "${CYAN}📦 Archive:${NC}"
        echo "  Fichier: $archive_file"
        echo "  Taille: $readable_size"
        echo "  Modifié: $(stat -c%y "$archive_file" 2>/dev/null || echo "unknown")"
    else
        echo -e "${RED}❌ Fichier d'archive manquant${NC}"
    fi
}

# Vérification des prérequis
check_prerequisites() {
    # Vérifier que nous sommes dans le bon répertoire
    if [[ ! -f "package.json" ]]; then
        echo "❌ Ce script doit être exécuté depuis la racine du projet"
        exit 1
    fi
    
    # Créer les répertoires si nécessaire
    mkdir -p "$SNAPSHOTS_DIR"
    mkdir -p "$REGISTRY_DIR"
}

# Script principal
main() {
    echo -e "${PURPLE}🚀 EvaluationCICD - Liste des Snapshots${NC}"
    echo ""
    
    check_prerequisites
    list_snapshots
    
    echo ""
    echo -e "${CYAN}💡 Aide:${NC}"
    echo "• Pour voir les détails: cat snapshots/data/SNAPSHOT_ID.json"
    echo "• Pour un rollback manuel: Utiliser GitHub Actions > Rollback Manual"
    echo "• Pour créer un snapshot: ./snapshots/create-snapshot.sh"
    echo ""
}

# Exécution du script principal
main "$@" 