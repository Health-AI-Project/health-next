# Scénario de démo live — Soutenance MSPR501

> Durée : 5 à 8 minutes (intégrée à la slide 8 du support)
> Objectif : montrer que l'ensemble du backend métier est fonctionnel de bout en bout.

---

## Pré-requis avant la démo

À faire **2 heures avant** la soutenance :

1. ✅ Stack démarrée : `docker compose up -d`
2. ✅ Tous les services `healthy` : `docker compose ps`
3. ✅ Seed appliqué : 8 runs ETL, 4 items validation
4. ✅ Compte admin créé : `admin@healthai.coach` promu via SQL
5. ✅ Navigateur Chrome ouvert sur `http://localhost:3000` en mode focus (F11)
6. ✅ DevTools réseau ouvert dans un onglet de fallback (pour montrer les appels réels)
7. ✅ Terminal ouvert avec `docker compose logs -f ia-python` pour montrer les logs en direct

**Mode dégradé** : si Docker tombe en panne, activer `NEXT_PUBLIC_ADMIN_USE_MOCKS=1` et relancer `npm run dev`. L'interface fonctionne avec les mocks.

---

## Scénario en 6 actes

### Acte 1 — Connexion et accueil admin (30 s)

1. Naviguer vers <http://localhost:3000>
2. Cliquer « Se connecter »
3. Entrer les identifiants admin
4. Une fois sur le dashboard utilisateur, naviguer manuellement vers `/dashboard/admin`

**À dire** : *"L'utilisateur classique ne voit pas l'admin. Le middleware vérifie le rôle côté serveur avant même de servir la page."*

### Acte 2 — Dashboard qualité (1 min 30)

1. Cliquer sur la carte « Qualité des données »
2. Pointer les 4 KPIs en haut (lignes ingérées, taux rejet, taux succès, durée moy.)
3. Montrer le bloc d'alerte (run failed sur `diet_recommendations`)
4. Faire défiler vers le graphique « Ingestion par source »
5. Cliquer sur `<details>` « Voir les données du graphique » → table accessible

**À dire** : *"On voit en direct les métriques 24h. Le run en échec est mis en évidence avec son message d'erreur. Le graphique a une version tabulaire pour les lecteurs d'écran — c'est notre conformité RGAA."*

6. Faire défiler vers la table « Historique des runs ETL »
7. Trier par « Rejetées » décroissant
8. Filtrer en tapant `exercisedb` dans la barre de recherche

**À dire** : *"La DataTable est générique : tri, filtre, pagination, le tout accessible au clavier. Le tri annonce `aria-sort` aux lecteurs d'écran."*

### Acte 3 — Nettoyage interactif (1 min 30)

1. Cliquer dans la sidebar sur « Datasets »
2. Choisir « Daily Food & Nutrition »
3. Pointer la badge « 1 anomalie » sur la ligne `Caesar salad` (calories: 850)
4. Cliquer « Éditer » sur cette ligne
5. Dans la modale : pointer le message d'anomalie (« écart de 173% »)
6. Modifier `calories` de 850 à 312 (valeur cohérente avec macros)
7. Cliquer « Sauvegarder + valider »
8. Le toast confirme, la ligne passe en statut « Validée »

**À dire** : *"L'admin corrige manuellement les anomalies que le pipeline n'a pas pu résoudre seul. La modification est tracée dans `audit_log` côté backend."*

### Acte 4 — Export CSV (30 s)

1. Sur la même page, cliquer le bouton « Exporter » en haut à droite
2. Sélectionner « Format CSV »
3. Le fichier `daily_food_nutrition.csv` se télécharge
4. Ouvrir le fichier (preview natif Chrome ou Excel)

**À dire** : *"Le backend `/api/admin/export/:source` streame le CSV directement. Pour de gros datasets, ça évite de saturer la mémoire."*

### Acte 5 — Workflow de validation (1 min 30)

1. Cliquer « Validation » dans la sidebar
2. Pointer les 3 KPIs en haut (En attente, Validés 24h, Rejetés 24h)
3. Sur la ligne `gm_002` (max_bpm: 240), cliquer l'œil pour ouvrir les détails
4. Dans le dialog : pointer le DiffView avec correction suggérée par le pipeline (240 → 190)
5. Cliquer « Approuver le lot »
6. Le toast confirme

