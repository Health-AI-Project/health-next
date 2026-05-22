# TODO — MSPR501 (Bloc E6.1)

> Cahier des charges : `MSPR501/2025-2026 CDA-DIADS - Sujet MSPR TPRE501.pdf`
> Périmètre : développement et déploiement d'une application HealthAI Coach — backend métier pour collecte, nettoyage, visualisation des données.

> **État au 2026-05-22** : 21/37 tâches terminées (57 %). Voir `30-Rapport-Technique.md` pour la synthèse.

---

## Vue d'ensemble — 8 livrables PDF + transverses

| Livrable PDF | Description | Tâches |
|---|---|---|
| **L1** | Documentation des données et flux | #4, #5 |
| **L2** | Pipelines ETL opérationnels | #6, #7, #8, #9 |
| **L3** | Jeux de données nettoyés et exploitables | #10, #11 |
| **L4** | Base de données relationnelle + scripts | #12, #13, #14 |
| **L5** | API REST documentée OpenAPI | #15, #16, #17 |
| **L6** | Interface web + tableau de bord (RGAA AA) | #18 → #29 |
| **L7** | Rapport technique + guide de déploiement | #30, #31, #32, #33 |
| **L8** | Support de soutenance | #34, #35, #36 |
| **Transverse** | Sécurité, README, CI/CD, récupération | #37, #38, #39, #40 |

---

## L1 — Documentation des données et flux

- [x] **#4 — Rédiger rapport d'inventaire des sources de données** → `04-Rapport-Inventaire-Sources.md`
  Document recensant : Daily Food Nutrition (Kaggle), Diet Recommendations (Kaggle), ExerciseDB (1300+), Gym Members (973 échantillons), Fitness Tracker. Pour chaque source : origine, format (CSV/JSON/XLSX), fréquence MAJ, règles qualité, justification du choix.

- [ ] **#5 — Créer diagramme des flux de données**
  Diagramme visuel : collecte brute → traitements nettoyage → stockage relationnel → exposition API → front. Format SVG/PNG + version Mermaid versionnée.

---

## L2 — Pipelines ETL opérationnels

- [ ] **#6 — Pipeline ETL ingestion automatisée (CSV/JSON/XLSX)**
  Côté `ia-python` : connecteurs pour les 3 formats avec validation de structure (schémas), détection d'erreurs et stratégies de fallback. Code versionné, commenté.

- [ ] **#7 — Validation structure et cohérence des données**
  Validation par schémas (Pydantic/JSON Schema) : types, ranges, unicité, complétude. Quarantaine des lignes invalides + rapport d'anomalies.

- [ ] **#8 — Système de logs et gestion d'erreurs ETL**
  Logs structurés (JSON) traçant chaque exécution : timestamp, source, lignes lues/valides/rejetées, erreurs détaillées. Niveau INFO/WARN/ERROR. Rotation des logs.

- [ ] **#9 — Scripts de planification ETL (cron/Airflow)**
  Mise en place d'un scheduler : choix entre cron (simple), Airflow (production) ou Prefect. Configuration des runs réguliers et déclenchements manuels.

---

## L3 — Jeux de données nettoyés et exploitables

- [ ] **#10 — Produire le dataset consolidé nettoyé**
  Dataset final débarrassé des anomalies, exportable en JSON et CSV. Servira de base pour les futurs modules IA. Documenter le schéma et les transformations appliquées.

- [ ] **#11 — Document justification choix datasets**
  Argumentaire écrit (1-2 pages) justifiant le choix des 5 datasets retenus : pertinence métier, qualité, licence, volumétrie, couverture des cas d'usage.

---

## L4 — Base de données relationnelle

- [ ] **#12 — Modèle de données MCD/MLD/MPD (Merise)**
  Schéma relationnel documenté : MCD conceptuel, MLD logique, MPD physique. Tables : users, profiles, foods, recipes, meal_logs, exercises, workout_sessions, biometrics, daily_logs. Diagramme exporté en PDF/PNG.

- [ ] **#13 — Scripts SQL création schéma PostgreSQL**
  Scripts `CREATE TABLE` versionnés, avec contraintes (PK, FK, CHECK, UNIQUE), index, types adaptés. À placer dans `sql/init/` d'`ia-python`. Compléter l'existant si déjà présent.

- [ ] **#14 — Système de migrations versionnées**
  Mise en place Alembic (Python) ou équivalent : migrations numérotées, rollback possible, reproductibilité totale. Documentation des migrations dans README.

---

## L5 — API REST documentée OpenAPI

- [ ] **#15 — API REST CRUD complète + sécurité**
  Endpoints CRUD : users, foods, recipes, exercises, meal_logs, workout_sessions, biometrics. Auth JWT/session, validation Pydantic, gestion erreurs HTTP standard, rate limiting.

