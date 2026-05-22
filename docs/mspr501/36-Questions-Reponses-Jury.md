# Questions/réponses jury — Soutenance MSPR501

> 30 minutes d'entretien collectif après la présentation. Prévoir des réponses concises de 30 s à 1 min 30 chacune.

---

## Catégorie 1 — Choix technologiques

### Q1 — Pourquoi PostgreSQL plutôt que MongoDB ?

Le modèle est fondamentalement relationnel : un utilisateur a 0..N logs nutrition, chaque log référence un aliment du catalogue, chaque plan d'entraînement contient des exercices référencés. Les contraintes d'intégrité (FK, CHECK, UNIQUE) sont natives en SQL et coûteuses à reproduire en NoSQL. PostgreSQL gère aussi le JSONB pour les rares cas flexibles (payloads ETL). Pas de besoin de sharding à court terme.

### Q2 — Pourquoi un BFF (backend-hono) en plus du backend Python ?

Trois raisons : (1) centraliser l'authentification avec Better Auth (cookies HttpOnly côté navigateur), (2) cacher l'API key inter-services qui ne doit jamais sortir du datacenter, (3) agréger plusieurs appels backend en une seule requête pour le frontend. Le BFF est très léger (Hono compile à ~50ko) et nous permet d'évoluer le contrat front sans toucher au backend métier.

### Q3 — Pourquoi Next.js 16 plutôt qu'une SPA (Vite + React) ?

Le middleware Next.js protège `/dashboard/*` côté serveur, avant même que la page ne soit servie au navigateur. C'est plus sécurisé qu'un check côté client. L'App Router permet de mixer Server Components (chargement initial rapide) et Client Components (interactivité). Et la landing page profite du SSR pour le SEO. En SPA pure, on aurait dû ajouter un BFF rien que pour la protection.

### Q4 — FastAPI vs Django REST Framework ?

FastAPI génère automatiquement la doc OpenAPI 3 à partir des annotations Pydantic, c'est le standard demandé. Il est async natif, utile pour les appels concurrents BDD + gRPC. Django apporterait un ORM puissant mais on construit notre propre admin Next.js, donc l'admin Django serait redondante. Pour un MVP, FastAPI est plus rapide à itérer.

### Q5 — Pourquoi 5 datasets alors que 2 suffisent ?

Le cahier des charges dit « minimum 2, justifier le choix ». On a voulu démontrer la généricité du pipeline en couvrant les **3 formats imposés** (CSV, JSON, XLSX) et la totalité du périmètre métier (profils, nutrition, exercices, biométrie). Plus de sources = plus de cas-limites à gérer = pipeline plus robuste. Ça nous prépare aussi à l'arrivée de vraies données client en production.

---

## Catégorie 2 — Sécurité

### Q6 — Comment garantissez-vous que l'admin ne soit accessible qu'aux administrateurs ?

Triple protection : (1) middleware Next.js qui redirige `/dashboard/*` vers `/connexion` si aucun cookie de session, (2) hook `useAdminGuard` côté client qui vérifie le rôle via `useUserRole` et redirige si non-admin, (3) côté backend-hono, chaque endpoint `/api/admin/*` vérifie `user.role === 'admin'` et retourne 403 sinon. Donc même si quelqu'un bypassait le frontend, le backend refuse.

### Q7 — Comment sont protégées les API keys ?

L'`IA_API_KEY` n'existe que dans `.env` (non versionné) et est partagée entre `backend-hono` et `ia-python` via les variables d'environnement Docker. Elle ne sort **jamais** au navigateur. Le frontend communique uniquement avec `backend-hono` via des cookies de session. Notre `lib/api/bff.ts` n'envoie aucune API key, juste `credentials: include` pour le cookie.

### Q8 — Et les secrets en cas de fuite ?

Le `.env` est dans `.gitignore`. Si une fuite arrive, on tourne immédiatement : (1) `BETTER_AUTH_SECRET` invalide toutes les sessions actives, (2) `IA_API_KEY` change et est redéployée sur les services concernés. Pour la prod, on prévoit un Vault (HashiCorp ou AWS Secrets Manager) pour ne plus avoir le secret en clair même dans `.env`.

### Q9 — Et le RGPD ?

À ce stade, tous nos datasets sont fictifs (Kaggle CC0). Pas de PII réelle. Pour la mise en production, on prévoit : consentement explicite à l'inscription, droit à l'oubli via endpoint `DELETE /api/v1/users/me`, journal de traitement, isolation par tenant pour le B2B. C'est dans la section « Perspectives » du rapport technique.

