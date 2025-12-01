# 💼 Time-Swap Network

> Plateforme Full Stack d'échange de crédits temps avec marketplace de services

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 📋 Description

**Time-Swap Network** est une plateforme complète permettant aux utilisateurs d'échanger des crédits temps entre eux, de créer et réserver des services, et de gérer leurs transactions de manière sécurisée. Le projet intègre un système d'authentification robuste, une marketplace de services, un système de messagerie en temps réel, et un tableau de bord analytique.

### 🌐 Liens

- **Application en production** : [https://timeswap-frontend-mu5v.onrender.com](https://timeswap-frontend-mu5v.onrender.com)
- **API Backend** : [https://timeswap-backend-1x1j.onrender.com](https://timeswap-backend-1x1j.onrender.com)
- **Documentation API** : [https://timeswap-backend-1x1j.onrender.com/api/docs](https://timeswap-backend-1x1j.onrender.com/api/docs)
- **Repository GitHub** : [https://github.com/jeyakishandev/Time-Swap](https://github.com/jeyakishandev/Time-Swap)

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Sécurité
- Authentification JWT avec tokens sécurisés
- Système de réinitialisation de mot de passe avec tokens temporaires
- Hashage des mots de passe avec bcrypt (12 rounds)
- Rate limiting pour protéger contre les attaques par force brute
- Headers de sécurité (CORS, XSS Protection, etc.)

### 💳 Système de Transactions
- Transfert de crédits temps entre utilisateurs
- Transactions atomiques garantissant la cohérence des données
- Historique complet des transactions
- Gestion des statuts (PENDING, COMPLETED, FAILED, CANCELLED)

### 🛒 Marketplace de Services
- Création et gestion de services avec catégories
- Recherche avancée avec filtres (prix, catégorie, note)
- Système de réservation avec gestion des statuts
- Calendrier de disponibilités

### ⭐ Système d'Avis & Notes
- Notation sur 5 étoiles
- Commentaires détaillés
- Calcul automatique des moyennes
- Affichage des statistiques de notation

### 💬 Communication en Temps Réel
- Messagerie instantanée entre utilisateurs
- Notifications en temps réel via WebSocket (Socket.io)
- Indicateurs de messages non lus
- Conversations persistantes

### 📊 Tableau de Bord Analytique
- Statistiques de transactions (revenus, dépenses)
- Graphiques de visualisation (Recharts)
- Historique des réservations
- Rapports mensuels

## 🛠️ Stack Technique

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP
- **Socket.io Client** - Communication WebSocket
- **Recharts** - Bibliothèque de graphiques
- **Zod** - Validation de schémas

### Backend
- **NestJS** - Framework Node.js progressif
- **Prisma** - ORM moderne pour PostgreSQL/SQLite
- **PostgreSQL** - Base de données relationnelle (production)
- **SQLite** - Base de données pour le développement
- **JWT** - Authentification par tokens
- **bcrypt** - Hashage des mots de passe
- **Socket.io** - WebSockets pour le temps réel
- **Swagger** - Documentation API automatique
- **Jest** - Framework de tests

### DevOps & Déploiement
- **Docker** - Containerisation
- **Render** - Hébergement backend et frontend
- **Supabase** - Base de données PostgreSQL managée
- **GitHub Actions** - CI/CD (optionnel)

## 🚀 Installation & Démarrage

### Prérequis

- Node.js 18+ et npm
- PostgreSQL (pour la production) ou SQLite (pour le développement)

### Installation Rapide

```bash
# Cloner le repository
git clone https://github.com/jeyakishandev/Time-Swap.git
cd Time-Swap

# Installation automatique (recommandé)
./start.sh
```

### Installation Manuelle

```bash
# Backend
cd backend
npm install
cp env.example .env
# Configurer DATABASE_URL et JWT_SECRET dans .env
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Frontend (dans un autre terminal)
cd frontend
npm install
cp env.example .env
# Configurer NEXT_PUBLIC_API_URL dans .env
npm run dev
```

### Avec Docker

```bash
docker-compose up --build
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:3001
- API Docs : http://localhost:3001/api/docs

## 📁 Structure du Projet

```
Time-Swap/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Module d'authentification
│   │   ├── users/          # Gestion des utilisateurs
│   │   ├── transactions/   # Système de transactions
│   │   ├── services/       # Marketplace de services
│   │   ├── bookings/       # Système de réservations
│   │   ├── reviews/        # Système d'avis
│   │   ├── messages/       # Messagerie
│   │   ├── notifications/  # Notifications temps réel
│   │   └── common/         # Utilitaires partagés
│   ├── prisma/             # Schéma et migrations Prisma
│   └── test/               # Tests unitaires
├── frontend/                # Application Next.js
│   ├── app/                # Pages et routes
│   ├── components/         # Composants React
│   ├── hooks/              # Hooks personnalisés
│   └── lib/                # Utilitaires et API client
└── docker-compose.yml       # Configuration Docker
```

## 🧪 Tests

```bash
cd backend

# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch
```

**Couverture actuelle :** 71%
- Services critiques : Auth 100%, Transactions 89%, Users 100%

## 🔧 Configuration

### Variables d'Environnement Backend

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
BACKEND_PORT=3001
```

### Variables d'Environnement Frontend

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
PORT=3000
NODE_ENV="development"
```

Voir `backend/env.example` et `frontend/env.example` pour plus de détails.

## 📚 API Documentation

La documentation complète de l'API est disponible via Swagger :
- **Local** : http://localhost:3001/api/docs
- **Production** : https://timeswap-backend-1x1j.onrender.com/api/docs

## 🚀 Déploiement

Le projet est déployé sur :
- **Render** : Backend et Frontend
- **Supabase** : Base de données PostgreSQL

### Déploiement Rapide

1. Créer un projet Supabase et récupérer la connection string
2. Créer un service Web sur Render pour le backend
3. Créer un service Web sur Render pour le frontend
4. Configurer les variables d'environnement
5. Appliquer les migrations Prisma : `npx prisma migrate deploy`

## 📊 Statistiques du Projet

- **Lignes de code** : ~12 400
- **Endpoints API** : 55+
- **Composants React** : 20+
- **Couverture de tests** : 71%
- **Durée de développement** : 2-3 mois

## 🎯 Points Techniques Remarquables

- **Transactions atomiques** : Garantie de cohérence des données lors des transferts de crédits
- **Architecture modulaire** : Code organisé avec NestJS (modules, services, controllers)
- **Temps réel** : WebSockets pour les notifications et la messagerie
- **Sécurité renforcée** : Rate limiting, validation des données, headers de sécurité
- **Type safety** : TypeScript strict sur tout le projet
- **Tests unitaires** : Couverture importante sur les services critiques

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Développeur Full Stack**

- 🌐 **Portfolio** : [Votre Portfolio](https://votre-portfolio.com) *(à remplacer par votre lien)*
- 💼 **GitHub** : [@jeyakishandev](https://github.com/jeyakishandev)
- 📦 **Projet** : [Time-Swap Network](https://github.com/jeyakishandev/Time-Swap)

---

⭐ Si ce projet vous intéresse, n'hésitez pas à le star sur GitHub !
