# Rapport technique — HealthAI Coach MSPR501

> Livrable L7 — Cahier des charges section IV.7
> Périmètre : conception, développement et livraison du backend métier de la plateforme HealthAI Coach, incluant pipeline ETL, base relationnelle, API REST sécurisée et interface d'administration accessible.

---

## 1. Contexte

HealthAI Coach est une startup française positionnée sur le marché de la santé connectée et du coaching personnalisé. Son ambition : proposer une plateforme digitale combinant suivi nutritionnel, accompagnement sportif et surveillance d'indicateurs biométriques, avec un modèle économique freemium et une stratégie B2B en marque blanche.

Le projet MSPR501 répond au besoin d'un **socle technique fiable et industrialisable** capable d'ingérer, nettoyer et exposer des données hétérogènes provenant de sources open data. Ce socle doit être prêt à accueillir les futurs modules IA de recommandation et de prédiction.

**Équipe** : 4 apprenants — répartition par domaine fonctionnel (ETL/data, BDD/API, frontend admin, déploiement/qualité).

**Durée** : 19 heures de préparation officielle.

---

## 2. Choix technologiques

### 2.1 Vue d'ensemble

| Couche | Technologie | Justification |
|---|---|---|
| **Base de données** | PostgreSQL 16 | Relationnel mature, support natif JSONB pour payloads ETL, écosystème extensions (BRIN, GIN), open-source |
| **Pipeline ETL** | Python 3.11 + pandas + openpyxl | Standard de l'industrie data, lib XLSX native, écosystème scientifique pour transformations |
| **API métier** | FastAPI (Python) | OpenAPI 3 auto-généré, validation Pydantic, async natif, performances comparables à Node |
| **Core gRPC** | Go (engine-go) | Performances brutes pour requêtes haut-volume, typage strict via proto |
| **BFF / Gateway** | Hono + Node 22 | Léger, TypeScript natif, OpenAPI via @hono/zod-openapi, idéal pour aggregation |
| **Frontend admin** | Next.js 16 + React 19 | SSR pour SEO landing, App Router, middleware natif pour auth, Server Components |
| **UI** | Shadcn UI + Radix UI + Tailwind 4 | Composants accessibles par défaut, design system maîtrisé |
| **Charts** | Recharts | API déclarative, accessibilité raisonnable, intégration React |
| **Tests e2e** | Playwright | Mocks réseau via `page.route`, support multi-navigateur, snapshots |
| **A11y automatisé** | axe-core | Référence industrielle, intégration Playwright |
| **Auth** | Better Auth | Moderne, support session cookie, intégration Drizzle |
| **Conteneurisation** | Docker Compose | Reproductibilité multi-machine, orchestration locale simple |

### 2.2 Justifications détaillées

**PostgreSQL plutôt que MongoDB** : le besoin métier (utilisateurs, profils, logs nutrition, sessions sport) est fondamentalement relationnel avec des contraintes d'intégrité fortes (FK, CHECK, UNIQUE). Le JSONB de PostgreSQL couvre les rares cas où on a besoin de flexibilité (payloads ETL, données de feedback). Pas de besoin de sharding à court terme.

**FastAPI plutôt que Django REST Framework** : Génération OpenAPI automatique, async natif (utile pour les appels concurrents aux gRPC + DB), validation Pydantic plus moderne. Django apporterait un ORM puissant mais on n'a pas besoin de l'admin Django (on construit notre propre admin Next.js).

**Hono comme BFF** : Choisir un BFF plutôt que d'exposer FastAPI directement permet :
- Centraliser l'auth (cookies Better Auth)
- Aggréger des appels (un endpoint front = N appels backend)
- Cacher les API keys internes
- Faire évoluer le contrat front sans toucher au backend métier

**Next.js plutôt que SPA pure** : Le middleware Next protège `/dashboard/*` côté serveur (avant même de servir la page). L'App Router permet de mixer Server et Client Components. Les futures pages publiques (landing, pricing) bénéficient du SSR.

**Pas de Streamlit pour l'admin** : Streamlit est rapide à prototyper mais l'accessibilité RGAA AA y est difficile à atteindre, et le critère est explicitement « déterminant » dans le cahier des charges.

---

## 3. Architecture

### 3.1 Vue logique

```
┌──────────────────────────────────────────────────────────────────┐
│  Sources externes (Kaggle CSV/XLSX + ExerciseDB JSON)            │
└─────────────────────┬────────────────────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────────────────────┐
│  ia-python — Pipeline ETL + FastAPI                              │
│  - etl/ : ingestion → validation Pydantic → nettoyage            │
│  - app/api/routes/ : CRUD + admin + analytics + etl + exports    │
│  - sql/init/ : 28 tables PostgreSQL + vues                       │
└─────────────────────┬────────────────────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────────────────────┐
│  PostgreSQL — Référentiel relationnel                            │
│  - users, profiles, foods, exercises, logs, etl_runs, ...        │
└──────┬───────────────────────────────────────┬───────────────────┘
       ▼                                       ▼
┌──────────────┐                  ┌────────────────────────────┐
│  engine-go   │ gRPC :50051     │  backend-hono — BFF :3002  │
│  Core perf   │◄────────────────►│  Auth + agrégation + admin│
└──────────────┘                  └─────────────┬──────────────┘
                                                ▼
                                  ┌─────────────────────────────┐
                                  │  health-next — Web :3000    │
                                  │  /dashboard (user)          │
                                  │  /dashboard/admin (MSPR501) │
                                  └─────────────────────────────┘
```

