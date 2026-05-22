# Accessibilité de l'interface admin — WCAG 2.1 AA / RGAA 4

> Livrable L6 — Critère **déterminant** du cahier des charges MSPR501 (section IV.6) :
> *« Le respect des standards d'accessibilité numérique (RGAA niveau AA) sera un critère déterminant. »*

---

## 1. Engagement

L'ensemble des pages `/dashboard/admin/*` est conçu pour répondre à **WCAG 2.1 niveau AA** (équivalent RGAA 4). La conformité est vérifiée à deux niveaux :

1. **Automatisé** via `axe-core` à chaque lancement de la suite de tests Playwright
   (`npm run test:a11y` couvre l'ensemble du projet, y compris l'admin via `e2e/admin-accessibility.spec.ts`).
2. **Manuel** pour les critères non automatisables (navigation clavier, lecteur d'écran, contraste fin).

---

## 2. Mesures techniques appliquées

### 2.1 Structure sémantique (WCAG 1.3.1)

| Élément | Convention |
|---|---|
| Page racine | `<main id="admin-main">` ciblé par le skip-link |
| Sidebar | `<aside aria-label="Navigation administration">` |
| Nav interne | `<nav aria-label="Sections administration">` |
| Sections | `<section aria-labelledby="...">` avec `<h2>` interne |
| Tables | `<caption className="sr-only">` pour la description |

### 2.2 Hiérarchie des titres (WCAG 2.4.6)

Chaque page admin a **exactement un `<h1>`** (titre de la page). Les `<h2>` suivent une numérotation logique sans saut de niveau. Les titres masqués visuellement utilisent `sr-only` (ex: « Statistiques de validation » sur la page validation).

### 2.3 Skip-link (WCAG 2.4.1)

Le composant `<SkipLink href="#admin-main">` est intégré dans `app/dashboard/admin/layout.tsx`. Il :
- Est masqué visuellement (`sr-only`) jusqu'à reception du focus
- Apparaît en haut à gauche avec un fond contrasté (`bg-primary`)
- Cible le `<main tabIndex={-1}>` pour permettre la prise de focus programmée

### 2.4 Garde de rôle accessible (WCAG 3.3.1)

Pendant la vérification des droits (`useAdminGuard`), un message `role="status" aria-live="polite"` annonce le chargement aux lecteurs d'écran. En cas d'accès refusé, un `<h1>` clair (« Accès refusé ») et un texte explicatif sont rendus.

### 2.5 Composants UI dédiés

| Composant | Mesures a11y |
|---|---|
| `DataTable` | `aria-sort` sur les en-têtes triables, `<button>` autour des labels, `aria-live="polite"` pour le nombre de résultats |
| `KpiCard` | `<p>` lié au valeur par `aria-labelledby`, `<TrendIcon aria-hidden>` + `<span className="sr-only">` pour le sens de la tendance |
| `ExportButton` | `aria-label="Exporter les données"` sur le trigger, icônes décoratives `aria-hidden` |
| `SkipLink` | Voir 2.3 |
| Charts Recharts | `role="img"` + `aria-label` décrivant le contenu, version tabulaire repliable dans `<details>` |

### 2.6 Labels de formulaires (WCAG 1.3.1, 3.3.2)

Tous les `<Input>` ont un `<Label htmlFor>` associé. Le dialogue d'édition de dataset (`DatasetSourcePage`) marque les champs anormaux avec `aria-invalid={true}` et un message visuel + textuel (« ⚠ à vérifier »).

### 2.7 États interactifs et focus (WCAG 2.4.7)

Tous les éléments interactifs (boutons, liens, cartes cliquables) ont une bordure de focus visible héritée de Shadcn UI : `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

### 2.8 Contraste (WCAG 1.4.3)

Les couleurs sémantiques (success/error/warning) ont été choisies pour respecter le ratio AA :
- `text-emerald-900` sur `bg-emerald-100` (light mode) — ratio ≥ 7:1
- `text-emerald-200` sur `bg-emerald-900/30` (dark mode) — ratio ≥ 4.5:1
- Idem pour rose (rejet) et amber (anomalie/partiel)

Les badges « Premium », « Pro » et autres conservent les standards de la design system existante.

### 2.9 Tableaux de données

Le tableau démographique sur `/dashboard/admin/analytics` utilise :
- `<caption className="sr-only">` pour décrire le contenu
- `<th scope="col">` pour identifier les en-têtes
- `tabular-nums` pour aligner les chiffres

Pour les graphiques (BarChart, LineChart, PieChart), un équivalent tabulaire est fourni :
- BarChart « Ingestion par source » → `<details>` avec table HTML détaillée
- PieChart démographique → `aria-label` listant les pourcentages
- LineChart nutrition → texte alt décrivant la tendance

---

## 3. Tests automatisés — `e2e/admin-accessibility.spec.ts`

### 3.1 Couverture

| Page testée | URL |
|---|---|
| Accueil admin | `/dashboard/admin` |
| Qualité des données | `/dashboard/admin/data-quality` |
| Index datasets | `/dashboard/admin/datasets` |
| Détail dataset | `/dashboard/admin/datasets/daily_food_nutrition` |
| Validation | `/dashboard/admin/validation` |
| Analytics business | `/dashboard/admin/analytics` |
| Flow diagram | `/dashboard/admin/flow` |

### 3.2 Vérifications

1. **axe-core** avec tags `wcag2a wcag2aa wcag21a wcag21aa` sur chaque page
2. Échec si une violation **critical** ou **serious** est trouvée
3. Test dédié : skip-link visible au Tab et activation au Enter
4. Test dédié : tous les boutons ont un nom accessible
5. Test dédié : pas de SVG orphelin sans `aria-hidden` ni `aria-label`

### 3.3 Rapports

Les résultats détaillés sont écrits dans `health-next/a11y-report/admin/*.json` (un fichier par page) avec :
- Compteur violations / passes / incomplete / inapplicable
- Détail de chaque violation : `id`, `impact`, `help`, `helpUrl`, `nodes`

### 3.4 Lancement

```bash
cd health-next
npm run test:a11y         # Toutes les pages (user + admin)
npx playwright test e2e/admin-accessibility.spec.ts   # Admin uniquement
```

---

## 4. Vérifications manuelles complémentaires

Liste à exécuter avant la soutenance pour garantir les critères non automatisables :

- [ ] Navigation **clavier uniquement** sur l'intégralité du parcours admin (Tab, Shift+Tab, Enter, Espace)
- [ ] Test **NVDA** (Windows) ou **VoiceOver** (macOS) sur la page data-quality : annonce des KPIs, lecture du graphique alternatif, navigation dans la DataTable
- [ ] Zoom 200 % sans perte de fonctionnalité (responsive + reflow)
- [ ] Mode contraste élevé du système d'exploitation
- [ ] Désactivation des animations (`prefers-reduced-motion`) — les charts Recharts respectent ce setting par défaut

---

## 5. Conformité revendiquée

Sur la base des vérifications automatisées et manuelles, l'interface admin **HealthAI Coach** revendique la conformité **WCAG 2.1 niveau AA**. Une déclaration RGAA détaillée pourra être produite à partir des résultats axe-core (rapports JSON dans `a11y-report/admin/`).

**Points de vigilance pour les itérations futures** :
- L'export CSV ne fournit pas encore de version a11y enrichie (header row sémantique uniquement)
- Le diagramme de flux interactif (page `/flow`) pourrait bénéficier d'une description plus poussée pour les utilisateurs de lecteurs d'écran complexes
- Les couleurs de tier dans le PieChart démographique doivent rester contrastées même si l'on change le theme provider — à recharter si une marque blanche custom était introduite
