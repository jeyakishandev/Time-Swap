# 🚀 Étapes de Déploiement sur Render

## 📋 Étape 1 : Déployer le Backend

### 1.1 Créer le service Backend
1. Allez sur https://render.com
2. Connectez-vous avec GitHub
3. Cliquez sur **"New +"** > **"Web Service"**
4. Sélectionnez votre repository `Time-Swap`
5. Configurez :
   - **Name** : `timeswap-backend`
   - **Region** : Choisissez la région la plus proche
   - **Branch** : `master` (ou `main`)
   - **Root Directory** : ⚠️ **LAISSEZ VIDE** (ne pas mettre "backend")
   - **Runtime** : `Node`
   - **Build Command** : 
     ```bash
     cd backend && npm install --include=dev && npm run build && npx prisma generate
     ```
   - **Start Command** :
     ```bash
     cd backend && npm run start:prod
     ```
   - **Plan** : Free (pour commencer)

### 1.2 Variables d'environnement Backend
Dans **Environment Variables**, ajoutez :

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres.vfijdglwduqtizmykybw:ja1mVOkGIw1BTuq0@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=3098d9f77efb1f0612e29cf801309769d347dadcaebefe3a0fa096a9b043ad8c762930950e67ce654eb8a19d205191955aa1c0f0eac2a9275e08c30c99c779f7
FRONTEND_URL=https://timeswap-frontend.onrender.com
BACKEND_PORT=3001
```

⚠️ **IMPORTANT** : Utilisez le **Transaction Pooler** (port 6543) pour la production !

### 1.3 Health Check
Dans **Advanced Settings** :
- **Health Check Path** : `/health`

### 1.4 Déployer
1. Cliquez sur **"Create Web Service"**
2. ⏳ Attendez 5-10 minutes
3. ✅ Notez l'URL : `https://timeswap-backend.onrender.com` (ou similaire)

---

## 📋 Étape 2 : Déployer le Frontend

### 2.1 Créer le service Frontend
1. Dans Render, cliquez sur **"New +"** > **"Web Service"**
2. Sélectionnez le même repository `Time-Swap`
3. Configurez :
   - **Name** : `timeswap-frontend`
   - **Region** : Même région que le backend
   - **Branch** : `master` (ou `main`)
   - **Root Directory** : ⚠️ **LAISSEZ VIDE** (ne pas mettre "frontend")
   - **Runtime** : `Node`
   - **Build Command** :
     ```bash
     cd frontend && npm install && npm run build
     ```
   - **Start Command** :
     ```bash
     cd frontend && npm start
     ```
   - **Plan** : Free

### 2.2 Variables d'environnement Frontend
Dans **Environment Variables**, ajoutez :

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://timeswap-backend.onrender.com
PORT=3000
```

⚠️ Remplacez `https://timeswap-backend.onrender.com` par l'URL réelle de votre backend !

### 2.3 Déployer
1. Cliquez sur **"Create Web Service"**
2. ⏳ Attendez 5-10 minutes
3. ✅ Notez l'URL : `https://timeswap-frontend.onrender.com` (ou similaire)

---

## 📋 Étape 3 : Mettre à jour FRONTEND_URL

1. Retournez dans le service **Backend** sur Render
2. Allez dans **Environment**
3. Mettez à jour `FRONTEND_URL` avec l'URL réelle de votre frontend :
   ```
   FRONTEND_URL=https://timeswap-frontend.onrender.com
   ```
4. Cliquez sur **"Save Changes"**
5. Render redéploiera automatiquement

---

## ✅ Vérification

1. **Backend Health Check** : `https://votre-backend.onrender.com/health`
   - Devrait retourner : `{"status":"ok","database":"connected"}`

2. **Frontend** : `https://votre-frontend.onrender.com`
   - L'application devrait se charger

3. **Test** :
   - Créer un compte
   - Se connecter
   - Envoyer un message

---

## 🐛 En cas de problème

- Vérifiez les logs dans Render > Logs
- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez que les URLs sont correctes (pas d'espace, pas de slash à la fin)