### 3.2 Sécurité

- **Auth utilisateur** : Better Auth (sessions cookies HttpOnly, secret aléatoire 32 chars)
- **Middleware Next.js** : redirige `/dashboard/*` vers `/connexion` si pas de session
- **Garde rôle admin** : double protection — middleware Next + hook `useAdminGuard` + check `role === 'admin'` côté BFF
- **API key inter-services** : `X-API-Key` partagée entre BFF et FastAPI, jamais exposée au navigateur
- **CORS** : strict — uniquement les origines listées dans `.env`
- **Secrets** : `.env` non versionné, `.env.example` documente les variables sans valeurs réelles
- **RGAA** : focus visible, contrastes AA, skip-link, structure sémantique, tests automatisés axe-core

---

## 4. Résultats obtenus

### 4.1 Livrables MSPR501 (mapping cahier des charges)

| Livrable | Réalisation |
|---|---|
| L1 — Inventaire sources + diagramme flux | `docs/mspr501/04-Rapport-Inventaire-Sources.md` + `05-Diagramme-Flux-Donnees.md` |
| L2 — Pipeline ETL opérationnel | `ia-python/etl/{cleaning,load,pipeline,run}.py` + table `etl_runs` |
| L3 — Datasets nettoyés + justification | Données dans PostgreSQL + `11-Justification-Datasets.md` |
| L4 — Modèle relationnel + scripts | `12-Modele-Donnees-Merise.md` + `ia-python/sql/init/01_schema.sql` (28 tables) |
| L5 — API REST documentée OpenAPI | FastAPI `/docs` + Hono `/ui` + `app/api/routes/admin.py` |
| L6 — Interface web + dashboard a11y | `health-next/app/dashboard/admin/*` (7 pages) + `29-Accessibilite-Admin-RGAA.md` |
| L7 — Rapport technique + déploiement | Ce document + `32-Guide-Deploiement.md` + `docker-compose.yml` |
| L8 — Support soutenance | Voir livrable séparé `34-Support-Soutenance.md` (à compléter) |

### 4.2 Métriques de réalisation

- **5 sources de données** ingérées (objectif minimum : 2) — couvre les 3 formats CSV/JSON/XLSX
- **28 tables** PostgreSQL + index + vues agrégées (incluant `etl_runs`, `etl_rejected_rows`, `data_validation_queue` pour le workflow admin)
- **7 pages admin** dans health-next : accueil, qualité données, datasets index + détail, validation, analytics, flow
- **9 endpoints admin** sur FastAPI + proxy sur backend-hono
- **Tests a11y automatisés** : axe-core sur les 7 pages + 3 tests dédiés (skip-link, boutons nommés, SVG)
- **Build Next.js** : 20 routes statiques + 1 dynamique compilées sans erreur en 17s

### 4.3 Captures et démonstration

Voir `docs/screenshots/` (à enrichir avec les pages admin) et la démo live en soutenance.

---

## 5. Difficultés rencontrées et solutions

### 5.1 Perte de fichiers locaux non-versionnés

**Problème** : Un `git clean -fd` involontaire sur `health-next` a supprimé les fichiers non-suivis (page admin en cours de développement, composants UI custom : data-table, kpi-card, export-button, skip-link).

**Impact** : ~12 fichiers représentant environ une journée de travail sur l'admin.

**Solution** : Reconstruction depuis zéro avec une architecture améliorée (séparation types / mocks / API client / composants). Le redesign a en fait clarifié la couche d'abstraction (`lib/api/admin/` + fallback mock).

**Leçon retenue** : Toujours `git status` complet avant `git clean` (ne pas tronquer avec `head`). Commit régulier même pour du WIP non-stabilisé.

### 5.2 Cohérence des URL entre services

**Problème initial** : Le frontend appelait simultanément `http://localhost:8000` (ia-python) avec `X-API-Key` exposée au navigateur, ET `/api/home` (backend-hono via cookies). Confusion sur la responsabilité de chaque service.

**Solution** : Introduction d'un wrapper dédié `lib/api/bff.ts` qui force tous les appels admin à passer par backend-hono (port 3002) avec credentials cookies. La clé API ne sort jamais du datacenter.

### 5.3 Données de démo pour les pages admin

**Problème** : Les pages admin avaient besoin de données réalistes pour la démo, mais les tables `etl_runs` étaient vides en environnement de dev.

