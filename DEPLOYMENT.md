# Suivi commercial - Sales Tracking App

Application Next.js pour gérer et suivre les ventes réalisées par des commerciaux en quartier.

## Fonctionnalités

- **Tableau croisé dynamique** : Visualisez les ventes par commercial et date
- **Synthèse mensuelle** : Statistiques complètes des ventes
- **Classement des quartiers** : Suivi automatique des meilleures performances
- **Formulaire d'ajout** : Enregistrement simplifié des ventes
- **Modification/Suppression** : Gestion complète des données

## Stack technologique

- **Frontend** : Next.js 16, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes
- **Données** : localStorage (développement), prêt pour Prisma/PostgreSQL
- **Déploiement** : Vercel

## Installation locale

```bash
# Cloner le repository
git clone <your-repo-url>
cd suivi_commercial

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Accédez à `http://localhost:3000`

## Pages

- **/** : Tableau croisé des ventes (commercial × date)
- **/synthese** : Synthèse mensuelle avec statistiques
- **/classement** : Classement des quartiers par performance

## Déploiement sur Vercel

### 1. Connecter à GitHub

```bash
# Ajouter remote GitHub
git remote add origin https://github.com/your-username/suivi_commercial
git branch -M main
git push -u origin main
```

### 2. Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Connectez votre compte GitHub
4. Sélectionnez le repository `suivi_commercial`
5. Cliquez sur "Deploy"

Vercel détectera automatiquement la configuration et déploiera l'application.

## Configuration environnement

- **développement** : Utilise `localStorage` du navigateur
- **production** : Prêt pour connexion à une base de données PostgreSQL

Créer un fichier `.env.local` pour les variables :

```
DATABASE_URL=votre_database_url
```

## Licence

MIT
