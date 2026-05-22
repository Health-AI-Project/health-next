# Justification du choix des datasets — MSPR501

> Livrable L3 — Cahier des charges section IV.4 « Exigences complémentaires » : *« Les équipes devront fournir une justification du choix des datasets utilisés. »*

---

## 1. Méthode de sélection

Le cahier des charges demande **au minimum deux sources** couvrant les besoins de HealthAI Coach : profils utilisateurs, base nutritionnelle, catalogue d'exercices, métriques biométriques. Nous avons retenu **cinq datasets** pour couvrir l'intégralité du périmètre métier et démontrer la robustesse du pipeline d'ingestion face à des formats hétérogènes.

Les critères de sélection appliqués :

| Critère | Pondération | Justification |
|---|---|---|
| **Pertinence métier** | ⭐⭐⭐ | Alignement direct avec le périmètre HealthAI Coach (nutrition, sport, biométrie) |
| **Qualité intrinsèque** | ⭐⭐⭐ | Données structurées, faible taux de valeurs manquantes, documentation présente |
| **Licence d'usage** | ⭐⭐⭐ | Licence ouverte (CC0, MIT, public domain) compatible avec un usage commercial |
| **Volumétrie** | ⭐⭐ | Suffisante pour tester le pipeline et alimenter les analytics, sans être insurmontable |
| **Diversité des formats** | ⭐⭐ | CSV, JSON, XLSX — démontre la généricité du pipeline d'ingestion |
| **Couverture démographique** | ⭐⭐ | Profils variés (âge, sexe, niveau sportif) pour entraîner les futurs modules IA |

---

## 2. Datasets retenus

### 2.1 Daily Food & Nutrition Dataset

- **Source** : Kaggle — <https://www.kaggle.com/datasets/adilshamim8/daily-food-and-nutrition-dataset>
- **Format** : CSV
- **Volumétrie** : ~10 000 lignes
- **Données** : apports quotidiens, valeurs nutritionnelles, tracking santé
- **Licence** : CC0 (Public Domain)

**Pourquoi ce dataset ?**

Il fournit la **base nutritionnelle quotidienne** demandée par le cahier des charges (section III.1, « base nutritionnelle contenant des aliments, leurs apports énergétiques et leurs macronutriments »). Le format CSV avec une structure simple en fait un excellent candidat pour tester le pipeline d'ingestion sur le format le plus courant. La granularité quotidienne permet ensuite d'alimenter les analyses de tendances alimentaires demandées en section III.3.

**Limites identifiées** : pas de référencement par marque ni de codes-barres → on ne pourra pas faire de matching avec OpenFoodFacts à terme. Acceptable pour le MVP.

---

### 2.2 Diet Recommendations Dataset

- **Source** : Kaggle — <https://www.kaggle.com/datasets/ziya07/diet-recommendations-dataset>
- **Format** : CSV
- **Volumétrie** : ~5 000 profils + recommandations associées
- **Données** : profils santé, besoins diététiques, recommandations IA
- **Licence** : CC BY 4.0

**Pourquoi ce dataset ?**

Il associe **profils utilisateurs et recommandations diététiques**, ce qui sert deux objectifs : (1) enrichir la base de profils fictifs demandée en section III.1, et (2) constituer un jeu d'entraînement pour le futur module IA de recommandations personnalisées mentionné en section II du cahier des charges. C'est le seul dataset retenu qui croise déjà profil + recommandation, donc indispensable pour préparer l'extension IA.

**Limites identifiées** : labels de recommandations parfois subjectifs (régimes "keto", "paleo" sans normalisation médicale). À documenter dans les règles de qualité.

---

### 2.3 ExerciseDB API Repository (1300+ exercices)

- **Source** : GitHub — <https://github.com/ExerciseDB/exercisedb-api>
- **Format** : JSON (fork conseillé sur compte personnel)
- **Volumétrie** : 1 300+ exercices
- **Données** : nom, type, groupes musculaires, équipement, niveau, images, instructions
- **Licence** : MIT

**Pourquoi ce dataset ?**

C'est la **référence ouverte** pour un catalogue d'exercices sportifs structuré. Le cahier des charges (section III.1) demande explicitement « *un catalogue d'exercices décrivant pour chaque activité son type, son niveau d'intensité et les équipements nécessaires* » — ce dataset coche les trois cases et ajoute les groupes musculaires et instructions visuelles. Le format JSON imbriqué teste le second connecteur du pipeline ETL.

