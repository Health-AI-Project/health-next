# Diagramme des flux de données — MSPR501

> Livrable L1 — Cahier des charges section IV.1 : *« Ce rapport sera accompagné d'un diagramme des flux de données, permettant de visualiser le cheminement complet entre la collecte brute, les traitements de nettoyage, le stockage en base relationnelle et l'exposition via API. »*

---

## 1. Vue d'ensemble (haut niveau)

```mermaid
flowchart LR
    subgraph SRC["🌐 Sources externes"]
        K1[Kaggle CSV<br/>Daily Food]
        K2[Kaggle CSV<br/>Diet Recommendations]
        K3[Kaggle CSV<br/>Gym Members]
        K4[Kaggle XLSX<br/>Fitness Tracker]
        GH[GitHub Fork<br/>ExerciseDB JSON]
    end

    subgraph ETL["🔄 Pipeline ETL — ia-python"]
        E1[Ingestion<br/>multi-format]
        E2[Validation<br/>schémas Pydantic]
        E3[Nettoyage<br/>normalisation]
        E4[Consolidation<br/>mapping métier]
    end

    subgraph STORE["🗄️ Stockage"]
        DB[(PostgreSQL<br/>relationnel)]
        EXP[Exports<br/>JSON / CSV]
    end

    subgraph API["🔌 Couche API"]
        FAPI[FastAPI<br/>REST + OpenAPI]
        HONO[backend-hono<br/>gateway BFF]
        ENG[engine-go<br/>gRPC core]
    end

    subgraph CLIENT["💻 Consommateurs"]
        WEB[health-next<br/>Admin web]
        MOB[flutter-ai<br/>App mobile]
        BI[Outils BI<br/>Power BI / Metabase]
    end

    K1 & K2 & K3 & K4 & GH --> E1
    E1 --> E2 --> E3 --> E4
    E4 --> DB
    DB --> EXP
    DB --> FAPI
    FAPI --> HONO
    HONO <--> ENG
    ENG --> DB
    HONO --> WEB
    HONO --> MOB
    DB -.-> BI

    style SRC fill:#fef3c7,stroke:#f59e0b
    style ETL fill:#dbeafe,stroke:#3b82f6
    style STORE fill:#dcfce7,stroke:#22c55e
    style API fill:#fce7f3,stroke:#ec4899
    style CLIENT fill:#f3e8ff,stroke:#a855f7
```

---

## 2. Flux détaillé étape par étape

### 2.1 Étape 1 — Collecte brute

```mermaid
flowchart TD
    A[Tâche planifiée<br/>cron quotidienne 02h00] --> B{Source ?}
    B -->|Kaggle CSV/XLSX| C[Kaggle CLI<br/>kaggle datasets download]
    B -->|GitHub JSON| D[git pull<br/>fork ExerciseDB]
    C --> E[Fichier dans data/raw/<br/>+ checksum SHA-256]
    D --> E
    E --> F[Enregistrement<br/>etl_runs table]
    F --> G[Trigger pipeline<br/>validation]

    style A fill:#fef3c7
    style F fill:#dcfce7
```

**Outils** : Kaggle CLI, GitHub Actions (sync ExerciseDB), cron Linux.
**Sortie** : fichiers bruts versionnés dans `ia-python/data/raw/` + entrée dans la table `etl_runs`.

---

### 2.2 Étape 2 — Validation

```mermaid
flowchart LR
    A[Fichier brut] --> B[Détection format<br/>CSV / JSON / XLSX]
    B --> C[Lecture pandas /<br/>openpyxl / json]
    C --> D[Validation schéma<br/>Pydantic]
    D -->|✅ valide| E[staging/]
    D -->|❌ invalide| F[quarantine/<br/>+ rapport anomalies]
    F --> G[Log WARN<br/>+ alerte admin]

    style D fill:#fce7f3
    style E fill:#dcfce7
    style F fill:#fee2e2
```

**Règles appliquées** : types, ranges, présence champs obligatoires, unicité.
**Sortie** : `data/staging/<source>.parquet` (valides) + `data/quarantine/<source>_invalid_<run_id>.csv` (rejetés).

---

### 2.3 Étape 3 — Nettoyage et normalisation

```mermaid
flowchart TD
    A[staging/] --> B[Dédoublonnage]
    B --> C[Normalisation strings<br/>lowercase, trim, snake_case]
    C --> D[Conversion unités<br/>cm→m, lb→kg, etc.]
    D --> E[Imputation valeurs manquantes<br/>médiane / mode]
    E --> F[Calcul colonnes dérivées<br/>BMI, écart macros]
    F --> G[Flag anomalies<br/>règles métier]
    G --> H[processed/<br/>+ rapport qualité]

    style A fill:#fef3c7
    style H fill:#dcfce7
```

**Outils** : pandas, numpy, scikit-learn (KNN imputation pour cas complexes).
**Sortie** : `data/processed/<source>.parquet` + métriques de qualité dans `etl_runs`.

---

### 2.4 Étape 4 — Consolidation et chargement BDD

