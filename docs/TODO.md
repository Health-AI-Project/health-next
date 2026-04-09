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
  - *Freemium :*
    - [ ] Depuis le dashboard Nutrition, uploader une photo de plat
    - [ ] Network : `POST /api/nutrition/upload` retourne 200 avec `class_name`, `calories`, `macros`
    - [ ] Logs backend : "LogNutrition" apparait sans erreur
  - *Premium / Premium+ :*
    - [ ] Memes tests que Freemium (la feature upload est accessible a tous)

---

### ~~2. Corriger la méthode HTTP /api/user/profile (PUT → POST)~~ DONE
- **Branche :** `fix/user-profile-method`
- **Fichier :** `health-next/app/dashboard/settings/page.tsx:69`
- **À faire :**
  - [x] Changer la méthode de PUT à POST dans settings/page.tsx
  - [x] Convertir `age` en `date_of_birth` (approximation année de naissance)
  - [x] Ajouter les champs manquants `goals` et `allergies` dans le body
- **Tests manuels :** ✅ Validés le 2026-04-09
  - *Freemium :*
    - [x] S'inscrire via /inscription avec age, poids, taille, objectifs, allergies
    - [x] Aller dans /dashboard/settings → les champs sont pre-remplis
    - [x] Modifier age/poids/taille, cliquer Sauvegarder → toast "Profil mis a jour"
    - [x] Network : requete POST vers `/api/user/profile`, body contient `date_of_birth`, `weight`, `height`, `goals`, `allergies`
    - [x] Rafraichir la page → les valeurs persistent
    - [x] Onglet Objectifs : cocher/decocher objectifs et allergies, Sauvegarder → persist apres refresh
    - [x] Allergies "Aucune" : coche decoche les autres, et inversement
    - [ ] Backend down : toast "Impossible de sauvegarder (backend non disponible)"
  - *Premium / Premium+ :*
    - [ ] Memes tests que Freemium (settings accessible a tous les tiers)

---

