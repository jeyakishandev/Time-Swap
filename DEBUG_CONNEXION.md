# 🔍 Guide de débogage - Problème de connexion en production

## ✅ Vérifications à faire

### 1. Variables d'environnement Frontend (Render)

Dans Render > `timeswap-frontend` > **Environment**, vérifiez :

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://timeswap-backend-1x1j.onrender.com
PORT=3000
```

⚠️ **IMPORTANT** :
- Pas d'espace avant/après le `=`
- Pas de guillemets autour de la valeur
- Pas de slash `/` à la fin de l'URL
- L'URL doit être en `https://` (pas `http://`)

### 2. Variables d'environnement Backend (Render)

Dans Render > `timeswap-backend` > **Environment**, vérifiez :

```
FRONTEND_URL=https://timeswap-frontend-mu5v.onrender.com
```

⚠️ **IMPORTANT** :
- Pas d'espace avant/après le `=`
- Pas de guillemets autour de la valeur
- Pas de slash `/` à la fin de l'URL
- L'URL doit être en `https://` (pas `http://`)

### 3. Test de l'API Backend

Ouvrez dans votre navigateur :
```
https://timeswap-backend-1x1j.onrender.com/health
```

Vous devriez voir :
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

### 4. Test de connexion depuis le navigateur

1. Ouvrez la console du navigateur (F12)
2. Allez sur `https://timeswap-frontend-mu5v.onrender.com/auth/login`
3. Essayez de vous connecter
4. Regardez les erreurs dans la console

**Erreurs courantes :**

#### Erreur CORS
```
Access to fetch at 'https://timeswap-backend-1x1j.onrender.com/auth/login' from origin 'https://timeswap-frontend-mu5v.onrender.com' has been blocked by CORS policy
```
**Solution** : Vérifiez que `FRONTEND_URL` dans le backend contient bien l'URL du frontend

#### Erreur 404
```
POST https://timeswap-backend-1x1j.onrender.com/auth/login 404
```
**Solution** : Vérifiez que `NEXT_PUBLIC_API_URL` est correct dans le frontend

#### Erreur Network
```
Network Error
Failed to fetch
```
**Solution** : Vérifiez que le backend est bien démarré et accessible

### 5. Vérifier les logs Render

**Backend** : Render > `timeswap-backend` > **Logs**
- Cherchez les erreurs lors de la tentative de connexion
- Vérifiez que les requêtes arrivent bien

**Frontend** : Render > `timeswap-frontend` > **Logs**
- Cherchez les erreurs de build ou de runtime
- Vérifiez que `NEXT_PUBLIC_API_URL` est bien utilisé

### 6. Test manuel de l'API

Testez directement l'endpoint de login avec curl ou Postman :

```bash
curl -X POST https://timeswap-backend-1x1j.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔧 Solutions rapides

### Solution 1 : Redéployer après modification des variables

1. Modifiez les variables d'environnement dans Render
2. Cliquez sur **"Save Changes"**
3. Render redéploiera automatiquement
4. Attendez 2-3 minutes
5. Testez à nouveau

### Solution 2 : Vérifier que les services sont actifs

Dans Render Dashboard, vérifiez que :
- ✅ Backend : Status = "Live"
- ✅ Frontend : Status = "Live"

### Solution 3 : Vider le cache du navigateur

1. Ouvrez les outils de développement (F12)
2. Clic droit sur le bouton de rechargement
3. Sélectionnez "Vider le cache et actualiser"

## 📝 Checklist complète

- [ ] `NEXT_PUBLIC_API_URL` dans le frontend = URL du backend (https://)
- [ ] `FRONTEND_URL` dans le backend = URL du frontend (https://)
- [ ] Pas d'espace dans les variables d'environnement
- [ ] Pas de slash à la fin des URLs
- [ ] Backend accessible via `/health`
- [ ] Les deux services sont "Live" dans Render
- [ ] Console du navigateur ne montre pas d'erreurs CORS
- [ ] Les logs Render ne montrent pas d'erreurs critiques

## 🆘 Si ça ne fonctionne toujours pas

Partagez avec moi :
1. Les erreurs de la console du navigateur (F12 > Console)
2. Les logs Render du backend (dernières lignes)
3. Les logs Render du frontend (dernières lignes)
4. Le message d'erreur exact que vous voyez

