# Guide de déploiement — HealthAI Coach

> Livrable L7 — Cahier des charges section IV.7 : *« un guide de déploiement détaillant la procédure de mise en œuvre (Docker/Docker Compose, variables d'environnement, prérequis logiciels) devra permettre à toute équipe technique de reproduire l'environnement et de lancer la solution en moins de trente minutes. »*

---

## 1. Prérequis logiciels

| Logiciel | Version minimale | Vérification |
|---|---|---|
| Docker Desktop | 24.x | `docker --version` |
| Docker Compose | v2.20+ | `docker compose version` |
| Git | 2.30+ | `git --version` |
| 8 Go RAM disponible | — | Recommandé pour faire tourner les 4 services |

**Ports utilisés** (libres impérativement) :
- `3000` — health-next (frontend admin web)
- `3002` — backend-hono (API gateway BFF)
- `5432` — PostgreSQL
- `8000` — ia-python (FastAPI métier)

---

## 2. Cloner les dépôts

L'application HealthAI Coach est composée de 5 dépôts indépendants sous l'organisation GitHub <https://github.com/Health-AI-Project>.

```bash
# Dossier parent
mkdir -p Health-AI-project && cd Health-AI-project

# Cloner les 4 repos nécessaires au backend MSPR501
git clone https://github.com/Health-AI-Project/ia-python.git
git clone https://github.com/Health-AI-Project/backend-hono.git
git clone https://github.com/Health-AI-Project/engine-go.git
git clone https://github.com/Health-AI-Project/health-next.git

# Optionnel — application mobile, hors périmètre MSPR501
git clone https://github.com/Health-AI-Project/flutter-ai.git
```

**Pour la livraison MSPR501** : se placer sur la branche `feat/mspr501` de chaque repo modifié.

```bash
cd ia-python && git checkout feat/mspr501 && cd ..
cd backend-hono && git checkout feat/mspr501 && cd ..
cd health-next && git checkout feat/mspr501 && cd ..
```

---

## 3. Configuration des variables d'environnement

À la racine de `Health-AI-project/`, copier `.env.example` en `.env` :

```bash
cp .env.example .env
```

Variables à ajuster **avant la première mise en production** :

| Variable | Description | Valeur par défaut |
|---|---|---|
| `DB_PASSWORD` | Mot de passe PostgreSQL | `healthai_dev_password` |
| `IA_API_KEY` | Clé partagée entre BFF et FastAPI | `dev-healthai-key` |
| `BETTER_AUTH_SECRET` | Secret session Better Auth (32+ chars) | À générer |

Pour générer un secret aléatoire :

```bash
openssl rand -hex 32
```

---

## 4. Lancement de la stack

À la racine de `Health-AI-project/` :

```bash
docker compose up -d --build
```

Première exécution : ~5-8 minutes (téléchargement images + build).

### 4.1 Vérifier l'état des services

```bash
docker compose ps
```

Tous les services doivent être `running` ou `healthy` :
- `healthai-postgres` (healthy)
- `healthai-ia-python` (healthy)
- `healthai-backend-hono` (running)
- `healthai-health-next` (running)

### 4.2 Voir les logs

```bash
docker compose logs -f                    # tous services
docker compose logs -f ia-python          # un service
```

### 4.3 Healthchecks manuels

```bash
curl http://localhost:8000/health          # ia-python — doit renvoyer database.ready=true
curl http://localhost:3002/                # backend-hono — renvoie un message status
curl http://localhost:3000/                # health-next — page landing
```

---

## 5. Initialisation des données

La base PostgreSQL est automatiquement initialisée au premier démarrage avec les scripts montés depuis `ia-python/sql/init/` :

1. `01_schema.sql` — création des 28 tables + index + vues
2. `02_seed.sql` — données métier de base (allergies, goals, etc.)
3. `03_seed_mspr501_admin.sql` — **données démo MSPR501** : 8 runs ETL, lignes rejetées, file de validation

**Vérifier le seed admin** :

```bash
docker compose exec postgres psql -U healthai -d healthai -c "SELECT COUNT(*) FROM etl_runs;"
# Doit retourner 8

docker compose exec postgres psql -U healthai -d healthai -c "SELECT COUNT(*) FROM data_validation_queue WHERE status = 'PENDING';"
# Doit retourner 2
```

---

## 6. Création d'un compte admin

L'admin doit exister en base. Deux options :

### Option A — Création manuelle (recommandée pour la démo)

```bash
# 1. Créer un user via le formulaire d'inscription /inscription
# 2. Promouvoir en admin via SQL :
docker compose exec postgres psql -U healthai -d healthai -c \
  "UPDATE \"user\" SET \"subscriptionStatus\"='PREMIUM_PLUS' WHERE email='votre.email@example.com';"
```

### Option B — Mode démo (sans backend admin obligatoire)

Au navigateur, activer le bypass admin dans la console :

```javascript
localStorage.setItem('health_ai_demo_admin', '1');
location.reload();
```

Le composant `useUserRole` reconnaîtra cet override et donnera accès à `/dashboard/admin`.

---

## 7. Accéder à l'interface admin

1. Ouvrir <http://localhost:3000>
2. S'inscrire ou se connecter (compte admin promu)
3. Naviguer vers <http://localhost:3000/dashboard/admin>
4. Les 5 sections doivent être accessibles : Qualité, Datasets, Validation, Analytics, Flow

---

## 8. Documentation API

Une fois la stack démarrée :

| Endpoint | URL |
|---|---|
| Swagger UI ia-python | <http://localhost:8000/docs> |
| OpenAPI JSON ia-python | <http://localhost:8000/openapi.json> |
| Swagger UI backend-hono | <http://localhost:3002/ui> |
| OpenAPI JSON backend-hono | <http://localhost:3002/doc> |

---

## 9. Arrêt et nettoyage

```bash
# Arrêt simple (conserve les données)
docker compose down

# Arrêt + suppression du volume PostgreSQL (RESET COMPLET)
docker compose down -v

# Reconstruction forcée d'une image (après changement de code)
docker compose up -d --build ia-python
```

---

## 10. Troubleshooting

### 10.1 « Port already in use »

Un port (3000, 3002, 5432, 8000) est déjà occupé. Solutions :

```bash
# Sur Windows
netstat -ano | findstr :3000
# Tuer le processus avec son PID via Task Manager

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

Ou changer le port dans `.env` (ex: `NEXT_PORT=3001`).

### 10.2 « database is not ready »

PostgreSQL n'est pas encore healthy. Attendre 10-20 secondes puis :

```bash
docker compose restart ia-python backend-hono health-next
```

### 10.3 Pages admin vides

L'interface utilise un fallback mock automatique si l'API échoue. Pour diagnostiquer :

1. Ouvrir DevTools → Network
2. Vérifier que `/api/admin/data-quality` retourne 200
3. Sinon, vérifier les logs backend-hono : `docker compose logs backend-hono | grep admin`

### 10.4 « IA service unreachable »

backend-hono ne joint pas ia-python. Vérifier :

```bash
docker compose exec backend-hono wget -qO- http://ia-python:8000/health
```

Si KO, recréer le réseau :

```bash
docker compose down && docker compose up -d
```

### 10.5 Build Next.js échoue

```bash
# Nettoyer le cache
docker compose down
docker volume prune -f
docker compose build --no-cache health-next
```

---

## 11. Récapitulatif chronologique (objectif < 30 min)

| Étape | Durée estimée |
|---|---|
| Cloner les 4 repos | 1-2 min |
| `cp .env.example .env` + ajuster secrets | 2-3 min |
| `docker compose up -d --build` (1ère fois) | 8-12 min |
| Attendre healthchecks | 1-2 min |
| Vérifier `/health` des services | 1 min |
| Promouvoir un compte admin OU activer mode démo | 2-3 min |
| Naviguer sur `/dashboard/admin` | 1 min |
| **Total** | **15-25 min** |

Pour les itérations suivantes (`docker compose up -d` sans `--build`), le démarrage prend environ **30 secondes**.

---

## 12. Production — étapes complémentaires

À ne **pas** négliger pour un déploiement réel :

1. Générer des secrets aléatoires solides pour `BETTER_AUTH_SECRET` et `IA_API_KEY`
2. Désactiver les seeds de démo (`03_seed_mspr501_admin.sql` à retirer)
3. Configurer HTTPS via reverse proxy (Caddy/Traefik/Nginx) devant les services
4. Activer la rotation des logs Docker (`max-size`, `max-file`)
5. Backups réguliers du volume `postgres_data`
6. Monitoring (Grafana + Prometheus ou équivalent) — non couvert dans MSPR501
