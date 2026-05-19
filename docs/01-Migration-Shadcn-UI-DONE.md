# 01 - Migration Shadcn UI (TERMINEE)

> Branche: `frontend` | PR: https://github.com/Health-AI-Project/health-next/pull/7

## Ce qui a ete fait

### Composants Shadcn installes (14)
button, card, checkbox, dialog, form, input, label, progress, select, skeleton, table, tabs, badge, toaster

### Migrations effectuees
- `sidebar.tsx` : `<select>` natif → Shadcn Select + tokens CSS (`bg-sidebar-background`, etc.)
- `nutrition-result-table.tsx` : `<table>` natif → Shadcn Table
- `signup-step.tsx` : import toast standardise via `@/components/ui/toaster`
- 6 wizard steps : navigation factorisee dans `WizardNavigation`

### Refactoring
- `WizardNavigation` : composant reutilisable pour les 6 wizard steps
- `SummaryCard` : composant local dans summary-step pour les 4 cartes recap
- `getChartTooltipStyle()` : style tooltip extrait dans chart-card
- `variant="premium"` : variante Button avec gradient
- Harmonisation `focus-visible:` sur tous les composants interactifs

### Qualite
- `npm run lint` : 0 erreur, 0 warning
- `npm run build` : 0 erreur TypeScript
- `npm run test` : 6/8 (2 echecs = backend absent, pas une regression)

### Exceptions documentees
- `meal-uploader.tsx` : `<input>` natif requis par react-dropzone
- `summary-step.tsx` : `<ul>/<li>` natifs (HTML semantique pour accessibilite)
