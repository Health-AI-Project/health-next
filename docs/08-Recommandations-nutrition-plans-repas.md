# 08 - Recommandations nutritionnelles et plans de repas

> Branche: `recommandations-nutrition`

## Pourquoi cette tache

Le cahier des charges (section III.1) exige un systeme capable de :
- **Detecter les desequilibres** (exces ou deficits nutritionnels)
- **Suggerer des ameliorations** adaptees a l'objectif sante de l'utilisateur
- **Generer des plans de repas personnalises** tenant compte des allergies, preferences et regimes

Actuellement, le frontend affiche les resultats bruts d'analyse (calories, macros) mais sans aucune interpretation ni recommandation. L'API backend existe deja via le gRPC `GetMealPlan` dans engine-go et l'endpoint Spoonacular dans backend-hono.

## Checklist

### 1) Enrichir la table de resultats avec des indicateurs de desequilibre
- [ ] Ajouter des indicateurs visuels sur chaque macro dans `nutrition-result-table.tsx` (exces = rouge, deficit = orange, equilibre = vert)
- [ ] Definir des seuils par rapport a l'objectif utilisateur (ex: objectif 2000 kcal, proteines 25-30%, etc.)
- [ ] Afficher un Badge Shadcn "Exces" / "Deficit" / "Equilibre" par nutriment

### 2) Ajouter une section suggestions apres l'analyse
- [ ] Creer un composant `components/nutrition/meal-suggestions.tsx`
- [ ] Afficher des suggestions textuelles generees par l'API IA (ex: "Ajoutez une source de proteines")
- [ ] Utiliser les composants Card + icones pour les conseils
- [ ] Si l'API ne retourne pas de suggestions, generer des suggestions basiques cote frontend selon les desequilibres detectes

### 3) Creer la page plans de repas
- [ ] Creer `app/dashboard/nutrition/meal-plan/page.tsx`
- [ ] Appeler l'API backend pour recuperer le plan de repas genere (`GET /api/*/mealPlan`)
- [ ] Afficher le plan par jour (petit-dejeuner, dejeuner, diner, collations)
- [ ] Utiliser Card + Tabs (par jour de la semaine)
- [ ] Gerer le PremiumGuard (fonctionnalite Premium)

### 4) Navigation
- [ ] Ajouter un lien "Plans de repas" dans la section nutrition ou le sidebar
- [ ] Lier la page suggestions a la page plan de repas ("Voir votre plan personnalise")

### 5) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] Verification visuelle avec donnees demo
- [ ] PremiumGuard applique sur les plans de repas
