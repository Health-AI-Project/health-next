# Etape 1 - Migrer les composants UI vers Shadcn UI

## Objectif
Uniformiser toute l'UI sur des composants Shadcn UI pour avoir:
- un design coherent
- une maintenance plus simple
- des composants reutilisables
- une base solide pour les etapes suivantes

## Pourquoi commencer par cette etape
Cette etape est la meilleure porte d'entree car les autres issues en dependent directement:
- landing page Premium+
- pages dashboard analytics/settings
- freemium guard (badges, cards, modals, toasts)
- rapport accessibilite (composants standardises plus simples a auditer)

## Perimetre
- Remplacer les composants UI custom ou heterogenes par des composants Shadcn UI.
- Centraliser les variantes de style (button, card, input, badge, dialog, tabs, table, toast).
- Conserver le comportement fonctionnel existant.

## Pages prioritaires
- Landing page: `app/page.tsx`
- Dashboard: `app/dashboard/page.tsx`
- Layout dashboard: `app/dashboard/layout.tsx`
- Page inscription: `app/inscription/page.tsx`

## Hors perimetre (pour cette etape)
- Modifier la logique metier Premium+.
- Ajouter/retirer des permissions Freemium Guard.
- Changer les regles de calcul metier (nutrition, analytics, recommandations).

## Prerequis techniques
- Node.js >= 20.9.0 (recommande: Node 20 LTS recent).
- Dependances installees avec `npm install` dans le dossier `health-next`.
- Serveur local fonctionnel avec `npm run dev` avant de commencer la migration.

## Checklist de travail

### 1) Audit des composants existants
- [x] Lister les composants dans `app/` et `components/`.
  - Commentaire validation: inventaire realise via recherche des fichiers `app/**/*.tsx` et `components/**/*.tsx`, puis verification manuelle des zones prioritaires.
- [x] Identifier les composants deja au format Shadcn UI.
  - Commentaire validation: verification des imports `@/components/ui/*` et controle du dossier `components/ui` (button, card, input, form, label, checkbox, progress, skeleton, toaster).
- [x] Identifier les composants custom a migrer en priorite (Button, Card, Input, Modal, Table, Badge).
  - Commentaire validation: mapping des ecarts detectes pendant l'audit (ex: `select` natif dans `components/dashboard/sidebar.tsx` et composants cibles manquants: select, dialog, tabs, table, badge).
- [x] Identifier les duplications de styles Tailwind a supprimer.
  - Commentaire validation: revue des `className` dans `app/` et `components/` et regroupement des motifs repetes pour prioriser le refactor.
  - Duplications principales identifiees:
    - Pattern wizard navigation repete: `flex justify-between pt-4` dans `components/wizard/steps/weight-step.tsx`, `components/wizard/steps/goals-step.tsx`, `components/wizard/steps/allergies-step.tsx`, `components/wizard/steps/summary-step.tsx`, `components/wizard/steps/signup-step.tsx`.
    - Pattern wizard espacement repete: `space-y-6` dans plusieurs steps (`age-step.tsx`, `weight-step.tsx`, `goals-step.tsx`, `allergies-step.tsx`, `summary-step.tsx`, `signup-step.tsx`).
    - Pattern cartes recap repete: `flex items-start gap-3 p-4 rounded-lg bg-accent/50` dans `components/wizard/steps/summary-step.tsx` (4 occurrences).
    - Pattern labels mode/entreprise repete: `text-xs font-medium text-muted-foreground` dans `components/dashboard/sidebar.tsx`.

### 2) Setup Shadcn UI (si incomplet)
- [x] Verifier que les bases sont presentes (`components/ui`, `lib/utils.ts`, `cn`).
  - Commentaire validation: controle de la structure confirme (`components/ui` present) et utilitaire `cn` disponible dans `lib/utils.ts`.
