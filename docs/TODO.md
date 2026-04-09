# TODO - Health Next Frontend

> Audit complet frontend-backend-IA réalisé le 2026-04-09

---

## CRITIQUE

### ~~1. Connecter /api/nutrition/upload au service IA-Python~~ DONE
- **Branche :** `fix/nutrition-upload-ia`
- **Fichier :** `backend-hono/src/routes/nutrition.ts`
- **À faire :**
  - [x] Appeler `POST ia-python:8000/predict/upload` avec le fichier image reçu en multipart
  - [x] Parser la réponse IA (prediction_id, class_name, calories estimées)
  - [x] Retourner les vraies macros au frontend
  - [x] Logger la prédiction via gRPC `CoreService.LogNutrition()`
- **Note :** En attente du modèle IA finalisé par le collègue pour test complet
- **Tests manuels :**
  - [ ] Lancer ia-python (`uvicorn api:app --port 8000`) + backend-hono
  - [ ] Depuis le dashboard Nutrition, uploader une photo de plat
  - [ ] Vérifier dans Network : `POST /api/nutrition/upload` retourne 200 avec `class_name`, `calories`, `macros`
  - [ ] Vérifier dans les logs backend : "LogNutrition" apparait sans erreur

---

### ~~2. Corriger la méthode HTTP /api/user/profile (PUT → POST)~~ DONE
- **Branche :** `fix/user-profile-method`
- **Fichier :** `health-next/app/dashboard/settings/page.tsx:69`
- **À faire :**
  - [x] Changer la méthode de PUT à POST dans settings/page.tsx
  - [x] Convertir `age` en `date_of_birth` (approximation année de naissance)
  - [x] Ajouter les champs manquants `goals` et `allergies` dans le body
- **Tests manuels :**
  - [ ] S'inscrire via /inscription avec age, poids, taille, objectifs, allergies
  - [ ] Aller dans /dashboard/settings → les champs sont pre-remplis
  - [ ] Modifier age/poids/taille, cliquer Sauvegarder → toast "Profil mis a jour"
  - [ ] Network : requete POST vers `/api/user/profile`, body contient `date_of_birth`, `weight`, `height`, `goals`, `allergies`
  - [ ] Rafraichir la page → les valeurs persistent
  - [ ] Onglet Objectifs : cocher/decocher objectifs et allergies, Sauvegarder → persist apres refresh
  - [ ] Allergies "Aucune" : coche decoche les autres, et inversement
  - [ ] Backend down : toast "Impossible de sauvegarder (backend non disponible)"

---

