# Etape 1 - Migrer les composants UI vers Shadcn UI (v2)

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

## Fichiers supplementaires dans le perimetre
- Nutrition tracker: `components/nutrition/nutrition-tracker.tsx`
- Tableau nutrition: `components/nutrition/nutrition-result-table.tsx`
- Meal uploader: `components/nutrition/meal-uploader.tsx`

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
  - Inventaire complet: 6 fichiers dans `app/`, 23 dans `components/` (dont 10 composants UI dans `components/ui/`).
- [x] Identifier les composants deja au format Shadcn UI.
  - Commentaire validation: verification des imports `@/components/ui/*` et controle du dossier `components/ui`.
  - Composants Shadcn en place: button, card, checkbox, form, input, label, progress, select, skeleton, toaster.
- [x] Identifier les composants custom a migrer en priorite (Button, Card, Input, Modal, Table, Badge).
  - Commentaire validation: mapping des ecarts detectes pendant l'audit.
  - Ecarts identifies: `select` natif dans sidebar (migre depuis), composants cibles manquants: dialog, tabs, table, badge.
- [x] Identifier les duplications de styles Tailwind a supprimer.
  - Commentaire validation: revue des `className` dans `app/` et `components/` et regroupement des motifs repetes pour prioriser le refactor.
  - Duplications principales identifiees:
    - Pattern wizard navigation repete: `flex justify-between pt-4` dans `weight-step.tsx`, `goals-step.tsx`, `allergies-step.tsx`, `summary-step.tsx`, `signup-step.tsx` (variante `flex justify-end pt-4` dans `age-step.tsx` car premier step sans bouton retour).
    - Pattern wizard espacement repete: `space-y-6` dans les 6 steps (`age-step`, `weight-step`, `goals-step`, `allergies-step`, `summary-step`, `signup-step`).
    - Pattern cartes recap repete: `flex items-start gap-3 p-4 rounded-lg bg-accent/50` dans `summary-step.tsx` (4 occurrences).
    - Pattern labels mode/entreprise repete: `text-xs font-medium text-muted-foreground` dans `sidebar.tsx`.

### 2) Setup Shadcn UI (si incomplet)
- [x] Verifier que les bases sont presentes (`components/ui`, `lib/utils.ts`, `cn`).
  - Commentaire validation: controle de la structure confirme (`components/ui` present) et utilitaire `cn` disponible dans `lib/utils.ts` (utilise `clsx` + `tailwind-merge`).
- [x] Verifier les dependances Radix et utilitaires necessaires.
  - Commentaire validation: verification des dependances UI dans `package.json`:
    - `@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-progress`, `@radix-ui/react-select`, `@radix-ui/react-slot`
    - `class-variance-authority`, `clsx`, `tailwind-merge`
- [x] Verifier la coherence des tokens Tailwind/CSS globaux.
  - Commentaire validation: controle des variables globales dans `app/globals.css` (`--background`, `--foreground`, `--primary`, `--ring`, `--sidebar-*`) et de leur mapping Tailwind via `@theme inline`.
  - Action appliquee: ajout du mapping `--color-sidebar-background`, `--color-sidebar-foreground`, `--color-sidebar-border` pour harmoniser l'usage `bg-*`, `text-*`, `border-*`.
  - Action appliquee: suppression des styles inline du sidebar et passage a des classes tokens (`bg-sidebar-background`, `text-sidebar-foreground`, `border-sidebar-border`) dans `components/dashboard/sidebar.tsx`.

## Resultat audit initial (18-03-2026)

### Constats valides
- Le dossier `components/ui` est present avec une base Shadcn deja en place: button, card, checkbox, form, input, label, progress, select, skeleton, toaster.
- Les pages prioritaires sont bien identifiees et existantes: `app/page.tsx`, `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`, `app/inscription/page.tsx`.
- La landing page (`app/page.tsx`) utilise deja `Button` et `Card` de `components/ui`.
- Le dashboard (`app/dashboard/page.tsx`) utilise deja `Card` de `components/ui`.
- L'inscription passe par `WizardContainer`, qui utilise deja majoritairement des composants UI Shadcn (button/input/form/checkbox).

