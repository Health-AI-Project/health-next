# API REST + OpenAPI + Tests — État livrable L5

> Livrable L5 — Cahier des charges section IV.5
> *« Une API REST fonctionnelle devra être mise à disposition, offrant les principales opérations de consultation et de gestion des données (CRUD utilisateurs, alimentation, exercices, métriques). Cette API devra être sécurisée, testée et fournie avec une documentation complète au format OpenAPI. »*

---

## 1. Tâches #15 — API REST CRUD complète + sécurité

### 1.1 Routes implémentées côté ia-python

| Route | Méthodes | Description |
|---|---|---|
| `/api/v1/users` | GET, POST | Liste + création utilisateurs |
| `/api/v1/users/{id}` | GET, PATCH, DELETE | CRUD individuel |
| `/api/v1/nutrition` | GET, POST | Catalogue d'aliments + logs |
| `/api/v1/nutrition/log` | GET, POST | Logs nutrition par user |
| `/api/v1/measurements` | GET, POST | Mesures biométriques |
| `/api/v1/activities` | GET, POST | Activités quotidiennes |
| `/api/v1/exercises` | GET | Catalogue d'exercices |
| `/api/v1/workouts` | GET, POST | Sessions d'entraînement |
| `/api/v1/predictions` | POST, GET | IA — analyse images repas |
| `/api/v1/feedback` | POST | Feedback utilisateur sur prédictions |
| `/api/v1/analytics/summary` | GET | Stats globales |
| `/api/v1/etl/run`, `/etl/runs` | POST, GET | Pipeline ETL |
| `/api/v1/exports/{source}` | GET | Export JSON/CSV |
| `/api/v1/admin/*` | varies | ⭐ MSPR501 — admin (data-quality, runs, validation, datasets, analytics) |

Voir `ia-python/app/api/routes/` pour le code source.

### 1.2 Routes implémentées côté backend-hono (BFF)

