# Documentation technique du frontend

## De quoi on parle

HealthNext c'est l'interface web de HealthAI Coach. Une app Next.js 16 qui tourne chez nous en local sur le port 3000, en préprod/prod derrière `next.medev-tech.fr`. Elle expose toutes les fonctionnalités côté utilisateur : inscription, dashboard avec ses stats, upload de photos de repas analysées par l'IA, plans de repas, programmes sport, panel B2B pour les clients marque blanche, etc.

Le front communique avec un seul backend (Hono sur le port 3002) qui sert de gateway. C'est ce backend qui orchestre ensuite les appels gRPC vers le moteur Go, les appels HTTP vers l'API Python de classification d'images, et les différents microservices (nutrition, meal plan, activity). Côté front on s'en fiche complètement, on voit qu'une seule URL.

## Stack complète

| Couche | Techno | Version |
|---|---|---|
| Framework | Next.js App Router | 16.1.6 |
| UI | React | 19.2.3 |
| Langage | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Composants | Shadcn UI + Radix UI | latest |
| Graphiques | Recharts | 3.7 |
| Formulaires | React Hook Form | 7.71 |
| Validation | Zod | 4.3 |
| State global | Zustand (+ persist) | 5.0 |
| Auth | Better Auth | 1.4 |
| Animations | Framer Motion | 12.31 |
| Icônes | Lucide React | 0.563 |
| Upload | react-dropzone | 14.4 |
| Tests e2e | Playwright | 1.58 |
| Tests a11y | @axe-core/playwright | 4.11 |

Toutes les dépendances sont dans `package.json`. Rien d'exotique, tout est sur npm.

## Architecture

L'archi suit les conventions de Next.js App Router. Rapidement :

```
┌───────────────────────────────────────────────┐
│  app/   (les routes, une par dossier)         │
│   ├── page.tsx           → landing publique   │
│   ├── connexion/         → login              │
│   ├── inscription/       → wizard 6 étapes    │
│   └── dashboard/                              │
│       ├── layout.tsx     → sidebar + shell    │
│       ├── page.tsx       → dashboard accueil  │
│       ├── nutrition/                          │
│       ├── workouts/                           │
│       ├── analytics/                          │
│       ├── clients/                            │
│       └── settings/                           │
├───────────────────────────────────────────────┤
│  components/                                  │
│   ├── ui/       → Shadcn (button, card, ...)  │
│   ├── charts/   → Recharts                    │
│   ├── nutrition/                              │
│   ├── wizard/                                 │
│   ├── premium/  → PremiumGuard, UpgradeDialog │
│   └── providers/                              │
├───────────────────────────────────────────────┤
│  lib/                                         │
│   ├── api.ts              → fetch + cache     │
│   ├── actions/            → Server Actions    │
│   ├── stores/             → Zustand           │
│   ├── hooks/              → use-premium, ...  │
│   └── auth-client.ts                          │
├───────────────────────────────────────────────┤
│  middleware.ts  → auth guard sur /dashboard   │
└───────────────────────────────────────────────┘
                       │
                       ▼
              Backend Hono (:3002)
```

Le middleware est vraiment minimal (une vingtaine de lignes). Il check juste la présence du cookie `better-auth.session_token`. Il valide pas la session auprès du backend, c'est volontaire : tout endpoint appelé derrière revalide de toute façon, donc inutile de rajouter une requête réseau au middleware et de ralentir le premier render.

## Les pages

Je vais pas détailler chaque composant mais voici en gros ce que fait chaque page.

### Landing `/`

Page publique, sans session. Trois cards pour les trois offres (Freemium 0€, Premium 9,99€, Premium+ 19,99€), un hero avec CTA, un footer. Indexable (Server Component, rendu côté serveur). On a fait attention aux metadata pour le SEO, tout en sémantique HTML correcte (`<header>`, `<main>`, `<section aria-labelledby>`, etc).

### Inscription `/inscription`

Wizard en 6 étapes : âge → poids/taille → objectifs → allergies → récap → création compte. L'état est stocké dans Zustand avec le middleware `persist`, donc si l'utilisateur ferme l'onglet et revient plus tard, il retrouve sa progression. Une fois l'inscription réussie, on appelle `resetWizard()` pour nettoyer le localStorage.

Chaque étape a sa propre validation Zod. Les messages d'erreur sont annoncés aux lecteurs d'écran via `aria-live="polite"`.

### Connexion `/connexion`

Formulaire simple email + password. Utilise `authClient.signIn.email()` de Better Auth. Gestion des 401 et 422 avec des toasts explicites. Un lien vers `/inscription` en bas.

### Dashboard `/dashboard`

Le coeur de l'app. 4 KPI cards en haut (poids, calories du jour, protéines, séances), une carte IMC calculée côté client à partir de poids+taille, puis deux graphiques (évolution du poids et calories de la semaine).

Les données des KPI viennent de `/api/home` (une agrégation BFF). Les graphiques font leurs propres requêtes vers `/api/stats/weight-history` et `/api/stats/calories-history` pour pouvoir être réutilisés à plusieurs endroits (dashboard + analytics) sans refetcher à chaque fois.

Si l'API retourne une erreur, on a un fallback avec des données de démo et un bandeau jaune qui prévient "Mode démonstration". L'utilisateur voit pas un écran blanc, il voit quelque chose d'exploitable mais il est prévenu que c'est pas ses vraies stats.

### Nutrition `/dashboard/nutrition`