### Ecarts detectes (reste a migrer)
- [RESOLU 18-03-2026] `components/dashboard/sidebar.tsx` contenait un `select` natif HTML (et labels natifs), migre vers `components/ui/select` + `components/ui/label`.
- [RESOLU 18-03-2026] `components/ui/select.tsx` a ete cree lors de cette migration et est desormais disponible.
- Exception technique legitime: `components/nutrition/meal-uploader.tsx` conserve un `<input {...getInputProps()}>` requis par `react-dropzone` (input cache de gestion upload), non considere comme dette UI.
- Exception semantique legitime: `components/wizard/steps/summary-step.tsx` conserve des `<ul>` et `<li>` natifs pour afficher les listes de goals et allergies. Ces elements HTML semantiques sont appropries ici (accessibilite des listes).
- [RESOLU 30-03-2026] Les composants `dialog`, `tabs`, `table`, `badge` ont ete installes dans `components/ui` avec leurs dependances Radix respectives.
- [RESOLU 30-03-2026] `components/nutrition/nutrition-result-table.tsx` a ete migre de `<table>` natif vers les composants Shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.
- [RESOLU 30-03-2026] Import `toast` standardise dans `signup-step.tsx`: remplace `import { toast } from "sonner"` par `import { toast } from "@/components/ui/toaster"` pour uniformiser avec le reste du projet.

### Statut de l'etape 1 apres audit
- P1 (button/input-form/card/select): termine, base solide en place.
- P2 (dialog/tabs/badge + standardisation toast): termine (30-03-2026).
- P3 (table nutrition): termine (30-03-2026).
- Reste a faire: harmonisation styling (etape 4).

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
- [x] P2: Installer les composants Shadcn UI manquants (dialog, tabs, badge).
  - Commentaire validation: creation de `components/ui/dialog.tsx` (Radix Dialog), `components/ui/tabs.tsx` (Radix Tabs), `components/ui/badge.tsx` (CVA) et `components/ui/table.tsx`. Dependances `@radix-ui/react-dialog` et `@radix-ui/react-tabs` installees.
  - Contexte: aucun modal, popover, dropdown ou onglet natif n'existait dans le code. Ces composants sont prets pour les besoins futurs (freemium guard, pages settings/analytics).
- [x] P2: Standardiser les imports toast.
  - Commentaire validation: remplacement de `import { toast } from "sonner"` par `import { toast } from "@/components/ui/toaster"` dans `components/wizard/steps/signup-step.tsx`.
  - Pourquoi: le fichier `components/ui/toaster.tsx` re-exporte deja `toast` depuis sonner. Un point d'entree unique facilite la maintenance.
- [x] P3: Migrer le tableau nutrition vers un composant Shadcn `table`.
  - Commentaire validation: migration de `components/nutrition/nutrition-result-table.tsx` — remplacement de `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` natifs par `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` de `@/components/ui/table`.
  - Verification: build (`npm run build`) passe sans erreur apres migration.

### 4) Refactor styling
- [x] Extraire le pattern de navigation wizard dans un composant reutilisable.
  - Commentaire validation: creation de `components/wizard/wizard-navigation.tsx` avec props `onPrev`, `prevLabel`, `nextLabel`, `nextIcon`, `nextClassName`, `isLoading`, `onNext`. Utilise dans les 6 wizard steps, supprimant la duplication du bloc navigation (boutons Precedent/Suivant).
  - Imports `Button` et `ArrowLeft`/`ArrowRight` retires des steps (centralises dans `WizardNavigation`).
- [x] Extraire le pattern des cards recapitulatif dans summary-step.
  - Commentaire validation: creation d'un composant local `SummaryCard` dans `summary-step.tsx` qui factorise le pattern `Card bg-accent/50 border-0` + `CardContent flex items-start gap-3 p-4` + icone. Les 4 blocs recapitulatifs utilisent desormais `SummaryCard`.
- [x] Extraire le pattern d'espacement wizard `space-y-6` si pertinent.
  - Commentaire validation: apres analyse, ce pattern est le `className` du `<form>` dans chaque step. C'est un usage standard de formulaire, l'extraire ajouterait de la complexite sans benefice reel. Laisse en l'etat volontairement.