```mermaid
flowchart LR
    A[processed/<br/>Daily Food] --> M[Mapping ORM]
    B[processed/<br/>Diet Reco] --> M
    C[processed/<br/>Gym Members] --> M
    D[processed/<br/>Fitness Tracker] --> M
    E[processed/<br/>ExerciseDB] --> M
    M --> N[Résolution FK<br/>users, foods, exercises]
    N --> O[INSERT bulk<br/>SQLAlchemy]
    O --> P[(PostgreSQL)]
    P --> Q[Mise à jour<br/>etl_runs status=success]

    style M fill:#dbeafe
    style P fill:#dcfce7
```

**Tables peuplées** : `users`, `profiles`, `foods`, `exercises`, `meal_logs`, `workout_sessions`, `daily_logs`, `recommendations`.
**Sortie** : base prête pour consommation API + run marqué `success` dans `etl_runs`.

---

### 2.5 Étape 5 — Exposition via API

```mermaid
flowchart TD
    DB[(PostgreSQL)] --> RAPI[FastAPI ia-python<br/>:8000]
    DB --> REG[engine-go gRPC<br/>:50051]
    REG --> RHONO[backend-hono<br/>:3002 — gateway]
    RAPI --> RHONO
    RHONO --> WEB[health-next admin<br/>:3000]
    RHONO --> MOB[flutter-ai mobile]
    RAPI --> EXP[/Export JSON / CSV/]

    style DB fill:#dcfce7
    style RHONO fill:#fce7f3
    style WEB fill:#f3e8ff
    style MOB fill:#f3e8ff
```

**Endpoints clés** :
- `GET /api/v1/foods` — catalogue alimentaire
- `GET /api/v1/exercises` — catalogue exercices
- `GET /api/v1/users/:id/meal-logs` — historique nutrition
- `GET /api/v1/users/:id/workouts` — historique sport
- `GET /api/admin/runs` — supervision pipeline
- `GET /api/admin/export/:source` — export consolidé

---

## 3. Flux administrateur (interface health-next)

```mermaid
sequenceDiagram
    actor Admin
    participant Front as health-next
    participant Hono as backend-hono
    participant API as ia-python FastAPI
    participant DB as PostgreSQL

    Admin->>Front: Accède à /dashboard/admin/data-quality
    Front->>Hono: GET /api/admin/runs
    Hono->>API: GET /api/v1/admin/runs
    API->>DB: SELECT FROM etl_runs ORDER BY started_at DESC
    DB-->>API: rows
    API-->>Hono: JSON {runs: [...]}
    Hono-->>Front: JSON
    Front-->>Admin: Affichage dashboard

    Admin->>Front: Édite une ligne anomalie
    Front->>Hono: PATCH /api/admin/datasets/foods/123
    Hono->>API: PATCH /api/v1/admin/datasets/foods/123
    API->>DB: UPDATE foods SET ... WHERE id=123
    DB-->>API: OK
    API->>DB: INSERT INTO audit_log (admin_id, action)
    API-->>Hono: 200 OK
    Hono-->>Front: 200
    Front-->>Admin: Toast "Modification enregistrée"
```

---

## 4. Flux d'export

```mermaid
flowchart LR
    A[Admin clic Export] --> B[Front<br/>GET /api/admin/export/foods?format=csv]
    B --> C[Hono<br/>proxy]
    C --> D[FastAPI<br/>build query selon filtres]
    D --> E[(PostgreSQL<br/>SELECT)]
    E --> F[pandas DataFrame]
    F --> G{Format ?}
    G -->|CSV| H[stream CSV<br/>content-disposition: attachment]
    G -->|JSON| I[stream JSON<br/>idem]
    H & I --> J[Téléchargement<br/>navigateur]

    style A fill:#f3e8ff
    style J fill:#dcfce7
```

---

## 5. Légende et conventions

| Couleur | Signification |
|---|---|
| 🟡 Jaune | Sources externes (collecte) |
| 🔵 Bleu | Pipeline ETL (transformation) |
| 🟢 Vert | Stockage / Sortie réussie |
| 🌸 Rose | Couche API / Gateway |
| 🟣 Violet | Consommateurs (UI) |
| 🔴 Rouge | Erreur / Quarantaine |

---

## 6. Génération des assets

Les diagrammes ci-dessus sont en **Mermaid** (texte versionné dans git). Pour produire des assets PNG/SVG destinés à la soutenance et au rapport technique :

```bash
# Installation
npm install -g @mermaid-js/mermaid-cli

# Export PNG haute résolution
mmdc -i 05-Diagramme-Flux-Donnees.md -o assets/flow-overview.png -w 2400 -H 1600 -b transparent

# Export SVG pour usage web (page admin /dashboard/admin/flow)
mmdc -i 05-Diagramme-Flux-Donnees.md -o assets/flow-overview.svg -b transparent
```

Les assets générés sont placés dans `docs/mspr501/assets/`. Ils sont aussi consommés par la page `app/dashboard/admin/flow/page.tsx` (#25) pour la visualisation interactive.
