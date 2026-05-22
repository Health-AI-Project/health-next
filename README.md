# health-next — Frontend HealthAI Coach

Interface web de la plateforme HealthAI Coach. Couvre :
- **Espace utilisateur** : inscription wizard, dashboard, nutrition, workouts, settings (MSPR502)
- **Espace admin** : qualité données, datasets, validation, analytics, flux (MSPR501)

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + TypeScript 5
- **Shadcn UI** (Radix + Tailwind 4) — composants accessibles WCAG AA
- **Better Auth** — sessions cookies HttpOnly
- **Recharts** — graphiques
- **Playwright** + **axe-core** — tests e2e + a11y
- **Zustand** — state global léger (wizard)

## Démarrage rapide

```bash
# Installation
npm install

# Dev
npm run dev          # http://localhost:3000

# Build production
npm run build && npm start

# Tests
npm run test         # Playwright e2e (57 tests)
npm run test:a11y    # axe-core sur toutes les pages
```

## Variables d'environnement

Créer `.env.local` à la racine :

```env
# Backend metier (FastAPI Python)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=dev-healthai-key

# BFF (Hono — gateway pour /api/admin/*)
NEXT_PUBLIC_BFF_URL=http://localhost:3002

# Toggle mocks admin (1 = utilise mocks même si backend up)
NEXT_PUBLIC_ADMIN_USE_MOCKS=0
```

## Structure

```
health-next/
├── app/                    # Routes Next.js (App Router)
│   ├── (landing)/          # Pages publiques
│   ├── connexion/          # Login
│   ├── inscription/        # Wizard 6 étapes
│   └── dashboard/
│       ├── analytics/      # User : graphs poids/calories/macros
│       ├── nutrition/      # User : upload + meal plan
│       ├── workouts/       # User : programme d'entraînement
│       ├── clients/        # B2B : liste clients (Premium+)
│       ├── settings/       # User : profil + objectifs
│       └── admin/          # ⭐ MSPR501 — espace admin
│           ├── data-quality/
│           ├── datasets/[source]/
│           ├── validation/
│           ├── analytics/
│           └── flow/
├── components/
│   ├── admin/              # Sidebar admin
│   ├── charts/             # Recharts wrappers
│   ├── dashboard/          # Layout, sidebar user
│   ├── ui/                 # Shadcn primitives + custom (data-table, kpi-card, etc.)
│   └── ...
├── lib/
│   ├── api/                # ⭐ Wrappers fetch (bff.ts + admin/)
│   ├── hooks/              # use-admin-guard, use-user-role, use-premium-status
│   ├── mocks/              # Fixtures de dev (mocks admin)
│   └── ...
├── types/                  # Types partagés (admin.ts)
├── e2e/                    # Tests Playwright
│   ├── accessibility.spec.ts
│   ├── admin-accessibility.spec.ts  # ⭐ MSPR501
│   └── ...
└── docs/
    ├── mspr501/            # ⭐ Livrables MSPR501 (37 docs)
    ├── mspr502/            # Anciens docs MSPR502
    └── livraison/          # Docs PDF benchmark/conduite changement
```

## MSPR501

Pour la livraison MSPR501 — Bloc E6.1 (création du backend métier), voir :

- **[`docs/mspr501/TODO.md`](docs/mspr501/TODO.md)** — index des 37 tâches
- **[`docs/mspr501/30-Rapport-Technique.md`](docs/mspr501/30-Rapport-Technique.md)** — rapport technique de synthèse
- **[`docs/mspr501/32-Guide-Deploiement.md`](docs/mspr501/32-Guide-Deploiement.md)** — guide déploiement < 30 min
- **[`docs/mspr501/29-Accessibilite-Admin-RGAA.md`](docs/mspr501/29-Accessibilite-Admin-RGAA.md)** — conformité RGAA AA

Branche de travail : `feat/mspr501` (à merger sur `main` à la fin).

## Architecture globale

Ce repo est l'un des 5 composants de HealthAI Coach :

```
Health-AI-project/
├── health-next/        ← vous êtes ici (frontend)
├── backend-hono/       ← BFF / gateway (port 3002)
├── ia-python/          ← FastAPI métier (port 8000)
├── engine-go/          ← gRPC core (port 50051)
└── flutter-ai/         ← App mobile (hors MSPR501)
```

Pour lancer la stack complète en local : `docker compose up -d` depuis le dossier parent (cf. guide de déploiement).
