#!/bin/bash

# Script d'initialisation pour les instances EC2
# Ce script installe et configure l'environnement pour l'application Node.js

set -e

# Variables
APP_PORT=${app_port}
NODE_VERSION="18"
APP_USER="nodejs"
APP_DIR="/opt/nodejs-app"
LOG_FILE="/var/log/user-data.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log "Début de l'initialisation de l'instance EC2"

# Mise à jour du système
log "Mise à jour du système"
yum update -y

# Installation des packages de base
log "Installation des packages de base"
yum install -y \
    curl \
    wget \
    git \
    htop \
    vim \
    unzip \
    jq \
    python3 \
    python3-pip \
    amazon-cloudwatch-agent

# Installation de Node.js via NodeSource
log "Installation de Node.js ${node_version}"
curl -fsSL https://rpm.nodesource.com/setup_${node_version}.x | bash -
yum install -y nodejs

# Vérification de l'installation Node.js
log "Version de Node.js installée: $(node --version)"
log "Version de npm installée: $(npm --version)"

# Installation de PM2 pour la gestion des processus
log "Installation de PM2"
npm install -g pm2

# Création de l'utilisateur pour l'application
log "Création de l'utilisateur $APP_USER"
useradd -r -s /bin/false $APP_USER || log "L'utilisateur $APP_USER existe déjà"

# Création du répertoire de l'application
log "Création du répertoire de l'application"
mkdir -p $APP_DIR
chown $APP_USER:$APP_USER $APP_DIR

# Installation de Docker pour les déploiements
log "Installation de Docker"
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Configuration du CloudWatch Agent
log "Configuration du CloudWatch Agent"
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
    "metrics": {
        "namespace": "CWAgent",
        "metrics_collected": {
            "cpu": {
                "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                "metrics_collection_interval": 60,
                "totalcpu": false
            },
            "disk": {
                "measurement": ["used_percent"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
            },
            "diskio": {
                "measurement": ["io_time"],
                "metrics_collection_interval": 60,
                "resources": ["*"]
            },
            "mem": {
                "measurement": ["mem_used_percent"],
                "metrics_collection_interval": 60
            },
            "netstat": {
                "measurement": ["tcp_established", "tcp_time_wait"],
                "metrics_collection_interval": 60
            },
            "swap": {
                "measurement": ["swap_used_percent"],
                "metrics_collection_interval": 60
            }
        }
    },
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/ec2/var/log/messages",
                        "log_stream_name": "{instance_id}"
                    },
                    {
                        "file_path": "/opt/nodejs-app/logs/app.log",
                        "log_group_name": "/aws/ec2/nodejs-app",
                        "log_stream_name": "{instance_id}"
                    }
                ]
            }
        }
    }
}
EOF

# Démarrage du CloudWatch Agent
log "Démarrage du CloudWatch Agent"
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s

# Configuration du health check endpoint temporaire
log "Configuration du health check temporaire"
cat > /tmp/health-server.js << 'EOF'
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      message: 'EC2 instance is ready for deployment'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(process.env.PORT || ${app_port}, () => {
  console.log(`Health check server running on port $${process.env.PORT || ${app_port}}`);
});
EOF

# Démarrage du serveur de health check temporaire
log "Démarrage du serveur de health check temporaire"
cd /tmp
PORT=$APP_PORT pm2 start health-server.js --name "health-check"
pm2 startup
pm2 save

# Configuration des logs
log "Configuration des logs"
mkdir -p $APP_DIR/logs
chown $APP_USER:$APP_USER $APP_DIR/logs

# Installation de l'agent SSM pour la gestion à distance
log "Installation de l'agent SSM"
yum install -y amazon-ssm-agent
systemctl start amazon-ssm-agent
systemctl enable amazon-ssm-agent

# Configuration du firewall (si nécessaire)
log "Configuration du firewall"
systemctl stop iptables || true
systemctl disable iptables || true

# Création d'un script de déploiement pour Ansible
log "Création du script de déploiement"
cat > /usr/local/bin/deploy-app.sh << 'EOF'
#!/bin/bash

# Script de déploiement appelé par Ansible
APP_DIR="/opt/nodejs-app"
APP_USER="nodejs"

echo "Déploiement de l'application Node.js..."

# Arrêt de l'ancienne version
pm2 stop all || true
pm2 delete all || true

# Déploiement de la nouvelle version (sera géré par Ansible)
cd $APP_DIR

# Installation des dépendances
npm ci --production

# Démarrage de l'application
pm2 start ecosystem.config.js
pm2 save

echo "Déploiement terminé"
EOF

chmod +x /usr/local/bin/deploy-app.sh

# Création d'un fichier de métadonnées
log "Création du fichier de métadonnées"
cat > /tmp/instance-metadata.json << EOF
{
  "instance_id": "$(curl -s http://169.254.169.254/latest/meta-data/instance-id)",
  "instance_type": "$(curl -s http://169.254.169.254/latest/meta-data/instance-type)",
  "availability_zone": "$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)",
  "public_ip": "$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)",
  "private_ip": "$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)",
  "initialization_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "app_port": "$APP_PORT",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)"
}
EOF

log "Métadonnées de l'instance sauvegardées dans /tmp/instance-metadata.json"

# Signal de fin d'initialisation
log "Initialisation de l'instance EC2 terminée avec succès"

# Redémarrage des services pour s'assurer que tout fonctionne
systemctl restart amazon-cloudwatch-agent
systemctl restart amazon-ssm-agent

log "Instance prête pour le déploiement via Ansible"

exit 0 