| Route | Méthodes | Description |
|---|---|---|
| `/api/home` | GET | Données agrégées du dashboard utilisateur |
| `/api/user` | GET, POST | Profil utilisateur |
| `/api/me` | GET | Profil agrégé courant |
| `/api/nutrition/upload` | POST | Upload + analyse photo de plat |
| `/api/nutrition/history` | GET, PATCH | Historique nutrition |
| `/api/clients` | GET (Premium+) | Clients B2B |
| `/api/activity` | GET | Wger recommendations |
| `/api/coach` | GET, POST | Plans d'entraînement |
| `/api/generate-menu` | POST (Premium) | Génération de menu IA |
| `/api/stats/*` | GET | Historique poids/calories/macros |
| `/api/admin/*` | varies | ⭐ MSPR501 — proxy vers ia-python/api/v1/admin/* |

Voir `backend-hono/src/routes/` pour le code source.

### 1.3 Sécurité

| Couche | Mécanisme |
|---|---|
| Authentification utilisateur | Better Auth — sessions cookies HttpOnly avec `BETTER_AUTH_SECRET` (32 chars) |
| Authentification inter-services | `X-API-Key` partagée entre BFF Hono et FastAPI |
| Autorisation par tier | Middleware `premiumGuard('premium'|'premium_plus')` côté Hono |
| Autorisation admin | Triple check : middleware Next + hook `useAdminGuard` + check `role === 'admin'` côté BFF |
| CORS | Whitelist explicite (`CORS_ORIGINS` env var) |
| Rate limiting | Middleware Hono (`rateLimitMiddleware` actif sur les endpoints publics) |
| Validation des inputs | Pydantic côté FastAPI, Zod côté Hono |
| HTTPS | Géré par le reverse proxy en production (Caddy/Traefik) |
| Secrets | `.env` non versionné, `.env.example` documente les variables |

### 1.4 Codes HTTP utilisés

| Code | Usage |
|---|---|
| `200` | Succès (lecture, modification) |
| `201` | Création réussie |
| `204` | Succès sans contenu (suppression) |
| `400` | Requête invalide (validation échouée) |
| `401` | Non authentifié |
| `403` | Authentifié mais pas autorisé |
| `404` | Ressource introuvable |
| `409` | Conflit (unicité violée) |
| `429` | Rate limit dépassé |
| `502` | Service backend indisponible (proxy Hono) |
| `503` | Service en maintenance |

---

## 2. Tâche #16 — Documentation OpenAPI complète

### 2.1 Côté ia-python (FastAPI)

OpenAPI **généré automatiquement** depuis les annotations Pydantic. Accessible via :

- Swagger UI : <http://localhost:8000/docs>
- ReDoc : <http://localhost:8000/redoc>
- JSON brut : <http://localhost:8000/openapi.json>

Chaque endpoint a sa description, ses paramètres typés, ses exemples de réponse et les codes HTTP possibles. Les schémas Pydantic sont exposés dans la section `Schemas` de Swagger.

### 2.2 Côté backend-hono

Utilise `@hono/zod-openapi` + `@hono/swagger-ui` :

- Swagger UI : <http://localhost:3002/ui>
- JSON brut : <http://localhost:3002/doc>

Configuration dans `backend-hono/src/index.ts` :

```ts
app.doc('/doc', {
  openapi: '3.1.0',
  info: { version: '1.0.0', title: 'Nutrition AI API', ... },
  servers: [{ url: 'http://localhost:3002', description: 'Local' }],
});
app.get('/ui', swaggerUI({ url: '/doc' }));
```

### 2.3 Génération de clients

Une fois en production, on peut générer des clients TypeScript depuis l'OpenAPI :

```bash
# Côté health-next
npx openapi-typescript http://backend-hono/doc -o lib/types/api.ts

# Ou via orval pour des hooks React Query typés
npx orval --config orval.config.ts
```

C'est dans les perspectives post-MSPR501.

---

## 3. Tâche #17 — Tests API

### 3.1 Tests existants côté ia-python

```
ia-python/tests/
├── api/                            # Tests d'intégration
├── unit/                           # Tests unitaires
├── conftest.py                     # Fixtures pytest
├── test_etl_cleaning.py            # ETL — règles de nettoyage
└── test_security_and_analytics.py  # Sécurité + analytics
```

Lancement :

```bash
cd ia-python
pytest                                                 # tous les tests
pytest tests/test_etl_cleaning.py -v                   # ETL avec verbose
pytest tests/test_security_and_analytics.py            # Sécurité + analytics
pytest --cov=app --cov-report=html                     # Avec couverture HTML
```

### 3.2 Tests existants côté backend-hono

```
backend-hono/
├── test_endpoints.py        # Tests Python d'API endpoints
├── test_full_flow.py        # Test du parcours complet
└── test-db.js               # Test connexion DB
```

### 3.3 Tests existants côté health-next

```
health-next/e2e/
├── accessibility.spec.ts         # Axe-core sur pages user
├── admin-accessibility.spec.ts   # ⭐ Axe-core sur pages admin (MSPR501)
├── admin.spec.ts                 # ⭐ Parcours admin e2e (MSPR501)
├── auth-flow.spec.ts             # Flow d'auth
├── dashboard-mocked.spec.ts      # Dashboard avec mocks
├── pages.spec.ts                 # Smoke tests pages publiques
└── user-journey.spec.ts          # Parcours utilisateur critique
```

Lancement :

```bash
cd health-next
npm run test              # 67 tests Playwright (user + admin)
npm run test:a11y         # Tests a11y uniquement
npm run test:a11y:report  # Génère le rapport JSON
```

### 3.4 Couverture cible vs réelle

| Module | Cible | Réel | Statut |
|---|---|---|---|
| Routes admin ia-python | 70% | ~50% | À compléter (tests unitaires des handlers) |
| ETL cleaning ia-python | 80% | ~85% | ✅ OK |
| Sécurité (auth, RBAC) | 90% | ~80% | ⚠️ Quelques edge cases manquent |
| Pages admin health-next | 80% | ~75% (e2e) | ✅ OK |
| A11y axe-core | 100% pages | 100% | ✅ OK |

### 3.5 Tests à ajouter (perspectives)

- Tests de **charge** sur les endpoints analytics (Locust ou k6) — non bloquant MSPR501
- Tests **mutation testing** (mutmut côté Python) pour valider la qualité des tests
- Tests de **contrat** entre Hono et FastAPI (Pact ou équivalent) — utile pour le découplage

---

## 4. État livrable

| Sous-tâche | Statut | Preuve |
|---|---|---|
| API CRUD utilisateurs | ✅ | `app/api/routes/users.py` |
| API CRUD alimentation | ✅ | `app/api/routes/nutrition.py` |
| API CRUD exercices | ✅ | `app/api/routes/exercises.py` |
| API CRUD métriques | ✅ | `app/api/routes/measurements.py`, `activities.py`, `workouts.py` |
| API admin MSPR501 | ✅ | `app/api/routes/admin.py` + `src/routes/admin.ts` |
| Sécurité (auth + rate limit + RBAC) | ✅ | Better Auth + middlewares Hono + `require_api_key` FastAPI |
| Documentation OpenAPI | ✅ | `:8000/docs` + `:3002/ui` |
| Tests unitaires | ✅ partiel | `tests/` côté Python + Playwright côté front |
| Tests d'intégration | ✅ partiel | `test_full_flow.py` + e2e Playwright |

Conformité au livrable L5 : **complète pour le périmètre MSPR501**.
