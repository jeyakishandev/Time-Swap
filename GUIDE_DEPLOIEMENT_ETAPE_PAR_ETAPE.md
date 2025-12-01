# 🚀 Guide de Déploiement Étape par Étape

Ce guide vous accompagne pas à pas pour déployer Time-Swap Network.

## 📋 Étape 1 : Créer le projet Supabase

### 1.1 Créer un compte Supabase
1. Allez sur https://supabase.com
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub (recommandé) ou créez un compte

### 1.2 Créer un nouveau projet
1. Cliquez sur "New Project"
2. Remplissez les informations :
   - **Name** : `timeswap-network` (ou le nom de votre choix)
   - **Database Password** : Créez un mot de passe fort (⚠️ **SAVEZ-LE**, vous en aurez besoin)
   - **Region** : Choisissez la région la plus proche de vous
   - **Pricing Plan** : Free tier (gratuit pour commencer)
3. Cliquez sur "Create new project"
4. ⏳ Attendez 2-3 minutes que le projet soit créé

### 1.3 Récupérer la connection string
1. Dans votre projet Supabase, allez dans **Settings** (icône d'engrenage en bas à gauche)
2. Cliquez sur **Database**
3. Faites défiler jusqu'à **Connection string**
4. ⚠️ **IMPORTANT : Sélectionnez "Transaction pooler"** (pas "Direct connection")
   - C'est le mode recommandé pour Prisma
   - Port : **6543** (pas 5432)
5. **Copiez la connection string** - elle ressemble à :
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. ⚠️ **Remplacez `[YOUR-PASSWORD]`** par le mot de passe que vous avez créé à l'étape 1.2

**Exemple de connection string complète :**
```
postgresql://postgres.abcdefghijklmnop:MonMotDePasse123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Pourquoi Transaction Pooler ?**
- ✅ Meilleure performance avec Prisma
- ✅ Gère mieux les connexions multiples
- ✅ Évite les erreurs "too many connections"
- ✅ Optimisé pour les requêtes courtes

---

## 📋 Étape 2 : Appliquer les migrations Prisma sur Supabase

### 2.1 Configurer la connection string localement
1. Dans votre terminal, allez dans le dossier backend :
   ```bash
   cd /root/Time-Swap/backend
   ```

2. Créez un fichier `.env` (si il n'existe pas) :
   ```bash
   cp env.example .env
   ```

3. Éditez le fichier `.env` et remplacez `DATABASE_URL` par votre connection string Supabase :
   ```env
   DATABASE_URL="postgresql://postgres:VotreMotDePasse@db.xxxxx.supabase.co:5432/postgres"
   ```

### 2.2 Appliquer les migrations
1. Installez les dépendances si nécessaire :
   ```bash
   npm install
   ```

2. Générez le client Prisma :
   ```bash
   npx prisma generate
   ```

3. Appliquez les migrations à la base de données Supabase :
   ```bash
   npx prisma migrate deploy
   ```
   
   Ou si vous préférez utiliser `db push` :
   ```bash
   npx prisma db push
   ```

4. ✅ Vérifiez que les migrations ont été appliquées :
   - Allez dans Supabase > **Table Editor**
   - Vous devriez voir toutes les tables : `users`, `services`, `bookings`, `messages`, etc.

---

## 📋 Étape 3 : Déployer le Backend sur Render

### 3.1 Créer un compte Render
1. Allez sur https://render.com
2. Cliquez sur "Get Started for Free"
3. Connectez-vous avec GitHub (recommandé)

### 3.2 Créer le service Backend
1. Dans le dashboard Render, cliquez sur **"New +"** > **"Web Service"**
2. Connectez votre repository GitHub :
   - Si c'est la première fois, autorisez Render à accéder à vos repos
   - Sélectionnez le repository `Time-Swap`
3. Configurez le service :
   - **Name** : `timeswap-backend`
   - **Region** : Choisissez la région la plus proche
   - **Branch** : `master` (ou `main` selon votre repo)
   - **Root Directory** : `backend` (optionnel, mais recommandé)
   - **Runtime** : `Node`
   - **Build Command** : 
     ```bash
     npm ci && npm run build && npx prisma generate
     ```
   - **Start Command** :
     ```bash
     npm run start:prod
     ```
   - **Plan** : Free (pour commencer)

### 3.3 Configurer les variables d'environnement
Dans la section **Environment Variables**, ajoutez :

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `DATABASE_URL` | `postgresql://postgres:...` | Votre connection string Supabase |
| `JWT_SECRET` | `[GÉNÉREZ UNE CLÉ]` | Voir ci-dessous |
| `FRONTEND_URL` | `https://timeswap-frontend.onrender.com` | On le mettra à jour après le déploiement du frontend |
| `BACKEND_PORT` | `3001` | |

**Générer un JWT_SECRET :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copiez la clé générée et utilisez-la pour `JWT_SECRET`.

### 3.4 Configurer le Health Check
1. Dans **Advanced Settings**
2. **Health Check Path** : `/health`

### 3.5 Déployer
1. Cliquez sur **"Create Web Service"**
2. ⏳ Attendez 5-10 minutes que le build se termine
3. ✅ Notez l'URL de votre backend (ex: `https://timeswap-backend.onrender.com`)

---

## 📋 Étape 4 : Déployer le Frontend sur Render

### 4.1 Créer le service Frontend
1. Dans le dashboard Render, cliquez sur **"New +"** > **"Web Service"**
2. Sélectionnez le même repository `Time-Swap`
3. Configurez le service :
   - **Name** : `timeswap-frontend`
   - **Region** : Même région que le backend
   - **Branch** : `master` (ou `main`)
   - **Root Directory** : `frontend` (optionnel)
   - **Runtime** : `Node`
   - **Build Command** :
     ```bash
     npm ci && npm run build
     ```
   - **Start Command** :
     ```bash
     npm start
     ```
   - **Plan** : Free

### 4.2 Configurer les variables d'environnement
Dans la section **Environment Variables**, ajoutez :

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `NEXT_PUBLIC_API_URL` | `https://timeswap-backend.onrender.com` | URL de votre backend (étape 3.5) |
| `PORT` | `3000` | |

### 4.3 Déployer
1. Cliquez sur **"Create Web Service"**
2. ⏳ Attendez 5-10 minutes que le build se termine
3. ✅ Notez l'URL de votre frontend (ex: `https://timeswap-frontend.onrender.com`)

---

## 📋 Étape 5 : Mettre à jour les configurations

### 5.1 Mettre à jour FRONTEND_URL dans le Backend
1. Retournez dans le service backend sur Render
2. Allez dans **Environment**
3. Mettez à jour `FRONTEND_URL` avec l'URL de votre frontend :
   ```
   FRONTEND_URL=https://timeswap-frontend.onrender.com
   ```
4. Cliquez sur **"Save Changes"**
5. Render redéploiera automatiquement

### 5.2 Vérifier les WebSockets
Les WebSockets devraient fonctionner automatiquement sur Render. Si vous avez des problèmes, vérifiez que `FRONTEND_URL` est correctement configuré.

---

## 📋 Étape 6 : Tester le déploiement

### 6.1 Tester le Backend
1. Ouvrez votre navigateur
2. Allez sur `https://votre-backend.onrender.com/health`
3. Vous devriez voir :
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "database": "connected"
   }
   ```

### 6.2 Tester le Frontend
1. Ouvrez votre navigateur
2. Allez sur `https://votre-frontend.onrender.com`
3. L'application devrait se charger
4. Testez :
   - Créer un compte
   - Se connecter
   - Envoyer un message
   - Créer un service

---

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez les logs dans Render > Logs
- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez que `DATABASE_URL` est correct

### Erreur de connexion à la base de données
- Vérifiez que la connection string Supabase est correcte
- Vérifiez que les migrations Prisma ont été appliquées
- Vérifiez que le mot de passe dans la connection string est correct

### CORS errors
- Vérifiez que `FRONTEND_URL` dans le backend correspond exactement à l'URL du frontend
- Vérifiez qu'il n'y a pas d'espace ou de slash à la fin

### WebSockets ne fonctionnent pas
- Vérifiez que `FRONTEND_URL` est correctement configuré
- Render supporte les WebSockets nativement, pas de configuration supplémentaire nécessaire

---

## ✅ Checklist Finale

- [ ] Projet Supabase créé
- [ ] Migrations Prisma appliquées
- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Render
- [ ] Variables d'environnement configurées
- [ ] FRONTEND_URL mis à jour dans le backend
- [ ] Health check fonctionne
- [ ] Application testée (inscription, connexion, messages)

---

## 🎉 Félicitations !

Votre application Time-Swap Network est maintenant en production ! 🚀

