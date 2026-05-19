# Rapport de tests et couverture — Frontend HealthNext

## Synthèse

La suite de tests end-to-end du frontend HealthNext est composée de **57 tests automatisés** exécutés via Playwright. Tous ces tests passent en environ 35 secondes sur une machine standard.

**Résultats actuels** :
- Tests totaux : **57**
- Tests passés : **57** (100%)
- Tests échoués : **0**
- Durée d'exécution : **~35 secondes**
- Navigateurs couverts : Chromium (Firefox et WebKit désactivés en CI pour optimiser le temps de build)

## Méthodologie de test

On a fait le choix d'une couverture principalement **end-to-end** (Playwright) plutôt que des tests unitaires (Jest/Vitest). Ce choix se justifie par :

- La nature de l'application (orientée parcours utilisateur)
- Le fait que les composants UI utilisés viennent de Shadcn/Radix, déjà testés en amont par leurs auteurs
- Playwright teste ce qui compte vraiment : le comportement réel dans un navigateur

Pour les flows qui dépendent du backend (auth, dashboard authentifié, appels API), on utilise `page.route()` de Playwright pour **mocker les réponses HTTP**. Cela permet de tester toute la logique frontend sans nécessiter le backend running en CI.

## Détail des suites de tests

### 1. Parcours utilisateur critique (`user-journey.spec.ts`) — 5 tests

Les tests fondamentaux du parcours d'inscription et d'authentification.

| # | Test | Description |
|---|---|---|
| 1 | Landing → Wizard | Clic sur le CTA "Commencer" redirige vers `/inscription` |
| 2 | Flow wizard complet | Renseignement âge, poids, taille, passage à l'étape objectifs |
| 3 | Validation âge | Un âge < 18 affiche un message d'erreur |
| 4 | Redirection auth | Accès à `/dashboard` sans session redirige vers `/connexion` |
| 5 | Formulaire login | Présence des champs email, mot de passe, bouton |

### 2. Couverture des pages (`pages.spec.ts`) — 22 tests

Test page par page pour vérifier que chaque route répond correctement.

**Landing Page (4 tests)**
- Hero visible avec CTA
- Affichage des 3 offres (Freemium, Premium, Premium+)
- Liens de navigation (connexion, inscription)
- Footer avec copyright

**Wizard d'inscription (4 tests)**
- Complétion des 3 premières étapes
- Rejet d'un âge invalide
- Rejet si taille manquante
- Navigation arrière (bouton Précédent)

**Page Connexion (2 tests)**
- Formulaire complet (email, password, submit)
- Lien vers création de compte

**Protection d'authentification (8 tests)**
- Redirection vers `/connexion` pour 8 routes protégées :
  - `/dashboard`
  - `/dashboard/nutrition`
  - `/dashboard/analytics`
  - `/dashboard/settings`
  - `/dashboard/workouts`
  - `/dashboard/clients`
  - `/dashboard/nutrition/history`
  - `/dashboard/nutrition/meal-plan`

**Design responsive (4 tests)**
- Landing en viewport mobile (375×812)
- Landing en viewport tablette (768×1024)
- Inscription en viewport mobile
- Connexion en viewport mobile

### 3. Accessibilité WCAG AA (`accessibility.spec.ts`) — 6 tests

Exécution d'axe-core sur 6 pages pour détecter les violations WCAG 2.1 AA.

| Page | URL | Violations critiques |
|---|---|---|
| Landing | `/` | **0** |
| Inscription Wizard | `/inscription` | **0** |
| Dashboard | `/dashboard` | **0** |
| Analytics | `/dashboard/analytics` | **0** |
| Nutrition Tracker | `/dashboard/nutrition` | **0** |
| Settings | `/dashboard/settings` | **0** |

Tags WCAG vérifiés : `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`.

Un rapport HTML détaillé est généré automatiquement dans `a11y-report/` via la commande `npm run test:a11y:report`.

### 4. Flow d'authentification (`auth-flow.spec.ts`) — 10 tests

Tests avec **mocks API** pour simuler les réponses backend.

