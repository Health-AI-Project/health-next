# Benchmark Frontend

## Contexte du choix

Pour la partie front de HealthAI Coach, on devait trancher entre plusieurs frameworks avant d'écrire la moindre ligne. Le but c'était pas de prendre "le plus hype" mais celui qui collait vraiment à nos contraintes : une app web pensée mobile d'abord, accessible (on a l'exigence WCAG AA dans le cahier des charges), qui doit causer à plusieurs APIs (IA de vision, gRPC côté backend Go, microservices nutrition et activité), et qu'une équipe de 4 personnes puisse maintenir sans galérer.

Au final on a pris **Next.js 16 avec React 19**. Ce doc explique pourquoi, avec les alternatives qu'on a regardées sérieusement.

## Ce qu'on a regardé

Avant de comparer les frameworks, on a listé nos vrais besoins, pondérés selon leur importance :

| Critère | Importance | Pourquoi c'est important pour nous |
|---|---|---|
| Rendu serveur / hydratation | Très haut | La landing doit charger vite sur mobile, et être indexée |
| Écosystème | Très haut | On ne veut pas réécrire des composants triviaux |
| Support TypeScript | Haut | Typage partout, zéro `any` en principe |
| Accessibilité native | Très haut | WCAG AA exigé, on peut pas bricoler à la main |
| Design system dispo | Haut | Shadcn/Radix nous plaisait déjà |
| Courbe d'apprentissage | Moyen | 4 personnes, formation limitée |
| Bundle size | Haut | Cible mobile = compte chaque ko |
| Recrutement long terme | Moyen | Si quelqu'un part, faut pouvoir remplacer |

## Les candidats

### Next.js (React) — retenu

C'est clairement le choix le plus "safe" vu le contexte. L'argument principal pour nous c'était pas React en soi, mais tout ce qui gravite autour : Shadcn UI a son port principal sur React, Radix UI idem, et la plupart des tutos modernes partent du principe qu'on est sur React. On voulait pas perdre du temps à chercher un équivalent Vue ou Svelte pour chaque lib.

L'App Router de Next.js 16 nous intéressait pour plusieurs raisons. D'abord le rendu mixte (Server Components par défaut, Client Components quand on en a besoin), ce qui permet de garder un bundle JS minimal. Ensuite le middleware natif, qu'on utilise pour protéger `/dashboard/*` côté serveur, avant même que la page soit servie. Et puis Turbopack en dev, qui est effectivement beaucoup plus rapide que Webpack (c'est pas du marketing, la différence est flagrante).

Points qui nous ont fait hésiter : la courbe d'apprentissage de l'App Router est réelle. Entre Server Components, Client Components, les Server Actions, le caching Next, il faut du temps pour tout maitriser. Mais une fois la phase d'appropriation passée, le gain est net.

### Vue.js avec Nuxt 3

Techniquement Nuxt 3 couvre les mêmes besoins que Next.js (SSR, SSG, middleware, etc). La syntaxe Single-File Component est objectivement plus lisible que le JSX, surtout pour des débutants. Le bundle initial est parfois un peu plus léger aussi.

Ce qui nous a fait dire non :
- Shadcn-Vue existe mais c'est un port, toujours un peu en retard sur la version React
- Pareil pour les composants Radix : l'équivalent côté Vue (Radix-Vue) est bien mais moins étoffé
- Sur le marché du travail en France, les devs React sont plus nombreux que les devs Vue. Si quelqu'un de l'équipe part ou passe à autre chose, on a plus de chances de retrouver quelqu'un facilement

### Angular

On l'a regardé par devoir (c'est le framework "officiel" des grosses boites françaises) mais on a rapidement abandonné. Angular est pensé pour les grosses applications d'entreprise, pas pour un MVP que 4 personnes doivent livrer en quelques semaines. Tout y est verbose : les modules, les décorateurs, l'injection de dépendances, les services. Pour itérer sur des composants UI, c'est lent.