C'est là qu'est le flow principal d'interaction avec l'IA. L'utilisateur drag-and-drop une photo de plat (via react-dropzone), elle est envoyée au backend qui la forwarde à l'API Python. La réponse arrive avec la classe détectée (parmi 101 classes de plats), la confiance, et une estimation calorique. On affiche ça dans une table éditable (l'utilisateur peut corriger manuellement les macros s'il juge l'estimation fausse), plus un composant `MealSuggestions` qui donne des conseils selon les objectifs de l'utilisateur.

Le sous-menu contient aussi :
- `/dashboard/nutrition/history` : liste des repas passés avec filtres (aujourd'hui, 7 jours, 30 jours, tout), tri par date
- `/dashboard/nutrition/meal-plan` : génération de plan hebdo par l'IA (Premium)

### Analytics `/dashboard/analytics`

Trois onglets (Tabs de Radix) : Vue d'ensemble, Nutrition, Poids. Les graphiques Macros sont derrière un `PremiumGuard` pour les utilisateurs Freemium.

### Workouts `/dashboard/workouts`

Génération de programmes sportifs via l'endpoint `/api/workout/generate`. Les exercices réels viennent de la base Postgres côté backend Go. On a seedé 15 exercices de base (pompes, squats, burpees, dips, etc). Le moteur Go choisit selon l'équipement dispo, les blessures, et le niveau.

Côté front, on distribue les exercices sur 5 jours (Lun → Ven) avec des onglets par jour.

### Clients `/dashboard/clients`

Réservé aux comptes Premium+. Affiche un tableau de bord anonymisé des clients d'un partenaire B2B (salle de sport, mutuelle). Pour l'instant c'est des données de démo parce qu'on n'a pas encore de table clients en base. Le `premiumGuard('premium_plus')` côté backend retourne un 403 aux non-Premium+, et côté front le message "Accès réservé" s'affiche.

### Settings `/dashboard/settings`

Trois onglets : Profil (email, âge, poids, taille), Objectifs & allergies, Abonnement (badge tier, CTA upgrade). Les modifs sont envoyées via `POST /api/user/profile` (qui appelle le gRPC `UpdateHealthProfile` côté Go).

## Comment on cause au backend

### Le client API

Tout passe par `lib/api.ts`. Deux fonctions principales :

```typescript
apiFetch<T>(endpoint, options)      // requête standard
cachedFetch<T>(endpoint, options)   // avec cache mémoire (TTL 30s)
```

Il y a aussi une classe `ApiError` avec les champs `status` et `required_tier` pour distinguer les cas d'erreur. On a des comportements automatiques :
- 401 : redirect vers `/connexion` (window.location)
- 403 avec `required_tier` : toast + ouverture de `UpgradeDialog`
- 429 : toast "trop de requêtes"
- 5xx : fallback sur données demo, bandeau jaune

### Le cache

Ajouté relativement tard dans le projet. Avant, chaque page qui montait son composant déclenchait un refetch de `/api/home`. Maintenant, le premier appel met en cache pendant 30 secondes (Map en mémoire). Les GET avec la même URL tapent dans le cache. Les mutations POST/PUT/PATCH bypassent évidemment.

C'est volontairement basique. Si on avait voulu faire les choses bien on aurait pris TanStack Query (ex-React Query). On n'en avait pas besoin pour un MVP.

### Fallback demo

Le principe c'est de jamais laisser l'utilisateur sur un écran blanc. Chaque page principale a sa constante `DEMO_DATA` en haut du fichier. Le pattern est toujours le même :

```tsx
try {
    const res = await cachedFetch('/api/home');
    setData(res.data);
} catch {
    setData(DEMO_DATA);
    setIsDemo(true);
}
```

Quand `isDemo === true`, on affiche un bandeau jaune en haut pour prévenir l'utilisateur. C'est pas parfait (on voudrait des vraies données) mais c'est mieux qu'une page cassée.

## Tests

On a 57 tests Playwright qui passent tous. Détail dans le fichier `04-Accessibilite-WCAG-RGAA.md` pour les tests d'a11y et dans le CI.

Rapide récap :
- `user-journey.spec.ts` : 5 tests, parcours principal
- `pages.spec.ts` : 22 tests, couverture de toutes les routes
- `accessibility.spec.ts` : 6 tests (axe-core sur 6 pages)
- `auth-flow.spec.ts` : 10 tests, login/signup avec mocks
- `dashboard-mocked.spec.ts` : 14 tests, dashboard authentifié avec mocks

Les tests qui ont besoin d'une session utilisent `page.route()` pour mocker les réponses API. On évite comme ça la dépendance à un backend running pendant les tests CI.

## Déploiement

En local : `npm install && npm run dev`. Par défaut ça tape sur `http://localhost:3002` pour l'API (variable `NEXT_PUBLIC_API_URL`).

En prod on a un Vercel branché sur le repo GitHub. Le main se déploie automatiquement. Les PR ont leur preview URL.

Variables d'env prod :
```
NEXT_PUBLIC_API_URL=https://hono.medev-tech.fr
```

## Trucs à savoir

- On utilise toujours `<Image>` de Next pour les images (lazy loading + optimisation)
- Server Components par défaut. `"use client"` uniquement quand on a besoin de state ou d'événements
- Pas de CSS modules, tout en Tailwind
- Les composants Shadcn sont copiés dans le repo, donc modifiables librement
- `npm run lint` doit être clean avant de push
- `npm test` avant de push si on touche aux flows critiques

## Améliorations prévues après MVP

- Internationalisation (i18n) FR/EN via `next-intl`
- PWA + service worker pour le mode offline
- Notifications push (pour les rappels quotidiens)
- Storybook des composants UI
- TanStack Query à la place de notre cache maison si on grossit
- Migration vers Server Actions pour les mutations (au lieu de fetch)