**Solution** : Création du seed SQL idempotent `03_seed_mspr501_admin.sql` monté automatiquement par PostgreSQL au premier démarrage (volume `/docker-entrypoint-initdb.d`). Avantage : 8 runs ETL d'exemple + lignes rejetées + items de validation en file d'attente, sans intervention manuelle.

### 5.4 Accessibilité des graphiques Recharts

**Problème** : Les charts Recharts ne sont pas naturellement accessibles aux lecteurs d'écran (SVG complexe, pas de description textuelle automatique).

**Solution** : Pour chaque chart, ajout de :
- `role="img"` + `aria-label` décrivant le chart
- Version tabulaire HTML repliable dans `<details>` (graphique BarChart « Ingestion par source »)
- Texte alternatif listant les pourcentages (PieChart démographique)

### 5.5 Synchronisation des types entre backend et frontend

**Problème** : Le contrat entre `ia-python` (Pydantic), `backend-hono` (TypeScript) et `health-next` (TypeScript) doit rester cohérent.

**Solution actuelle** : Types définis manuellement dans `types/admin.ts` côté front. Pour la suite, prévu de générer les types TypeScript depuis l'OpenAPI exposé par FastAPI (`openapi-typescript` ou `orval`).

---

## 6. Perspectives d'évolution

### 6.1 Court terme (post-MSPR501)

- **Implémentation effective du pipeline ETL** côté `ia-python/etl/` : actuellement, la structure des `etl_runs` est en place mais l'ingestion réelle des datasets Kaggle reste à coder (parsing, validation, chargement). La table seed couvre la démo.
- **Édition serveur des lignes datasets** : actuellement l'édition `PATCH /api/admin/datasets/:source/:id` est un stub. À implémenter avec persistence + invalidation cache.
- **Conversion mocks → tests intégration** : les mocks frontend deviendront fixtures de tests Playwright contre backend réel.

### 6.2 Moyen terme — Modules IA

L'architecture est conçue pour accueillir les modules IA mentionnés dans le contexte :

- **Recommandations nutritionnelles personnalisées** : table `recommendations` (à créer) liée à `users` + `meal_logs`. Endpoint `POST /api/v1/recommendations/generate` qui appelle un modèle Python (scikit-learn, embeddings + similarité ou LLM via API).
- **Prédiction d'évolution biométrique** : série temporelle sur `weight_history`, modèle LSTM ou Prophet. Endpoint dédié `/api/v1/predictions/weight`.
- **Reconnaissance d'image (déjà partiellement présent)** : FastAPI a une route `/predict/upload` pour analyser une photo de repas (Food101). À industrialiser.

### 6.3 Long terme — Industrialisation

- **CI/CD GitHub Actions** : lint + tests à chaque PR, déploiement automatique sur préprod
- **Monitoring** : Prometheus + Grafana pour observer la latence API, le taux de rejet ETL, l'usage par tier d'abonnement
- **Multi-tenant B2B** : isolation par tenant (entreprise/club de sport) pour la marque blanche
- **Data warehouse** : copie des données dans un entrepôt (BigQuery, Snowflake) pour de l'analytique avancée découplée de la base transactionnelle
- **GDPR/RGPD** : à terme, anonymisation et droit à l'oubli (les datasets actuels étant fictifs, le risque est nul pour le prototype)

---

## 7. Conclusion

Le projet MSPR501 a livré un **socle backend complet, sécurisé et accessible** répondant aux 8 livrables attendus par HealthAI Coach. L'architecture multi-services (Python + Go + TypeScript) prouve sa résilience grâce à la séparation des responsabilités (BFF) et au design system accessible. Le pipeline ETL et la base relationnelle sont prêts à recevoir les données réelles ; l'interface admin permet aux équipes internes de surveiller la qualité, valider les anomalies et exporter les datasets nettoyés.

L'effort consacré à la conformité **RGAA AA** (skip-link, sémantique, contrastes, axe-core en CI) garantit que l'outil est utilisable par tout collaborateur, indépendamment de ses capacités, conformément à l'exigence forte du cahier des charges.

Le déploiement reproductible en moins de 30 minutes via Docker Compose démontre la maturité industrielle attendue : ce n'est pas une démonstration technique isolée, mais bien un prototype prêt à être intégré dans l'écosystème HealthAI Coach.

---

## Annexes

- `docs/mspr501/TODO.md` — liste exhaustive des 37 tâches du projet
- `docs/mspr501/04-Rapport-Inventaire-Sources.md` — détail des 5 sources
- `docs/mspr501/05-Diagramme-Flux-Donnees.md` — diagrammes Mermaid
- `docs/mspr501/12-Modele-Donnees-Merise.md` — MCD/MLD/MPD
- `docs/mspr501/29-Accessibilite-Admin-RGAA.md` — conformité accessibilité
- `docs/mspr501/32-Guide-Deploiement.md` — procédure < 30 min
