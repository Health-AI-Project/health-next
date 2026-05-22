# Assets MSPR501

Ce dossier contient les fichiers d'orchestration à copier à la racine du projet
(parent du dossier `health-next/`) :

```
Health-AI-project/
├── docker-compose.yml          ← copie depuis assets/
├── .env                        ← copie depuis assets/.env.example
├── ia-python/
├── backend-hono/
├── engine-go/
└── health-next/
```

## Copie initiale

```bash
# Depuis Health-AI-project/
cp health-next/docs/mspr501/assets/docker-compose.yml .
cp health-next/docs/mspr501/assets/.env.example .env
# Éditer .env pour ajuster les secrets
```

## Pourquoi pas à la racine du repo ?

Les 5 repos sont des dépôts Git indépendants. Le `docker-compose.yml`
orchestre tous les services et n'appartient à aucun repo en particulier.
La version maîtresse est tracée ici dans `health-next` car c'est le repo
qui contient la doc MSPR501. Une fois copié à la racine du projet, il y reste
mais peut diverger — re-copier depuis cet emplacement si besoin.
