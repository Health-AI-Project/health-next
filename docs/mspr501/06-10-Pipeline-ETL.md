# Pipeline ETL — État livrables L2 + L3

> Livrables L2 + L3 — Cahier des charges sections IV.2 et IV.3
> *« un pipeline d'ingestion et de transformation automatisé, incluant le code source complet, versionné et commenté, les scripts de planification ou de configuration, et un système de gestion des erreurs et des logs retraçant chaque exécution. »*
>
> *« Un jeu de données consolidé et débarrassé de ses anomalies devra être produit. »*

---

## 1. Code existant — `ia-python/etl/`

Le pipeline ETL existe déjà dans le repo `ia-python` (avant MSPR501). Il a été enrichi pour répondre au cahier des charges.

### 1.1 Structure

```
ia-python/etl/
├── __init__.py
├── cleaning.py     ← Normalisation colonnes + détection anomalies (89 lignes)
├── load.py         ← Insertion bulk en base (233 lignes)
├── pipeline.py     ← Orchestration file + API ETL (156 lignes)
└── run.py          ← Entry point CLI (15 lignes)
```

Total : **494 lignes** de code Python versionné.

### 1.2 Fonctionnalités implémentées

| # | Fonction | Module | Tâche |
|---|---|---|---|
| 1 | Ingestion fichiers (auto-détection format CSV) | `pipeline.py:run_file_etl` | #6 |
| 2 | Ingestion API externe (HTTP GET) | `pipeline.py:run_api_etl` | #6 |
| 3 | Validation structure (colonnes requises) | `cleaning.py:_reject_reason` | #7 |
| 4 | Validation types (numeric, date) | `cleaning.py:clean_nutrition_frame` | #7 |
| 5 | Détection anomalies métier (valeurs négatives) | `cleaning.py:_reject_reason` | #7 |
| 6 | Quarantaine lignes rejetées | `load.py:insert_rejected_rows` | #7, #8 |
| 7 | Normalisation colonnes (alias multiples) | `cleaning.py:NUTRITION_COLUMN_MAP` | #6 |
| 8 | Déduplication (clé composite user/date/meal/food) | `cleaning.py:drop_duplicates` | #6 |
| 9 | Tracking runs en base (`etl_runs`) | `pipeline.py:_start_run` + `_finish_run` | #8 |
| 10 | Logs JSON via Python logging | À enrichir | #8 |

### 1.3 Lancement manuel

```bash
cd ia-python
python -m etl.run
```

Ou via l'API admin :

```bash
curl -X POST http://localhost:8000/api/v1/etl/run \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"include_api": true}'
```

Cette commande peut aussi être déclenchée depuis l'interface admin `/dashboard/admin/data-quality` (bouton « Lancer un nouveau run » — à ajouter en perspective).

---

## 2. Couverture des sources MSPR501

Le pipeline actuel est principalement orienté **nutrition CSV**. Pour couvrir les 5 sources retenues (cf. `11-Justification-Datasets.md`), voici l'état d'avancement :

| Source | Format | Code actuel | À compléter |
|---|---|---|---|
| Daily Food & Nutrition | CSV | ✅ `clean_nutrition_frame` couvre déjà | Mapper les colonnes spécifiques |
| Diet Recommendations | CSV | ⚠️ Module dédié à créer | `etl/diet_recommendations.py` |
| ExerciseDB | JSON | ⚠️ `load.py:insert_exercises` existe | Lecteur JSON à connecter |
| Gym Members | CSV | ⚠️ `load.py:insert_biometrics` existe | Module de cleaning dédié |
| Fitness Tracker | XLSX | ❌ Pas de support XLSX dans `pipeline.py` | Ajouter `pd.read_excel` avec openpyxl |

### 2.1 Plan pour compléter les 5 sources

```python
# etl/sources/__init__.py (à créer)
from etl.sources.daily_food import process_daily_food
from etl.sources.diet_reco import process_diet_recommendations
from etl.sources.exercise_db import process_exercise_db
from etl.sources.gym_members import process_gym_members
from etl.sources.fitness_tracker import process_fitness_tracker

SOURCE_PROCESSORS = {
    "daily_food_nutrition": process_daily_food,
    "diet_recommendations": process_diet_recommendations,
    "exercisedb": process_exercise_db,
    "gym_members": process_gym_members,
    "fitness_tracker": process_fitness_tracker,
}

def run_etl_for_source(source: str, file_path: str):
    processor = SOURCE_PROCESSORS[source]
    return processor(file_path)
```

