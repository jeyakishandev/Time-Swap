# 🚀 Guide Rapide : Déployer le Seed sur Supabase

## ⚡ Méthode Rapide (1 commande)

```bash
cd backend
DATABASE_URL="postgresql://postgres.xxxxx:VotreMotDePasse@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true" ./seed-production.sh
```

## 📋 Étapes Détaillées

### 1. Récupérer la DATABASE_URL de Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Database**
4. Dans la section **Connection string**, sélectionnez **Transaction pooler**
5. Copiez la connection string (elle ressemble à ça) :
   ```
   postgresql://postgres.xxxxx:VotreMotDePasse@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. **Important** : Remplacez `[YOUR-PASSWORD]` par votre mot de passe Supabase

### 2. Exécuter le Seed

**Option A : Avec le script automatique (recommandé)**
```bash
cd backend
DATABASE_URL="votre_connection_string_complète" ./seed-production.sh
```

**Option B : Avec npm directement**
```bash
cd backend
echo 'DATABASE_URL="votre_connection_string_complète"' > .env
npm install
npm run prisma:seed
rm .env  # Nettoyer après
```

### 3. Vérifier le Résultat

Vous devriez voir dans la console :
```
🌱 Seeding database...
✅ Users created: { alice: 'alice', bob: 'bob', charlie: 'charlie', diana: 'diana' }
✅ Sample transactions created: ...
✅ Services created: ...
✅ Reviews created: ...
✅ Seed terminé avec succès !
```

### 4. Tester la Connexion

Testez avec un des comptes créés :
- Email : `alice@example.com`
- Mot de passe : `password123`

## 🔐 Identifiants de Test Créés

Après le seed, vous pouvez vous connecter avec :

| Email | Mot de passe | Crédits |
|-------|--------------|---------|
| `alice@example.com` | `password123` | 10000 |
| `bob@example.com` | `password123` | 150 |
| `charlie@example.com` | `password123` | 75 |
| `diana@example.com` | `password123` | 200 |

## ⚠️ Notes Importantes

1. **Le seed utilise `upsert`** : Si les utilisateurs existent déjà, ils ne seront pas dupliqués
2. **Les données sont sécurisées** : Les mots de passe sont hashés avec bcrypt
3. **Le seed crée aussi** :
   - Des transactions de test
   - Des services de test
   - Des réservations de test
   - Des avis de test

## 🐛 Dépannage

### Erreur : "DATABASE_URL n'est pas définie"
→ Assurez-vous d'avoir défini la variable d'environnement avant d'exécuter le script

### Erreur : "Connection refused"
→ Vérifiez que vous utilisez le **Transaction Pooler** (port 6543) et non la connexion directe (port 5432)

### Erreur : "Authentication failed"
→ Vérifiez que votre mot de passe Supabase est correct dans la connection string

### Erreur : "Table does not exist"
→ Assurez-vous d'avoir exécuté les migrations Prisma avant le seed :
```bash
cd backend
DATABASE_URL="votre_connection_string" npx prisma migrate deploy
```

## 📚 Documentation Complète

Pour plus de détails, consultez [SEED_PRODUCTION.md](./SEED_PRODUCTION.md)