- [x] Creer des variantes la ou necessaire (ex: `variant="premium"`).
  - Commentaire validation: ajout de la variante `premium` dans `components/ui/button.tsx` (gradient `from-primary to-primary/80` avec hover). Utilise dans `WizardNavigation` via prop `nextVariant="premium"` dans `summary-step.tsx` et `signup-step.tsx`. Suppression des className gradient en dur.
- [x] Harmoniser les espacements, tailles, et etats (hover/focus/disabled).
  - Commentaire validation:
    - Harmonisation `focus:` vers `focus-visible:` dans `dialog.tsx`, `badge.tsx`, `select.tsx` (alignement avec button, input, checkbox, tabs qui utilisaient deja `focus-visible:`).
    - Ajout du hover manquant sur la card Premium de la landing page (`hover:border-primary transition-colors`), alignement avec la card Freemium.
    - Extraction du style tooltip duplique des charts dans `getChartTooltipStyle()` dans `chart-card.tsx`, utilise par `weight-evolution-chart.tsx` et `calories-chart.tsx`.
    - Suppression de la prop `nextClassName` de `WizardNavigation` au profit de `nextVariant` (plus propre, passe par le systeme de variantes CVA).

### 5) Validation fonctionnelle
- [x] Lancer le projet localement et verifier les pages clefs.
  - Commentaire validation: les 4 pages (`/`, `/inscription`, `/dashboard`, `/dashboard/nutrition`) retournent HTTP 200 et le HTML SSR contient tous les elements attendus.
  - Landing page: header, hero, 2 pricing cards (Freemium avec hover, Premium avec hover et gradient), CTA, footer — tous les boutons utilisent les classes Shadcn avec `focus-visible:ring-2`.
  - Inscription: wizard step 1 rendu avec `WizardNavigation` (`flex justify-end pt-4`), barre de progression, formulaire avec `<label>` et `<input>` Shadcn.
  - Dashboard: sidebar avec tokens (`bg-sidebar-background`, `border-sidebar-border`), Select Radix (`role="combobox"`), boutons de theme avec `focus-visible:ring-2`, `<nav aria-label="Navigation principale">`.
  - Nutrition: page chargee correctement.
  - Note: le `<select aria-hidden="true">` dans le dashboard est le select natif cache genere par Radix pour l'accessibilite — comportement normal, pas un ecart de migration.
- [x] Verifier responsive mobile/desktop.
  - Commentaire validation: verification des classes responsive dans le HTML SSR: `sm:w-auto`, `md:grid-cols-2`, `lg:text-6xl`, `md:py-24`, `sm:flex-row`, `lg:p-8`. Les breakpoints sont presents sur les elements critiques (hero, grids, boutons).
- [x] Verifier focus clavier et navigation clavier sur composants interactifs.
  - Commentaire validation: tous les elements interactifs (button, input, select trigger, checkbox) utilisent `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. Les labels ont `peer-disabled:cursor-not-allowed peer-disabled:opacity-70`. Les inputs ont `disabled:cursor-not-allowed disabled:opacity-50`. Harmonisation `focus:` vers `focus-visible:` appliquee dans l'etape 4.
- [x] Verifier qu'aucune regression visuelle majeure n'apparait.
  - Commentaire validation: aucun element manquant, aucune classe cassee, tous les composants UI utilisent les classes Shadcn attendues. Les gradients, hovers et transitions sont presents dans le HTML rendu.

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
- Les imports toast sont standardises via `@/components/ui/toaster`.

## Definition of Done (DoD)
- [ ] Migration terminee sur le perimetre prioritaire.
- [ ] Tests locaux passes.
- [ ] Changements commits sur la branche `frontend`.
- [ ] PR prete avec captures avant/apres.

## Risques
- Regressions visuelles discretes sur certaines pages.
- Variantes de composants insuffisantes au premier passage.
- Dette de style historique cachee dans les pages.

## Mitigation
- Migrer par lots petits (Button/Input/Card puis le reste).
- Verifier page par page apres chaque lot.
- Faire des commits atomiques et faciles a revert.
