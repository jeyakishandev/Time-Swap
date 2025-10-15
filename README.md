# 🌟 Time-Swap Network

> **Mon premier projet Full Stack ambitieux**

Une plateforme d'échange de crédits temps que j'ai développée pour apprendre les technologies modernes. L'idée m'est venue en pensant à un système d'échange de services entre amis.

## 🎯 Pourquoi ce projet ?

Après avoir fait quelques projets simples (todo list, blog basique), j'ai voulu créer quelque chose de plus complexe. L'idée des crédits temps m'a plu car ça combine plusieurs concepts intéressants : l'authentification, les transactions, et une interface utilisateur moderne.

## 📚 Ce que j'ai appris

### **Next.js 14**
- L'App Router est vraiment différent de ce que je connaissais
- Les Server Components, c'est génial mais il faut s'habituer
- Tailwind CSS c'est pratique mais il faut une bonne organisation

### **NestJS**
- Premier framework backend que j'utilise (avant j'utilisais Express)
- L'injection de dépendances, c'est magique !
- Les Guards pour l'authentification, j'ai mis du temps à comprendre

### **Prisma**
- Les transactions atomiques, j'ai eu des bugs bizarres avant de comprendre
- Maintenant je vois pourquoi c'est si important pour la cohérence des données
- SQLite pour commencer, PostgreSQL plus tard

## 🚀 Stack Technique

### Frontend
- **Next.js 14** - J'ai découvert l'App Router, c'est génial !
- **TypeScript** - J'apprends à bien typer, c'est pas toujours évident
- **Tailwind CSS** - Pratique mais il faut s'organiser

### Backend
- **NestJS** - Mon premier framework backend sérieux
- **Prisma** - J'ai galéré avec les transactions mais maintenant je comprends
- **JWT** - L'authentification, j'ai appris l'importance de la sécurité
- **SQLite** - Pour commencer, PostgreSQL plus tard

## 🐛 Problèmes rencontrés

### **Authentification JWT**
- J'ai eu du mal à comprendre le flow complet au début
- Les tokens qui expiraient trop vite (j'ai mis 1h au lieu de 1 jour)
- Les cookies HTTP-only, c'est plus sécurisé mais plus complexe

### **Transactions Prisma**
- J'avais des bugs bizarres : l'argent disparaissait parfois
- J'ai découvert les transactions atomiques et maintenant c'est stable
- Les types Decimal vs Number, j'ai galéré avec SQLite

### **Docker**
- Docker ne marchait pas sur mon PC au début
- J'ai appris à utiliser SQLite en local pour développer plus facilement
- Les variables d'environnement, c'est important !

## 🚀 Démarrage Rapide

```bash
# Backend
cd backend
export DATABASE_URL="file:./dev.db"
export JWT_SECRET="your-secret-key"
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 👤 Auteur

**Développeur Junior Full Stack en apprentissage**

Ce projet montre ma progression :
- ✅ Premier projet Full Stack complet
- ✅ Découverte des transactions atomiques
- ✅ Apprentissage de l'authentification JWT
- ✅ Premiers pas avec les tests unitaires