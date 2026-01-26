# Configuration Supabase

Suivez ces étapes pour configurer le backend de l'application.

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un nouveau projet.
2. Notez l'URL du projet et la clé publique `anon` (disponibles dans Project Settings > API).

## 2. Configurer l'Authentification

1. Allez dans le menu **Authentication** > **Providers**.
2. Assurez-vous que **Email** est activé.
3. (Optionnel) Désactivez "Confirm email" dans **Authentication** > **Providers** > **Email** si vous souhaitez tester sans valider les emails.

## 3. Créer les Tables de la Base de Données

1. Allez dans le **SQL Editor** de votre projet Supabase.
2. Cliquez sur "New Query".
3. Copiez-collez le contenu du fichier `supabase/migrations/initial_schema.sql` (situé dans ce projet).
4. Cliquez sur **Run** pour exécuter le script.

Ce script va créer :
- Les tables `vocabulary_items`, `learning_progress`, `review_sessions`.
- Les indexes de performance.
- Les politiques de sécurité (RLS) pour protéger les données utilisateurs.
- La fonction `get_due_reviews` nécessaire pour l'application.

## 4. Lier l'application

1. Ouvrez le fichier `.env` à la racine du projet `smart-revision-app`.
2. Remplacez les valeurs par celles de votre projet :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-publique-anon
   ```

## 5. Test

Lancez l'application avec `npx expo start` et créez un compte utilisateur pour vérifier que la connexion à Supabase fonctionne.
