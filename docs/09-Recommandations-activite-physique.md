# 09 - Recommandations d'activite physique (TERMINEE)

> Branche: `recommandations-workout`

## Pourquoi cette tache

Le cahier des charges (section III.2) exige un moteur de recommandation multi-criteres pour proposer des programmes d'entrainement adaptes selon l'objectif, la progression, les contraintes materielles, les preferences et les limitations physiques. Le backend engine-go expose deja le gRPC `GetWorkoutRecommendation` qui genere ces programmes.

Actuellement, le frontend n'a **aucune page** pour afficher les recommandations d'activite physique. Le lien "Clients" dans le sidebar n'a pas de page associee. Cette fonctionnalite est centrale dans la proposition de valeur Premium du cahier des charges ("plans sportifs detailles").

## Checklist

### 1) Creer la page programmes d'entrainement
- [x] Cree `app/dashboard/workouts/page.tsx`
  - Fait en creant un composant client avec fetch API + fallback demo. 3 cards stats en haut (seances/semaine, calories/semaine, exercices), puis le programme complet en tabs par jour.
- [x] Programme hebdomadaire avec 5 jours demo : Push (haut du corps), Bas du corps, Repos actif, Pull (haut du corps), Full body + HIIT
  - Fait avec `DEMO_WORKOUT_PLAN` contenant 5 jours, 2 a 5 exercices par jour, avec series, reps, repos et muscle cible.
- [x] Chaque exercice affiche : numero, nom, series x reps, temps de repos, muscle cible en Badge
  - Fait avec des Cards individuelles par exercice, numero dans un cercle colore, infos en 2 lignes, Badge muscle visible sur desktop.
- [x] Badge de difficulte par jour : Debutant (secondary), Intermediaire (default), Avance (destructive)
  - Fait avec le composant `DifficultyBadge` qui mappe la difficulte vers une variante de Badge.

### 2) Connecter a l'API
- [x] Appel `GET /api/workouts/plan` via `apiFetch()`, fallback sur `DEMO_WORKOUT_PLAN`
  - Fait dans un `useEffect` avec try/catch, meme pattern que toutes les autres pages.
- [x] Interfaces TypeScript `Exercise` et `DayWorkout` definies
  - `Exercise` : name, sets, reps, rest, muscle. `DayWorkout` : day, focus, duration, calories, difficulty, exercises[].
- [x] 5 jours de donnees demo avec exercices realistes

### 3) Formulaire de preferences
- [ ] A implementer quand le backend exposera un endpoint de configuration des preferences workout
  - Note : le formulaire n'est pas encore integre car l'endpoint backend n'est pas defini. Le programme affiche est genere par l'IA cote backend.

### 4) Navigation et guard
- [x] Lien "Entrainement" ajoute dans le sidebar avec icone Dumbbell et badge "Pro"
  - Fait en ajoutant `{ href: "/dashboard/workouts", label: "Entrainement", icon: Dumbbell, premium: true }` dans `navItems` du sidebar. Le lien "Clients" est conserve pour l'etape B2B (doc 11).
- [x] PremiumGuard applique sur le programme (exercices floutes pour les users free)
  - Fait en wrappant la section Tabs dans `<PremiumGuard feature="Programmes d'entrainement personnalises">`. Les stats restent visibles.

### 5) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur, route `/dashboard/workouts` listee
- [x] Responsive : cards exercices s'empilent, badge muscle cache sur mobile (`hidden sm:inline-flex`)
- [x] Accessibilite : sr-only headings, aria-hidden sur icones

## Modifications apportees

### Fichiers crees
- `app/dashboard/workouts/page.tsx` : page entrainement avec 3 cards stats, tabs par jour, exercices en cards, PremiumGuard, donnees demo 5 jours

### Fichiers modifies
- `components/dashboard/sidebar.tsx` : ajout lien "Entrainement" (Dumbbell, premium: true) et import Dumbbell