### ~~3. Créer ou mapper l'endpoint /api/user/goals~~ DONE
- **Branche :** `fix/user-profile-method` (fusionné avec tâche #2)
- **Fichier :** `health-next/app/dashboard/settings/page.tsx:87`
- **Solution :** Redirigé vers `POST /api/user/profile` qui accepte goals + allergies
  - [x] handleSaveGoals utilise maintenant POST /api/user/profile avec tous les champs requis
- **Tests manuels :**
  - [ ] Memes tests que tache #2, onglet Objectifs

---

### 4. Créer ou mapper l'endpoint /api/nutrition/meal-plan
- **Branche :** `fix/meal-plan-endpoint`
- **Fichier :** `health-next/app/dashboard/nutrition/meal-plan/page.tsx:121`
- **Problème :** Le frontend appelle `GET /api/nutrition/meal-plan`, mais le backend a `POST /api/generate-menu` et `GET /api/my-meals`.
- **À faire :**
  - [ ] Créer `GET /api/nutrition/meal-plan` côté backend qui appelle `GET /api/my-meals`
  - [ ] Ou modifier le frontend pour utiliser `GET /api/my-meals` + bouton `POST /api/generate-menu`
  - [ ] Adapter le format de réponse pour matcher le type `DayPlan[]`
- **Tests manuels :**
  - [ ] Aller sur /dashboard/nutrition/meal-plan
  - [ ] Network : la requete ne retourne pas 404
  - [ ] Un plan de repas s'affiche (ou un bouton pour en generer un)
  - [ ] Apres generation, les repas s'affichent par jour avec les macros
  - [ ] Rafraichir → le plan persiste

---

### 5. Créer ou mapper l'endpoint /api/workouts/plan
- **Branche :** `fix/workouts-endpoint`
- **Fichier :** `health-next/app/dashboard/workouts/page.tsx:121`
- **Problème :** Le frontend appelle `GET /api/workouts/plan`, mais le backend a `POST /api/workout/generate` (avec params duration, equipment, injuries).
- **À faire :**
  - [ ] Créer `GET /api/workouts/plan` qui retourne le dernier plan généré
  - [ ] Ou modifier le frontend pour appeler `POST /api/workout/generate`
  - [ ] Adapter le format de réponse pour matcher `DayWorkout[]`
- **Tests manuels :**
  - [ ] Aller sur /dashboard/workouts (necessite Premium)
  - [ ] Network : la requete ne retourne pas 404
  - [ ] Un plan d'entrainement s'affiche ou un formulaire pour en generer
  - [ ] Verifier que les exercices, durees et calories sont affiches

---

### 6. Créer l'endpoint /api/clients
- **Branche :** `fix/clients-endpoint`
- **Fichier :** `health-next/app/dashboard/clients/page.tsx:52`
- **Problème :** L'endpoint n'existe pas du tout côté backend.
- **À faire :**
  - [ ] Créer la route `GET /api/clients` dans backend-hono
  - [ ] Implémenter la logique B2B (liste des clients d'un professionnel)
  - [ ] Protéger avec vérification Premium Plus
  - [ ] Retourner le format `Client[]` attendu par le frontend
- **Tests manuels :**
  - [ ] Avec un compte Premium Plus : /dashboard/clients affiche la liste des clients
  - [ ] Network : `GET /api/clients` retourne 200 avec un tableau `Client[]`
  - [ ] Avec un compte Free : la page affiche le guard premium (pas d'acces)
  - [ ] Sans auth : retourne 401

---

### 7. Ajouter is_premium et subscription_tier dans /api/home
- **Branche :** `fix/premium-status-response`
- **Fichiers :** `health-next/lib/hooks/use-premium-status.ts:31-35` / `backend-hono/src/routes/home.ts`
- **Problème :** Le frontend cherche `user.subscription_tier` et `user.is_premium`, mais le backend ne retourne pas ces champs. Tous les utilisateurs sont considérés "free".
- **À faire :**
  - [ ] Ajouter `is_premium` et `subscription_tier` dans la réponse user de `/api/home`
  - [ ] Récupérer ces infos depuis gRPC `GetUserProfile` (retourne `is_premium`) ou table users
- **Tests manuels :**
  - [ ] Network : `GET /api/home` → la reponse `data.user` contient `is_premium` et `subscription_tier`
  - [ ] Avec un compte Free : `is_premium: false`, `subscription_tier: "free"`
  - [ ] Avec un compte Premium : `is_premium: true`, `subscription_tier: "premium"`
  - [ ] Dans /dashboard/settings onglet Abonnement : le badge affiche le bon tier
  - [ ] Les sections "Pro" du menu lateral sont verrouillees/deverrouillees selon le tier

---

### 8. Corriger les noms de champs nutrition history
- **Branche :** `fix/nutrition-history-fields`
- **Fichier :** `health-next/app/dashboard/nutrition/history/page.tsx`
- **Problème :** Mismatches entre frontend et backend :
  - `proteins` (frontend) vs `protein` (backend)
  - `fats` (frontend) vs `fat` (backend)
  - `items` n'existe pas côté backend (il y a `imageUrl`)
  - Macros imbriquées dans `macros` côté backend, à plat côté frontend
- **À faire :**
  - [ ] Adapter le frontend pour parser la structure `macros` du backend
  - [ ] Ou adapter le backend pour aplatir les macros dans la réponse
- **Tests manuels :**
  - [ ] Uploader 2-3 repas via /dashboard/nutrition
  - [ ] Aller sur /dashboard/nutrition/history
  - [ ] Les repas s'affichent avec calories, proteines, glucides, lipides corrects (pas 0 ou undefined)
  - [ ] L'image du plat s'affiche si disponible
  - [ ] Les totaux journaliers sont coherents

---

## HAUTE

### 9. Ajouter middleware auth Next.js pour protéger /dashboard
- **Branche :** `feat/auth-middleware`
- **Problème :** Aucune protection côté serveur sur `/dashboard/*`. Un utilisateur non connecté peut accéder à toutes les pages.
- **À faire :**
  - [ ] Créer `middleware.ts` à la racine de health-next
  - [ ] Vérifier la session/cookie pour toutes les routes `/dashboard/*`
  - [ ] Rediriger vers `/` ou `/inscription` si non authentifié
  - [ ] Utiliser `better-auth` pour la vérification de session côté serveur
- **Tests manuels :**
  - [ ] Sans etre connecte, aller sur /dashboard → redirige vers / ou /inscription
  - [ ] Sans etre connecte, aller sur /dashboard/settings → idem
  - [ ] Connecte, aller sur /dashboard → affiche le dashboard normalement
  - [ ] Se deconnecter puis naviguer vers /dashboard → redirection

---

### 10. Implémenter un vrai guard premium côté backend
- **Branche :** `feat/backend-premium-guard`
- **Fichier :** `health-next/components/premium/premium-guard.tsx`
- **Problème :** Le PremiumGuard actuel est purement CSS (blur + overlay). Le contenu est visible via DevTools.
- **À faire :**
  - [ ] Ajouter un middleware backend qui vérifie le tier de l'utilisateur
  - [ ] Les endpoints premium doivent retourner 403 si non premium
  - [ ] Le frontend doit gérer le 403 et afficher l'upgrade dialog
  - [ ] Ne pas envoyer les données premium dans la réponse si non autorisé
- **Tests manuels :**
  - [ ] Avec compte Free : appeler un endpoint premium (ex: /api/workouts/plan) → 403
  - [ ] Le frontend affiche le dialog d'upgrade, pas de donnees visibles dans DevTools
  - [ ] Avec compte Premium : meme endpoint → 200 avec donnees
  - [ ] Inspecter le HTML avec DevTools (compte Free) : aucune donnee premium dans le DOM

---

### 11. Corriger l'exemption auth de /api/generate-menu
- **Branche :** `fix/generate-menu-auth`
- **Fichier :** `backend-hono/src/middlewares/auth.ts:7`
- **Problème :** `/api/generate-menu` est exempté de l'auth, mais le handler utilise `c.get('user')` qui sera `undefined` → crash potentiel.
- **À faire :**
  - [ ] Retirer `/api/generate-menu` de la liste des exemptions auth
  - [ ] Ou ajouter un fallback quand `user` est undefined
  - [ ] Tester la route avec et sans authentification
- **Tests manuels :**
  - [ ] Sans auth : `POST /api/generate-menu` → 401 (pas 500 ou crash)
  - [ ] Avec auth : `POST /api/generate-menu` → 200 ou reponse metier normale
  - [ ] Verifier les logs backend : pas d'exception "Cannot read property of undefined"

---

### 12. Améliorer la gestion d'erreurs API dans le frontend
- **Branche :** `feat/error-handling`
- **Fichiers :** `lib/api.ts`, `use-premium-status.ts`, `nutrition-actions.ts`, pages dashboard
- **Problèmes :**
  - Pas de distinction 401/403/429/500 dans `api.ts`
  - Erreur silencieuse → tier "free" dans `use-premium-status.ts`
  - Aucun try/catch dans `nutrition-actions.ts`
  - Données de démo affichées sans prévenir l'utilisateur
- **À faire :**
  - [ ] Gérer 401 (rediriger vers login), 403 (upgrade dialog), 429 (retry avec backoff)
  - [ ] Ajouter des toasts d'erreur explicites
  - [ ] Ajouter un indicateur visuel "Mode démo" quand les données de démo sont affichées
  - [ ] Ajouter try/catch dans nutrition-actions.ts
- **Tests manuels :**
  - [ ] Session expiree → redirection automatique vers /connexion (pas ecran blanc)
  - [ ] Endpoint premium sans etre premium → dialog upgrade (pas erreur silencieuse)
  - [ ] Rate limit (429) → toast "Trop de requetes, reessayez" avec retry
  - [ ] Backend completement down → bandeau "Mode demo" visible, pas d'ecran blanc
  - [ ] Erreur dans nutrition upload → toast explicite avec le message d'erreur

---

### 13. Sécuriser les secrets du .env.local backend
- **Branche :** `fix/secure-env-secrets`
- **Fichier :** `backend-hono/.env.local`
- **Problème :** Secrets en clair (BETTER_AUTH_SECRET, REDIS_PASSWORD, SPOONACULAR_API_KEY, MONGO_URI avec credentials).
- **À faire :**
  - [ ] Vérifier que `.env.local` est dans le `.gitignore`
  - [ ] Créer un `.env.example` sans les valeurs sensibles
  - [ ] Changer `BETTER_AUTH_SECRET` pour une vraie clé sécurisée
  - [ ] Rotation des clés si elles ont été poussées sur git
- **Tests manuels :**
  - [ ] `git status` : `.env.local` n'apparait PAS dans les fichiers trackes
  - [ ] `.env.example` existe avec les cles mais sans les valeurs (ex: `REDIS_PASSWORD=`)
  - [ ] `BETTER_AUTH_SECRET` n'est pas "a_very_secret_key_change_me_in_production"
  - [ ] `git log --all -p -- .env.local` : le fichier n'a jamais ete commite

---

## MOYENNE

### 14. Persister l'état du wizard dans localStorage
- **Branche :** `feat/wizard-persistence`
- **Fichier :** `health-next/lib/stores/wizard-store.ts`
- **Problème :** L'état Zustand est en mémoire uniquement. Un refresh perd toute la progression.
- **À faire :**
  - [ ] Ajouter le middleware `persist` de Zustand avec localStorage
  - [ ] Configurer les champs à persister
  - [ ] Ajouter un mécanisme de nettoyage après inscription réussie
- **Tests manuels :**
  - [ ] Aller sur /inscription, remplir age et poids
  - [ ] Rafraichir la page (F5) → l'etape et les donnees sont conservees
  - [ ] Terminer l'inscription → localStorage est nettoye
  - [ ] DevTools > Application > localStorage : pas de donnees wizard residuelles apres inscription

---

## FAIBLE

### 15. Nettoyer le code
- **Branche :** `chore/cleanup`
- **À faire :**
  - [ ] Supprimer console.log commentés (`signup-step.tsx:50,73`, `summary-step.tsx:54`)
  - [ ] Supprimer l'interface `MealAnalysis` inutilisée (`nutrition-actions.ts:12-17`)
  - [ ] Centraliser les données de démo dupliquées dans chaque page dashboard
- **Tests manuels :**
  - [ ] `grep -r "console.log" components/wizard/` : aucun console.log commente restant
  - [ ] `grep -r "MealAnalysis" lib/` : l'interface n'existe plus
  - [ ] Les donnees de demo sont dans un seul fichier partage (ex: `lib/demo-data.ts`)
