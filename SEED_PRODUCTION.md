# 🌱 Importer les données de test en production (Supabase)

## Méthode 1 : Script automatique (⭐ Recommandé)

### Prérequis
1. Avoir Node.js installé localement
2. Avoir la variable d'environnement `DATABASE_URL` de Supabase

### Étapes

1. **Récupérer votre DATABASE_URL de Supabase**
   - Allez sur Supabase Dashboard > Settings > Database
   - Copiez la connection string (Transaction Pooler, port 6543)
   - Format : `postgresql://postgres.xxxxx:VotreMotDePasse@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

2. **Exécuter le script de seed**
   ```bash
   cd backend
   DATABASE_URL="votre_connection_string_supabase" ./seed-production.sh
   ```
   
   Ou si vous préférez définir la variable d'environnement séparément :
   ```bash
   cd backend
   export DATABASE_URL="votre_connection_string_supabase"
   ./seed-production.sh
   ```

3. **Vérifier que les utilisateurs ont été créés**
   Vous devriez voir dans la console :
   ```
   ✅ Users created: { alice: 'alice', bob: 'bob', charlie: 'charlie', diana: 'diana' }
   ```

## Méthode 2 : Via npm directement

Si vous préférez utiliser npm directement :

1. **Récupérer votre DATABASE_URL de Supabase** (voir Méthode 1)

2. **Créer un fichier `.env` temporaire dans le dossier backend**
   ```bash
   cd backend
   echo 'DATABASE_URL="votre_connection_string_supabase"' > .env
   ```

3. **Installer les dépendances et exécuter le seed**
   ```bash
   npm install
   npm run prisma:seed
   ```

4. **Nettoyer le fichier `.env` après** (optionnel, pour éviter de l'envoyer par erreur)
   ```bash
   rm .env
   ```

## Méthode 2 : Via Render (si vous avez accès SSH)

1. Dans Render, allez dans votre service backend
2. Ouvrez un shell (si disponible)
3. Exécutez :
   ```bash
   cd backend
   npm run prisma:seed
   ```

## Méthode 3 : Créer un compte via l'interface

Si vous ne pouvez pas exécuter le seed, vous pouvez créer un compte directement :

1. Allez sur `https://timeswap-frontend-mu5v.onrender.com/auth/register`
2. Créez un nouveau compte avec votre email et mot de passe
3. Connectez-vous avec ces identifiants

## Identifiants de test (après seed)

Après avoir exécuté le seed, vous pouvez vous connecter avec :

- **Alice** : `alice@example.com` / `password123`
- **Bob** : `bob@example.com` / `password123`
- **Charlie** : `charlie@example.com` / `password123`
- **Diana** : `diana@example.com` / `password123`

## Vérification

Pour vérifier que les utilisateurs existent, vous pouvez tester l'endpoint :

```bash
curl https://timeswap-backend-1x1j.onrender.com/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Vous devriez recevoir un token JWT si les identifiants sont corrects.

