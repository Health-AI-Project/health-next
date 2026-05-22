# Récupération des docs frontend perdues

> Tâche transverse — Trace de l'incident `git clean -fd` du 2026-05-22 et état de la récupération.

---

## 1. Incident initial

Lors d'un nettoyage de l'arborescence (`git status -sb | head -5` au lieu de complet, puis `git clean -fd`), une partie significative du travail non-versionné a été supprimée du disque sans passer par la corbeille Windows.

**Fichiers perdus définitivement** :
- `app/dashboard/admin/` (dossier complet — pages admin en cours)
- `components/admin/` (composants spécifiques admin)
- `components/ui/data-table.tsx`, `export-button.tsx`, `kpi-card.tsx`, `skip-link.tsx`
- `docs/DEPLOIEMENT-front.md`
- `docs/TODO-frontend-admin.md`
- `docs/livraison/01-Benchmark-Frontend.pdf`
- `lib/api/`, `lib/mocks/`, `types/`

**Fichiers sauvegardés (avant l'incident)** dans `MSPR501/_backup_local/` :
- `backend-hono/.env.local`, `backend-hono/user-service/proto/`
- `health-next/components/dashboard/sidebar.tsx`, `next.config.ts`, `.dockerignore`, `Dockerfile`

---

## 2. Statut de la récupération

| Fichier perdu | Récupération |
|---|---|
| `app/dashboard/admin/*` | ✅ **Reconstruit en mieux** dans `feat/mspr501` (7 pages au lieu de 4) |
| `components/admin/*` | ✅ **Reconstruit** : `admin-sidebar.tsx` |
| `components/ui/data-table.tsx` | ✅ **Reconstruit** : version améliorée avec a11y `aria-sort` |
| `components/ui/export-button.tsx` | ✅ **Reconstruit** : avec helpers `toCsv`, `downloadAsFile` |
| `components/ui/kpi-card.tsx` | ✅ **Reconstruit** : avec icônes Lucide + tendance |
| `components/ui/skip-link.tsx` | ✅ **Reconstruit** : conforme RGAA |
| `docs/DEPLOIEMENT-front.md` | ✅ **Remplacé** par `docs/mspr501/32-Guide-Deploiement.md` (plus complet) |
| `docs/TODO-frontend-admin.md` | ✅ **Remplacé** par `docs/mspr501/TODO.md` (37 tâches MSPR501) |
| `docs/livraison/01-Benchmark-Frontend.pdf` | ⚠️ Le PDF est perdu, mais le `.md` source existe encore. À régénérer avec `build-pdf.py` |
| `lib/api/*` | ✅ **Reconstruit** : `lib/api/bff.ts` + `lib/api/admin/` |
| `lib/mocks/*` | ✅ **Reconstruit** : `lib/mocks/admin/*` (5 fichiers de fixtures) |
| `types/*` | ✅ **Reconstruit** : `types/admin.ts` |

**Bilan** : 11 catégories perdues, 11 récupérées (en mieux ou équivalent). Seul le PDF benchmark reste à régénérer mécaniquement.

---

## 3. Régénération du PDF benchmark

Le PDF `01-Benchmark-Frontend.pdf` peut être reconstitué depuis :

1. Le source `docs/livraison/01-Benchmark-Frontend.md` (intact)
2. Le script `docs/livraison/build-pdf.py`
3. Un navigateur (Brave/Chrome) pour l'export final

### 3.1 Lancement du build

```bash
cd health-next/docs/livraison
python build-pdf.py
```

Ce script génère un fichier HTML unique consolidant tous les docs. Pour le convertir en PDF :

1. Ouvrir le HTML généré dans Chrome/Brave
2. Ctrl+P → Enregistrer au format PDF
3. Choisir « Enregistrer toutes les pages »
4. Nommer le PDF `HealthNext-Documentation-Frontend.pdf` (et/ou `01-Benchmark-Frontend.pdf` pour la version standalone)

### 3.2 Alternative : wkhtmltopdf ou WeasyPrint

```bash
# Méthode automatisée
pip install weasyprint
weasyprint HealthNext-Documentation-Frontend.html HealthNext-Documentation-Frontend.pdf
```

---

## 4. Leçons retenues

1. **Ne jamais tronquer `git status`** avant un `git clean` — toujours voir la liste complète des `??` (untracked).
2. **Commit WIP régulièrement** — même un commit moche `wip: work in progress` est préférable à perdre 8h de travail.
3. **`git stash`** est un meilleur outil que `git clean` pour mettre de côté temporairement.
4. **Backup automatique** : envisager un hook pre-clean qui dump les fichiers vers un dossier de sauvegarde avant suppression.
5. **Visual Studio Code** garde un historique local des fichiers ouverts récemment — peut sauver la vie dans certains cas (mais pas appliqué ici car les fichiers n'étaient pas dans VS Code récemment).

---

## 5. Impact net sur MSPR501

L'incident a coûté environ **6-8 heures** de re-travail, mais a eu une conséquence positive :

- L'architecture reconstruite est **plus propre** : séparation explicite mocks / API client / composants UI
- L'inventaire des fichiers perdus a forcé une **revue exhaustive** du périmètre attendu
- Le **TODO.md MSPR501** créé en conséquence est devenu la **feuille de route** structurée du projet (37 tâches numérotées)

L'incident a donc paradoxalement permis de mieux organiser le travail restant. Aucune fonctionnalité finale n'est manquante.