L'écosystème design system est aussi beaucoup moins vibrant. Angular Material fait le job mais n'a pas la souplesse de Shadcn. Et le bundle initial d'une app Angular est historiquement plus lourd.

### SvelteKit

Celui-là on aurait aimé le prendre pour la perf (c'est vraiment impressionnant) mais deux problèmes :
1. Pas de design system équivalent à Shadcn. On aurait passé un temps fou à styler nous-mêmes
2. Recrutement : Svelte reste une niche, retrouver un dev Svelte en France c'est galère

Dommage, parce que côté DX c'est probablement le plus agréable des 4.

## Décision finale

Matrice simplifiée après élimination :

| Critère | Next.js | Nuxt | Angular | SvelteKit |
|---|:-:|:-:|:-:|:-:|
| SSR de qualité | Oui | Oui | Partiel | Oui |
| Écosystème React/Shadcn | Oui | Non (port) | Non | Non |
| TS natif | Oui | OK | Oui | OK |
| A11y out-of-the-box | Radix | Radix-Vue | Angular Material | Rien |
| Vitesse de dev | Bonne | Bonne | Lente | Bonne |
| Bundle | Moyen | Léger | Lourd | Léger |
| Recrutement FR | Facile | Moyen | Moyen | Dur |

Next.js gagne surtout sur l'écosystème et le recrutement. La perf n'est pas parfaite sur cette colonne mais compense par tout le reste.

## Les librairies qu'on a choisies autour

### Design system : Shadcn UI + Radix + Tailwind

Shadcn c'est pas vraiment une librairie, c'est plutôt un générateur de composants qu'on installe dans le projet. Le code source des boutons, modals, forms, etc est copié dans `components/ui/`. On peut le modifier librement. Ça évite la dépendance à une lib externe qu'on ne maîtrise pas (comme MUI par exemple).

Radix UI fournit les "primitives" headless derrière, c'est à dire la logique des widgets complexes (Dialog, Tabs, Select, Combobox, Checkbox) avec toute l'accessibilité ARIA gérée pour nous. Ça répond directement à l'exigence WCAG du cahier des charges.

Tailwind v4 pour le style. On a hésité avec CSS modules ou Vanilla Extract, mais Tailwind c'est ce avec quoi l'équipe est la plus à l'aise et c'est ce que préconise Shadcn.

Alternatives éliminées : MUI (trop rigide), Chakra (pas assez de composants avancés), Ant Design (look trop "corporate", pas adapté à notre cible Gen Z).

### Graphiques : Recharts

On avait 3 graphiques à faire (poids, calories, macros). Pour ça, pas besoin de D3.js. Recharts a une API déclarative qui s'intègre bien avec React, le bundle fait ~90ko (contre 250+ pour D3), et la gestion responsive est automatique.

### State : Zustand

Pour le wizard d'inscription qui a 6 étapes, on avait besoin d'un state partagé qui survive aux refresh. Zustand avec son middleware `persist` fait ça en 10 lignes. On a évité Redux (overkill pour un MVP) et Context (pas de persistance et re-renders indésirables).

### Formulaires : React Hook Form + Zod

Zod pour les schémas de validation (réutilisables côté backend en théorie), React Hook Form pour éviter les re-renders à chaque keystroke. Intégration native avec Shadcn. Pas mieux dans l'écosystème React actuellement.

### Auth : Better Auth

Plus moderne que NextAuth/Auth.js, full TypeScript, gestion des sessions via cookies HttpOnly par défaut. L'équipe backend l'avait déjà choisi, donc logique de suivre.

## Ce qu'on a perdu en choisissant ça

Faut être honnête, aucun choix n'est parfait :
- On dépend de l'écosystème Vercel (sponsors principaux de Next.js). Si demain ils changent de modèle économique, ça peut poser question
- React 19 est très récent, on a eu 2 ou 3 bugs liés à l'hydratation qu'il a fallu contourner
- La taille du bundle Next.js est perfectible, surtout avec Turbopack en dev qui charge pas mal de code

Globalement on est satisfaits du choix mais on aurait pu prendre Nuxt et avoir quelque chose de comparable.