- [x] Verifier les dependances Radix et utilitaires necessaires.
  - Commentaire validation: verification des dependances UI dans `package.json` (ex: `@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-progress`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`).
- [x] Verifier la coherence des tokens Tailwind/CSS globaux.
  - Commentaire validation: controle des variables globales dans `app/globals.css` (`--background`, `--foreground`, `--primary`, `--ring`, `--sidebar-*`) et de leur mapping Tailwind via `@theme inline`.
  - Action appliquee: ajout du mapping `--color-sidebar-background`, `--color-sidebar-foreground`, `--color-sidebar-border` pour harmoniser l'usage `bg-*`, `text-*`, `border-*`.
  - Action appliquee: suppression des styles inline du sidebar et passage a des classes tokens (`bg-sidebar-background`, `text-sidebar-foreground`, `border-sidebar-border`) dans `components/dashboard/sidebar.tsx`.

## Resultat audit initial (18-03-2026)

### Constats valides
- Le dossier `components/ui` est present avec une base Shadcn deja en place: button, card, input, form, label, checkbox, progress, skeleton, toaster.
- Les pages prioritaires sont bien identifiees et existantes: `app/page.tsx`, `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`, `app/inscription/page.tsx`.
- La landing page (`app/page.tsx`) utilise deja `Button` et `Card` de `components/ui`.
- Le dashboard (`app/dashboard/page.tsx`) utilise deja `Card` de `components/ui`.
- L'inscription passe par `WizardContainer`, qui utilise deja majoritairement des composants UI Shadcn (button/input/form/checkbox).

### Ecarts detectes (reste a migrer)
- [RESOLU 18-03-2026] `components/dashboard/sidebar.tsx` contenait un `select` natif HTML (et labels natifs), migre vers `components/ui/select` + `components/ui/label`.
- Certains usages HTML natifs restent presents (ex: input de dropzone dans `components/nutrition/meal-uploader.tsx`), a trier entre cas legitimes techniques et migration UI.
- Les composants `select`, `dialog`, `tabs`, `table`, `badge` ne sont pas encore presents dans `components/ui`, alors qu'ils sont dans le perimetre cible.

### Statut de l'etape 1 apres audit
- P1 (button/input-form/card): avancee forte, base en place.
- P2/P3 (select/dialog/tabs/table/badge + harmonisation): a poursuivre.

### 3) Migration composant par composant
- [x] P1: Migrer les boutons vers `components/ui/button`.
  - Commentaire validation: recherche case-sensitive de balises `<button>` dans `app/` et `components/` (aucune occurrence native restante) et verification des usages `Button` via imports `@/components/ui/button`.
- [x] P1: Migrer les champs formulaire vers `input`, `label`, `form`, `checkbox`, `select`.
  - Commentaire validation: migration complete sur les composants cibles (`Input`, `Form*`, `Checkbox`, `Select`, `Label`) incluant l'alignement de `components/wizard/steps/signup-step.tsx` vers `components/ui/form`.
  - Verification effectuee: recherche case-sensitive des balises natives de champs (`<input>`, `<label>`, `<select>`, `<textarea>`) dans `app/` et `components/`.
  - Exception technique legitime: `components/nutrition/meal-uploader.tsx` conserve un `<input {...getInputProps()}>` requis par `react-dropzone` (input cache de gestion upload), non considere comme dette UI.
- [x] P1: Migrer les blocs de contenu vers `card`.
  - Commentaire validation: migration des blocs de recapitulatif dans `components/wizard/steps/summary-step.tsx` de `div` styles vers `Card` + `CardContent` pour uniformiser les conteneurs UI.
  - Verification effectuee: controle des pages prioritaires (`app/page.tsx`, `app/dashboard/page.tsx`, `app/inscription/page.tsx` via `WizardContainer`) confirmant l'usage majoritaire de `Card` pour les blocs de contenu.
- [x] P2: Migrer interactions (modals, popovers, dropdowns) vers composants Shadcn UI.
  - Commentaire validation: ajout de `components/ui/dropdown-menu.tsx` (Shadcn + Radix) et migration de l'interaction de choix du mode dans `components/dashboard/sidebar.tsx` vers un `DropdownMenu`.
  - Verification effectuee: diagnostics sans erreur sur `components/ui/dropdown-menu.tsx` et `components/dashboard/sidebar.tsx`, avec navigation clavier supportee nativement par Radix.
  - Note perimetre: aucun modal/popover custom detecte a migrer dans le code actuel; le besoin interaction est couvert par `Select` (entreprise) + `DropdownMenu` (mode).
- [x] P2: Migrer feedback/notifications vers `sonner` + `toaster`.
  - Commentaire validation: unification des appels `toast` sur `sonner` dans `components/nutrition/nutrition-tracker.tsx` et `components/nutrition/nutrition-result-table.tsx`.
  - Verification effectuee: `Toaster` reste monte dans `app/dashboard/layout.tsx`, garantissant l'affichage global des notifications dashboard.
- [ ] P3: Migrer tableaux/lists avec composants standardises.

### 4) Refactor styling
- [ ] Supprimer les classes redondantes repetees dans les pages.
- [ ] Creer des variantes la ou necessaire (ex: `variant=\"premium\"`).
- [ ] Harmoniser les espacements, tailles, et etats (hover/focus/disabled).

### 5) Validation fonctionnelle
- [ ] Lancer le projet localement et verifier les pages clefs.
- [ ] Verifier responsive mobile/desktop.
- [ ] Verifier focus clavier et navigation clavier sur composants interactifs.
- [ ] Verifier qu'aucune regression visuelle majeure n'apparait.

### 6) Validation technique
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test` (ou au minimum les tests e2e critiques)

## Criteres d'acceptation
- Tous les composants UI critiques utilisent Shadcn UI.
- Pas de duplication majeure de styles utilitaires dans les pages.
- UI visuellement coherente sur landing + dashboard.
- Build et lint passent.
- Pas de regression fonctionnelle bloquante.
- Les pages prioritaires sont migrees au moins sur les composants P1 (button/input-form/card).

## Definition of Done (DoD)
- [ ] Migration terminee sur le perimetre prioritaire.
- [ ] Tests locaux passes.
- [ ] Changements commits sur la branche `frontend`.
- [ ] PR prete avec captures avant/apres.

## Risques
- Regressions visuelles discrètes sur certaines pages.
- Variantes de composants insuffisantes au premier passage.
- Dette de style historique cachee dans les pages.

## Mitigation
- Migrer par lots petits (Button/Input/Card puis le reste).
- Verifier page par page apres chaque lot.
- Faire des commits atomiques et faciles a revert.
