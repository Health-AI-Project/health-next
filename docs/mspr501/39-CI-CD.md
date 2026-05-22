# CI/CD GitHub Actions — MSPR501

> Tâche transverse — Démontrer la « logique industrielle » attendue par le cahier des charges (mentionnée 4× dans le PDF).

---

## 1. Workflows par repo

Chaque repo a son propre workflow CI dans `.github/workflows/ci.yml`. Branches déclenchant la CI :
- `main` — protection stricte (lint + tests + build doivent passer)
- `develop` — branche d'intégration
- `feat/mspr501` — branche de livraison MSPR501

### 1.1 health-next — `health-next/.github/workflows/ci.yml`

Étapes :
1. Checkout
2. Node.js 20 + cache npm
3. `npm ci`
4. Install Playwright Chromium
5. **Build Next.js** (`npm run build`)
6. **Tests e2e Playwright** (57 user + 9 admin + 7 a11y)
7. Génération du rapport accessibilité
8. Upload artefacts : `playwright-report/` et `a11y-report/` (rétention 7-30 jours)

Durée typique : ~8 minutes.

### 1.2 ia-python — `ia-python/.github/workflows/ci.yml`

Étapes :
1. Checkout
2. Python 3.11 + cache pip
3. Service PostgreSQL 16 démarré en sidecar
4. `pip install -r requirements.api.txt`
5. **Lint ruff** (non-bloquant)
6. **Init schéma** : exécute les 4 scripts SQL `init/`
7. **pytest** avec couverture
8. **Upload coverage.xml** (rétention 30 jours)
9. **Audit sécurité** via `scripts/verify_security.py`

Durée typique : ~5 minutes.

### 1.3 backend-hono — `backend-hono/.github/workflows/ci.yml`

Étapes :
1. Checkout
2. pnpm 9 + Node.js 22
3. `pnpm install --frozen-lockfile`
4. **TypeScript check** (`tsc --noEmit`)
5. **Build** (`pnpm run build`)
6. **Vérification OpenAPI** : démarre le serveur et curl `/doc`

Durée typique : ~3 minutes.

---

## 2. Couverture des règles métier

| Règle | health-next | backend-hono | ia-python |
|---|---|---|---|
| Lint | ✅ ESLint | ⚠️ via tsc | ✅ ruff |
| Type check | ✅ tsc | ✅ tsc | ✅ mypy (à ajouter) |
| Build | ✅ Next.js | ✅ tsc | — (pas de build dist) |
| Tests unitaires | — (peu pertinents) | ⚠️ partiel | ✅ pytest |
| Tests e2e | ✅ Playwright | ⚠️ via tests Python | — |
| Tests a11y | ✅ axe-core | — | — |
| Couverture publiée | ✅ artefact | — | ✅ coverage.xml |
| Audit sécurité | ⚠️ via npm audit | ⚠️ via pnpm audit | ✅ script dédié |

---

## 3. Protections de branche recommandées (GitHub Settings)

Sur `main` de chaque repo :
- ✅ Require pull request reviews (1 reviewer minimum)
- ✅ Require status checks to pass before merging
  - Cocher le job `test` / `build` du workflow CI
- ✅ Require branches to be up to date before merging
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

Sur `develop` :
- ✅ Require status checks (allow direct push pour intégration rapide)

---

## 4. Déploiement (CD) — perspectives

**Hors périmètre MSPR501** mais préparé pour la suite :

### 4.1 Préprod automatique sur `develop`

```yaml
deploy-preprod:
  needs: test
  if: github.ref == 'refs/heads/develop'
  runs-on: ubuntu-latest
  steps:
    - name: Build Docker image
      run: docker build -t healthai/${{ github.repository }}:${{ github.sha }} .
    - name: Push to registry
      run: docker push healthai/${{ github.repository }}:${{ github.sha }}
    - name: Trigger preprod deploy
      run: curl -X POST $PREPROD_WEBHOOK
```

### 4.2 Production manuelle via tag

```yaml
deploy-prod:
  if: startsWith(github.ref, 'refs/tags/v')
  # ... idem mais sur tag v* uniquement
  environment: production
  # GitHub Environments protègent avec approval manuel
```

### 4.3 Outils pressentis

- **Hébergement** : VPS Hetzner ou DigitalOcean Droplet + Docker Compose
- **Reverse proxy + HTTPS** : Caddy 2 (Let's Encrypt automatique)
- **Registry images** : GitHub Container Registry (gratuit pour repos publics)
- **Secrets prod** : GitHub Environments + AWS Secrets Manager à terme
- **Monitoring** : Grafana + Prometheus + Loki

---

## 5. Cron jobs ETL (planifié)

Pour le pipeline ETL en production, prévu :

```yaml
# .github/workflows/etl-schedule.yml dans ia-python
name: ETL Schedule
on:
  schedule:
    - cron: "0 2 * * *"  # Tous les jours à 2h UTC
  workflow_dispatch:      # Permet déclenchement manuel

jobs:
  etl:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger ETL via webhook
        run: |
          curl -X POST $IA_SERVICE_URL/api/v1/etl/run \
            -H "X-API-Key: $IA_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"include_api": true}'
```

Pour MSPR501, cette planification est mentionnée mais pas active — l'admin déclenche manuellement via l'UI.

---

## 6. Lancement local des checks CI

Pour reproduire la CI en local avant push :

```bash
# health-next
cd health-next
npm ci && npm run build && npm run test

# ia-python
cd ia-python
pip install -r requirements.api.txt
pytest

# backend-hono
cd backend-hono
pnpm install && pnpm exec tsc --noEmit && pnpm run build
```

Si tout passe en local, la CI GitHub passera aussi.

---

## 7. Statut actuel

- [x] `health-next/.github/workflows/ci.yml` (préexistant, branche `feat/mspr501` ajoutée)
- [x] `ia-python/.github/workflows/ci.yml` (nouveau, MSPR501)
- [x] `backend-hono/.github/workflows/ci.yml` (nouveau, MSPR501)
- [ ] CD préprod automatique sur `develop` — perspective
- [ ] CD prod manuel sur tag `v*` — perspective
- [ ] ETL planifié via GitHub Actions — perspective
