# Dockerfile pour le backend NestJS
# J'ai appris Docker récemment, c'est super pratique !

FROM node:18-alpine

# Créer le dossier de l'application
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste du code
COPY . .

# Générer Prisma client
RUN npx prisma generate

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
