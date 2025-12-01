#!/usr/bin/env bash
# Script pour exécuter le seed en utilisant la DATABASE_URL de Render
# Ce script peut être exécuté localement ou sur Render

set -e

echo "🌱 Déploiement des données de test sur Supabase..."
echo ""

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erreur: DATABASE_URL n'est pas définie"
  echo ""
  echo "💡 Pour exécuter ce script:"
  echo "   1. Récupérez votre DATABASE_URL depuis Render:"
  echo "      - Allez sur Render Dashboard > Votre service backend"
  echo "      - Allez dans 'Environment'"
  echo "      - Copiez la valeur de DATABASE_URL"
  echo ""
  echo "   2. Exécutez:"
  echo "      export DATABASE_URL='votre_connection_string'"
  echo "      ./seed-from-render.sh"
  echo ""
  echo "   Ou directement:"
  echo "      DATABASE_URL='votre_connection_string' ./seed-from-render.sh"
  exit 1
fi

echo "✅ DATABASE_URL trouvée"
echo "🔍 Format détecté: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)"
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

# Vérifier la connexion à la base de données
echo "🔍 Vérification de la connexion à la base de données..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ Connexion réussie"
else
  echo "⚠️  Impossible de vérifier la connexion, mais on continue..."
fi

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
echo "🧪 Testez la connexion avec:"
echo "   curl https://timeswap-backend-1x1j.onrender.com/auth/login \\"
echo "     -X POST \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"alice@example.com\",\"password\":\"password123\"}'"
echo ""

