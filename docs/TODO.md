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
  - *Premium / Premium+ :* ✅ Validé le 2026-04-09
    - [x] Memes tests que Freemium (settings accessible a tous les tiers)

---

### ~~3. Créer ou mapper l'endpoint /api/user/goals~~ DONE
- **Branche :** `fix/user-profile-method` (fusionné avec tâche #2)
- **Fichier :** `health-next/app/dashboard/settings/page.tsx:87`
- **Solution :** Redirigé vers `POST /api/user/profile` qui accepte goals + allergies
  - [x] handleSaveGoals utilise maintenant POST /api/user/profile avec tous les champs requis
- **Tests manuels :** ✅ Validés le 2026-04-09
  - *Freemium :*
    - [x] Memes tests que tache #2, onglet Objectifs
  - *Premium / Premium+ :* ✅ Validé le 2026-04-09
    - [x] Memes tests que Freemium

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
  - *Premium :* ✅ Validé le 2026-04-09
    - [x] Aller sur /dashboard/nutrition/meal-plan → contenu visible sans blur
    - [x] Network : `GET /api/my-meals` ne retourne pas 404
    - [x] Bandeau demo visible si aucun plan genere
    - [ ] Cliquer "Generer un plan" → loader, puis plan affiche par jour avec macros — ⚠ Spoonacular API echoue (cle invalide ou quota depasse)
    - [ ] Rafraichir → le plan persiste (charge depuis /api/my-meals) — ⚠ Depend de la generation
  - *Premium+ :*
    - [x] Memes tests que Premium (acces complet)

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
  - *Premium :* ✅ Validé le 2026-04-09
    - [x] Aller sur /dashboard/workouts → contenu visible sans blur
    - [x] Network : `POST /api/workout/generate` ne retourne pas 404
    - [x] Bandeau demo visible si gRPC down, sinon plan reel
    - [ ] Cliquer "Generer un programme" → loader, puis exercices affiches par jour — ⚠ gRPC GenerateWorkout non implemente cote engine-go
    - [ ] Verifier que les exercices, durees et calories sont affiches — ⚠ Depend de gRPC
  - *Premium+ :*
    - [x] Memes tests que Premium

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
  - *Premium :* ✅ Validé le 2026-04-09
    - [x] Aller sur /dashboard/clients → page "Acces reserve" (requiert Premium+)
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
  - *Premium :* ✅ Validé le 2026-04-09
    - [x] Network : `GET /api/home` → `data.user` contient `is_premium: true`, `subscription_tier: "premium"`
    - [x] /dashboard/settings onglet Abonnement : badge "Premium" affiche
    - [x] Sections "Pro" du menu lateral sont deverrouillees (sauf clients)
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
  - *Premium / Premium+ :* ✅ Validé le 2026-04-09
    - [x] Memes tests que Freemium (l'historique est accessible a tous)

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
  - *Premium / Premium+ :* ✅ Validé le 2026-04-09
    - [x] Memes tests que Freemium (dashboard fonctionne normalement)

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
  - *Freemium :* ✅ Validé le 2026-04-09
    - [x] Appeler un endpoint premium (POST /api/workout/generate) → 403
    - [x] Le frontend affiche le toast d'erreur "Impossible de generer le programme"
    - [x] Le PremiumGuard CSS bloque le contenu (blur + "Debloquer")
  - *Premium :* ✅ Validé le 2026-04-09
    - [x] Meme endpoint → 200 avec donnees visibles
    - [x] Endpoints Premium+ (ex: /api/clients) → 403
  - *Premium+ :*
    - [x] Tous les endpoints retournent 200

---

### ~~11. Corriger l'exemption auth de /api/generate-menu~~ DONE
- **Branche :** `fix/nutrition-upload-ia`
- **Fichier :** `backend-hono/src/middlewares/auth.ts:7`
- **Problème :** `/api/generate-menu` est exempté de l'auth, mais le handler utilise `c.get('user')` qui sera `undefined` → crash potentiel.
- **Solution :** Retirer l'exemption (la route est aussi protegee par premiumGuard depuis tache #10)
  - [x] Retirer `/api/generate-menu` de la liste des exemptions auth
- **Tests manuels :**
  - *Non connecte :* ✅ Validé le 2026-04-09
    - [x] `POST /api/generate-menu` → 401 (pas 500 ou crash)
    - [x] Logs backend : pas d'exception "Cannot read property of undefined"
  - *Freemium :* ✅ Validé le 2026-04-09
    - [x] `POST /api/generate-menu` → 403 (premium requis, bloque par premiumGuard)
  - *Premium / Premium+ :* ✅ Validé le 2026-04-09
    - [x] `POST /api/generate-menu` → accessible (200, pas 403) — ⚠ Spoonacular echoue mais l'endpoint est bien autorise

---

### ~~12. Améliorer la gestion d'erreurs API dans le frontend~~ DONE
- **Branche :** `fix/user-profile-method`
- **Fichiers :** `lib/api.ts`, `nutrition-actions.ts`, `app/dashboard/page.tsx`, `app/dashboard/analytics/page.tsx`
- **Problèmes :**
  - Pas de distinction 401/403/429/500 dans `api.ts`
  - Aucun try/catch dans `nutrition-actions.ts`
  - Données de démo affichées sans prévenir l'utilisateur
- **Solution :**
  - [x] Creer classe `ApiError` avec `status` et `required_tier` dans `api.ts`
  - [x] Redirection auto vers `/connexion` sur 401
  - [x] Try/catch dans `nutrition-actions.ts` avec messages explicites
  - [x] Bandeau "Mode demonstration" sur dashboard, analytics, meal-plan, workouts
  - [x] Supprimer l'interface `MealAnalysis` inutilisee dans `nutrition-actions.ts`
- **Note :** Les graphiques Analytics utilisent des donnees hardcodees (pas d'API historique disponible)
- **Tests manuels :**
  - *Non connecte :* ✅ Validé le 2026-04-09
    - [x] Acces a une page protegee → redirection vers /connexion (pas ecran blanc)
  - *Freemium :* ✅ Validé le 2026-04-09
    - [x] Endpoint premium → toast d'erreur (pas erreur silencieuse)
    - [x] Dashboard : pas de bandeau demo (donnees reelles chargees)
    - [x] Page Analytics : bandeau indiquant que les graphiques sont des donnees de demo
    - [x] Page Workouts : bandeau demo + toast erreur sur "Generer un programme"
    - [x] Page Meal Plan : bandeau demo + toast erreur sur "Generer un plan"
    - [ ] Backend down → bandeau "Mode demo" visible, pas d'ecran blanc
    - [ ] Erreur nutrition upload → toast explicite avec le message d'erreur
  - *Premium / Premium+ :* ✅ Validé le 2026-04-09
    - [x] Memes tests de resilience (backend down)

---

### ~~13. Sécuriser les secrets du .env.local backend~~ DONE
- **Branche :** `fix/nutrition-upload-ia`
- **Fichier :** `backend-hono/.env.local`, `backend-hono/.env.example` (nouveau)
- **Problème :** Secrets en clair (BETTER_AUTH_SECRET, REDIS_PASSWORD, SPOONACULAR_API_KEY, MONGO_URI avec credentials).
- **Solution :**
  - [x] `.env.local` est dans le `.gitignore`
  - [x] Creer `.env.example` sans les valeurs sensibles
  - [x] Changer `BETTER_AUTH_SECRET` pour une vraie cle securisee (64 chars hex)
  - [ ] Rotation des cles (REDIS_PASSWORD, DB_PASSWORD, MONGO_URI, SPOONACULAR_API_KEY) — a faire cote serveur
- **⚠ ATTENTION :** `.env.local` a ete commite dans le commit `2f504d8`. Les secrets sont dans l'historique git. Il faudrait idealement purger l'historique ou considerer ces cles comme compromises et les tourner.
- **Tests manuels :**
  - *Tous tiers :* ✅ Validé le 2026-04-09
    - [x] `git status` : `.env.local` n'apparait PAS dans les fichiers trackes
    - [x] `.env.example` existe avec les cles mais sans les valeurs
    - [x] `BETTER_AUTH_SECRET` n'est plus "a_very_secret_key_change_me_in_production"
    - [ ] `git log --all -p -- .env.local` : ⚠ le fichier a ete commite dans le passe (commit 2f504d8)

---

## MOYENNE

### ~~14. Persister l'état du wizard dans localStorage~~ DONE
- **Branche :** `fix/user-profile-method`
- **Fichiers :** `health-next/lib/stores/wizard-store.ts`, `health-next/components/wizard/steps/signup-step.tsx`
- **Problème :** L'état Zustand est en mémoire uniquement. Un refresh perd toute la progression.
- **Solution :**
  - [x] Ajouter le middleware `persist` de Zustand avec localStorage (cle: `wizard-store`)
  - [x] Persister `currentStep` et `data` (age, poids, taille, objectifs, allergies)
  - [x] Appeler `resetWizard()` apres inscription reussie pour nettoyer le localStorage
- **Tests manuels :**
  - *Non connecte (inscription) :*
    - [ ] Aller sur /inscription, remplir age et poids
    - [ ] Rafraichir la page (F5) → l'etape et les donnees sont conservees
    - [ ] Terminer l'inscription → localStorage est nettoye
    - [ ] DevTools > Application > localStorage : pas de donnees wizard residuelles apres inscription

---

## FAIBLE

### ~~15. Nettoyer le code~~ DONE (partiel)
- **Branche :** `fix/user-profile-method`
- **Solution :**
  - [x] Supprimer console.log commente (`summary-step.tsx:54`)
  - [x] Supprimer l'interface `MealAnalysis` inutilisee (`nutrition-actions.ts:12-17`) — fait dans tache #12
  - [ ] Centraliser les donnees de demo dans un fichier partage — reporte (6 fichiers avec des interfaces differentes, refactoring risque)
- **Tests manuels :**
  - *Tous tiers :* ✅ Partiellement validé le 2026-04-09
    - [x] `grep -r "console.log" components/wizard/` : aucun console.log commente restant
    - [x] `grep -r "MealAnalysis" lib/` : l'interface n'existe plus
    - [ ] Les donnees de demo sont encore dans chaque page (centralisation reportee)

---

### ~~16. Connecter les graphiques Analytics/Dashboard a de vraies donnees~~ DONE
- **Fichiers :** `health-next/components/charts/weight-evolution-chart.tsx`, `calories-chart.tsx`, `macros-chart.tsx`
- **Problème :** Les graphiques "Evolution du poids" et "Calories journalieres" affichent des donnees hardcodees. Les KPI du haut sont reels, mais pas les graphiques.
- **Solution :**
  - **engine-go :**
    - [x] Creer un endpoint gRPC `GetWeightHistory(user_id, days)` — retourne le poids actuel (pas de table historique de poids)
    - [x] Creer un endpoint gRPC `GetCaloriesHistory(user_id, days)` — agrege les `daily_log` par jour
    - [x] Ajouter `GetDailyLogHistory` au repository et service Activity
    - [x] Corriger les handler wrappers `LogNutrition`, `LogWorkout` et `UpdateBiometrics` (etaient des stubs nil)
  - **backend-hono :**
    - [x] Creer `GET /api/stats/weight-history` qui appelle le gRPC et retourne `[{ date, poids, objectif }]`
    - [x] Creer `GET /api/stats/calories-history` qui appelle le gRPC et retourne `[{ jour, calories, objectif }]`
    - [x] Creer `GET /api/stats/macros` qui retourne la repartition en pourcentages
  - **health-next :**
    - [x] `weight-evolution-chart.tsx` : fetch depuis `/api/stats/weight-history` avec fallback demo
    - [x] `calories-chart.tsx` : fetch depuis `/api/stats/calories-history` avec fallback demo
    - [x] `macros-chart.tsx` : fetch depuis `/api/stats/macros` avec fallback demo
    - [x] Retirer le bandeau demo statique de la page Analytics
- **Note :** La table `daily_log` n'a pas encore de table d'historique de poids, donc seul le poids actuel est retourne. Les charts montrent des donnees demo en fallback si aucune donnee reelle n'est disponible.
- **Tests manuels :**
  - *Freemium :*
    - [x] /dashboard : le graphique "Evolution du poids" fetch depuis l'API (fallback demo si pas de donnees)
    - [x] /dashboard : le graphique "Calories journalieres" fetch depuis l'API (fallback demo si pas de donnees)
    - [x] Si aucune donnee historique : donnees de demonstration affichees avec indication
  - *Premium / Premium+ :*
    - [x] /dashboard/analytics : memes graphiques avec donnees reelles
    - [x] Le graphique Macros (PremiumGuard) fetch depuis /api/stats/macros