7. Cliquer sur l'onglet « Historique »
8. Voir le lot qu'on vient d'approuver avec l'auteur et le timestamp

**À dire** : *"Le pipeline ne décide pas seul — toute anomalie ambiguë part dans cette file d'attente. L'historique trace qui a validé quoi, c'est notre auditabilité."*

### Acte 6 — Analytics business (1 min)

1. Cliquer « Analytics business » dans la sidebar
2. Pointer les 6 KPIs business (utilisateurs actifs, conversion premium, NPS, etc.)
3. Cliquer l'onglet « Utilisateurs » (déjà actif)
4. Pointer l'histogramme empilé démographique
5. Cliquer l'onglet « Nutrition » — courbe 30 jours
6. Cliquer l'onglet « Fitness » — top 10 exercices

**À dire** : *"Les équipes produit utilisent cette section pour comprendre l'audience, les habitudes alimentaires moyennes, et les exercices populaires. Tout est requêté en SQL agrégé temps réel, pas de pré-calcul figé."*

### Acte 7 — Bonus : flux de données et OpenAPI (1 min)

1. Cliquer « Flux de données » dans la sidebar
2. Montrer la cartographie 5 couches
3. Cliquer sur un nœud (ex: « PostgreSQL ») — détails s'affichent

**À dire** : *"Vue d'ensemble pour les nouveaux développeurs ou pour expliquer l'archi à un product manager."*

4. Ouvrir un nouvel onglet sur <http://localhost:8000/docs>
5. Pointer la section `admin` de l'API
6. Déplier un endpoint (ex: `GET /admin/data-quality`)
7. Cliquer « Try it out » et exécuter

**À dire** : *"L'API est entièrement documentée OpenAPI 3, testable directement depuis Swagger. C'est ce qui permettra à l'équipe mobile et aux partenaires B2B de s'intégrer sans friction."*

---

## Fallbacks en cas de pépin

| Pépin | Plan B |
|---|---|
| Docker ne démarre pas | Activer `NEXT_PUBLIC_ADMIN_USE_MOCKS=1` + `npm run dev` — toute l'interface tourne en mocks |
| Une page admin plante | Naviguer vers une autre, mentionner que les fallback mocks sont actifs |
| Le seed n'est pas en base | Montrer le SQL `03_seed_mspr501_admin.sql` et relancer manuellement |
| Le compte admin n'existe pas | Activer le mode démo via `localStorage.setItem('health_ai_demo_admin', '1')` |
| L'IA Python est down | Le BFF retourne 502 mais le fallback mock prend le relais — c'est visible dans les DevTools mais l'UX reste OK |

**Règle d'or** : ne jamais débugger en live. Si quelque chose ne marche pas, dire « on va y revenir après les questions » et continuer le scénario.

---

## Messages clés à marteler pendant la démo

1. *« Tout est sourcé en base, on ne joue pas avec des données figées »* (sauf si fallback mock)
2. *« Chaque action est tracée — auditabilité complète »*
3. *« RGAA AA : l'admin est utilisable sans la souris, sans les yeux »*
4. *« Conçu pour évoluer — ajouter un module IA = ajouter un endpoint, pas réécrire »*
5. *« Reproductible < 30 minutes sur n'importe quelle machine Docker »*

---

## Captures écran à préparer

Pour les slides backup et le rapport :

- [ ] Accueil admin (les 5 cartes)
- [ ] Data-quality (KPIs + graph + table)
- [ ] Datasets index (5 sources avec compteurs)
- [ ] Datasets [source] avec ligne anormale highlightée
- [ ] Modal d'édition avec champ en erreur
- [ ] Validation queue avec 1 PENDING
- [ ] DiffView avant/après dans le dialog
- [ ] Analytics histogramme démographique
- [ ] Flow diagram avec un nœud sélectionné
- [ ] DevTools Network montrant `/api/admin/data-quality` 200 OK
- [ ] Terminal `docker compose ps` avec tout healthy
- [ ] Output axe-core sans violation critique

À placer dans `docs/screenshots/admin/`.
