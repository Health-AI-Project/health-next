# 04 - Implementer /dashboard/settings

> Branche: `dashboard-settings`

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
- [x] Cree `app/dashboard/settings/page.tsx` — composant client avec 3 tabs (Profil, Objectifs, Abonnement)
- [x] Layout : titre "Parametres", description, Tabs Shadcn avec icones

### 2) Section Profil
- [x] Email affiche en lecture seule (disabled) avec note explicative
- [x] Age modifiable (Input number, min 18, max 120)
- [x] Poids modifiable (Input number, min 30, max 300, step 0.1)
- [x] Composants utilises : Card, Input, Label Shadcn
- [x] Sauvegarde via `PUT /api/user/profile` avec toast de confirmation

### 3) Section Objectifs et allergies
- [x] Objectifs : 6 checkboxes reutilisant `GOALS_OPTIONS` du wizard
- [x] Allergies : 8 checkboxes reutilisant `ALLERGIES_OPTIONS` du wizard, logique "Aucune allergie" exclusive
- [x] Checkbox Shadcn avec labels cliquables, grille 2 colonnes
- [x] Sauvegarde via `PUT /api/user/goals` avec toast de confirmation

### 4) Section Abonnement
- [x] Statut affiche avec Badge Shadcn ("Premium" ou "Freemium")
- [x] CTA upgrade si Freemium : prix 9,99€, bouton variante `premium`
- [x] Message de confirmation si Premium

### 5) Gestion d'etat et API
- [x] Fetch initial via `/api/home`, fallback sur donnees demo (`DEMO_SETTINGS`)
- [x] Skeleton pour l'etat de chargement
- [x] Toast de confirmation/erreur apres chaque sauvegarde

### 7) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] `npm run test` : pas de regression
- [ ] Verification visuelle sur `/dashboard/settings`
- [ ] Verifier que le lien "Parametres" du sidebar est actif quand on est sur cette page
- [ ] Tester la navigation clavier sur tous les formulaires
