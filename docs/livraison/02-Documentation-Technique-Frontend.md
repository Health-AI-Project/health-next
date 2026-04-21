# Documentation technique — Frontend HealthNext

## 1. Vue d'ensemble

**HealthNext** est l'interface web de la plateforme **HealthAI Coach**. C'est une application Next.js 16 (React 19) qui expose aux utilisateurs finaux et aux clients B2B les fonctionnalités IA de nutrition et d'activité physique.

### 1.1 Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Langage | TypeScript | 5.x |
| Design System | Shadcn UI + Radix UI | dernière |
| Styling | Tailwind CSS | 4.x |
| Graphiques | Recharts | 3.7 |
| Formulaires | React Hook Form + Zod | 7.71 / 4.3 |
| State | Zustand + persist middleware | 5.0 |
| Auth | Better Auth | 1.4 |
| Animations | Framer Motion | 12.31 |
| Tests e2e | Playwright | 1.58 |
| Accessibilité | @axe-core/playwright | 4.11 |
| Upload | react-dropzone | 14.4 |
| Icônes | Lucide React | 0.563 |

### 1.2 Architecture en couches

```
┌──────────────────────────────────────────────────────────┐
│  Pages (app/)                                            │
│  - Server Components (SEO, initial data)                 │
│  - Client Components (interactivité)                     │
├──────────────────────────────────────────────────────────┤
│  Components (components/)                                │
│  - UI (Shadcn)                                           │
│  - Charts (Recharts)                                     │
│  - Dashboard (layout, sidebar)                           │
│  - Nutrition, Wizard, Premium                            │
├──────────────────────────────────────────────────────────┤
│  Lib (lib/)                                              │
│  - api.ts (fetch + cache + gestion erreurs)              │
│  - actions/ (Server Actions)                             │
│  - stores/ (Zustand)                                     │
│  - hooks/ (use-premium-status)                           │
│  - auth-client.ts                                        │
├──────────────────────────────────────────────────────────┤
│  Middleware (middleware.ts)                              │
│  - Protection auth sur /dashboard/*                      │
└──────────────────────────────────────────────────────────┘
                         ↓
              ┌──────────────────────┐
              │  Backend Hono :3002  │
              │  API Gateway         │
              └──────────────────────┘
                         ↓
      ┌────────────────────────────────────┐
      │   gRPC (engine-go :50051)          │
      │   IA-Python FastAPI (:8000)        │
      │   Microservices (nutrition, meal)  │
      └────────────────────────────────────┘
```

---

## 2. Structure du projet

```
health-next/
├── app/                          # App Router Next.js
│   ├── page.tsx                  # Landing page (3 offres)
│   ├── connexion/page.tsx        # Login
│   ├── inscription/page.tsx      # Wizard multi-étapes
│   ├── dashboard/
│   │   ├── layout.tsx            # Layout commun (sidebar)
│   │   ├── page.tsx              # Dashboard (KPIs + graphiques)
│   │   ├── analytics/page.tsx    # Analytics avancées (tabs)
│   │   ├── nutrition/
│   │   │   ├── page.tsx          # Upload + résultats IA
│   │   │   ├── history/page.tsx  # Historique repas
│   │   │   └── meal-plan/page.tsx # Plans de repas (Premium)
│   │   ├── workouts/page.tsx     # Programmes sport (Premium)
│   │   ├── clients/page.tsx      # B2B (Premium+)
│   │   └── settings/page.tsx     # Profil, objectifs, abonnement
│   └── layout.tsx                # Root layout (Toaster, thème)
├── components/
│   ├── ui/                       # Shadcn UI (Button, Card, Dialog, ...)
│   ├── charts/                   # Recharts (Weight, Calories, Macros)
│   ├── dashboard/                # Layout, Sidebar, BmiCard
│   ├── nutrition/                # Tracker, Uploader, ResultTable, Suggestions
│   ├── wizard/                   # Multi-step inscription
│   ├── premium/                  # PremiumGuard, UpgradeDialog
│   └── providers/                # DynamicThemeProvider
├── lib/
│   ├── api.ts                    # Client API + cache + ApiError
│   ├── actions/                  # Server Actions (nutrition)
│   ├── stores/                   # Zustand (wizard, theme)
│   ├── hooks/                    # use-premium-status
│   └── auth-client.ts            # Better Auth
├── e2e/
│   ├── user-journey.spec.ts      # 5 tests parcours critique
│   ├── pages.spec.ts             # 22 tests de couverture
│   └── accessibility.spec.ts     # 6 tests WCAG AA
├── docs/                         # Documentation
├── middleware.ts                 # Auth middleware
├── next.config.ts
├── tailwind.config.ts
└── playwright.config.ts
```

