# 06 - Exporter un rapport d'accessibilite WCAG/RGAA AA

> Branche: `frontend/a11y-report`

## Objectif
Generer et exporter un rapport d'accessibilite WCAG/RGAA AA exploitable comme livrable. Actuellement axe-core tourne en CI mais le rapport n'est pas genere ni exporte.

## Contexte technique
- Tests existants : `e2e/accessibility.spec.ts` avec `@axe-core/playwright`
- Pages testees : `/`, `/inscription`, `/dashboard`, `/dashboard/nutrition`
- Tags WCAG verifies : `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
- Reporter actuel : HTML Playwright (`playwright-report/`) + list console
- CI : GitHub Actions uploade `playwright-report/` en artifact (retention 7 jours)
- Resultats actuels : 6/8 tests passent (2 echecs = backend absent)

## Checklist

### 1) Ameliorer la collecte des resultats axe-core
- [ ] Modifier `accessibility.spec.ts` pour sauvegarder les resultats complets d'axe (violations, passes, incomplete, inapplicable) dans un fichier JSON
- [ ] Generer un fichier JSON par page testee (ex: `a11y-report-landing.json`, `a11y-report-dashboard.json`)
- [ ] Inclure les metadonnees : date, URL, nombre de regles testees, nombre de violations

### 2) Generer le rapport HTML
- [ ] Creer un script `scripts/generate-a11y-report.ts` (ou `.js`) qui lit les JSON et genere un rapport HTML
- [ ] Le rapport doit contenir :
  - Resume global (nombre de pages, taux de conformite, date du test)
  - Tableau des violations par severite (critical, serious, moderate, minor)
  - Pour chaque violation : description, selecteur CSS, critere WCAG concerne, lien vers la documentation
  - Liste des tests passes (preuves de conformite)
  - Mapping WCAG → RGAA (les criteres se correspondent)
- [ ] Styler le rapport pour qu'il soit presentable comme livrable

### 3) Ajouter les pages manquantes au test
- [ ] Ajouter `/dashboard/analytics` quand la page sera creee
- [ ] Ajouter `/dashboard/settings` quand la page sera creee
- [ ] Verifier que toutes les pages publiques et privees sont couvertes

### 4) Integrer dans le CI
- [ ] Ajouter une etape dans `.github/workflows/ci.yml` pour generer le rapport apres les tests
- [ ] Uploader le rapport HTML comme artifact GitHub Actions
- [ ] Optionnel : faire echouer le CI si des violations critical/serious sont detectees (deja le cas)

### 5) Script npm
- [ ] Ajouter un script `npm run test:a11y:report` qui lance les tests + genere le rapport en une commande
- [ ] Le rapport doit etre genere dans un dossier dedie (ex: `a11y-report/`)
- [ ] Ajouter `a11y-report/` au `.gitignore`

### 6) Validation
- [ ] Le rapport HTML est lisible et complet
- [ ] Le rapport est genere automatiquement en CI
- [ ] Le rapport contient le mapping WCAG AA → RGAA
- [ ] Les violations connues (backend absent) sont documentees dans le rapport
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
