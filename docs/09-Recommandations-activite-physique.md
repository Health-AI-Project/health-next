# 09 - Recommandations d'activite physique

> Branche: `recommandations-workout`

## Pourquoi cette tache

Le cahier des charges (section III.2) exige un moteur de recommandation multi-criteres pour proposer des programmes d'entrainement adaptes selon l'objectif, la progression, les contraintes materielles, les preferences et les limitations physiques. Le backend engine-go expose deja le gRPC `GetWorkoutRecommendation` qui genere ces programmes.

Actuellement, le frontend n'a **aucune page** pour afficher les recommandations d'activite physique. Le lien "Clients" dans le sidebar n'a pas de page associee. Cette fonctionnalite est centrale dans la proposition de valeur Premium du cahier des charges ("plans sportifs detailles").

## Checklist

### 1) Creer la page programmes d'entrainement
- [ ] Creer `app/dashboard/workouts/page.tsx`
- [ ] Afficher le programme d'entrainement recommande par l'IA
- [ ] Structure : plan hebdomadaire avec exercices par jour
- [ ] Pour chaque exercice : nom, series, repetitions, duree, muscle cible
- [ ] Utiliser Card + Tabs (par jour) + Badge (niveau difficulte)

### 2) Connecter a l'API
- [ ] Appeler l'endpoint backend qui communique avec le gRPC `GetWorkoutRecommendation`
- [ ] Definir l'interface TypeScript `WorkoutPlan` (jours, exercices, parametres)
- [ ] Prevoir des donnees demo si le backend est absent

### 3) Formulaire de preferences
- [ ] Permettre a l'utilisateur de configurer ses preferences avant de generer un programme :
  - Objectif (perte de poids, prise de muscle, endurance, sante generale)
  - Equipements disponibles (salle, domicile, exterieur)
  - Duree souhaitee par seance
  - Limitations physiques (blessures, contre-indications)
- [ ] Utiliser les composants Select, Checkbox, Input Shadcn
- [ ] Bouton "Generer mon programme" qui appelle l'API

### 4) Navigation et guard
- [ ] Mettre a jour le sidebar : remplacer "Clients" par "Entrainement" ou ajouter un nouveau lien
- [ ] Appliquer PremiumGuard (fonctionnalite Premium)
- [ ] Ajouter le badge "Pro" dans le sidebar

### 5) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] Verification visuelle avec donnees demo
- [ ] Responsive et accessibilite
