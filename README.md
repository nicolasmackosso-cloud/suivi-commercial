# Suivi commercial

Application Next.js pour gérer et lister les ventes réalisées par des commerciaux en quartier.

## Fonctionnalités

- Ajouter et modifier des ventes
- Filtrer les ventes par commercial ou quartier
- Supprimer des ventes
- Voir le total des montants filtrés
- Enregistrer les ventes dans le stockage local du navigateur

## Lancer l'application

1. Installer les dépendances :

```bash
npm install
```

2. Démarrer le serveur de développement :

```bash
npm run dev
```

3. Ouvrir le navigateur à :

```bash
http://localhost:3000
```

## Structure

- `app/page.tsx` : interface principale de gestion des ventes
- `app/layout.tsx` : configuration du titre et du style global
- `app/globals.css` : styles globaux et configuration Tailwind

## Notes

Les ventes sont sauvegardées localement dans le navigateur via `localStorage`.