- [ ] **#16 — Documentation OpenAPI complète**
  Génération automatique OpenAPI 3.0 (FastAPI le fait nativement ; pour Hono utiliser `@hono/zod-openapi`). Swagger UI accessible en local. Exemples de requêtes/réponses pour chaque endpoint.

- [ ] **#17 — Tests API (unitaires + intégration)**
  Tests pytest (ia-python) ou vitest (hono) couvrant : auth, CRUD, validations, codes erreurs, cas limites. Cible ~70% de couverture sur les routes critiques.

---

## L6 — Interface admin + tableau de bord (le gros morceau)

### Fondations frontend

- [ ] **#18 — Types et mocks admin frontend**
  Créer `types/admin.ts` (Run, DatasetRow, Anomaly, ValidationDecision, ExportRequest) + `lib/mocks/admin/*` (fixtures pour dev sans backend). Permet de développer l'UI en parallèle du backend.

- [ ] **#19 — Composants UI réutilisables admin**
  `components/ui/data-table.tsx` (tri/filtre/pagination), `kpi-card.tsx`, `export-button.tsx` (JSON/CSV), `skip-link.tsx` (a11y). Tous accessibles WCAG AA.

- [ ] **#20 — Layout admin + garde rôle**
  `app/dashboard/admin/layout.tsx` avec sidebar admin dédiée. Middleware vérifie le rôle `admin` via Better Auth. Hook `use-admin-guard.ts` pour vérifs client-side.

### Pages admin

- [ ] **#21 — Page dashboard qualité des données**
  `app/dashboard/admin/data-quality/page.tsx` : KPIs (lignes ingérées, taux erreur, complétude), statut derniers runs ETL (succès/échec, durée), alertes anomalies. Charts temps réel.

- [ ] **#22 — Page outils de nettoyage interactifs**
  `app/dashboard/admin/datasets/[source]/page.tsx` : DataTable paginable/filtrable par source (profils, nutrition, exercices, biométrie). Édition inline ou modale, marquage à valider/validée/rejetée.

- [ ] **#23 — Page workflow validation/approbation**
  `app/dashboard/admin/validation/page.tsx` : file d'attente lots importés, diff avant/après nettoyage, actions approuver/rejeter, historique des décisions avec auteur et timestamp.

- [ ] **#24 — Page analytics business admin**
  `app/dashboard/admin/analytics/page.tsx` : 4 sections — métriques utilisateurs (âge/objectifs/sexe), analyses nutritionnelles (tendances, déficits), stats fitness (top exercices, intensités), KPIs business (engagement, conversion, satisfaction).

- [ ] **#25 — Page flux de données (diagramme interactif)**
  `app/dashboard/admin/flow/page.tsx` : visualisation interactive des flux (sources → ETL → BDD → API → front). Au minimum SVG statique cliquable, idéalement React Flow avec statuts live.

### Branchement et qualité

- [ ] **#26 — Clients API admin (branchement backend)**
  `lib/api/admin/*` : fonctions fetch typées pour `/api/admin/runs`, `/datasets/:source`, `/validation`, `/export/:source`, `/analytics/*`. Remplace les mocks une fois le backend prêt.

- [ ] **#27 — Endpoints backend pour interface admin**
  Côté `backend-hono` ou `ia-python` : exposer `GET /api/admin/runs`, `/datasets/:source` (pagination/filtre), `PATCH /datasets/:source/:id`, `POST /validation/:lot_id/approve|reject`, `GET /export/:source?format=json|csv`, `GET /analytics/*` (users, nutrition, fitness, business).

- [ ] **#28 — Tests e2e Playwright admin**
  `e2e/admin.spec.ts` : parcours navigation admin, édition d'une anomalie, validation d'un lot, export CSV/JSON, lecture KPIs. Mocks via `page.route()`.

- [ ] **#29 — Tests a11y RGAA AA sur pages admin** ⭐ critère déterminant
  `e2e/admin-accessibility.spec.ts` : axe-core sur chaque page admin. Vérifications manuelles : navigation clavier, contraste, lecteur écran (NVDA/VoiceOver), skip-link fonctionnel, headings hiérarchiques.

---

## L7 — Rapport technique + guide de déploiement

- [ ] **#30 — Rapport technique 5-8 pages**
  Rapport synthétisant : contexte HealthAI Coach, choix technologiques (stack, justification), résultats obtenus (pipelines, BDD, API, UI), difficultés rencontrées + solutions, perspectives évolution (modules IA).

- [ ] **#31 — docker-compose.yml global du projet**
  Compose orchestrant : postgres, ia-python, engine-go, backend-hono, health-next. Volumes pour data persistante. Variables `.env` documentées. Profil dev vs prod.