---

## 3. Fonctionnalités principales

### 3.1 Landing Page (`/`)

- Page publique présentant les 3 offres (Freemium 0€, Premium 9,99€, Premium+ 19,99€)
- Grille responsive 3 colonnes → 1 colonne sur mobile
- CTAs vers `/inscription` et `/connexion`
- SEO optimisé (metadata, sémantique HTML)

### 3.2 Inscription (`/inscription`)

**Wizard multi-étapes (6 étapes)** :
1. Âge (validation : 18-100 ans)
2. Poids + Taille (30-300 kg / 100-250 cm)
3. Objectifs (checkboxes multi-sélection)
4. Allergies (checkboxes + option "Aucune")
5. Récapitulatif
6. Création de compte (email + mot de passe)

**Caractéristiques :**
- État persistant dans `localStorage` via Zustand `persist` middleware
- Un refresh (F5) ne perd pas la progression
- Nettoyage automatique après inscription réussie
- Validation Zod à chaque étape
- Navigation Précédent/Suivant avec sauvegarde

### 3.3 Dashboard (`/dashboard`)

**4 KPI cards** (données réelles via `/api/home`) :
- Poids actuel
- Calories du jour
- Protéines
- Nombre de séances

**Graphiques** (données réelles via `/api/stats/*`) :
- Évolution du poids (LineChart, 30 jours)
- Calories journalières (BarChart, 7 jours)
- Carte BMI (calcul client-side : `poids / (taille/100)²`)

**Fallback** : Si l'API est indisponible, bandeau "Mode démonstration" + données fictives (expérience dégradée, pas d'écran blanc).

### 3.4 Analytics (`/dashboard/analytics`)

**3 onglets** :
- Vue d'ensemble (poids + calories + macros)
- Nutrition (calories + macros)
- Poids (évolution)

**Macros Chart** (PieChart) protégé par `PremiumGuard` pour les utilisateurs Freemium.

### 3.5 Nutrition