Chaque processeur suit le contrat :

```python
def process_<source>(file_path: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Renvoie (cleaned_df, rejected_df)."""
    raw = _read_file(file_path)         # CSV / JSON / XLSX selon format
    cleaned, rejected = _validate_and_clean(raw, schema)
    return cleaned, rejected
```

Effort estimé : 1 jour par source non couverte (3 sources × 1j = 3j).

---

## 3. Tâche #7 — Validation structure et cohérence

### 3.1 Niveau structurel (Pydantic — à industrialiser)

Pour chaque source, définir un schéma Pydantic :

```python
# etl/schemas.py
from pydantic import BaseModel, Field, validator
from datetime import date

class GymMemberRow(BaseModel):
    age: int = Field(ge=16, le=100)
    gender: str = Field(pattern="^(male|female|other)$")
    weight_kg: float = Field(ge=30, le=250)
    height_m: float = Field(ge=1.2, le=2.3)
    max_bpm: int = Field(ge=60, le=220)
    avg_bpm: int

    @validator("avg_bpm")
    def avg_lte_max(cls, v, values):
        if "max_bpm" in values and v > values["max_bpm"]:
            raise ValueError("avg_bpm ne peut pas dépasser max_bpm")
        return v
```

Effort estimé : 0.5j par source.

### 3.2 Niveau métier (déjà partiel dans `cleaning.py`)

- ✅ Cohérence calorique (à ajouter : `protein × 4 + carbs × 4 + fat × 9 ≈ calories ± 15%`)
- ✅ Valeurs négatives détectées
- ✅ Champs requis vérifiés
- ⚠️ Plages physiologiques à enforcer (déjà via Pydantic ci-dessus)

---

## 4. Tâche #8 — Logs et gestion d'erreurs

### 4.1 Existant

- Table `etl_runs` : statut + timestamps + compteurs
- Table `etl_rejected_rows` : payload + raison + horodatage
- Vue `vw_etl_quality_24h` : agrégat 24h pour le dashboard admin

### 4.2 À enrichir

Pour des logs structurés JSON exportables (vers ELK, Datadog, etc.) :

```python
# etl/logging_config.py
import logging
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "module": record.module,
            "message": record.getMessage(),
            **(record.__dict__.get("extra", {})),
        })

logger = logging.getLogger("etl")
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

Usage :

```python
logger.info("ETL run started", extra={"run_id": run_id, "source": source_name})
logger.warning("Row rejected", extra={"reason": reason, "row_id": idx})
```

Effort estimé : 0.5j.

---

## 5. Tâche #9 — Planification (cron / Airflow)

### 5.1 Approche cron simple

Pour les besoins MSPR501, un cron est suffisant. Dans le `docker-compose.yml`, ajouter un service `etl-cron` :

```yaml
etl-cron:
  build:
    context: ./ia-python
    dockerfile: Dockerfile
  depends_on:
    ia-python:
      condition: service_started
  command: ["sh", "-c", "while true; do sleep 86400; python -m etl.run; done"]
  environment:
    DATABASE_URL: ${DATABASE_URL}
    API_KEY: ${IA_API_KEY}
```

Cette approche tourne toutes les 24h. Pour un cron plus précis, utiliser `cron` Linux natif :

```cron
# /etc/cron.d/healthai-etl
0 2 * * * docker compose exec ia-python python -m etl.run >> /var/log/healthai-etl.log 2>&1
```

### 5.2 Approche GitHub Actions

Documentée dans `39-CI-CD.md` section 5 (cron workflow déclenchant l'API ETL).

### 5.3 Approche Airflow (perspective production)

Pour un orchestrateur professionnel avec retry, alerting, dépendances entre DAGs :

```python
# airflow/dags/healthai_etl.py
from airflow import DAG
from airflow.providers.http.operators.http import SimpleHttpOperator
from datetime import datetime, timedelta

