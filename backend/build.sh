#!/bin/bash
# Script de build pour Render

set -e

echo "🔨 Installation des dépendances..."
npm ci

echo "📦 Génération du client Prisma..."
npx prisma generate

echo "🏗️  Build de l'application..."
npm run build

echo "✅ Build terminé avec succès!"

