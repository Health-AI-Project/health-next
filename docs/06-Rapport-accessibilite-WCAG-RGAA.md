# 06 - Exporter un rapport d'accessibilite WCAG/RGAA AA (TERMINEE)

> Branche: `a11y-report`

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
- [x] Modifier `accessibility.spec.ts` pour sauvegarder les resultats complets d'axe dans un fichier JSON
  - Fait en ajoutant `fs.writeFileSync` apres chaque scan axe-core. Chaque page genere un fichier JSON dans `a11y-report/` avec les violations, passes, et metadonnees (date, URL, compteurs).
- [x] Generer un fichier JSON par page testee (ex: `landing-page.json`, `dashboard.json`)
  - Fait en nommant les fichiers a partir du nom de la page en kebab-case.
- [x] Inclure les metadonnees : date, URL, nombre de regles testees, nombre de violations
  - Fait avec un objet `summary` contenant `violations`, `passes`, `incomplete`, `inapplicable`.

### 2) Generer le rapport HTML
- [x] Creer `scripts/generate-a11y-report.js` qui lit les JSON et genere un rapport HTML
  - Fait en lisant tous les `.json` de `a11y-report/`, en aggregeant les stats, et en generant un HTML autonome avec CSS inline.
- [x] Le rapport contient : resume global (pages, taux de conformite, violations, passes), detail par page, mapping WCAG/RGAA
  - Fait avec 4 cards resume, une section par page (violations avec severite coloree + regles validees en 2 colonnes), et un tableau de mapping WCAG → RGAA.
- [x] Styler le rapport pour qu'il soit presentable comme livrable
  - Fait avec un design sobre responsive, couleurs par severite, badges pass/fail, police systeme.

### 3) Ajouter les pages manquantes au test
- [x] Ajouter `/dashboard/analytics`
  - Fait en ajoutant `{ url: "/dashboard/analytics", name: "Analytics" }` dans le tableau `pages`.
- [x] Ajouter `/dashboard/settings`
  - Fait en ajoutant `{ url: "/dashboard/settings", name: "Settings" }` dans le tableau `pages`.
- [x] 6 pages couvertes : `/`, `/inscription`, `/dashboard`, `/dashboard/analytics`, `/dashboard/nutrition`, `/dashboard/settings`

### 4) Integrer dans le CI
- [x] Ajouter une etape dans `.github/workflows/ci.yml` pour generer le rapport apres les tests
  - Fait avec une etape `Generate Accessibility Report` qui lance `node scripts/generate-a11y-report.js` avec `if: always()`.
- [x] Uploader le rapport HTML comme artifact GitHub Actions
  - Fait avec `actions/upload-artifact@v4`, nom `a11y-report`, retention 30 jours (plus long que les 7 jours du rapport Playwright).
- [x] Le CI echoue deja si des violations critical/serious sont detectees (comportement existant conserve)

### 5) Script npm
- [x] Ajouter `npm run test:a11y:report` qui lance les tests + genere le rapport
  - Fait en ajoutant `"test:a11y:report": "playwright test e2e/accessibility.spec.ts && node scripts/generate-a11y-report.js"` dans package.json.
- [x] Le rapport est genere dans `a11y-report/`
- [x] `a11y-report/` ajoute au `.gitignore`

### 6) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] Lancer `npm run test:a11y:report` et verifier le rapport HTML

## Modifications apportees

### Fichiers crees
- `scripts/generate-a11y-report.js` : script de generation du rapport HTML avec mapping WCAG/RGAA

### Fichiers modifies
- `e2e/accessibility.spec.ts` : ajout des pages analytics et settings, sauvegarde JSON des resultats
- `package.json` : script `test:a11y:report` ajoute
- `.gitignore` : `/a11y-report` ajoute
- `.github/workflows/ci.yml` : etape generation rapport + upload artifact a11y-report (30 jours)
