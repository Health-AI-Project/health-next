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
- [ ] Creer le dossier `app/dashboard/analytics/`
- [ ] Creer `app/dashboard/analytics/page.tsx`
- [ ] Definir le layout de la page (titre, grille de charts)

### 2) Definir les donnees et l'API
- [ ] Identifier l'endpoint backend a appeler (ex: `/api/analytics` ou `/api/home`)
- [ ] Definir l'interface TypeScript des donnees analytics (calories, poids, workouts, macros)
- [ ] Implementer le fetch des donnees avec `apiFetch()`
- [ ] Gerer les etats de chargement (Skeleton) et d'erreur

### 3) Implementer les sections analytics
- [ ] Section evolution du poids : reutiliser/adapter `WeightEvolutionChart` avec des donnees reelles
- [ ] Section calories : reutiliser/adapter `CaloriesChart` avec des donnees reelles
- [ ] Section macronutriments : ajouter un chart repartion proteines/glucides/lipides
- [ ] Section resume : cards avec les stats cles (nombre de repas, nombre de workouts, calories moyennes)
- [ ] Ajouter des filtres temporels (semaine, mois, 3 mois) si pertinent

### 4) UI et composants
- [ ] Utiliser les composants Shadcn existants : Card, Tabs (pour les filtres temporels), Skeleton
- [ ] Utiliser `ChartCard` comme wrapper pour chaque graphique
- [ ] Utiliser `getChartTooltipStyle()` pour les tooltips des charts
- [ ] Verifier la coherence visuelle avec le dashboard principal

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
