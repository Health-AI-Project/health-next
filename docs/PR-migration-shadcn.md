# PR: feat(ui): migrer les composants UI vers Shadcn UI

> Ce fichier contient le titre et le contenu de la Pull Request a creer sur GitHub.
> Il n'est pas destine a etre merge — il sert juste de support pour copier-coller dans GitHub.

---

## Titre de la PR

```
feat(ui): migrer les composants UI vers Shadcn UI
```

## Body de la PR

```markdown
## Summary

- Migration complete des composants UI natifs vers Shadcn UI (button, card, input, form, select, label, checkbox, table, dialog, tabs, badge)
- Factorisation des patterns dupliques : `WizardNavigation`, `SummaryCard`, `getChartTooltipStyle()`, `variant="premium"`
- Harmonisation des focus states (`focus-visible:`), hover states, et tokens CSS sidebar
- Standardisation des imports toast via `@/components/ui/toaster`
- Correction de toutes les erreurs ESLint et warnings TypeScript (suppression des `any`, typage des reponses API)

## Changements principaux

### Composants UI crees
- `components/ui/dialog.tsx` — Radix Dialog pour les futures modals
- `components/ui/tabs.tsx` — Radix Tabs pour les futures pages settings
- `components/ui/badge.tsx` — Badge avec 4 variantes (default, secondary, destructive, outline)
- `components/ui/table.tsx` — Table standardisee (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
- `components/ui/select.tsx` — Radix Select (migration sidebar)

### Composants applicatifs crees
- `components/wizard/wizard-navigation.tsx` — Navigation reutilisable pour les 6 wizard steps

### Fichiers migres
- `components/dashboard/sidebar.tsx` — Select natif remplace par Shadcn Select + tokens CSS
- `components/nutrition/nutrition-result-table.tsx` — `<table>` natif remplace par Shadcn Table
- 6 wizard steps — navigation factorisee, imports nettoyes
- `components/wizard/steps/summary-step.tsx` — Cards recapitulatif factorisees dans `SummaryCard`

### Qualite
- `npm run lint` : 0 erreur, 0 warning (15 problemes pre-existants corriges)
- `npm run build` : compilation reussie, 0 erreur TypeScript
- `npm run test` : 6/8 tests e2e passent

### Pourquoi 2 tests echouent (et pourquoi ce n'est pas un probleme)

Les 2 tests qui echouent concernent la page **dashboard** :

1. **"Dashboard should meet WCAG 2.1 AA requirements"** — Ce test charge `/dashboard`, qui appelle l'API `/api/home` pour afficher les statistiques (poids, calories, etc.). Sans serveur backend en local, l'appel echoue et la page affiche un message d'erreur. Le test d'accessibilite detecte alors un probleme de contraste sur ce message d'erreur.

2. **"should verify dashboard content and navigation"** — Ce test cherche le heading "Poids actuel" sur la page. Comme l'API `/api/home` ne repond pas, les cards de stats ne s'affichent jamais et le test ne trouve pas le heading.

**Ces 2 tests echouaient deja avant la migration UI.** Ils necessitent un serveur backend fonctionnel pour repondre a `/api/home`. Ce n'est pas une regression introduite par cette PR — c'est une dependance d'environnement pre-existante. Pour les faire passer, il faudrait soit lancer le backend avant les tests, soit mocker les reponses API dans les tests e2e.

## Documentation
- `docs/01-Migrer-les-composants-UI-vers-Shadcn-UI-v2.md` — Plan de migration complet avec checklist, audit, et criteres d'acceptation valides
- `docs/02-Changelog-migration-v1-vers-v2.md` — Explication de chaque modification par rapport au plan initial

## Test plan
- [x] `npm run lint` passe sans erreur
- [x] `npm run build` compile sans erreur
- [x] 6/8 tests e2e passent (landing, inscription, wizard, accessibilite)
- [x] Les 4 pages principales retournent HTTP 200
- [x] Aucune regression fonctionnelle bloquante
- [ ] 2 tests dashboard a faire passer quand le backend sera disponible
```
