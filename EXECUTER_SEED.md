# 🚀 Exécuter le Seed - Guide Simple

## 📋 Vous avez déjà votre URI Supabase ?

Parfait ! Utilisez-la directement :

### Méthode 1 : Une seule commande

```bash
cd backend
DATABASE_URL="votre_uri_supabase_complète" ./seed-production.sh
```

**Exemple :**
```bash
cd backend
DATABASE_URL="postgresql://postgres.xxxxx:VotreMotDePasse@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true" ./seed-production.sh
```

### Méthode 2 : Avec export

```bash
cd backend
export DATABASE_URL="votre_uri_supabase_complète"
./seed-production.sh
```

## 🔍 Où trouver votre URI ?

### Si vous l'avez déjà dans Render :

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionnez votre service backend (`timeswap-backend`)
3. Allez dans l'onglet **Environment**
4. Trouvez la variable `DATABASE_URL`
5. Copiez sa valeur

### Si vous devez la récupérer depuis Supabase :

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Database**
4. Dans **Connection string**, sélectionnez **Transaction pooler**
5. Copiez la connection string
6. **Important** : Remplacez `[YOUR-PASSWORD]` par votre mot de passe Supabase

## ✅ Après l'exécution

Vous devriez voir :
```
🌱 Seeding database...
✅ Users created: { alice: 'alice', bob: 'bob', charlie: 'charlie', diana: 'diana' }
✅ Sample transactions created: ...
✅ Services created: ...
✅ Reviews created: ...
✅ Seed terminé avec succès !
```

## 🧪 Tester

Testez avec un des comptes créés :
```bash
curl https://timeswap-backend-1x1j.onrender.com/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Ou connectez-vous sur le frontend avec :
- Email : `alice@example.com`
- Mot de passe : `password123`

## 🔐 Identifiants créés

| Email | Mot de passe | Crédits |
|-------|--------------|---------|
| `alice@example.com` | `password123` | 10000 |
| `bob@example.com` | `password123` | 150 |
| `charlie@example.com` | `password123` | 75 |
| `diana@example.com` | `password123` | 200 |

