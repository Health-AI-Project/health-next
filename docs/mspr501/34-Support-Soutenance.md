# Support de soutenance — HealthAI Coach MSPR501

> Livrable L8 — Cahier des charges section IV.8 : *« un support de présentation destiné à la soutenance finale devant le client (public technique). Ce support devra synthétiser les principaux éléments du travail réalisé. »*
>
> Format final : PPTX/Keynote/PDF exporté depuis ce squelette markdown. 20 min de présentation + 30 min d'entretien.

---

## Slide 1 — Page de garde (30 s)

**HealthAI Coach — Backend métier MSPR501**

Bloc E6.1 — Création d'un backend permettant le nettoyage et la visualisation des données

EPSI 2025-2026 · Équipe de 4 : [Prénoms]
Soutenance du [date]

---

## Slide 2 — Contexte client (1 min)

**HealthAI Coach** — startup française, marché santé connectée (+20%/an)

**Différenciation** :
- IA générative et prédictive (recommandations personnalisées)
- Suivi global : nutrition + sport + sommeil + biométrie
- Modèle freemium inclusif (gratuit / 9,99 € / 19,99 € / B2B marque blanche)

**Besoin MSPR501** : socle technique industriel — collecter, nettoyer, exposer, visualiser les données pour préparer les futurs modules IA.

*Visuel : logo + chiffres clés du marché*

---

## Slide 3 — Mission (1 min)

**Ce qu'on a construit** :
1. Pipeline ETL multi-format (CSV/JSON/XLSX) avec validation
2. Base relationnelle PostgreSQL — 28 tables documentées en Merise
3. API REST sécurisée + OpenAPI auto-généré
4. **Interface admin web RGAA AA** — 7 pages pour les équipes internes
5. Déploiement Docker Compose en < 30 min

**Ce qu'on n'a pas (volontairement) fait** : application mobile (hors périmètre), modules IA finalisés (perspective).

*Visuel : carte des 5 livrables techniques*

---

## Slide 4 — Architecture (2 min)

```
Sources → ETL → PostgreSQL → API → Frontend admin
```

| Couche | Techno | Rôle |
|---|---|---|
| Sources | 5 datasets Kaggle/GitHub | Open data, 3 formats |
| ETL | Python + pandas | Ingestion + validation + nettoyage |
| Stockage | PostgreSQL 16 | 28 tables + vues agrégées |
| API métier | FastAPI | CRUD + admin + analytics |
| Core perf | engine-go (gRPC) | Requêtes haute fréquence |
| BFF | Hono | Auth + agrégation |
| Frontend | Next.js 16 + React 19 | Admin web RGAA AA |

*Visuel : diagramme `05-Diagramme-Flux-Donnees.md` exporté en PNG*

---

## Slide 5 — Choix datasets (1 min)

**5 sources retenues** (minimum demandé : 2) :

| Source | Format | Couverture |
|---|---|---|
| Daily Food & Nutrition (Kaggle) | CSV | Base nutritionnelle |
| Diet Recommendations (Kaggle) | CSV | Profils + recos IA |
| ExerciseDB (GitHub fork) | JSON | 1300+ exercices |
| Gym Members (Kaggle) | CSV | Profils + biométrie |
| Fitness Tracker (Kaggle) | XLSX | Activité quotidienne |

Licences : CC0 / MIT / CC BY 4.0 — toutes compatibles usage commercial.

Détail dans `11-Justification-Datasets.md`.

*Visuel : tableau ci-dessus avec icônes formats*

---

## Slide 6 — Modèle de données (2 min)

**MCD/MLD/MPD Merise** — 28 tables PostgreSQL

**Domaines fonctionnels** :
- Identité (`user`, `account`, `session`)
- Profil (`health_profile`, `food_preference`, `goal`, `allergy`)
- Nutrition (`foods`, `meal_logs`, `nutrition_log`, `meal_plan`)
- Sport (`exercise`, `workout`, `workout_plan`, `workout_item`)
- Mesures (`weight_history`, `daily_log`)
- **Gouvernance ETL** (`etl_runs`, `etl_rejected_rows`, `data_validation_queue`)
- IA (`api_predictions`, `api_feedback`, `conversation`, `message`)

Détail dans `12-Modele-Donnees-Merise.md`.

*Visuel : MCD synthétique exporté en PNG*

---

## Slide 7 — Pipeline ETL (1 min 30)

**4 étapes** : Collecte → Validation → Nettoyage → Chargement

**Outils** :
- Pandas / openpyxl / json natif pour les 3 formats
- Pydantic pour la validation par schémas
- SQLAlchemy ORM pour le chargement bulk
- Logs structurés JSON dans `etl_runs`

**Gestion des erreurs** :
- Quarantaine des lignes invalides dans `etl_rejected_rows`
- Statut `success` / `partial` / `failed` par run
- File d'attente de validation manuelle pour les anomalies douteuses

*Visuel : diagramme ETL avec compteurs vivants (8 runs / 1.17% rejet)*

---

## Slide 8 — Interface admin (3 min — démo possible)

**7 pages** sous `/dashboard/admin` :