---

## Catégorie 3 — Qualité, tests, déploiement

### Q10 — Quelle couverture de tests avez-vous ?

57 tests Playwright e2e existants côté frontend (parcours user, dashboard, accessibilité) + 10 nouveaux tests pour l'admin (7 pages × axe-core + 3 tests dédiés clavier/SVG/boutons). Côté Python, tests pytest sur les routes critiques (`test_etl_cleaning.py`, `test_security_and_analytics.py`). On vise 70 % de couverture sur les routes admin avant la fin du sprint.

### Q11 — Comment vérifiez-vous l'accessibilité ?

Deux niveaux : automatisé via `axe-core` dans Playwright (échoue le build si une violation critical ou serious est trouvée), et manuel via une checklist (navigation clavier complète, lecteur d'écran NVDA, zoom 200%, mode contraste élevé). Les rapports JSON sont écrits dans `a11y-report/admin/` pour audit.

### Q12 — Combien de temps pour déployer la solution from scratch ?

Sur une machine vierge avec Docker installé : 15 à 25 minutes selon la bande passante. La majorité du temps est le téléchargement des images Docker + le build Next.js (la première fois). Après ça, un `docker compose up -d` redémarre tout en 30 secondes. C'est documenté dans `32-Guide-Deploiement.md`.

### Q13 — Avez-vous testé sur une autre machine ?

[À VÉRIFIER avant la soutenance — c'est la tâche #33] Cette validation est cruciale pour prouver la reproductibilité. Si pas fait, dire honnêtement : « pas encore sur une autre machine physique, mais le `docker-compose.yml` est isolant et tous les paths sont relatifs ; on prévoit la validation cette semaine ».

---

## Catégorie 4 — ETL et qualité données

### Q14 — Comment détectez-vous les anomalies ?

Trois couches : (1) validation **structurelle** via Pydantic — types, présence des champs obligatoires, ranges (`age` entre 16 et 100), (2) validation **métier** — cohérence calorique (`protein × 4 + carbs × 4 + fat × 9 ≈ calories ± 15%`), unicité (`UNIQUE(user_id, date)` au niveau BDD), (3) validation **statistique** — détection d'outliers (max_bpm > 220) marqués pour revue humaine via la file `data_validation_queue`.

### Q15 — Que se passe-t-il quand une source devient indisponible ?

Le run ETL part en statut `failed` avec le message d'erreur stocké dans `etl_runs.error_message`. Le dashboard admin l'affiche dans la section « Alertes ». Le précédent dataset reste en base, l'application continue de fonctionner sur la dernière version connue. Pour la prod, on prévoit des alertes Slack/email via webhook.

### Q16 — Comment gérez-vous la mise à jour incrémentale des sources ?

Pour cet MVP, on fait des snapshots manuels stockés dans `data/raw/` avec checksum SHA-256 + horodatage. Une réingestion complète est rapide (~20 000 lignes max). Pour les volumes plus importants, le futur pipeline aura un mode incrémental basé sur des timestamps `updated_at`.

### Q17 — Pourquoi avoir prévu une file de validation manuelle ?

Certaines anomalies ne sont pas binaires — par exemple, un BPM max de 240 est physiologiquement improbable mais peut résulter d'un capteur défaillant, d'une saisie erronée, ou d'un cas extrême réel. Plutôt que de rejeter automatiquement (perte de données) ou d'accepter (corruption), on demande à un humain de trancher. C'est le workflow `data_validation_queue` que vous voyez dans l'interface admin.

---

## Catégorie 5 — Évolutivité et IA

### Q18 — Comment intégrera-t-on les modules IA à terme ?

L'architecture est conçue pour ça. Un nouveau module IA = un nouveau service Python (par exemple `recommendations-service`) qui consomme la base PostgreSQL en lecture, expose un endpoint REST, est appelé par le BFF Hono qui agrège avec les autres données. La table `recommendations` est déjà prévue dans le MCD. Pour le prototype, on a même implémenté la reconnaissance d'images repas via Food101.

### Q19 — Scalabilité — combien d'utilisateurs supportés ?

Pour le MVP : 10 000 utilisateurs sans modification (un seul nœud PostgreSQL, un seul Hono, un seul FastAPI). Au-delà, on peut horizontaliser : (a) `backend-hono` est stateless, on duplique derrière un load balancer, (b) `ia-python` idem, (c) PostgreSQL en réplication read-only puis sharding. Le frontend Next.js scale via Vercel ou CDN.

### Q20 — Pourquoi engine-go dans l'archi ?

Pour les requêtes haute fréquence et latence critique (calcul d'IMC, agrégations sur de grosses volumétries de logs), Go offre des performances 5 à 10x supérieures à Python sur du calcul pur. Il expose un service gRPC consommé par `backend-hono`. Pour l'admin MSPR501, il est secondaire — on appelle directement FastAPI qui couvre les besoins.

---

## Catégorie 6 — Méthodologie et équipe

### Q21 — Comment avez-vous réparti le travail ?

4 membres, 4 spécialisations : data/ETL, BDD/API, frontend admin, déploiement/qualité. Code review croisée systématique sur les PR. Daily de 15 min en début de session. Outils : Trello pour le suivi des 37 tâches (visible dans `TODO.md`), Discord pour la communication, GitHub pour le code.

### Q22 — Quelles ont été les principales difficultés ?

Trois grosses : (1) perte accidentelle de fichiers locaux non-versionnés suite à un `git clean -fd` — reconstruction depuis zéro avec architecture améliorée, (2) cohérence des URL entre les 3 services, résolue avec le wrapper `lib/api/bff.ts`, (3) accessibilité des graphiques Recharts — solution par `role="img"` + version tabulaire `<details>`.

### Q23 — Si vous aviez plus de temps, que feriez-vous ?

Trois priorités : (1) implémenter l'ETL réel — actuellement la structure est prête mais l'ingestion concrète des datasets Kaggle reste à coder, (2) générer les types TypeScript depuis OpenAPI pour synchroniser automatiquement front et back, (3) déployer en préprod et faire un test de charge pour valider les hypothèses de scalabilité.

### Q24 — Qu'est-ce qui vous a le plus surpris dans ce projet ?

L'ampleur du périmètre vs le temps disponible nous a forcés à prioriser dur. Le critère « RGAA niveau AA déterminant » nous a poussés à investir tôt dans les composants accessibles — ce qui a payé : nos pages passent axe-core sans violation critique. C'est devenu un avantage différenciant vs MyFitnessPal ou Yazio.

---

## Catégorie 7 — Questions ouvertes possibles

### Q25 — Si un client B2B vous demande sa propre marque blanche, comment vous y prenez-vous ?

Le frontend a déjà un système de `theme-provider` avec themes dynamiques (vu dans `lib/themes/company-themes.ts`). On ajoute un nouveau thème, on configure son sous-domaine via reverse proxy, et on isole ses données via un champ `tenant_id` sur les tables sensibles (à ajouter en migration). Pour la facturation, on s'appuie sur les `subscriptionStatus` existants + un futur module billing.

### Q26 — Quel est votre plus gros risque pour la mise en production ?

Le respect du **RGPD** dès le premier vrai utilisateur. Aujourd'hui on est sur des datasets fictifs, mais à la première inscription réelle, il faut le consentement, le droit à l'oubli, l'export portable. C'est plus une question légale/UX que technique, mais ça doit être prêt avant le lancement.

### Q27 — Comment monitoreriez-vous la qualité des données en production ?

Le dashboard `/dashboard/admin/data-quality` est déjà ça. À enrichir avec : alertes Slack si taux de rejet > 5%, dashboard Grafana avec courbes longue durée, comparaison automatique avec les runs des 7 jours précédents pour détecter des dérives.

### Q28 — Pourquoi avoir choisi Mermaid pour les diagrammes ?

Trois raisons : versionné dans Git en texte, donc reviewable comme du code ; rendu natif dans GitHub, GitLab et la plupart des éditeurs Markdown ; pas de dépendance à un outil propriétaire (Lucidchart, draw.io). Pour la soutenance, on exporte en PNG haute résolution via `mermaid-cli`.

---

## Conseils généraux pour l'entretien

1. **Toujours répondre concrètement** — citer un fichier, un endpoint, une commande
2. **Ne pas inventer** — si on ne sait pas, dire « bonne question, on a creusé X, on n'est pas allé jusqu'à Y, c'est dans les perspectives »
3. **Distribuer les réponses** — chaque membre couvre son domaine
4. **Citer le cahier des charges** quand c'est pertinent (« le PDF nous demande... »)
5. **Montrer les preuves** — ouvrir un fichier de code, lancer une commande, naviguer vers une page
6. **Ne pas dépasser 1 min 30 par réponse** sauf si on demande de développer
