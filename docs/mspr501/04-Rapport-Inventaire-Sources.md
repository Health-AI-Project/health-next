# Rapport d'inventaire des sources de données — MSPR501

> Livrable L1 — Cahier des charges section IV.1 : *« Un rapport d'inventaire des sources de données devra recenser toutes les sources utilisées, internes comme externes, en précisant leur origine, leur format, leur fréquence de mise à jour et les règles appliquées pour en assurer la qualité. »*

---

## 1. Synthèse

| # | Nom | Type | Format | Volumétrie | Fréquence MAJ | Licence |
|---|---|---|---|---|---|---|
| 1 | Daily Food & Nutrition Dataset | Externe — Kaggle | CSV | ~10 000 lignes | Statique (snapshot) | CC0 |
| 2 | Diet Recommendations Dataset | Externe — Kaggle | CSV | ~5 000 lignes | Statique | CC BY 4.0 |
| 3 | ExerciseDB API Repository | Externe — GitHub | JSON | 1 300+ exercices | À fork + sync mensuel | MIT |
| 4 | Gym Members Exercise Dataset | Externe — Kaggle | CSV | 973 lignes | Statique | CC0 |
| 5 | Fitness Tracker Dataset | Externe — Kaggle | XLSX | ~3 000 lignes | Statique | CC0 |

**Total** : 5 sources externes — ~19 000 enregistrements consolidés après ingestion.
**Internes** : aucune à ce stade (HealthAI Coach étant en phase de bootstrap, il n'existe pas encore d'historique client réel).

---

## 2. Fiche détaillée par source

### 2.1 Daily Food & Nutrition Dataset

| Champ | Valeur |
|---|---|
| **URL** | <https://www.kaggle.com/datasets/adilshamim8/daily-food-and-nutrition-dataset> |
| **Type de source** | Open data |
| **Format brut** | CSV — encodage UTF-8, séparateur virgule |
| **Volumétrie** | ~10 000 lignes × ~15 colonnes |
| **Schéma principal** | `date, user_id, food, meal_type, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, water_ml` |
| **Fréquence MAJ** | Statique — snapshot téléchargé une fois et versionné dans `data/raw/` |
| **Méthode d'acquisition** | Téléchargement manuel via Kaggle CLI (`kaggle datasets download -d adilshamim8/daily-food-and-nutrition-dataset`) |
| **Licence** | CC0 — domaine public, usage libre |

**Règles de qualité appliquées** :
1. `date` parsée en `YYYY-MM-DD` — lignes au format invalide → quarantaine
2. `calories` numérique > 0 — sinon flag anomalie
3. Cohérence macros : `protein_g × 4 + carbs_g × 4 + fat_g × 9` doit être proche (±15 %) de `calories` — sinon flag « écart macros »
4. `meal_type` dans l'ensemble `{breakfast, lunch, dinner, snack}` — valeurs hors liste → enum custom
5. Déduplication sur (`date`, `user_id`, `food`, `meal_type`)

**Mapping vers la base relationnelle** :
- `date, user_id, meal_type, calories, protein_g, ...` → table `meal_logs`
- `food` (string) → résolution vers table `foods` (lookup ou création)

---

### 2.2 Diet Recommendations Dataset

| Champ | Valeur |
|---|---|
| **URL** | <https://www.kaggle.com/datasets/ziya07/diet-recommendations-dataset> |
| **Type de source** | Open data |
| **Format brut** | CSV — UTF-8, séparateur virgule |
| **Volumétrie** | ~5 000 profils + colonnes de recommandations |
| **Schéma principal** | `age, gender, weight_kg, height_cm, activity_level, dietary_preferences, health_condition, recommended_diet, recommended_calories` |
| **Fréquence MAJ** | Statique |
| **Méthode d'acquisition** | Kaggle CLI |
| **Licence** | CC BY 4.0 — attribution requise dans la doc utilisateur |

**Règles de qualité appliquées** :
1. `age` ∈ [16, 100] — bornes médicales raisonnables, hors bornes → rejet
2. `weight_kg` ∈ [30, 250], `height_cm` ∈ [120, 230] — hors bornes → rejet
3. `gender` ∈ {male, female, other} — normalisation depuis variantes (`M`, `F`, `Female`, etc.)
4. `recommended_diet` libellés normalisés (lowercase, snake_case)
5. Calcul BMI dérivé : `weight_kg / (height_cm/100)²` — stockage en colonne calculée

**Mapping** :
- Profil utilisateur → tables `users` + `profiles`
- Recommandations → table `recommendations` (champ JSON ou table dédiée)

---

### 2.3 ExerciseDB API Repository

| Champ | Valeur |
|---|---|
| **URL** | <https://github.com/ExerciseDB/exercisedb-api> |
| **Type de source** | Open data — repo GitHub |
| **Format brut** | JSON (un fichier ou un par exercice selon variante) |
| **Volumétrie** | 1 300+ exercices |
| **Schéma principal** | `id, name, body_part, equipment, target, secondary_muscles[], instructions[], gif_url` |
| **Fréquence MAJ** | Mensuelle — sync via `git pull` du fork |
| **Méthode d'acquisition** | **Fork** sur le compte org Health-AI-Project + clone local + sync mensuel automatisé |
| **Licence** | MIT — usage libre avec attribution dans le code |

