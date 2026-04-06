# 04 - Implementer /dashboard/settings

> Branche: `frontend/dashboard-settings`

## Objectif
Creer la page `/dashboard/settings` actuellement manquante. Le lien "Parametres" existe deja dans le sidebar (icone Settings).

## Contexte technique
- Le sidebar reference deja `/dashboard/settings` dans ses liens de navigation
- Auth : Better Auth (`lib/auth-client.ts`, base URL `http://localhost:3002`)
- Donnees utilisateur disponibles via `apiFetch("/api/home")` : email, weight, is_premium
- Donnees du wizard (profil initial) : age, weight, goals, allergies (schemas dans `lib/schemas/wizard-schemas.ts`)
- Composants Shadcn disponibles : Form, Input, Label, Select, Checkbox, Card, Tabs, Dialog, Button
- Zustand disponible pour la gestion d'etat local

## Checklist

### 1) Creer la structure de la page
- [ ] Creer le dossier `app/dashboard/settings/`
- [ ] Creer `app/dashboard/settings/page.tsx`
- [ ] Definir le layout avec des sections (utiliser Tabs Shadcn pour organiser)

### 2) Section Profil
- [ ] Afficher et permettre la modification de l'email
- [ ] Afficher et permettre la modification du poids
- [ ] Afficher et permettre la modification de l'age
- [ ] Utiliser les composants Form + Input + Label Shadcn
- [ ] Valider les champs avec Zod (reutiliser les schemas du wizard si possible)
- [ ] Implementer la sauvegarde via l'API backend

### 3) Section Objectifs et allergies
- [ ] Afficher les objectifs actuels avec possibilite de les modifier
- [ ] Afficher les allergies actuelles avec possibilite de les modifier
- [ ] Reutiliser les Checkbox Shadcn comme dans le wizard
- [ ] Implementer la sauvegarde via l'API backend

### 4) Section Abonnement
- [ ] Afficher le statut actuel (Freemium / Premium / Premium+)
- [ ] Afficher un CTA d'upgrade si l'utilisateur est en Freemium
- [ ] Utiliser le composant Badge pour afficher le tier
- [ ] Utiliser le Dialog pour confirmer les changements d'abonnement

### 5) Section Preferences d'affichage
- [ ] Theme (deja gere dans le sidebar, envisager de le dupliquer ici)
- [ ] Notifications (activer/desactiver)
- [ ] Utiliser les composants Select et Checkbox

### 6) Gestion d'etat et API
- [ ] Identifier les endpoints backend pour lire/ecrire les settings
- [ ] Implementer le fetch des donnees actuelles au chargement
- [ ] Gerer les etats de chargement et d'erreur
- [ ] Afficher un toast de confirmation apres chaque sauvegarde

### 7) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] `npm run test` : pas de regression
- [ ] Verification visuelle sur `/dashboard/settings`
- [ ] Verifier que le lien "Parametres" du sidebar est actif quand on est sur cette page
- [ ] Tester la navigation clavier sur tous les formulaires
