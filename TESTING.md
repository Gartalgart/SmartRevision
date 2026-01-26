# Instructions de Test

## Scénarios de Test Principaux

### 1. Authentification
- **Inscription** : S'inscrire avec un email/mot de passe. Vérifier la création du compte et la redirection.
- **Connexion** : Se déconnecter via le profil et se reconnecter.

### 2. Gestion du Vocabulaire (`(tabs)/words`)
- **Ajout** : Utiliser le bouton "Ajouter un mot".
  - Essayer d'ajouter sans remplir les champs (Vérifier erreur).
  - Ajouter "Apple" / "Pomme".
- **Liste** : Vérifier que "Apple" apparaît dans la liste "Vocabulaire".
- **Recherche** : Taper "Pomme" dans la barre de recherche.

### 3. Système de Révision
*Note : Un nouveau mot est immédiatement disponible pour la révision (status 'new').*

- **Lancement** : Sur l'accueil, le compteur doit afficher "1" (si vous avez ajouté 1 mot).
- **Session** :
  - Lancer la révision.
  - Vérifier le recto (Anglais).
  - Taper pour retourner (Animation + Français).
  - Choisir une difficulté (ex: "Facile").
- **Résultat** :
  - L'écran de félicitations apparaît.
  - Retour à l'accueil.
  - Le compteur "À réviser" doit être retombé à 0.
  - La prochaine révision pour ce mot sera dans 7 jours (si "Facile").

### 4. Persistance
- Fermer et rouvrir l'application. La session utilisateur doit être maintenue.

## Données de Test

Pour peupler votre base rapidement via SQL Editor Supabase (remplacez `USER_UUID` par votre ID utilisateur trouvable dans la table `auth.users`) :

```sql
WITH new_vocab AS (
  INSERT INTO vocabulary_items (user_id, english_word, french_translation, example_sentence)
  VALUES 
    ('USER_UUID', 'Resilience', 'Résilience', 'Resilience is key to success.'),
    ('USER_UUID', 'Ubiquitous', 'Omniprésent', 'Smartphones are ubiquitous nowadays.')
  RETURNING id, user_id
)
INSERT INTO learning_progress (user_id, item_id, status)
SELECT user_id, id, 'new' FROM new_vocab;
```
