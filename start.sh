#!/bin/bash

# Script de démarrage rapide pour Time-Swap Network
# J'ai créé ce script pour faciliter le développement !

echo "🚀 Démarrage de Time-Swap Network..."

# Vérifier si les variables d'environnement sont définies
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant, création depuis env.example..."
    cp env.example .env
fi

# Charger les variables d'environnement
export $(cat .env | grep -v '^#' | xargs)

echo "📦 Installation des dépendances..."

# Backend
echo "🔧 Installation backend..."
cd backend
npm install

# Générer Prisma client
echo "🗄️  Génération Prisma client..."
npx prisma generate

# Migrations et seed
echo "🌱 Migration et seed de la base de données..."
npx prisma migrate dev --name init
npm run prisma:seed

cd ..

# Frontend
echo "🎨 Installation frontend..."
cd frontend
npm install

cd ..

echo "✅ Installation terminée !"
echo ""
echo "Pour démarrer l'application :"
echo "  Backend:  cd backend && npm run start:dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Ou utilisez le script de développement :"
echo "  npm run dev"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  API Docs: http://localhost:3001/api/docs"