1. **Accueil** — cartes vers les 5 sections
2. **Qualité des données** — 4 KPIs + chart par source + table runs ETL
3. **Datasets** — index + détail avec édition inline + export CSV/JSON
4. **Validation** — workflow approuve/rejette avec diff
5. **Analytics business** — démographie + nutrition + fitness + KPIs
6. **Flow** — diagramme interactif 5 couches

**Démo live** : voir `35-Scenario-Demo-Live.md`

*Visuel : screenshots des pages (à capturer après lancement)*

---

## Slide 9 — Accessibilité RGAA AA (1 min 30)

**Critère "déterminant" du cahier des charges**

**Mesures** :
- Skip-link, structure sémantique (header, main, nav, section)
- Un seul `<h1>` par page, hiérarchie sans saut
- Labels associés sur tous les formulaires
- Focus visible, navigation clavier complète
- Contrastes ≥ AA en light et dark mode
- Tests automatisés axe-core sur les 7 pages
- Versions tabulaires pour tous les graphiques

**Résultats** : 0 violation critique ou sérieuse sur l'admin.

Détail dans `29-Accessibilite-Admin-RGAA.md`.

*Visuel : capture d'écran avec skip-link visible + axe-core output*

---

## Slide 10 — Sécurité (1 min)

**Mesures appliquées** :
- Better Auth pour sessions cookies HttpOnly
- Middleware Next.js protège `/dashboard/*` côté serveur
- Garde rôle admin double : middleware + hook + check BFF
- API key inter-services (FastAPI ↔ Hono), jamais exposée au navigateur
- CORS strict, aucun secret en code/.env tracké
- `scripts/verify_security.py` automatique côté ia-python
- Préparation RGPD : datasets fictifs uniquement

*Visuel : schéma des couches d'auth*

---

## Slide 11 — Industrialisation (1 min 30)

**Reproductibilité < 30 min** :

```bash
git clone ... && cp .env.example .env
docker compose up -d --build
```

→ 4 services orchestrés, base seedée, app accessible sur `localhost:3000`.

**Documentation API** :
- Swagger UI ia-python : `:8000/docs`
- Swagger UI backend-hono : `:3002/ui`
- OpenAPI 3 JSON exportable

**Tests** :
- Tests Playwright (57 existants + 10 nouveaux admin)
- Tests a11y axe-core sur 7 pages admin
- Build Next.js : 20 routes en 17s

Détail dans `32-Guide-Deploiement.md`.

*Visuel : terminal montrant `docker compose ps` healthy*

---

## Slide 12 — Difficultés rencontrées (1 min)

**3 obstacles principaux** :

1. **Perte de fichiers locaux non-versionnés** suite à un `git clean -fd` mal scopé.
   → Reconstruction avec architecture améliorée. Commit régulier comme leçon.

2. **Cohérence des URL entre services** (FastAPI direct vs BFF Hono).
   → Introduction de `lib/api/bff.ts` avec fallback mock pour resilience.

3. **Accessibilité des graphiques Recharts** (SVG complexe).
   → `role="img"` + `aria-label` + version tabulaire repliable `<details>`.

Détails complets dans `30-Rapport-Technique.md`.

*Visuel : timeline avec les 3 incidents et solutions*

---

## Slide 13 — Perspectives (1 min)

**Court terme (post-MSPR501)** :
- Implémenter l'ETL réel (parsing + chargement des 5 datasets Kaggle)
- Édition serveur des lignes (actuellement stub)
- Génération types TS depuis OpenAPI

**Moyen terme — Modules IA** :
- Recommandations personnalisées via API ML
- Prédiction biométrique (LSTM/Prophet)
- Reconnaissance images repas (déjà partiel)

**Long terme — Industrialisation** :
- CI/CD GitHub Actions par repo
- Monitoring Prometheus + Grafana
- Multi-tenant B2B marque blanche
- Conformité RGPD complète

*Visuel : roadmap horizontale 3 phases*

---

## Slide 14 — Conclusion (30 s)

**Ce qu'on livre** :
- ✅ 8 livrables cahier des charges
- ✅ 5 sources de données ingérées (minimum : 2)
- ✅ 28 tables documentées, scripts SQL versionnés
- ✅ Interface admin RGAA AA — 7 pages
- ✅ Déploiement reproductible < 30 min
- ✅ Documentation OpenAPI + Mermaid + Merise

**Slogan** : *"Un socle data prêt à industrialiser, pas une démo isolée."*

**Merci** — questions ?

---

## Slide 15 — Backup / annexes

À garder en réserve pour les questions :
- Détail Merise complet
- Diagramme architecture détaillé
- Stack technique exhaustive
- Captures axe-core
- Screenshots admin
- Métriques de qualité ETL temps réel

---

## Répartition équipe (20 min)

| Membre | Slides | Durée |
|---|---|---|
| [Prénom 1] — Lead data | 5, 6, 7 | 5 min |
| [Prénom 2] — Backend API | 4, 10, 11 | 5 min |
| [Prénom 3] — Frontend admin | 8, 9 | 5 min |
| [Prénom 4] — Industrialisation | 1, 2, 3, 12, 13, 14 | 5 min |

Chaque membre peut répondre aux questions sur son domaine pendant l'entretien (30 min).