### ~~3. Créer ou mapper l'endpoint /api/user/goals~~ DONE
- **Branche :** `fix/user-profile-method` (fusionné avec tâche #2)
- **Fichier :** `health-next/app/dashboard/settings/page.tsx:87`
- **Solution :** Redirigé vers `POST /api/user/profile` qui accepte goals + allergies
  - [x] handleSaveGoals utilise maintenant POST /api/user/profile avec tous les champs requis
- **Tests manuels :** ✅ Validés le 2026-04-09
  - *Freemium :*
    - [x] Memes tests que tache #2, onglet Objectifs
  - *Premium / Premium+ :*
    - [ ] Memes tests que Freemium

---

### ~~4. Créer ou mapper l'endpoint /api/nutrition/meal-plan~~ DONE
- **Branche :** `fix/user-profile-method`
- **Fichier :** `health-next/app/dashboard/nutrition/meal-plan/page.tsx`
- **Problème :** Le frontend appelle `GET /api/nutrition/meal-plan`, mais le backend a `POST /api/generate-menu` et `GET /api/my-meals`.
- **Solution :** Modifier le frontend pour utiliser les endpoints existants
  - [x] Remplacer `GET /api/nutrition/meal-plan` par `GET /api/my-meals`
  - [x] Ajouter bouton "Generer un plan" qui appelle `POST /api/generate-menu`
  - [x] Mapper les recettes backend (`BackendRecipe[]`) vers `DayPlan[]`
  - [x] Bandeau "Donnees de demonstration" quand aucun plan n'existe
- **Tests manuels :**
  - *Freemium :*
    - [x] Aller sur /dashboard/nutrition/meal-plan → PremiumGuard bloque le contenu (blur + "Debloquer")
    - [x] Le contenu premium n'est PAS accessible via DevTools (tache #10)
  - *Premium :*
    - [ ] Aller sur /dashboard/nutrition/meal-plan → contenu visible sans blur
    - [ ] Network : `GET /api/my-meals` ne retourne pas 404
    - [ ] Bandeau demo visible si aucun plan genere
    - [ ] Cliquer "Generer un plan" → loader, puis plan affiche par jour avec macros
    - [ ] Rafraichir → le plan persiste (charge depuis /api/my-meals)
  - *Premium+ :*
    - [ ] Memes tests que Premium (acces complet)

---

### ~~5. Créer ou mapper l'endpoint /api/workouts/plan~~ DONE
- **Branche :** `fix/user-profile-method`
- **Fichier :** `health-next/app/dashboard/workouts/page.tsx`
- **Problème :** Le frontend appelle `GET /api/workouts/plan`, mais le backend a `POST /api/workout/generate` (avec params duration, equipment, injuries).
- **Solution :** Modifier le frontend pour utiliser `POST /api/workout/generate` directement
  - [x] Remplacer `GET /api/workouts/plan` par `POST /api/workout/generate`
  - [x] Mapper la reponse backend (`BackendWorkoutPlan`) vers `DayWorkout[]`
  - [x] Ajouter bouton "Generer un programme" + bandeau demo
- **Tests manuels :**
  - *Freemium :* ✅ Validé le 2026-04-09
    - [x] Aller sur /dashboard/workouts → PremiumGuard bloque le programme (blur + "Debloquer")
    - [x] Les stats (seances, calories, exercices) sont visibles au-dessus du guard
  - *Premium :*
    - [ ] Aller sur /dashboard/workouts → contenu visible sans blur
    - [ ] Network : `POST /api/workout/generate` ne retourne pas 404
    - [ ] Bandeau demo visible si gRPC down, sinon plan reel
    - [ ] Cliquer "Generer un programme" → loader, puis exercices affiches par jour
    - [ ] Verifier que les exercices, durees et calories sont affiches
  - *Premium+ :*
    - [ ] Memes tests que Premium

---

### ~~6. Créer l'endpoint /api/clients~~ DONE
- **Branche :** `fix/nutrition-upload-ia`
- **Fichiers :** `backend-hono/src/routes/clients.ts` (nouveau), `backend-hono/src/index.ts`
- **Problème :** L'endpoint n'existe pas du tout côté backend.
- **Solution :** Creer `GET /api/clients` avec donnees de demo (pas de table B2B en base)
  - [x] Creer la route `GET /api/clients` dans backend-hono
  - [x] Retourner le format `Client[]` attendu par le frontend
  - [ ] Implementer la vraie logique B2B quand la table clients existera
  - [ ] Proteger avec verification Premium Plus (tache #10)
- **Tests manuels :**
  - *Freemium :*
    - [x] Aller sur /dashboard/clients → page "Acces reserve" (guard frontend isPremiumPlus)
    - [x] Sans auth : `GET /api/clients` retourne 401
  - *Premium :*
    - [ ] Aller sur /dashboard/clients → page "Acces reserve" (requiert Premium+)
  - *Premium+ :*
    - [ ] Aller sur /dashboard/clients → stats + liste des clients visible
    - [ ] Network : `GET /api/clients` retourne 200 avec `{ data: Client[] }`
    - [ ] Les donnees clients s'affichent correctement

---

### ~~7. Ajouter is_premium et subscription_tier dans /api/home~~ DONE
- **Branche :** `fix/nutrition-upload-ia`
- **Fichiers :** `backend-hono/src/routes/home.ts`
- **Problème :** Le frontend cherche `user.subscription_tier` et `user.is_premium`, mais le backend ne retourne pas ces champs. Tous les utilisateurs sont considérés "free".
- **Solution :** Ajouter les champs depuis le gRPC `GetUserProfile` (qui retourne `is_premium` et `subscription_status`)
  - [x] Ajouter `is_premium` et `subscription_tier` dans la reponse user de `/api/home`
  - [x] Mapper `subscription_status` (PREMIUM/FREE) vers `subscription_tier` (premium/free/premium_plus)
- **Tests manuels :**
  - *Freemium :* ✅ Validé le 2026-04-09
    - [x] Network : `GET /api/home` → `data.user` contient `is_premium: false`, `subscription_tier: "free"`
    - [x] /dashboard/settings onglet Abonnement : badge "Freemium" affiche
    - [x] Sections "Pro" du menu lateral sont verrouillees (Entrainement Pro, Analytics Pro)
  - *Premium :*
    - [ ] Network : `GET /api/home` → `data.user` contient `is_premium: true`, `subscription_tier: "premium"`
    - [ ] /dashboard/settings onglet Abonnement : badge "Premium" affiche
    - [ ] Sections "Pro" du menu lateral sont deverrouillees (sauf clients)
  - *Premium+ :*
    - [ ] Network : `GET /api/home` → `data.user` contient `is_premium: true`, `subscription_tier: "premium_plus"`
    - [ ] /dashboard/settings onglet Abonnement : badge "Premium+" affiche
    - [ ] Toutes les sections du menu lateral sont deverrouillees

---

### ~~8. Corriger les noms de champs nutrition history~~ DONE
- **Branche :** `fix/user-profile-method`
- **Fichier :** `health-next/app/dashboard/nutrition/history/page.tsx`
- **Problème :** Mismatches entre frontend et backend :
  - `proteins` (frontend) vs `protein` (backend)
  - `fats` (frontend) vs `fat` (backend)
  - `items` n'existe pas côté backend (il y a `imageUrl`)
  - Macros imbriquées dans `macros` côté backend, à plat côté frontend
- **Solution :** Adapter le frontend avec un mapper `backendToMealHistory()`
  - [x] Mapper `macros.protein` → `proteins`, `macros.fat` → `fats`, etc.
  - [x] Gerer les deux formats de reponse (tableau direct ou `{ data: [] }`)
  - [x] Afficher "—" au lieu d'URLs dans la colonne Aliments
- **Tests manuels :**
  - *Freemium :* ✅ Validé le 2026-04-09
    - [x] Aller sur /dashboard/nutrition/history
    - [x] Les repas s'affichent avec calories, proteines, glucides, lipides corrects (pas 0 ou undefined)
    - [x] Les totaux (1100 kcal, 550 kcal/repas) sont coherents
    - [ ] Uploader 2-3 repas via /dashboard/nutrition (necessite ia-python)
    - [ ] L'image du plat s'affiche si disponible
  - *Premium / Premium+ :*
    - [ ] Memes tests que Freemium (l'historique est accessible a tous)

---

## HAUTE

### ~~9. Ajouter middleware auth Next.js pour protéger /dashboard~~ DONE
- **Branche :** `fix/user-profile-method`
- **Problème :** Aucune protection côté serveur sur `/dashboard/*`. Un utilisateur non connecté peut accéder à toutes les pages.
- **Solution :** Middleware Next.js qui verifie le cookie `better-auth.session_token`
  - [x] Creer `middleware.ts` a la racine de health-next
  - [x] Verifier le cookie de session pour toutes les routes `/dashboard/*`
  - [x] Rediriger vers `/connexion` si non authentifie
- **Tests manuels :**
  - *Non connecte :* ✅ Validé le 2026-04-09
    - [x] Aller sur /dashboard → redirige vers /connexion
    - [x] Aller sur /dashboard/settings → idem
    - [x] Aller sur /dashboard/nutrition → idem
  - *Freemium :* ✅ Validé le 2026-04-09
    - [x] Aller sur /dashboard → affiche le dashboard normalement
    - [x] Se deconnecter puis naviguer vers /dashboard → redirection vers /connexion
  - *Premium / Premium+ :*
    - [ ] Memes tests que Freemium

---

### ~~10. Implémenter un vrai guard premium côté backend~~ DONE
- **Branche :** `fix/nutrition-upload-ia` + `fix/user-profile-method`
- **Fichiers :** `backend-hono/src/middlewares/premium.ts` (nouveau), `backend-hono/src/index.ts`, `health-next/lib/api.ts`
- **Problème :** Le PremiumGuard actuel est purement CSS (blur + overlay). Le contenu est visible via DevTools.
- **Solution :** Middleware `premiumGuard()` cote backend + error.status dans apiFetch
  - [x] Creer middleware `premiumGuard('premium' | 'premium_plus')` qui verifie via gRPC
  - [x] Appliquer aux endpoints : `/api/workout/*`, `/api/generate-menu`, `/api/nutrition/analyze` (Premium), `/api/clients` (Premium+)
  - [x] Retourner 403 avec `required_tier` si non autorise
  - [x] Frontend `apiFetch` expose `error.status` et `error.required_tier`
- **Tests manuels :**
  - *Freemium :*
    - [ ] Appeler un endpoint premium (ex: /api/workouts/plan) → 403
    - [ ] Le frontend affiche le dialog d'upgrade
    - [ ] Inspecter le HTML avec DevTools : aucune donnee premium dans le DOM
  - *Premium :*
    - [ ] Meme endpoint → 200 avec donnees visibles
    - [ ] Endpoints Premium+ (ex: /api/clients) → 403
  - *Premium+ :*
    - [ ] Tous les endpoints retournent 200

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
  - *Non connecte :*
    - [ ] `POST /api/generate-menu` → 401 (pas 500 ou crash)
    - [ ] Logs backend : pas d'exception "Cannot read property of undefined"
  - *Freemium :*
    - [ ] `POST /api/generate-menu` → 200 ou reponse metier normale (si autorise)
  - *Premium / Premium+ :*
    - [ ] `POST /api/generate-menu` → 200 avec plan genere

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
  - *Non connecte :*
    - [ ] Acces a une page protegee → redirection vers /connexion (pas ecran blanc)
  - *Freemium :*
    - [ ] Endpoint premium → dialog upgrade (pas erreur silencieuse)
    - [ ] Rate limit (429) → toast "Trop de requetes, reessayez"
    - [ ] Backend down → bandeau "Mode demo" visible, pas d'ecran blanc
    - [ ] Erreur nutrition upload → toast explicite avec le message d'erreur
  - *Premium / Premium+ :*
    - [ ] Memes tests de resilience (429, backend down)

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
  - *Tous tiers :*
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
  - *Non connecte (inscription) :*
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
  - *Tous tiers :*
    - [ ] `grep -r "console.log" components/wizard/` : aucun console.log commente restant
    - [ ] `grep -r "MealAnalysis" lib/` : l'interface n'existe plus
    - [ ] Les donnees de demo sont dans un seul fichier partage (ex: `lib/demo-data.ts`)