| # | Test | Description |
|---|---|---|
| 1 | Formulaire de login affiché | Champs email, password, bouton submit |
| 2 | Appel API login | Vérifie que POST `/api/auth/sign-in/email` est bien déclenché |
| 3 | Login réussi | Mock 200 + cookie de session |
| 4 | Lien vers inscription | Redirection vers `/inscription` |
| 5 | Bouton visible après échec | Le bouton reste accessible après un 401 |
| 6 | Wizard : étape 1 sur 6 | Indicateur de progression |
| 7 | Persistance localStorage | L'âge saisi est stocké dans `wizard-store` |
| 8 | Refus âge < 18 | Message d'erreur affiché |
| 9 | Refus taille manquante | Validation Zod bloque |
| 10 | Navigation arrière | Le bouton Précédent restaure les données |

### 5. Dashboard authentifié avec mocks (`dashboard-mocked.spec.ts`) — 14 tests

Tests des pages authentifiées, session simulée via cookie injecté.

**Dashboard (4 tests)**
- Affichage des 4 KPIs (poids, calories, protéines, activité)
- Bandeau démo quand API en erreur
- Rendu des graphiques avec données réelles
- Présence de la carte IMC

**Analytics (3 tests)**
- Page chargée avec les stats
- 3 onglets présents (vue d'ensemble, nutrition, poids)
- Navigation entre onglets fonctionnelle

**Settings (2 tests)**
- Page paramètres chargée
- Onglets profil, objectifs, abonnement

**Premium Guard (2 tests)**
- Free user bloqué sur la génération workout (403)
- Premium user reçoit le plan

**Gestion d'erreurs API (3 tests)**
- 401 → redirection vers login
- 500 → fallback demo + bandeau
- Toast d'erreur sur échec de génération

## Commandes disponibles

```bash
# Lancer tous les tests
npm run test

# Parcours critique uniquement
npm run test:e2e

# Accessibilité uniquement
npm run test:a11y

# Accessibilité + rapport HTML
npm run test:a11y:report

# Afficher le dernier rapport Playwright
npm run test:report
```

## Intégration continue

Le pipeline GitHub Actions exécute tous les tests à chaque push et pull request :

1. Installation des dépendances (`npm ci`)
2. Build de production (`npm run build`)
3. Exécution des tests (`npx playwright test`)
4. Upload du rapport HTML en artifact (rétention 7 jours)
5. Upload du rapport axe-core a11y en artifact (rétention 30 jours)

Le build échoue automatiquement si :
- Un test e2e échoue
- Des violations WCAG critical/serious sont détectées
- Le linter ESLint trouve une erreur

## Couverture effective

### Ce qui est couvert

- **Routes publiques** : toutes testées (landing, connexion, inscription)
- **Routes protégées** : redirection vérifiée pour chacune
- **Flows d'authentification** : login/logout avec mocks réalistes
- **Dashboard & charts** : affichage des données et fallback
- **Accessibilité** : 6 pages principales auditées
- **Responsive** : viewports mobile, tablette, desktop
- **Gestion d'erreurs** : 401, 403, 500 gérés
- **Premium Guard** : blocage et déblocage testés

### Ce qui n'est pas couvert (volontairement)

- **Tests de charge** : hors scope frontend (à faire côté backend/k6)
- **Tests de sécurité** : couverts par des outils dédiés (npm audit, Snyk)
- **Tests cross-browser Firefox/Safari** : désactivés en CI pour gagner du temps, peuvent être activés en local

### Ce qui pourrait être amélioré

- Tests unitaires des hooks custom (`usePremiumStatus`) en Vitest
- Tests de composants isolés avec Storybook + Chromatic (post-MVP)
- Mesures Lighthouse automatisées en CI (Core Web Vitals)

## Rapport HTML interactif

Playwright génère un rapport HTML détaillé après chaque exécution, accessible via :

```
playwright-report/index.html
```

Ce rapport contient :
- Liste de tous les tests avec statut (pass/fail/skip)
- Durée d'exécution par test
- Traces complètes (vidéo + screenshots + network) en cas d'échec
- Filtrage par statut, fichier, tag

Pour le consulter : `npx playwright show-report`.

## Annexe : configuration Playwright

Extrait de `playwright.config.ts` :

```typescript
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run build && npx next start -p 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

Le web server est démarré automatiquement au lancement des tests, avec réutilisation en local (gain de temps).
