# SmartRevision App

Application mobile de révision de vocabulaire anglais basée sur la répétition espacée (SM-2 simplifié), construite avec Expo, TypeScript et Supabase.

## Fonctionnalités

- **Authentification** : Inscription et connexion sécurisées.
- **Gestion du vocabulaire** : Ajout de mots anglais avec traduction et exemples.
- **Répétition Spacée** : Algorithme SM-2 pour optimiser les révisions.
- **Flashcards** : Interface interactive avec cartes retournables.
- **Dashboard** : Suivi des mots à réviser et de la progression.

## Structure du Projet

- `app/` : Routes et écrans (Expo Router).
- `components/` : Composants UI réutilisables.
- `services/` : Logique métier et interaction avec Supabase.
- `hooks/` : Custom hooks (React Query, Auth).
- `utils/` : Algorithmes (SM-2) et constantes.
- `types/` : Définitions TypeScript.

## Prérequis

- Node.js (LTS recommandé)
- Compte Supabase (Gratuit)

## Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Configurer les variables d'environnement :
   Créer un fichier `.env` à la racine (voir `.env.example` ou ci-dessous) et ajouter vos clés Supabase.
   ```
   EXPO_PUBLIC_SUPABASE_URL=votre_url_projet
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   ```

3. Lancer l'application :
   ```bash
   npx expo start
   ```
   - Appuyer sur `i` pour lancer sur simulateur iOS (Mac uniquement).
   - Appuyer sur `a` pour lancer sur émulateur Android.
   - Scanner le QR code avec l'app Expo Go sur votre téléphone.

## Base de Données (Supabase)

Voir le fichier [SETUP.md](./SETUP.md) pour les instructions détaillées de configuration de la base de données.
