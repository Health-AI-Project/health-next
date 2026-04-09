# 08 - Recommandations nutritionnelles et plans de repas (TERMINEE)

> Branche: `recommandations-nutrition`

## Pourquoi cette tache

Le cahier des charges (section III.1) exige un systeme capable de :
- **Detecter les desequilibres** (exces ou deficits nutritionnels)
- **Suggerer des ameliorations** adaptees a l'objectif sante de l'utilisateur
- **Generer des plans de repas personnalises** tenant compte des allergies, preferences et regimes

Actuellement, le frontend affiche les resultats bruts d'analyse (calories, macros) mais sans aucune interpretation ni recommandation. L'API backend existe deja via le gRPC `GetMealPlan` dans engine-go et l'endpoint Spoonacular dans backend-hono.

## Checklist

### 1) Enrichir la table de resultats avec des indicateurs de desequilibre
- [x] Indicateurs visuels par nutriment : Badge "Deficit" (orange), "Exces" (rouge), "Equilibre" (vert)
  - Fait en creant `components/nutrition/meal-suggestions.tsx` avec une fonction `analyzeNutrients()` qui compare les totaux du repas aux objectifs journaliers divises par 3 (1 repas = 1/3 de la journee). Seuils : < 80% = deficit, > 120% = exces.
- [x] Seuils definis : 2000 kcal/jour, 60g proteines, 250g glucides, 70g lipides (divises par 3 par repas)
  - Fait dans `DAILY_TARGETS` avec la fonction `getStatus()` qui calcule le ratio actual/target.
- [x] Badges Shadcn avec icones : TrendingDown (deficit), TrendingUp (exces), CheckCircle (equilibre)
  - Fait avec les composants `StatusBadge` et `StatusIcon` qui rendent le badge et l'icone selon le statut.

### 2) Ajouter une section suggestions apres l'analyse
- [x] Cree `components/nutrition/meal-suggestions.tsx`
  - Fait avec 2 cards : "Analyse nutritionnelle" (4 indicateurs en grille 2x2) et "Suggestions" (liste des conseils pour les nutriments en desequilibre).
- [x] Suggestions textuelles generees cote frontend selon les desequilibres detectes
  - Fait avec `getSuggestion()` qui retourne un conseil specifique pour chaque nutriment et chaque type de desequilibre (ex: deficit proteines → "Ajoutez une source de proteines : poulet, poisson, oeufs, legumineuses ou tofu").
- [x] Integre dans le nutrition tracker apres le tableau de resultats
  - Fait en ajoutant `<MealSuggestions data={nutritionData} />` dans `nutrition-tracker.tsx` apres `NutritionResultTable`, affiche uniquement apres l'analyse.

### 3) Creer la page plans de repas
- [x] Cree `app/dashboard/nutrition/meal-plan/page.tsx`
  - Fait avec un composant client qui fetch `/api/nutrition/meal-plan` avec fallback sur 5 jours de plans demo (Lundi a Vendredi, 3-4 repas par jour avec ingredients detailles).
- [x] Affichage par jour via Tabs (Lundi, Mardi, etc.) avec total calories par jour
  - Fait avec `<Tabs>` Shadcn et un `TabsTrigger` par jour. Chaque jour affiche ses repas en grille 2 colonnes.
- [x] Chaque repas affiche : nom, icone (Coffee/Sun/Moon/Utensils), calories en Badge, macros, et ingredients en Badges secondaires
  - Fait avec le composant `MealCard` qui affiche toutes ces informations.
- [x] PremiumGuard applique sur tout le contenu du plan
  - Fait en wrappant les Tabs dans `<PremiumGuard feature="Plans de repas personnalises">`.

### 4) Navigation
- [x] Bouton "Plan repas" ajoute dans le nutrition tracker (a cote de "Historique")
  - Fait en ajoutant un `<Link href="/dashboard/nutrition/meal-plan">` avec icone CalendarDays dans `nutrition-tracker.tsx`.
- [x] Bouton "Analyser un repas" dans la page plan pour revenir au tracker
  - Fait en haut a droite du header.

### 5) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur, routes `/dashboard/nutrition/meal-plan` et `/dashboard/nutrition/history` listees
- [x] PremiumGuard actif sur les plans de repas (floute + bouton upgrade pour les users free)

## Modifications apportees

### Fichiers crees
- `components/nutrition/meal-suggestions.tsx` : analyse nutritionnelle avec indicateurs desequilibre + suggestions textuelles
- `app/dashboard/nutrition/meal-plan/page.tsx` : page plans de repas avec 5 jours demo, tabs, cards repas, PremiumGuard

### Fichiers modifies
- `components/nutrition/nutrition-tracker.tsx` : ajout MealSuggestions apres le tableau, bouton "Plan repas" dans la navigation
