# Validation reproductibilité — Test machine vierge

> Tâche transverse — Cahier des charges section IV.7 : *« permettre à toute équipe technique de reproduire l'environnement et de lancer la solution en moins de trente minutes. »*

---

## 1. Objectif

Valider que le `docker-compose.yml` global + le guide de déploiement (`32-Guide-Deploiement.md`) permettent à un technicien qui découvre le projet de :

1. Cloner les 4 repos
2. Configurer l'environnement
3. Démarrer la stack
4. Accéder à l'interface admin

…le tout en **moins de 30 minutes**.

---

## 2. Procédure de test

### 2.1 Environnements de test

Réaliser le test sur **au moins deux environnements différents** :

| Env | OS | Docker | Statut |
|---|---|---|---|
| Test A | Windows 11 + Docker Desktop 4.x | 24.x | ⏳ À planifier |
| Test B | Ubuntu 22.04 + Docker CE | 24.x | ⏳ À planifier |
| Test C | macOS Sonoma + Docker Desktop | 24.x | ⏳ À planifier (optionnel) |

### 2.2 Protocole

Sur chaque environnement, un membre **différent** de l'équipe (et non celui qui a écrit le code) doit :

1. **Préparer** : machine vierge ou VM avec uniquement Docker + Git installés
2. **Chronomètre démarré** à `T0`
3. **Suivre le guide** `32-Guide-Deploiement.md` à la lettre, sans aide externe
4. **Noter** chaque étape avec son timestamp et toute friction rencontrée
5. **Chronomètre arrêté** quand l'interface admin est accessible et qu'au moins une page admin (data-quality) affiche les données du seed

### 2.3 Critères de succès

| Critère | Seuil |
|---|---|
| Durée totale | ≤ 30 minutes |
| Étapes documentées et exécutables | 100% |
| Erreurs nécessitant recherche externe | 0 |
| Friction utilisable mais ralentissant | ≤ 3 incidents mineurs |

Si un critère échoue, la PR de la branche `feat/mspr501` ne doit pas être mergée tant que le guide n'est pas corrigé.

---

## 3. Fiche de validation (template)

À recopier et remplir lors de chaque test.

```
Testeur :    [Prénom]
Date :       [YYYY-MM-DD]
OS :         [Windows 11 / Ubuntu 22.04 / macOS Sonoma / ...]
Docker :     [version]
Hardware :   [RAM, CPU]

═══════════════════════════════════════════════════════════════
T0 : Début du test (Docker démarré, dossier vide)

[ ] T+__min  Clone des 4 repos              (durée : __min)
[ ] T+__min  cp .env.example .env           (durée : __min)
[ ] T+__min  Édition .env (secrets)         (durée : __min)
[ ] T+__min  docker compose up -d --build   (durée : __min)
[ ] T+__min  Attente healthchecks           (durée : __min)
[ ] T+__min  Vérification /health           (durée : __min)
[ ] T+__min  Création compte admin          (durée : __min)
[ ] T+__min  Accès /dashboard/admin         (durée : __min)
[ ] T+__min  Page data-quality affiche      (durée : __min)
       les KPIs avec données seedées

T_total = ___ minutes

═══════════════════════════════════════════════════════════════
Incidents :
- [ ]
- [ ]
- [ ]

Améliorations à apporter au guide :
- [ ]
- [ ]
```

---

## 4. Optimisations possibles si > 30 min

### 4.1 Si le build Docker est long

- **Pré-build et publier les images** sur GitHub Container Registry
- Modifier `docker-compose.yml` pour utiliser `image:` au lieu de `build:` quand disponible
- Économise 5-8 minutes du build initial

### 4.2 Si la configuration des secrets est laborieuse

- Fournir un `.env.dev` avec des valeurs par défaut **non-sécurisées** mais fonctionnelles
- Document clairement « à ne JAMAIS utiliser en production »
- Réduit l'étape à un `cp .env.dev .env`

### 4.3 Si le démarrage est instable

- Ajouter des `depends_on: condition: service_healthy` plus stricts
- Augmenter les `retries` des healthchecks
- Éviter les race conditions entre postgres et ia-python (déjà couvert)

### 4.4 Si la création du compte admin est bloquante

- Ajouter un seed SQL qui crée un user admin par défaut avec un mot de passe documenté
- Document clairement « à supprimer en production »

```sql
-- Ajouter dans 03_seed_mspr501_admin.sql
INSERT INTO "user" (id, name, email, "subscriptionStatus", email_verified, created_at, updated_at)
VALUES ('admin-demo', 'Admin Démo', 'admin@healthai.coach.demo', 'PREMIUM_PLUS', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

Compte démo `admin@healthai.coach.demo` (pas de mot de passe nécessaire si on active le mode démo via localStorage).

---

## 5. Calendrier prévu

Avant la soutenance :

- [ ] **T-7j** : Test A par membre #2 (auteur : membre #1)
- [ ] **T-5j** : Correction du guide si > 30 min
- [ ] **T-3j** : Test B sur OS différent par membre #3
- [ ] **T-1j** : Test final de bout en bout par membre #4 (répétition de la démo)

Si tous les tests passent, le repo est marqué « MSPR501 ready » et la branche `feat/mspr501` est mergée sur `main`.

---

## 6. Backup du chronomètre

À conserver dans le matériel de soutenance pour répondre à la question Q13 de `36-Questions-Reponses-Jury.md` (« Avez-vous testé sur une autre machine ? »).

Capture suggérée pour les slides : tableau récap des 3 tests avec les durées réelles.

---

## 7. État actuel

- [x] `docker-compose.yml` global créé
- [x] `.env.example` documenté
- [x] Guide de déploiement écrit (`32-Guide-Deploiement.md`)
- [x] Seed démo MSPR501 (`03_seed_mspr501_admin.sql`)
- [ ] **Test reproductibilité sur machine vierge** ← à exécuter par un membre de l'équipe

**Recommandation** : ne pas marquer cette tâche complétée tant que le test n'a pas été réellement effectué. C'est la preuve la plus forte de la « logique industrielle » attendue par le jury.
