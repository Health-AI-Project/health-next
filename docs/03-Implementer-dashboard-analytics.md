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
- [x] Cree `app/dashboard/analytics/page.tsx` — composant client avec fetch API, cards resume, tabs et charts
- [x] Layout : titre "Analytics", 4 cards stats, section charts avec Tabs (Vue d'ensemble, Nutrition, Poids)

### 2) Definir les donnees et l'API
- [x] Endpoint : `/api/home` (meme que le dashboard principal)
- [x] Interface `AnalyticsData` definie (stats: calories, protein, workouts_count + user: weight)
- [x] Fetch avec `apiFetch()`, fallback sur donnees demo (`DEMO_DATA`) si backend absent
- [x] Etat de chargement avec Skeleton (4 cards + 2 charts)

### 3) Implementer les sections analytics
- [x] Evolution du poids : `WeightEvolutionChart` avec donnees demo (7 points sur 30 jours)
- [x] Calories : `CaloriesChart` avec donnees demo (7 jours, objectif 2000 kcal)
- [x] Macronutriments : nouveau `MacrosChart` (PieChart donut) avec repartition 30/50/20
- [x] Resume : 4 cards stats (calories moyennes, proteines, seances, poids)
- [x] Filtres temporels via Tabs Shadcn (Vue d'ensemble, Nutrition, Poids)

### 4) UI et composants
- [x] Composants Shadcn utilises : Card, Tabs, Skeleton
- [x] `ChartCard` utilise comme wrapper pour les 3 graphiques
- [x] `getChartTooltipStyle()` utilise dans MacrosChart
- [x] Coherence visuelle avec le dashboard principal (meme pattern cards + charts)

### 5) Responsive et accessibilite
- [x] Affichage mobile : charts empiles en colonne, cards empilees
- [x] Navigation clavier : tabs navigables au clavier avec focus-visible
- [x] Aucune regression a11y (test Landing, Inscription, Nutrition passent)

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
