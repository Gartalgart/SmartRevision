# 📋 SmartRevision - Plan d'Action (TODO)

Ce fichier liste les tâches restant à accomplir pour faire passer l'application de MVP à une version production-ready.

## 🚀 Priorité Haute (Core & Fixes)
- [ ] **Rétablir l'Authentification** : Une fois les tests terminés, réactiver `app/(auth)` et les vérifications de session dans `useAuth`.
- [ ] **Gestion des Erreurs UI** : Ajouter des Toasts (ex: `react-native-toast-message`) pour confirmer l'ajout d'un mot ou signaler une erreur réseau.
- [ ] **Algorithme SM-2 Complet** : Affiner l'algorithme dans `utils/sm2.ts` (actuellement simplifié) pour inclure le calcul exact du prochain intervalle basé sur la performance passée.
- [ ] **Persistence Locale (Cache)** : Utiliser `react-native-mmkv` avec React Query pour permettre la lecture des mots même sans connexion internet (Offline-first).

## ✨ Fonctionnalités (Features)
- [ ] **Synthèse Vocale (TTS)** : Ajouter un bouton sur la Flashcard pour écouter la prononciation du mot anglais.
- [x] **Import CSV/JSON** : Implémenté avec tutoriel et support des dossiers. (23/01/2026)
- [x] **Explorateur de Fichiers** : Système de dossiers hiérarchiques pour organiser le vocabulaire. (23/01/2026)
- [ ] **Système de Streaks Réel** : Implémenter la logique côté backend pour calculer les jours consécutifs de révision.
- [ ] **Types de Questions Variés** :
    - [ ] QCM (Choix multiples)
    - [ ] Saisie clavier (pour tester l'orthographe)
- [ ] **Notifications Push** : Rappels quotidiens pour réviser les mots dus.

## 🎨 UI / UX (Aesthetics)
- [ ] **Mode Sombre** : Support complet du dark mode via `utils/styles.ts`.
- [ ] **Animations de Transition** : Ajouter des transitions fluides entre les écrans via Shared Element Transitions ou Reanimated.
- [ ] **Feedback Haptique** : Ajouter des vibrations légères lors du flip de carte ou lors de la validation d'une révision.
- [x] **Dashboard Moderne** : Refonte de l'accueil avec stats visuelles et accès rapide. (23/01/2026)
- [ ] **Graphiques de Progression** : Intégrer des graphiques réels pour visualiser la progression.

## 🛠️ Technique & Maintenance
- [ ] **Génération de Types Supabase** : Automatiser la mise à jour de `types/database.types.ts` via la CLI Supabase.
- [ ] **Tests Unitaires** : Tester l'algorithme SM-2 avec Jest pour garantir que les intervalles calculés sont cohérents.
- [ ] **Optimisation FlashList** : S'assurer que les composants de la liste sont assez légers pour garantir du 60 FPS sur mobile.
- [ ] **Migration NativeWind** : Re-tenter l'intégration propre de NativeWind (v4/Aora) pour plus de flexibilité CSS si nécessaire pour une version standalone.

---
*Dernière mise à jour : 23/01/2026*