**Upload (`/dashboard/nutrition`)** :
- Drag & drop via `react-dropzone` (image/*, max 10MB)
- Envoi au backend qui forwarde à **ia-python** (`POST /predict/upload`)
- Réponse : classe détectée + calories + macros estimées
- Affichage tabulaire éditable (correction utilisateur possible)
- Suggestions contextualisées (déficit / équilibre / excès)

**Historique (`/dashboard/nutrition/history`)** :
- Liste des repas loggés
- Filtre par période (aujourd'hui, semaine, mois)
- Tri ascendant/descendant par date
- 3 cards : total repas, calories cumulées, moyenne/repas

**Meal Plan (`/dashboard/nutrition/meal-plan`)** — **Premium** :
- Bouton "Générer un plan" → `POST /api/generate-menu`
- Plan sur 5 jours (petit-déj, déjeuner, dîner, collation)
- Contraintes prises en compte : allergies, régime, budget
- Cards détaillées par repas (macros, ingrédients)

### 3.6 Workouts (`/dashboard/workouts`) — Premium

- Bouton "Générer un programme" → `POST /api/workout/generate`
- Distribution sur 5 jours (Lun → Ven)
- Chaque jour : liste d'exercices avec séries, répétitions, repos
- Paramètres : durée, équipement, blessures

### 3.7 Clients B2B (`/dashboard/clients`) — Premium+

- Tableau de bord B2B (marque blanche)
- Liste des clients abonnés
- Stats : total, actifs 7j, taux Premium, calories moyennes
- Données anonymisées (confidentialité)

### 3.8 Settings (`/dashboard/settings`)

**3 onglets** :
- Profil (email, âge, poids, taille)
- Objectifs & Allergies
- Abonnement (badge tier, CTA upgrade)

Sauvegarde via `POST /api/user/profile` avec toast de confirmation.

---

## 4. Principes d'ergonomie appliqués

### 4.1 Navigation

- **Sidebar fixe desktop** avec icônes Lucide + labels
- **Sidebar collapsible tablette/mobile** (menu hamburger)
- **Breadcrumb implicite** via le titre de page (`h1`)
- **Retour arrière natif** du navigateur préservé (pas de SPA cassée)
- **Liens actifs** mis en évidence (couleur primaire + fond)

### 4.2 Feedback utilisateur

- **Toasts** (Sonner) pour confirmations et erreurs
- **Skeletons** pendant les chargements (pas de spinner bloquant)
- **Bandeaux "Mode démonstration"** transparents quand données mockées
- **Messages d'erreur** explicites (pas de code HTTP brut)
- **Validation en temps réel** dans les formulaires

### 4.3 Hiérarchie visuelle

- **Titre h1** unique par page (SEO + a11y)
- **Cards** pour regrouper l'information (Card/CardHeader/CardContent/CardFooter)
- **Couleurs sémantiques** (primary = vert, destructive = rouge, muted = gris)
- **Tailles typographiques** cohérentes (via `text-sm`, `text-xl`, `text-4xl`)

### 4.4 Cognitive load

- **6 liens maximum** dans la sidebar
- **Wizard découpé** en 6 étapes courtes plutôt qu'un formulaire long
- **Messages d'aide** sous chaque champ (`description`)
- **Premium Guard** avec blur + CTA clair (pas de murs opaques)

### 4.5 Responsive

| Breakpoint | Comportement |
|---|---|
| `< 640px` (mobile) | Sidebar cachée, grille 1 colonne, navigation bottom/top |
| `640-1024px` (tablet) | Grille 2 colonnes, sidebar collapsible |
| `> 1024px` (desktop) | Sidebar fixe 264px, grille 3-4 colonnes |

Testé sur viewports 375×812 (iPhone SE), 768×1024 (iPad), 1920×1080 (desktop).

---

## 5. Gestion des APIs

### 5.1 Client API centralisé (`lib/api.ts`)

```typescript
// Requêtes classiques
apiFetch<T>(endpoint, options)

// Requêtes avec cache TTL (30s par défaut)
cachedFetch<T>(endpoint, options, ttl)

// Invalidation
invalidateCache(endpoint)
```

### 5.2 Cache intelligent

- Cache en mémoire (Map)
- TTL 30 secondes par défaut
- Appliqué aux endpoints stables : `/api/home`, `/api/stats/*`
- Les mutations (POST/PUT/PATCH) bypassent le cache automatiquement
- Clé = URL complète (inclut les query params)

### 5.3 Gestion d'erreurs

**Classe `ApiError`** :
- `status` (HTTP code)
- `required_tier` (pour 403 premium)
- `message` (humain)

**Comportements** :
- **401** → redirect automatique vers `/connexion`
- **403** → toast "Premium requis" + overlay UpgradeDialog
- **429** → toast "Trop de requêtes, réessayez"
- **5xx** → fallback demo + bandeau + logged en console

### 5.4 Fallbacks (continuité de service)

Chaque page principale a des **DEMO_DATA** utilisées en cas d'erreur API :
- Pas d'écran blanc
- Bandeau jaune "Mode démonstration" transparent
- L'utilisateur comprend que les données ne sont pas réelles

---

## 6. Accessibilité (WCAG 2.1 AA / RGAA)

### 6.1 Mesures appliquées

| Critère | Implémentation |
|---|---|
| Structure sémantique | `<header>`, `<main>`, `<nav>`, `<section>` partout |
| Hiérarchie `h1→h6` | Un seul h1 par page, jamais de saut de niveau |
| Labels | Tous les inputs ont un `<label>` associé (`htmlFor`) |
| `aria-label` | Icônes sans texte ont un `aria-label` |
| `aria-hidden` | Icônes purement décoratives |
| `aria-describedby` | Messages d'aide liés aux inputs |
| `aria-live` | Messages d'erreur annoncés (`polite`) |
| Navigation clavier | Tab/Shift+Tab, Escape (dialogs), Enter/Space |
| Focus visible | Ring via Radix UI `focus-visible` |
| Contraste | Palette Tailwind respectant ratio 4.5:1 (texte normal) |
| Skip link | Présent sur les pages dashboard |
| ARIA widgets | Tabs, Dialog, Checkbox, Select via Radix UI (conformes WAI-ARIA) |

### 6.2 Tests automatisés

- `@axe-core/playwright` exécuté sur **6 pages** :
  - `/`, `/inscription`, `/dashboard`, `/dashboard/analytics`, `/dashboard/nutrition`, `/dashboard/settings`
- **0 violation critique/serious** sur toutes les pages
- Tags testés : `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
- Rapport HTML généré : `npm run test:a11y:report`

### 6.3 CI / CD

- GitHub Actions exécute les tests axe-core sur chaque PR
- Le build échoue si des violations critiques sont détectées
- Rapport uploadé en artifact (30 jours de rétention)

---

## 7. Sécurité

### 7.1 Authentification

- **Better Auth** avec sessions cookies HttpOnly (pas accessible via JS)
- Middleware Next.js vérifie le cookie sur `/dashboard/*`
- Redirection automatique vers `/connexion` si pas de session

### 7.2 Protection des routes

- **Côté serveur** : middleware.ts (Edge) → bloque avant le rendu
- **Côté backend** : middleware Hono + `premiumGuard('premium' | 'premium_plus')` → retourne 403
- **Côté frontend** : `PremiumGuard` composant → masque visuellement (mais NE protège pas seul)

### 7.3 XSS / CSRF

- React échappe le contenu par défaut (pas de `dangerouslySetInnerHTML` sauf cas justifié)
- Cookies en `SameSite=Lax`
- CORS restrictif côté backend (`localhost:3000`, `localhost:3001`, `https://next.medev-tech.fr`)

---

## 8. Performance

### 8.1 Optimisations appliquées

- **Server Components par défaut** (JS bundle minimal)
- **Client Components ciblés** (`"use client"` uniquement quand nécessaire)
- **Turbopack** (build 10-30× plus rapide que Webpack en dev)
- **Code splitting automatique** par route
- **Images** : Next/Image avec lazy loading
- **Cache API** (TTL 30s) évite les refetchs inutiles
- **Recharts `ResponsiveContainer`** évite les recalculs au resize

### 8.2 Métriques (build production)

- Build sans erreur, toutes les pages pre-rendered (`○ Static`)
- Middleware déployé en Edge (`ƒ Proxy`)
- Lighthouse ciblé : **Performance 90+, Accessibility 100, SEO 95+**

---

## 9. Tests

### 9.1 Couverture (33 tests Playwright)

| Suite | Tests | Description |
|---|---|---|
| Landing Page | 4 | Hero, pricing, navigation, footer |
| Inscription Wizard | 4 | Flow complet, validations, navigation |
| Connexion | 2 | Formulaire, lien inscription |
| Auth Protection | 8 | Redirection pour 8 routes `/dashboard/*` |
| Responsive | 4 | Mobile + tablette (375, 768px) |
| User Journey | 5 | Landing → Wizard, redirections |
| Accessibilité WCAG AA | 6 | axe-core sur 6 pages |
| **Total** | **33** | **100% passent ✅** |

### 9.2 Scripts disponibles

```bash
npm run test            # Tous les tests
npm run test:e2e        # User journey uniquement
npm run test:a11y       # Accessibilité uniquement
npm run test:a11y:report # + rapport HTML
npm run test:report     # Ouvre le rapport Playwright
```

### 9.3 CI GitHub Actions

- Tests e2e sur chaque push
- Tests d'accessibilité sur chaque push
- Rapport HTML uploadé comme artifact (30 jours)
- Échec du build si violations a11y critiques

---

## 10. Déploiement

### 10.1 Environnements

| Environnement | URL | Branche |
|---|---|---|
| Development | `localhost:3000` | feature/* |
| Preview | (Vercel auto) | PR |
| Production | `next.medev-tech.fr` | `main` |

### 10.2 Variables d'environnement

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002  # ou prod URL
```

### 10.3 Commandes

```bash
npm install        # Installer les dépendances
npm run dev        # Dev local (Turbopack)
npm run build      # Build production
npm run start      # Démarrer en prod
npm run lint       # Linter ESLint
npm run test       # Tests Playwright
```

---

## 11. Évolutions futures

- Intégration objets connectés (Premium+) via Web Bluetooth API
- Consultations en ligne (WebRTC)
- Notifications push (PWA + Service Worker)
- Internationalisation (i18n) — FR/EN
- Mode hors-ligne (Service Worker + IndexedDB)
- Thème dynamique B2B (tokens CSS variables déjà en place)

---

## 12. Références

- Next.js : https://nextjs.org/docs
- Shadcn UI : https://ui.shadcn.com
- Radix UI : https://www.radix-ui.com
- WCAG 2.1 : https://www.w3.org/TR/WCAG21/
- RGAA 4 : https://accessibilite.numerique.gouv.fr/
- axe-core : https://www.deque.com/axe/
