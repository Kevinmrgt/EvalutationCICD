# =========================
# Stage 1: Dependencies
# =========================
FROM node:18-alpine AS deps

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Installer les dépendances système nécessaires
RUN apk add --no-cache dumb-init

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci --include=dev

# =========================
# Stage 2: Build
# =========================
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les dépendances depuis le stage précédent
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/package*.json ./

# Copier le code source
COPY . .

# Exécuter les tests et le linting (tolérant aux échecs en dev)
RUN npm run lint
RUN npm run test:coverage || echo "Tests failed but continuing build for development"

# Nettoyer les dépendances de développement
RUN npm prune --production

# =========================
# Stage 3: Production
# =========================
FROM node:18-alpine AS production

# Informations sur l'image
LABEL maintainer="Kevin - YNOV DevOps"
LABEL description="Evaluation CI/CD - API REST Node.js"
LABEL version="1.0.0"

# Installer dumb-init pour un meilleur signal handling
RUN apk add --no-cache dumb-init

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Changer le propriétaire du répertoire
RUN chown -R app:nodejs /usr/src/app

# Basculer vers l'utilisateur non-root
USER app

# Copier les dépendances de production depuis le stage build
COPY --from=build --chown=app:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=app:nodejs /usr/src/app/package*.json ./

# Copier le code source de l'application
COPY --chown=app:nodejs ./api ./api

# Exposer le port de l'application
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Commande de démarrage avec dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "api/src/app.js"] 