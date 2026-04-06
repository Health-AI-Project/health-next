# 07 - Journal alimentaire (historique des repas) (TERMINEE)

> Branche: `journal-alimentaire`

## Pourquoi cette tache

Le cahier des charges (section Business Model, Freemium) mentionne explicitement un **journal alimentaire** comme fonctionnalite de base accessible a tous les utilisateurs. Actuellement, le frontend permet d'uploader une photo de repas et de voir le resultat d'analyse, mais les repas ne sont pas affiches sous forme d'historique consultable. L'utilisateur ne peut pas revoir ses repas passes.

L'API backend existe deja (`GET /api/nutrition/history`) et la sauvegarde fonctionne (`PUT /api/nutrition/{id}`), il manque uniquement la page frontend pour afficher ces donnees.

## Checklist

### 1) Creer la page historique des repas
- [x] Cree `app/dashboard/nutrition/history/page.tsx`
  - Fait en creant un composant client avec fetch API, 3 cards resume (repas enregistres, calories totales, moyenne par repas), et un tableau avec tous les repas. 6 repas demo quand le backend est absent.
- [x] Afficher la liste des repas avec : date, nom, aliments, calories/macros
  - Fait avec un composant `MealTable` utilisant Table Shadcn. Chaque ligne affiche la date formatee en francais, un Badge pour le type de repas, la liste des aliments, et les macros (P/G/L).
- [x] Composants Shadcn utilises : Card, Table, Badge, Skeleton, Tabs, Button
- [x] Gerer le chargement (Skeleton) et fallback donnees demo (6 repas sur 4 jours)

### 2) Connecter a l'API
- [x] Appel `GET /api/nutrition/history` via `apiFetch()`, fallback sur `DEMO_HISTORY` en cas d'erreur
  - Fait dans un `useEffect` avec try/catch, meme pattern que les autres pages.
- [x] Interface `MealHistoryItem` definie (id, date, name, items[], calories, proteins, carbs, fats)
- [x] 6 repas demo couvrant 4 jours avec des aliments varies

### 3) Filtres et tri
- [x] Tri par date : bouton "Plus recent" / "Plus ancien" avec icone ArrowUpDown
  - Fait avec un state `sortAsc` qui inverse le tri au clic.
- [x] Filtre par periode via Tabs : Tout, Aujourd'hui, 7 jours, 30 jours
  - Fait avec une fonction `filterByPeriod()` qui filtre les repas selon la date de cutoff.

### 4) Navigation
- [x] Bouton "Historique" ajoute dans le nutrition-tracker (en haut a droite, avec icone History)
  - Fait en ajoutant un `<Link href="/dashboard/nutrition/history">` avec un `<Button variant="outline">` dans `nutrition-tracker.tsx`.
- [x] Bouton "Analyser un repas" dans la page historique pour revenir au tracker
  - Fait en haut a droite du header avec un lien vers `/dashboard/nutrition`.

### 5) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur, route `/dashboard/nutrition/history` listee
- [x] Responsive : grille cards s'adapte (sm:grid-cols-3), tableau scrollable
- [x] Accessibilite : sr-only headings, aria-hidden sur icones, focus-visible sur boutons/tabs

## Modifications apportees

### Fichiers crees
- `app/dashboard/nutrition/history/page.tsx` : page journal alimentaire avec cards resume, tabs filtres, tableau repas, tri, donnees demo

### Fichiers modifies
- `components/nutrition/nutrition-tracker.tsx` : ajout bouton "Historique" en haut a droite avec lien vers la page history
