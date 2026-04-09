# 04 - Implementer /dashboard/settings (TERMINEE)

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
  - Fait en creant le dossier `app/dashboard/settings/` puis le fichier `page.tsx` avec la directive `"use client"` pour le state React.
- [x] Layout : titre "Parametres", description, Tabs Shadcn avec icones
  - Fait en utilisant `<Tabs>` de `@/components/ui/tabs` avec 3 `TabsTrigger` contenant chacun une icone lucide-react (`User`, `Target`, `CreditCard`) et un `TabsContent` par section.

### 2) Section Profil
- [x] Email affiche en lecture seule (disabled) avec note explicative
  - Fait avec un `<Input type="email" disabled>` pre-rempli depuis les donnees API, et un `<p>` explicatif en dessous ("L'email ne peut pas etre modifie").
- [x] Age modifiable (Input number, min 18, max 120)
  - Fait avec `<Input type="number" min={18} max={120}>` et un `onChange` qui met a jour le state via `setSettings`.
- [x] Poids modifiable (Input number, min 30, max 300, step 0.1)
  - Fait avec `<Input type="number" min={30} max={300} step={0.1}>` et un `onChange` identique.
- [x] Composants utilises : Card, Input, Label Shadcn
  - Fait en wrappant le formulaire dans `<Card><CardHeader><CardContent>` avec des `<Label htmlFor>` lies aux inputs par leur `id`.
- [x] Sauvegarde via `PUT /api/user/profile` avec toast de confirmation
  - Fait avec une fonction `handleSaveProfile()` qui appelle `apiFetch("/api/user/profile", { method: "PUT" })` et affiche `toast.success()` ou `toast.error()` selon le resultat.

### 3) Section Objectifs et allergies
- [x] Objectifs : 6 checkboxes reutilisant `GOALS_OPTIONS` du wizard
  - Fait en important `GOALS_OPTIONS` depuis `lib/schemas/wizard-schemas.ts` et en mappant chaque option sur un `<Checkbox>` + `<Label>`. La fonction `toggleGoal()` ajoute/retire l'id dans le tableau `settings.goals`.
- [x] Allergies : 8 checkboxes reutilisant `ALLERGIES_OPTIONS` du wizard, logique "Aucune allergie" exclusive
  - Fait avec la meme approche. La fonction `toggleAllergy()` gere le cas special : si on coche "none", ca decoche tout le reste, et si on coche une allergie, ca decoche "none".
- [x] Checkbox Shadcn avec labels cliquables, grille 2 colonnes
  - Fait avec `<div className="grid gap-3 sm:grid-cols-2">` et `<Label className="cursor-pointer">` lie au checkbox par `htmlFor`.
- [x] Sauvegarde via `PUT /api/user/goals` avec toast de confirmation
  - Fait avec `handleSaveGoals()` qui envoie `goals` et `allergies` en JSON via `apiFetch`.

### 4) Section Abonnement
- [x] Statut affiche avec Badge Shadcn ("Premium" ou "Freemium")
  - Fait avec un rendu conditionnel : `<Badge>Premium</Badge>` si `is_premium` est true, sinon `<Badge variant="secondary">Freemium</Badge>`.
- [x] CTA upgrade si Freemium : prix 9,99€, bouton variante `premium`
  - Fait avec un bloc conditionnel `{!settings?.is_premium && (...)}` contenant un titre, une description, le prix et un `<Button variant="premium">`.
- [x] Message de confirmation si Premium
  - Fait avec un bloc conditionnel `{settings?.is_premium && (...)}` affichant un encadre avec bordure `border-primary/50` et fond `bg-primary/5`.

### 5) Gestion d'etat et API
- [x] Fetch initial via `/api/home`, fallback sur donnees demo (`DEMO_SETTINGS`)
  - Fait dans un `useEffect` qui appelle `apiFetch("/api/home")` et en cas d'erreur (backend absent) utilise `DEMO_SETTINGS` (email, age 28, poids 74.5, freemium, 2 goals, aucune allergie).
- [x] Skeleton pour l'etat de chargement
  - Fait avec 3 `<Skeleton>` (titre, tabs, contenu) affiches pendant `loading === true`.
- [x] Toast de confirmation/erreur apres chaque sauvegarde
  - Fait via `toast.success("Profil mis a jour")` en cas de succes et `toast.error("Impossible de sauvegarder")` en cas d'echec, importe depuis `@/components/ui/toaster`.

### 6) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur, page `/dashboard/settings` listee dans les routes
- [x] Verification visuelle : 3 tabs fonctionnels (Profil, Objectifs, Abonnement)
- [x] Lien "Parametres" du sidebar actif sur cette page
- [x] Responsive et navigation clavier OK

## Modifications apportees

### Fichiers crees
- `app/dashboard/settings/page.tsx` : page settings avec 3 tabs, fetch API + fallback demo, toast confirmation

### Reutilisation
- `GOALS_OPTIONS` et `ALLERGIES_OPTIONS` de `lib/schemas/wizard-schemas.ts`
- Composants Shadcn : Card, Tabs, Input, Label, Checkbox, Badge, Button (premium), Skeleton, toast
