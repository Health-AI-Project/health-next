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

---

### 2. Corriger la méthode HTTP /api/user/profile (PUT → POST)
- **Branche :** `fix/user-profile-method`
- **Fichier :** `health-next/app/dashboard/settings/page.tsx:69`
- **Problème :** Le frontend envoie un PUT, le backend attend un POST. Le champ `age` n'est pas reconnu (le backend attend `date_of_birth`).
- **À faire :**
  - [ ] Changer la méthode de PUT à POST dans settings/page.tsx
  - [ ] Changer le champ `age` en `date_of_birth`
  - [ ] Ajouter les champs manquants `goals` et `allergies` dans le body

---

### 3. Créer ou mapper l'endpoint /api/user/goals
- **Branche :** `fix/user-goals-endpoint`
- **Fichier :** `health-next/app/dashboard/settings/page.tsx:87`
- **Problème :** Le frontend appelle `PUT /api/user/goals` avec `{ goals, allergies }`, mais cet endpoint n'existe pas.
- **Options :**
  - [ ] Option A : Rediriger vers `PUT /api/me/preferences` existant (adapter `goals` → `diet`)
  - [ ] Option B : Créer un nouvel endpoint `/api/user/goals` côté backend
- **Champs attendus backend :** `{ allergies, diet }` (pas `goals`)

---

### 4. Créer ou mapper l'endpoint /api/nutrition/meal-plan
- **Branche :** `fix/meal-plan-endpoint`
- **Fichier :** `health-next/app/dashboard/nutrition/meal-plan/page.tsx:121`
- **Problème :** Le frontend appelle `GET /api/nutrition/meal-plan`, mais le backend a `POST /api/generate-menu` et `GET /api/my-meals`.
- **À faire :**
  - [ ] Créer `GET /api/nutrition/meal-plan` côté backend qui appelle `GET /api/my-meals`
  - [ ] Ou modifier le frontend pour utiliser `GET /api/my-meals` + bouton `POST /api/generate-menu`
  - [ ] Adapter le format de réponse pour matcher le type `DayPlan[]`

---

### 5. Créer ou mapper l'endpoint /api/workouts/plan
- **Branche :** `fix/workouts-endpoint`
- **Fichier :** `health-next/app/dashboard/workouts/page.tsx:121`
- **Problème :** Le frontend appelle `GET /api/workouts/plan`, mais le backend a `POST /api/workout/generate` (avec params duration, equipment, injuries).
- **À faire :**
  - [ ] Créer `GET /api/workouts/plan` qui retourne le dernier plan généré
  - [ ] Ou modifier le frontend pour appeler `POST /api/workout/generate`
  - [ ] Adapter le format de réponse pour matcher `DayWorkout[]`

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

---

### 7. Ajouter is_premium et subscription_tier dans /api/home
- **Branche :** `fix/premium-status-response`
- **Fichiers :** `health-next/lib/hooks/use-premium-status.ts:31-35` / `backend-hono/src/routes/home.ts`
- **Problème :** Le frontend cherche `user.subscription_tier` et `user.is_premium`, mais le backend ne retourne pas ces champs. Tous les utilisateurs sont considérés "free".
- **À faire :**
  - [ ] Ajouter `is_premium` et `subscription_tier` dans la réponse user de `/api/home`
  - [ ] Récupérer ces infos depuis gRPC `GetUserProfile` (retourne `is_premium`) ou table users

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

---

### 11. Corriger l'exemption auth de /api/generate-menu
- **Branche :** `fix/generate-menu-auth`
- **Fichier :** `backend-hono/src/middlewares/auth.ts:7`
- **Problème :** `/api/generate-menu` est exempté de l'auth, mais le handler utilise `c.get('user')` qui sera `undefined` → crash potentiel.
- **À faire :**
  - [ ] Retirer `/api/generate-menu` de la liste des exemptions auth
  - [ ] Ou ajouter un fallback quand `user` est undefined
  - [ ] Tester la route avec et sans authentification

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

---

## FAIBLE

### 15. Nettoyer le code
- **Branche :** `chore/cleanup`
- **À faire :**
  - [ ] Supprimer console.log commentés (`signup-step.tsx:50,73`, `summary-step.tsx:54`)
  - [ ] Supprimer l'interface `MealAnalysis` inutilisée (`nutrition-actions.ts:12-17`)
  - [ ] Centraliser les données de démo dupliquées dans chaque page dashboard
