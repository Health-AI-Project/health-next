# Stratégie de migrations BDD

> Livrable L4 — Cahier des charges section IV.4 : *« scripts SQL de création et de migration permettant de déployer la base de manière automatisée. L'objectif est de fournir une structure pérenne, versionnée et reproductible dans n'importe quel environnement. »*

---

## 1. Approche actuelle — scripts SQL versionnés

Pour le périmètre MSPR501, nous utilisons une approche **fichiers SQL numérotés** stockés dans `ia-python/sql/init/`. Cette approche est simple, lisible, et compatible avec le mécanisme natif de PostgreSQL via Docker (volume monté sur `/docker-entrypoint-initdb.d`).

### 1.1 Convention de nommage

```
sql/init/
├── 01_schema.sql                  ← Création des 28 tables + index de base
├── 02_seed.sql                    ← Données métier de base (allergies, goals)
├── 03_seed_mspr501_admin.sql      ← Données démo MSPR501 (runs ETL, validation queue)
└── 04_views_mspr501.sql           ← Vues agrégées + index admin
```

**Règles** :
- Préfixe numérique à 2 chiffres pour ordre d'exécution
- Verbe en snake_case pour décrire l'action
- Idempotence via `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE VIEW`, `INSERT ... WHERE NOT EXISTS`

### 1.2 Mécanisme de bootstrap

Le `docker-compose.yml` global monte le dossier en lecture seule sur le conteneur postgres :

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./ia-python/sql/init:/docker-entrypoint-initdb.d:ro
```

PostgreSQL exécute automatiquement tous les `.sql` du dossier au premier démarrage (création de la base). Les exécutions suivantes sont **idempotentes** : aucune destruction de données.

### 1.3 Avantages de cette approche

- ✅ Aucune dépendance Python supplémentaire (Alembic ne tournerait que dans l'environnement dev)
- ✅ Réutilisable hors-Docker (n'importe quel `psql -f`)
- ✅ Lecture humaine directe — pas de format binaire
- ✅ Versionnable simplement dans git
- ✅ Reproductible identique en dev/staging/prod

### 1.4 Limitations connues

- ❌ Pas de rollback automatique (il faut écrire un script `DOWN` séparé si besoin)
- ❌ Pas de détection automatique de drift entre code et schéma
- ❌ Limité au mode bootstrap — pas adapté pour migrer une base déjà peuplée

---

## 2. Approche prévue pour la production — Alembic

Pour la mise en production avec des données réelles, nous prévoyons de migrer vers **Alembic** (la lib de référence pour SQLAlchemy). Cette migration est mentionnée dans le rapport technique (`30-Rapport-Technique.md` section 6.1).

### 2.1 Pourquoi Alembic

- Détection automatique de drift via `alembic revision --autogenerate` comparé au modèle SQLAlchemy
- Versions UP/DOWN — rollback supporté
- Historique tracé dans la table `alembic_version`
- Migrations Python (logique conditionnelle, transformations de données pendant la migration)
- Standard de l'écosystème FastAPI/SQLAlchemy

### 2.2 Structure cible

```
ia-python/
├── alembic/
│   ├── versions/
│   │   ├── 001_initial_schema.py
│   │   ├── 002_add_etl_tables.py
│   │   ├── 003_add_validation_queue.py
│   │   └── ...
│   ├── env.py
│   ├── script.py.mako
│   └── README
├── alembic.ini
└── app/
    └── models/
        └── domain.py        ← Source de vérité pour `--autogenerate`
```

### 2.3 Workflow en production

```bash
# Créer une nouvelle migration depuis un changement de modèle
alembic revision --autogenerate -m "add user.timezone column"

# Reviewer la migration générée dans alembic/versions/

# Appliquer en dev
alembic upgrade head

# Rollback si besoin
alembic downgrade -1

# Statut
alembic current
alembic history
```

### 2.4 Coexistence des deux approches

Pendant la **transition** (post-MSPR501), les deux approches peuvent coexister :

- `sql/init/*.sql` reste pour le bootstrap initial des environnements neufs (dev, démo, CI)
- `alembic/versions/*.py` prend le relais pour les changements incrémentaux post-bootstrap

À terme, on alignera les deux : Alembic deviendra la source unique, et un `alembic upgrade head` sur une base vide reproduira le schéma initial.

---

## 3. Bonnes pratiques

### 3.1 Avant de modifier le schéma

1. **Vérifier qu'on ne casse pas les API existantes** — un `DROP COLUMN` ou un renommage peut casser FastAPI / Hono / health-next
2. **Penser à la migration des données** — pas seulement la structure
3. **Tester en dev avec `docker compose down -v && docker compose up -d`** pour repartir d'une base vierge

### 3.2 Pour les changements en production

1. Toujours créer une **PR** avec la migration séparée du code applicatif
2. Tester la migration sur un **clone récent de la base prod**
3. Prévoir un **plan de rollback** documenté dans la description de la PR
4. Déployer la migration AVANT le code applicatif (rétro-compatibilité)
5. Surveiller les **logs** pendant les minutes suivant le déploiement

### 3.3 Conventions de schéma

- Tables en `snake_case` singulier (`user`, `nutrition_log`, `etl_run`)
- Colonnes en `snake_case` (`created_at`, `user_id`)
- PKs nommées `id`
- FKs nommées `<entité>_id`
- Index préfixés `idx_<table>_<colonne>`
- Vues préfixées `vw_<sujet>`
- Contraintes CHECK avec des messages d'erreur explicites

---

## 4. État actuel — checklist

- [x] Schéma initial 28 tables (`01_schema.sql`)
- [x] Seed métier de base (`02_seed.sql`)
- [x] Tables MSPR501 spécifiques : `etl_runs`, `etl_rejected_rows`, `data_validation_queue` (dans `01_schema.sql`)
- [x] Seed démo admin MSPR501 (`03_seed_mspr501_admin.sql`)
- [x] Vues agrégées admin (`04_views_mspr501.sql`)
- [x] Index complémentaires admin (`04_views_mspr501.sql`)
- [x] Documentation Merise MCD/MLD/MPD (`12-Modele-Donnees-Merise.md`)
- [ ] Migration vers Alembic (planifié post-MSPR501)
- [ ] Génération automatique des types TS depuis le schéma (planifié post-MSPR501)
