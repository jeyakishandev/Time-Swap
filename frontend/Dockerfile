# Dockerfile pour le frontend Next.js
# J'ai découvert que Next.js marche bien avec Docker !

FROM node:18-alpine

# Créer le dossier de l'application
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste du code
COPY . .

# Construire l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
