# ✅ Checklist de Préparation Production

## 📋 Avant le Déploiement

### Base de Données (Supabase)
- [ ] Créer un projet Supabase
- [ ] Récupérer la connection string PostgreSQL
- [ ] Tester la connexion à la base de données
- [ ] Appliquer les migrations Prisma : `npx prisma migrate deploy`

### Backend (Render)
- [ ] Créer un service Web sur Render
- [ ] Configurer les variables d'environnement :
  - `DATABASE_URL` (connection string Supabase)
  - `JWT_SECRET` (générer une clé secrète forte)
  - `FRONTEND_URL` (URL du frontend Render)
  - `NODE_ENV=production`
  - `BACKEND_PORT=3001`
- [ ] Configurer le Build Command : `cd backend && npm ci && npm run build && npx prisma generate`
- [ ] Configurer le Start Command : `cd backend && npm run start:prod`
- [ ] Configurer le Health Check Path : `/health`
- [ ] Tester l'endpoint `/health` après déploiement

### Frontend (Render)
- [ ] Créer un service Web sur Render
- [ ] Configurer les variables d'environnement :
  - `NEXT_PUBLIC_API_URL` (URL du backend Render)
  - `NODE_ENV=production`
  - `PORT=3000`
- [ ] Configurer le Build Command : `cd frontend && npm ci && npm run build`
- [ ] Configurer le Start Command : `cd frontend && npm start`
- [ ] Tester l'application après déploiement

## 🔐 Sécurité

- [ ] JWT_SECRET généré et configuré (ne jamais utiliser la valeur par défaut en production)
- [ ] CORS configuré correctement
- [ ] Headers de sécurité activés
- [ ] Rate limiting activé
- [ ] Variables d'environnement sécurisées (pas dans le code)

## 🧪 Tests Post-Déploiement

- [ ] Backend accessible et répond aux requêtes
- [ ] Frontend accessible et se charge correctement
- [ ] Connexion à la base de données fonctionnelle
- [ ] Authentification fonctionnelle (login/register)
- [ ] WebSockets fonctionnels (notifications, messages)
- [ ] API endpoints fonctionnels
- [ ] Health check endpoint fonctionnel

## 📝 Notes Importantes

1. **Migrations Prisma** : Utilisez `prisma migrate deploy` en production, pas `prisma migrate dev`
2. **JWT_SECRET** : Générer avec `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
3. **CORS** : S'assurer que `FRONTEND_URL` correspond exactement à l'URL du frontend
4. **WebSockets** : Render supporte les WebSockets nativement, pas de configuration supplémentaire nécessaire
5. **Base de données** : Supabase utilise PostgreSQL, le schéma Prisma a été mis à jour

## 🚨 En cas de Problème

- Vérifier les logs Render pour les erreurs
- Vérifier que toutes les variables d'environnement sont configurées
- Vérifier que les migrations Prisma ont été appliquées
- Vérifier la connexion à la base de données Supabase
- Vérifier les URLs CORS

