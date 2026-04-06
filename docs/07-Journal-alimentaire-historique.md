# 07 - Journal alimentaire (historique des repas)

> Branche: `journal-alimentaire`

## Pourquoi cette tache

Le cahier des charges (section Business Model, Freemium) mentionne explicitement un **journal alimentaire** comme fonctionnalite de base accessible a tous les utilisateurs. Actuellement, le frontend permet d'uploader une photo de repas et de voir le resultat d'analyse, mais les repas ne sont pas affiches sous forme d'historique consultable. L'utilisateur ne peut pas revoir ses repas passes.

L'API backend existe deja (`GET /api/nutrition/history`) et la sauvegarde fonctionne (`PUT /api/nutrition/{id}`), il manque uniquement la page frontend pour afficher ces donnees.

## Checklist

### 1) Creer la page historique des repas
- [ ] Creer `app/dashboard/nutrition/history/page.tsx`
- [ ] Afficher la liste des repas passes avec : date, photo miniature, nom des aliments, total calories/macros
- [ ] Utiliser les composants Shadcn : Card, Table, Badge, Skeleton
- [ ] Gerer le chargement (Skeleton) et l'erreur (fallback donnees demo)

### 2) Connecter a l'API
- [ ] Appeler `GET /api/nutrition/history` via `apiFetch()`
- [ ] Definir l'interface TypeScript `MealHistory` (id, date, photo_url, items, totals)
- [ ] Prevoir des donnees demo si le backend est absent

### 3) Filtres et tri
- [ ] Permettre le tri par date (plus recent / plus ancien)
- [ ] Optionnel : filtre par jour/semaine/mois via Tabs ou Select

### 4) Navigation
- [ ] Ajouter un lien "Historique" dans la page nutrition ou un sous-menu
- [ ] Permettre de cliquer sur un repas pour voir le detail (reutiliser nutrition-result-table)

### 5) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] Verification visuelle avec donnees demo
- [ ] Responsive et accessibilite (aria-labels, focus-visible)