**Règles de qualité appliquées** :
1. `id` unique — sinon dernière version conservée
2. `name` non vide — sinon rejet
3. Normalisation `body_part` et `equipment` vers vocabulaire contrôlé (table `equipment_types`, `body_parts`)
4. `gif_url` validée (HTTP 200 + content-type image) — sinon flag « média manquant »
5. `instructions` ≥ 2 étapes — sinon flag « instructions incomplètes »

**Mapping** : table `exercises` + tables de liaison `exercise_muscles`, `exercise_equipment`.

---

### 2.4 Gym Members Exercise Dataset

| Champ | Valeur |
|---|---|
| **URL** | <https://www.kaggle.com/datasets/valakhorasani/gym-members-exercise-dataset> |
| **Type de source** | Open data |
| **Format brut** | CSV |
| **Volumétrie** | 973 lignes × ~15 colonnes |
| **Schéma principal** | `age, gender, weight_kg, height_m, max_bpm, avg_bpm, resting_bpm, session_duration_h, calories_burned, workout_type, fat_percentage, water_intake_l, workout_frequency_per_week, experience_level, bmi` |
| **Fréquence MAJ** | Statique |
| **Méthode d'acquisition** | Kaggle CLI |
| **Licence** | CC0 |

**Règles de qualité appliquées** :
1. `max_bpm` ∈ [60, 220], `avg_bpm` ≤ `max_bpm` — sinon rejet (incohérence physiologique)
2. `session_duration_h` ∈ [0.1, 5] — sinon flag aberrant
3. `bmi` recalculé depuis weight/height et comparé à la valeur fournie (tolérance ±0.5) — écart > seuil → flag
4. `experience_level` normalisé sur échelle 1-3 (`beginner=1, intermediate=2, advanced=3`)
5. `workout_type` mappé sur taxonomie ExerciseDB (`cardio, strength, hiit, yoga, ...`)

**Mapping** : table `workout_sessions` + enrichissement `profiles` pour les utilisateurs sans profil détaillé.

---

### 2.5 Fitness Tracker Dataset

| Champ | Valeur |
|---|---|
| **URL** | <https://www.kaggle.com/datasets/nadeemajeedch/fitness-tracker-dataset> |
| **Type de source** | Open data |
| **Format brut** | XLSX — feuille unique |
| **Volumétrie** | ~3 000 lignes |
| **Schéma principal** | `date, user_id, steps, distance_km, active_minutes, sedentary_minutes, calories_burned, sleep_hours, heart_rate_avg` |
| **Fréquence MAJ** | Statique |
| **Méthode d'acquisition** | Kaggle CLI puis conversion XLSX → DataFrame via `pandas.read_excel` (openpyxl) |
| **Licence** | CC0 |

**Règles de qualité appliquées** :
1. `date` parsée — formats Excel multiples gérés (`datetime`, `string ISO`, sérial Excel)
2. `steps` ∈ [0, 100 000] — au-delà → flag (record marathon = 60-80k pas max)
3. `sleep_hours` ∈ [0, 24] — sinon rejet
4. `active_minutes + sedentary_minutes` ≤ 1440 (minutes dans une journée)
5. Agrégation journalière par `user_id` si doublons

**Mapping** : table `daily_logs` (activité quotidienne agrégée).

---

## 3. Gouvernance des données

### 3.1 Stockage des sources brutes

```
ia-python/
├── data/
│   ├── raw/              ← snapshots téléchargés (versionnés avec DVC ou git-lfs si lourds)
│   │   ├── daily_food_nutrition.csv
│   │   ├── diet_recommendations.csv
│   │   ├── exercisedb/   ← submodule git pointant vers le fork
│   │   ├── gym_members.csv
│   │   └── fitness_tracker.xlsx
│   ├── staging/          ← données après validation, avant nettoyage
│   ├── processed/        ← données nettoyées prêtes pour la BDD
│   └── exports/          ← exports JSON/CSV produits par l'API
```

### 3.2 Traçabilité

Chaque ligne ingérée porte les métadonnées techniques suivantes dans la base :
- `source_name` : identifiant du dataset d'origine
- `source_version` : hash ou date du snapshot
- `ingested_at` : timestamp d'ingestion
- `etl_run_id` : référence vers la table `etl_runs` pour audit

Cela permet de répondre à la question « d'où vient cette ligne ? » même 6 mois après la mise en production.

### 3.3 Mise à jour future

| Source | Stratégie de MAJ |
|---|---|
| Kaggle datasets statiques | Snapshot manuel trimestriel — alerte si nouveau commit |
| ExerciseDB | Sync mensuel automatisé via GitHub Action sur le fork |
| Données client à terme | Ingestion temps réel via webhook depuis l'app mobile (hors périmètre MSPR501) |

---

## 4. Diagramme des flux

Voir le document complémentaire **`05-Diagramme-Flux-Donnees.md`** pour la représentation visuelle complète du cheminement collecte → API.
