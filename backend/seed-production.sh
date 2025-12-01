#!/usr/bin/env bash
# Script pour exécuter le seed sur Supabase en production

set -e

echo "🌱 Déploiement des données de test sur Supabase..."
echo ""

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erreur: DATABASE_URL n'est pas définie"
  echo ""
  echo "💡 Pour exécuter ce script:"
  echo "   export DATABASE_URL='votre_connection_string_supabase'"
  echo "   ./seed-production.sh"
  echo ""
  echo "   Ou directement:"
  echo "   DATABASE_URL='votre_connection_string' ./seed-production.sh"
  exit 1
fi

echo "✅ DATABASE_URL trouvée"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "prisma/seed.ts" ]; then
  echo "❌ Erreur: Ce script doit être exécuté depuis le dossier backend/"
  exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
fi

# Générer Prisma client
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Exécuter le seed
echo "🌱 Exécution du seed..."
npm run prisma:seed

echo ""
echo "✅ Seed terminé avec succès !"
echo ""
echo "📋 Utilisateurs créés:"
echo "   - alice@example.com / password123"
echo "   - bob@example.com / password123"
echo "   - charlie@example.com / password123"
echo "   - diana@example.com / password123"
echo ""

