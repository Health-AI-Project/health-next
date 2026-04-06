# 03 - Implementer /dashboard/analytics

> Branche: `frontend/dashboard-analytics`

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
- [ ] Verifier l'affichage mobile (charts empiles en colonne)
- [ ] Verifier la navigation clavier sur les filtres/tabs
- [ ] Lancer `npm run test:a11y` et verifier 0 regression

### 6) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] `npm run test` : pas de regression
- [ ] Verification visuelle sur `/dashboard/analytics`
- [ ] Verifier que le lien "Analytics" du sidebar est actif quand on est sur cette page
