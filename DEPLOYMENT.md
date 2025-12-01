# Guide de Déploiement - Time-Swap Network

Ce guide explique comment déployer Time-Swap Network sur Render (backend + frontend) et Supabase (base de données).

## 📋 Prérequis

1. Compte Render : https://render.com
2. Compte Supabase : https://supabase.com
3. Git repository configuré

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Notez les informations de connexion :
   - Host
   - Database name
   - User
   - Password
   - Port (généralement 5432)

### 2. Récupérer la connection string

Dans votre projet Supabase, allez dans **Settings > Database** et copiez la connection string.

**⚠️ IMPORTANT : Utilisez le TRANSACTION POOLER (port 6543) pour Prisma**

1. Dans la section **Connection string**, sélectionnez **"Transaction pooler"** (pas "Direct connection")
2. Copiez la connection string - elle ressemble à :
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
3. Remplacez `[PASSWORD]` par le mot de passe de votre base de données

**Pourquoi Transaction Pooler ?**
- ✅ Meilleure performance avec Prisma
- ✅ Gère mieux les connexions multiples
- ✅ Évite les erreurs "too many connections"
- ✅ Optimisé pour les requêtes courtes (parfait pour Prisma)

### 3. Appliquer les migrations Prisma

```bash
cd backend
# Mettre à jour DATABASE_URL dans .env avec la connection string Supabase
npx prisma migrate deploy
# ou
npx prisma db push
```

## 🚀 Déploiement sur Render

### Backend

1. **Créer un nouveau Web Service sur Render**
   - Connectez votre repository GitHub
   - Sélectionnez le repository Time-Swap
   - Configuration :
     - **Name**: `timeswap-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm ci && npm run build && npx prisma generate`
     - **Start Command**: `cd backend && npm run start:prod`
     - **Root Directory**: `backend` (optionnel)

2. **Variables d'environnement** (dans Render Dashboard > Environment)
   ```
   NODE_ENV=production
   DATABASE_URL=<votre connection string Supabase>
   JWT_SECRET=<générez une clé secrète forte>
   FRONTEND_URL=https://timeswap-frontend.onrender.com
   BACKEND_PORT=3001
   ```

3. **Health Check** (optionnel)
   - Créez un endpoint `/health` dans votre backend
   - Configurez-le dans Render : `Health Check Path: /health`

### Frontend

1. **Créer un nouveau Web Service sur Render**
   - Connectez votre repository GitHub
   - Sélectionnez le repository Time-Swap
   - Configuration :
     - **Name**: `timeswap-frontend`
     - **Environment**: `Node`
     - **Build Command**: `cd frontend && npm ci && npm run build`
     - **Start Command**: `cd frontend && npm start`
     - **Root Directory**: `frontend` (optionnel)

2. **Variables d'environnement**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://timeswap-backend.onrender.com
   PORT=3000
   ```

## 🔧 Configuration Post-Déploiement

### 1. Mettre à jour CORS

Assurez-vous que `FRONTEND_URL` dans le backend correspond à l'URL de votre frontend Render.

### 2. Vérifier les WebSockets

Les WebSockets (notifications, messages) devraient fonctionner automatiquement sur Render.

### 3. Générer un JWT_SECRET sécurisé

```bash
# Générer une clé secrète
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📝 Checklist de Déploiement

- [ ] Projet Supabase créé
- [ ] Migrations Prisma appliquées sur Supabase
- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Render
- [ ] Variables d'environnement configurées
- [ ] CORS configuré correctement
- [ ] JWT_SECRET généré et configuré
- [ ] Tests de connexion effectués
- [ ] WebSockets testés

## 🐛 Dépannage

### Erreur de connexion à la base de données

- Vérifiez que la connection string Supabase est correcte
- Vérifiez que les migrations Prisma ont été appliquées
- Vérifiez les logs Render pour plus de détails

### Erreur CORS

- Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL du frontend
- Vérifiez que les headers CORS sont correctement configurés

### WebSockets ne fonctionnent pas

- Render supporte les WebSockets nativement
- Vérifiez que les URLs sont correctes dans les configurations frontend

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)