- [ ] **#32 — Guide de déploiement < 30 min**
  `docs/livraison/DEPLOIEMENT.md` : prérequis (Docker Desktop, ports libres), commandes exactes, ordre de démarrage, vérification santé services, troubleshooting commun. Testé sur machine vierge.

- [ ] **#33 — Validation reproductibilité (test machine vierge)** ⭐ exigence PDF
  Suivre le guide de déploiement sur une machine ou VM propre. Mesurer temps réel jusqu'au premier appel API réussi. Corriger les zones d'ombre du guide. Objectif < 30 min.

---

## L8 — Support de soutenance

- [ ] **#34 — Support de présentation soutenance (20 min)**
  Slides couvrant : contexte, démarche, choix techno, architecture, démo (5-8 min live), difficultés, résultats, perspectives. Format PowerPoint ou Keynote/PDF. Répartir le temps de parole entre les 4 membres de l'équipe.

- [ ] **#35 — Scénario de démo live de bout en bout**
  Scénario écrit étape par étape : déclenchement ETL → ingestion source → admin voit run dans dashboard → édite une anomalie → approuve le lot → export CSV → consulte analytics business. Avec fallback si problème live.

- [ ] **#36 — Préparer questions/réponses jury (30 min entretien)**
  Anticiper 15-20 questions probables du jury : pourquoi PostgreSQL/Next/Hono/Go/Python ? Sécurité ? Scalabilité ? Tests ? Accessibilité ? Évolutivité IA ? Préparer réponses concises de chacun des 4 membres.

---

## Transverse

- [ ] **#37 — Audit sécurité**
  Vérifier : aucun secret en clair (`.env` + `.gitignore`), auth obligatoire sur endpoints sensibles, HTTPS en prod, RBAC (rôle admin), protection CSRF/XSS, rate limiting, logs sans données perso. Lancer `scripts/verify_security.py` côté `ia-python`.

- [ ] **#38 — README global et par service**
  README racine décrivant l'architecture globale + liens vers chaque service. README par repo (`ia-python`, `engine-go`, `backend-hono`, `health-next`, `flutter-ai`) avec : description, prérequis, install, run, tests, structure dossiers.

- [ ] **#39 — CI/CD GitHub Actions**
  GitHub Actions par repo : lint + tests à chaque PR sur main. Build Docker. Optionnel : déploiement auto sur préprod. Mentionné dans le rapport technique comme bonne pratique industrielle.

- [ ] **#40 — Récupérer/refaire docs frontend perdues**
  Suite au `git clean` accidentel : `01-Benchmark-Frontend.pdf` (perdu, le `.md` existe encore), `DEPLOIEMENT-front.md` (à refaire), `TODO-frontend-admin.md` (remplacé par ce fichier). Régénérer le PDF benchmark via `build-pdf.py`.

---

## Sprints suggérés (12 jours)

### Sprint 1 — Fondations data (J1-J3)
- #11 justifier datasets → #4 inventaire → #5 diagramme flux
- #12 modèle Merise → #13 SQL → #14 migrations
- #6 → #7 → #8 → #9 ETL complet

### Sprint 2 — API et données (J4-J5)
- #10 dataset consolidé
- #15 → #16 → #17 API + OpenAPI + tests
- #37 audit sécurité en parallèle

### Sprint 3 — Interface admin (J6-J9) — le gros morceau
- #18 → #19 → #20 (fondations frontend)
- #27 endpoints backend admin (en parallèle)
- #21 → #22 → #23 → #24 → #25 (pages, dans cet ordre)
- #26 branchement backend
- #28 → #29 (tests + a11y)

### Sprint 4 — Industrialisation (J10-J11)
- #31 docker-compose → #32 guide deploy → #33 test machine vierge
- #38 README → #39 CI/CD
- #40 récupération docs perdues

### Sprint 5 — Soutenance (J12)
- #30 rapport technique
- #34 → #35 → #36 (slides + démo + Q/R)

---

## Points d'attention critiques

1. **RGAA niveau AA** — dit "critère déterminant" dans le PDF → ne pas négliger #29
2. **Minimum 2 sources** — on en cible 5 → couverture largement au-delà du minimum
3. **Reproductibilité < 30 min** — #33 doit être réellement testé sur une autre machine
4. **Logique industrielle** — mentionné 4× dans le PDF → CI/CD (#39) + Docker (#31) seront scrutés
5. **Évolutivité IA** — explicite dans le PDF → bien structurer l'API pour accueillir des modules IA plus tard
6. **Soutenance 50 min** (20 présentation + 30 entretien) → préparer les 4 membres équitablement
