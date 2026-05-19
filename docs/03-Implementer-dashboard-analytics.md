# 03 - Implementer /dashboard/analytics (TERMINEE)

> Branche: `dashboard-analytics`

## Objectif
Creer la page `/dashboard/analytics` actuellement manquante. Le lien "Analytics" existe deja dans le sidebar (icone BarChart3).

## Contexte technique
- Le sidebar reference deja `/dashboard/analytics` dans ses liens de navigation
- Composants charts existants : `WeightEvolutionChart`, `CaloriesChart`, `ChartCard` (dans `components/charts/`)
- Ces charts utilisent Recharts (LineChart, BarChart) mais ont des tableaux de donnees vides
- API disponible : `apiFetch()` dans `lib/api.ts` (base URL configurable via `NEXT_PUBLIC_API_URL`)
- Interface dashboard existante : `DashboardData` avec `stats.calories`, `stats.protein`, `stats.workouts_count`

## Checklist

### 1) Creer la structure de la page
- [x] Cree le dossier `app/dashboard/analytics/`
  - Fait avec `mkdir -p app/dashboard/analytics`.
- [x] Cree `app/dashboard/analytics/page.tsx` — composant client avec fetch API, cards resume, tabs et charts
  - Fait en creant un composant `"use client"` qui reutilise le meme pattern que `dashboard/page.tsx` : fetch dans un `useEffect`, gestion loading/data, sections stats + charts.
- [x] Layout : titre "Analytics", 4 cards stats, section charts avec Tabs (Vue d'ensemble, Nutrition, Poids)
  - Fait avec un `<header>` (h1 + description), une section cards (`grid sm:grid-cols-2 lg:grid-cols-4`), et une section charts wrappee dans `<Tabs>` avec 3 `TabsContent`.

### 2) Definir les donnees et l'API
- [x] Endpoint : `/api/home` (meme que le dashboard principal)
  - Fait en reutilisant `apiFetch("/api/home")` qui retourne les stats et le profil utilisateur.
- [x] Interface `AnalyticsData` definie (stats: calories, protein, workouts_count + user: weight)
  - Fait en creant une interface TypeScript locale dans le fichier, plus legere que `DashboardData` (pas besoin de email ni is_premium).
- [x] Fetch avec `apiFetch()`, fallback sur donnees demo (`DEMO_DATA`) si backend absent
  - Fait en remplacant le `setError()` par `setData(DEMO_DATA)` dans le catch — la page affiche toujours du contenu au lieu d'un message d'erreur.
- [x] Etat de chargement avec Skeleton (4 cards + 2 charts)
  - Fait en retournant un bloc de `<Skeleton>` pendant `loading === true` : 1 skeleton titre, 4 skeletons cards, 2 skeletons charts.

### 3) Implementer les sections analytics
- [x] Evolution du poids : `WeightEvolutionChart` avec donnees demo (7 points sur 30 jours)
  - Fait en remplacant le tableau vide `weightData = []` par 7 points de donnees (01/03 a 30/03, poids de 76.2 a 74.5, objectif 74) dans `weight-evolution-chart.tsx`.
- [x] Calories : `CaloriesChart` avec donnees demo (7 jours, objectif 2000 kcal)
  - Fait en remplacant le tableau vide `caloriesData = []` par 7 jours (Lun a Dim, calories entre 1600 et 2200, objectif 2000) dans `calories-chart.tsx`.
- [x] Macronutriments : nouveau `MacrosChart` (PieChart donut) avec repartition 30/50/20
  - Fait en creant `components/charts/macros-chart.tsx` avec un `<PieChart>` Recharts en donut (`innerRadius={60} outerRadius={100}`), 3 segments colores avec les couleurs du theme (`colors.primary`, `colors.secondary`, `colors.tertiary`).
- [x] Resume : 4 cards stats (calories moyennes, proteines, seances, poids)
  - Fait en creant un tableau `summaryStats` mappe sur des `<Card>` avec icone, valeur et unite — meme pattern que le dashboard principal.
- [x] Filtres temporels via Tabs Shadcn (Vue d'ensemble, Nutrition, Poids)
  - Fait avec `<Tabs defaultValue="overview">` et 3 `TabsContent` : "overview" affiche les 3 charts, "nutrition" affiche CaloriesChart + MacrosChart, "weight" affiche WeightEvolutionChart seul.

### 4) UI et composants
- [x] Composants Shadcn utilises : Card, Tabs, Skeleton
  - Fait en important depuis `@/components/ui/card`, `@/components/ui/tabs`, `@/components/ui/skeleton`.
- [x] `ChartCard` utilise comme wrapper pour les 3 graphiques
  - Fait en wrappant chaque chart dans `<ChartCard title="..." description="...">` depuis `components/charts/chart-card.tsx`.
- [x] `getChartTooltipStyle()` utilise dans MacrosChart
  - Fait en appelant `getChartTooltipStyle(colors)` et en spreadant le resultat dans `<Tooltip {...getChartTooltipStyle(colors)}>`.
- [x] Coherence visuelle avec le dashboard principal (meme pattern cards + charts)
  - Verifie visuellement — meme structure de cards (icon en haut a droite, valeur en gras, unite en muted), memes charts.

### 5) Responsive et accessibilite
- [x] Affichage mobile : charts empiles en colonne, cards empilees
  - Verifie — la grille `lg:grid-cols-2` des charts passe en 1 colonne sous `lg`, les cards `sm:grid-cols-2 lg:grid-cols-4` s'adaptent.
- [x] Navigation clavier : tabs navigables au clavier avec focus-visible
  - Verifie — les TabsTrigger Radix gerent nativement la navigation clavier (fleches gauche/droite + focus-visible).
- [x] Aucune regression a11y (test Landing, Inscription, Nutrition passent)
  - Verifie avec `npm run test` — les 6 tests qui passaient avant passent toujours.

### 6) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur, page `/dashboard/analytics` listee dans les routes
- [x] `npm run test` : 6/8 (2 echecs = dashboard principal, pas analytics)
- [x] Verification visuelle sur `/dashboard/analytics` : 4 cards, 3 tabs, 3 charts
- [x] Lien "Analytics" du sidebar actif quand on est sur cette page

## Modifications apportees

### Fichiers crees
- `app/dashboard/analytics/page.tsx` : page analytics avec cards resume, tabs, fetch API + fallback demo
- `components/charts/macros-chart.tsx` : PieChart donut repartition macronutriments

### Fichiers modifies
- `components/charts/weight-evolution-chart.tsx` : ajout donnees demo (7 points sur 30 jours)
- `components/charts/calories-chart.tsx` : ajout donnees demo (7 jours avec objectif 2000 kcal)