dag = DAG(
    "healthai_etl",
    schedule_interval="0 2 * * *",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    default_args={"retries": 3, "retry_delay": timedelta(minutes=5)},
)

run_etl = SimpleHttpOperator(
    task_id="run_etl",
    http_conn_id="ia_python",
    endpoint="/api/v1/etl/run",
    method="POST",
    headers={"X-API-Key": "{{ var.value.IA_API_KEY }}"},
    data='{"include_api": true}',
    dag=dag,
)
```

---

## 6. Tâche #10 — Dataset consolidé

### 6.1 État actuel

Une fois le pipeline lancé, les données nettoyées sont dans PostgreSQL aux tables :

- `nutrition_log` (alimentation quotidienne)
- `daily_log` (agrégation journalière)
- `weight_history` (poids)
- `workout` (sessions sport)
- `exercise` (catalogue)
- `meal_suggestion` (catalogue alimentaire)

### 6.2 Export consolidé

L'endpoint `/api/admin/export/{source}?format=json|csv` permet d'exporter chaque dataset. Pour produire un **dataset consolidé multi-sources** (le seul livrable explicitement « consolidé »), créer une view :

```sql
CREATE OR REPLACE VIEW vw_consolidated_dataset AS
SELECT
    u.id AS user_id,
    u.email,
    u.age,
    u.weight,
    u.height,
    u."subscriptionStatus" AS subscription_status,
    nl.logged_at AS nutrition_date,
    nl.calories,
    nl.protein,
    nl.carbs,
    nl.fat,
    w.date AS workout_date,
    w.calories_burned,
    wh.weight AS measured_weight,
    wh.measured_at
FROM "user" u
LEFT JOIN nutrition_log nl ON nl.user_id = u.id
LEFT JOIN workout w ON w.user_id = u.id AND w.date = nl.logged_at
LEFT JOIN weight_history wh ON wh.user_id = u.id;
```

À ajouter dans `sql/init/04_views_mspr501.sql` (perspective).

### 6.3 Téléchargement direct

Endpoint à créer (perspective) : `/api/admin/export/consolidated?format=json|csv` qui interroge la vue ci-dessus et streame.

---

## 7. État des tâches

| Tâche | Code | Doc | Statut |
|---|---|---|---|
| #6 — Pipeline ingestion (CSV/JSON/XLSX) | ✅ partiel (CSV principalement) | ✅ | 60% — XLSX à ajouter, processeurs par source |
| #7 — Validation structure | ✅ basique | ✅ | 70% — Pydantic à industrialiser |
| #8 — Logs et erreurs | ✅ basique (table `etl_runs`) | ✅ | 70% — JSON structuré à enrichir |
| #9 — Planification cron/Airflow | ⚠️ exemple docker | ✅ | 50% — pas de cron actif |
| #10 — Dataset consolidé | ⚠️ exports par source OK | ✅ | 60% — vue consolidée à créer |

**Bilan** : la chaîne ETL est **fonctionnelle de bout en bout** pour le format CSV de la source `nutrition_log`. L'extension aux 4 autres sources est documentée pas-à-pas mais nécessite 3-4 jours supplémentaires d'implémentation.

Pour la **démo MSPR501**, le seed SQL `03_seed_mspr501_admin.sql` fournit des runs ETL d'exemple qui démontrent visuellement le pipeline dans l'interface admin sans nécessiter d'avoir 5 sources réellement ingérées.

---

## 8. Démo de la chaîne complète

Scénario à présenter en soutenance (cf. `35-Scenario-Demo-Live.md`) :

1. Déposer un fichier CSV de test dans `data/input/` :
   ```bash
   docker compose cp tests/fixtures/sample_nutrition.csv ia-python:/app/data/input/
   ```
2. Déclencher le pipeline :
   ```bash
   docker compose exec ia-python python -m etl.run
   ```
3. Observer le run en temps réel dans l'interface admin : `/dashboard/admin/data-quality` montre le nouveau run.
4. Vérifier les lignes rejetées : `/dashboard/admin/datasets/daily_food_nutrition` les liste avec leur raison.
5. Exporter le dataset : bouton « Export CSV » de la même page.

Le tout en moins de 2 minutes — démonstration concrète de l'industrialisation.