**Limites identifiées** : pas d'estimation calorique par exercice → on devra la calculer côté backend à partir du type/intensité. Pas bloquant.

---

### 2.4 Gym Members Exercise Dataset

- **Source** : Kaggle — <https://www.kaggle.com/datasets/valakhorasani/gym-members-exercise-dataset>
- **Format** : CSV
- **Volumétrie** : 973 échantillons
- **Données** : âge, genre, poids, taille, BPM max/moyen, calories, BMI, body fat %
- **Licence** : CC0 (Public Domain)

**Pourquoi ce dataset ?**

Il fournit le **socle de profils utilisateurs fictifs avec mesures biométriques** demandé en section III.1 (« *informations démographiques et objectifs personnalisés* »). Les colonnes BPM, calories et BMI couvrent les métriques de performance attendues (section III.1, « *métriques de performance, données biométriques simulées comme poids, sommeil, fréquence cardiaque* »).

**Limites identifiées** : seulement 973 lignes — limité pour de l'entraînement IA sérieux, mais suffisant pour démontrer le pipeline et alimenter le dashboard analytics.

---

### 2.5 Fitness Tracker Dataset

- **Source** : Kaggle — <https://www.kaggle.com/datasets/nadeemajeedch/fitness-tracker-dataset>
- **Format** : XLSX
- **Volumétrie** : ~3 000 enregistrements
- **Données** : steps, calories burn, minutes d'activité, profils diversifiés
- **Licence** : CC0 (Public Domain)

**Pourquoi ce dataset ?**

Il complète le précédent en fournissant des **données d'activité quotidienne** plutôt que ponctuelles. C'est aussi le seul dataset retenu au format **XLSX**, ce qui permet de valider le troisième connecteur du pipeline d'ingestion (CSV, JSON et XLSX étant les trois formats listés en section III.1).

**Limites identifiées** : pas de timestamps précis pour reconstruire des séries temporelles fines. Acceptable car on travaille en agrégat journalier.

---

## 3. Synthèse — couverture du cahier des charges

| Besoin métier (section III.1 du PDF) | Dataset(s) retenu(s) |
|---|---|
| Profils utilisateurs (âge, sexe, objectifs) | Gym Members + Diet Recommendations |
| Base nutritionnelle (aliments, macros, recettes) | Daily Food & Nutrition |
| Catalogue d'exercices (type, intensité, équipement) | ExerciseDB |
| Métriques biométriques simulées | Gym Members + Fitness Tracker |

| Contrainte technique | Dataset(s) couvrant l'exigence |
|---|---|
| Format **CSV** | Daily Food, Diet Recommendations, Gym Members |
| Format **JSON** | ExerciseDB |
| Format **XLSX** | Fitness Tracker |

**Résultat** : avec ces 5 datasets, tous les besoins métier ET tous les formats imposés sont couverts. Le pipeline d'ingestion peut donc être démontré sur la totalité de son périmètre.

---

## 4. Datasets écartés (et pourquoi)

| Dataset envisagé | Raison de l'écart |
|---|---|
| **OpenFoodFacts** (1M+ produits) | Volumétrie trop élevée pour un MVP, complexité de matching (codes-barres) sans valeur ajoutée pour la soutenance |
| **MyFitnessPal scraped data** | Statut légal flou (scraping) — incompatible avec l'exigence d'usage industriel |
| **Strava API** | Nécessite auth OAuth + tokens utilisateurs réels — hors périmètre pédagogique |
| **Google Fit API** | Idem Strava + dépendance à un service tiers en production |
| **Fitbit Public Data** | Couverture restreinte au dispositif Fitbit, biais matériel |

---

## 5. Conformité réglementaire

Tous les datasets retenus sont sous **licence ouverte** (CC0, CC BY 4.0, MIT) compatible avec un usage commercial. Aucun ne contient de **données personnelles réelles** — il s'agit soit de jeux fictifs anonymisés, soit de catalogues d'objets (aliments, exercices). Cela évite tout risque RGPD à ce stade du prototype.

Pour la mise en production future (vraies données utilisateurs), un mapping vers un schéma RGPD-compliant devra être prévu (consentement, droit à l'oubli, minimisation). Cette dimension est mentionnée comme perspective dans le rapport technique (L7, #30).
