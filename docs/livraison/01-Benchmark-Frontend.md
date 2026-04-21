# Benchmark Frontend — HealthNext

## 1. Contexte

Dans le cadre du développement de la plateforme **HealthAI Coach**, un choix technologique devait être fait pour l'interface utilisateur. L'application cible les Millennials/Gen Z, doit être responsive (mobile, tablette, desktop), accessible (WCAG/RGAA AA), et capable de consommer plusieurs APIs (IA, gRPC, backend métier).

Ce document présente le benchmark réalisé pour justifier le choix de **Next.js 16 (React 19)** comme framework frontend.

---

## 2. Critères d'évaluation

| Critère | Pondération | Justification |
|---|---|---|
| Performance (SSR/hydration) | ★★★★★ | Temps de chargement critique sur mobile |
| Écosystème & communauté | ★★★★★ | Recrutement futur, maintenance long terme |
| TypeScript natif | ★★★★☆ | Sécurité du code, DX |
| SEO / Rendu côté serveur | ★★★★☆ | Landing page indexable |
| Accessibilité (a11y) | ★★★★★ | WCAG AA exigé par le cahier des charges |
| Courbe d'apprentissage | ★★★☆☆ | Équipe de 4 personnes, formation rapide |
| Compatibilité design system | ★★★★☆ | Shadcn UI, Tailwind |
| Bundle size | ★★★★☆ | Perf mobile |

---

## 3. Comparatif des frameworks

### 3.1 React (Next.js) — **CHOIX RETENU**

**Points forts :**
- **Rendu hybride** (SSR, SSG, ISR, Client) : parfait pour une landing page indexable + un dashboard interactif
- **Écosystème le plus mature** : Shadcn UI, Radix UI, React Hook Form, Zustand, Recharts, TanStack Query — tout ce qu'on utilise a des intégrations natives
- **Tooling Next.js 16** : Turbopack, App Router, Server Components, middleware natif pour l'auth
- **TypeScript natif** : typage complet, autocomplétion
- **React 19** : nouveau compiler, meilleures perfs de base
- **Communauté** : +227k ⭐ sur GitHub (React), support LTS garanti par Vercel
- **Accessibilité** : Radix UI fournit des composants accessibles par défaut (ARIA, keyboard)

**Points faibles :**
- Build plus lent que Vite (mais Turbopack comble l'écart)
- Hydration parfois lourde si mal optimisée
- Courbe d'apprentissage plus raide (App Router, Server Components)

### 3.2 Vue.js (Nuxt 3)

**Points forts :**
- Syntaxe Single-File Components très lisible
- Nuxt 3 offre du SSR comparable à Next.js
- Moins verbose que React pour les petits projets
- Bundle initial plus léger

**Points faibles :**
- Écosystème **moins riche** pour notre stack (Shadcn UI principal port est React ; Vue a son équivalent mais moins mature)
- Moins de composants accessibles prêts à l'emploi (Radix UI n'a pas d'équivalent aussi complet côté Vue)
- Recrutement plus difficile (marché du travail dominé par React)
- Composition API moins intuitive pour les débutants React

### 3.3 Angular

**Points forts :**
- Framework "batteries included" (routing, HTTP, forms, i18n intégrés)
- TypeScript first-class depuis le début
- Bon pour les grosses applications d'entreprise
- Excellents outils CLI (ng generate, ng build)

**Points faibles :**
- **Beaucoup trop lourd** pour notre scope (MVP 4 personnes, 6 pages)
- Syntaxe verbose (decorators, modules, injection)
- Bundle initial plus important
- Courbe d'apprentissage très raide
- Moins agile pour itérer sur des composants UI
- Écosystème design system moins vibrant (pas d'équivalent Shadcn UI)

### 3.4 SvelteKit

**Points forts :**
- Performance exceptionnelle (compilation AOT)
- Bundle extrêmement léger
- Syntaxe simple et claire

**Points faibles :**
- Écosystème encore immature
- Moins de composants accessibles prêts à l'emploi
- Recrutement plus difficile
- Communauté plus petite (risque sur la pérennité)

---

## 4. Matrice de décision

| Critère | Next.js (React) | Nuxt (Vue) | Angular | SvelteKit |
|---|:-:|:-:|:-:|:-:|
| Performance SSR | ✅ Excellent | ✅ Excellent | ⚠️ Bon | ✅ Excellent |
| Écosystème | ✅ 5/5 | ⚠️ 4/5 | ⚠️ 4/5 | ❌ 2/5 |
| TypeScript | ✅ Natif | ⚠️ Bon | ✅ Natif | ⚠️ Bon |
| Accessibilité | ✅ Radix UI | ⚠️ Partiel | ⚠️ Partiel | ❌ Manuel |
| Design system | ✅ Shadcn UI | ⚠️ Shadcn-Vue | ❌ Angular Material | ❌ Manuel |
| SEO | ✅ Excellent | ✅ Excellent | ⚠️ Bon | ✅ Excellent |
| Apprentissage | ⚠️ Moyen | ✅ Facile | ❌ Difficile | ✅ Facile |
| Communauté | ✅ 227k ⭐ | ✅ 208k ⭐ | ⚠️ 96k ⭐ | ⚠️ 78k ⭐ |
| Recrutement | ✅ Facile | ⚠️ Moyen | ⚠️ Moyen | ❌ Difficile |
| **TOTAL** | **9/9** | **5/9** | **3/9** | **2/9** |

---

## 5. Choix des librairies associées

### 5.1 Design System : Shadcn UI + Radix UI + Tailwind CSS

**Pourquoi ?**
- Composants headless (pas de style imposé) → personnalisation totale
- Accessibilité WCAG AA **by default** via Radix UI (ARIA, keyboard, focus trap)
- Tailwind CSS = utility-first, design cohérent, contrôle total du design system
- Code installable et modifiable (pas de dépendance npm opaque)

**Alternatives évaluées :**
- Material UI (MUI) → trop opinionné, difficile à customiser, bundle lourd
- Chakra UI → bon mais plus limité, pas de composants dialog/combobox headless
- Ant Design → look trop "enterprise", pas adapté à notre cible (jeune, moderne)

### 5.2 Graphiques : Recharts

**Pourquoi ?**
- API déclarative React-friendly
- Responsive par défaut
- Suffisant pour nos 3 graphiques (poids, calories, macros)
- Bundle plus léger que D3.js (~90ko vs 250ko+)

**Alternatives évaluées :**
- D3.js → trop bas niveau, overkill pour nos besoins
- Chart.js → impératif (Canvas), moins React-friendly
- Plotly.js → trop lourd (~900ko), overkill

### 5.3 State management : Zustand

**Pourquoi ?**
- API minimaliste (hook unique)
- Middleware `persist` natif (stockage localStorage pour le wizard)
- Pas de boilerplate contrairement à Redux
- TypeScript natif

**Alternatives évaluées :**
- Redux Toolkit → overkill pour un MVP
- React Context → pas de persistance, re-renders inutiles
- Jotai → excellent mais moins connu, moins d'exemples

### 5.4 Formulaires : React Hook Form + Zod

**Pourquoi ?**
- Validation schema-based avec Zod (réutilisable côté API)
- Performance (pas de re-render inutile)
- Intégration Shadcn UI native

### 5.5 Auth : Better Auth

**Pourquoi ?**
- Moderne, TypeScript, gère sessions via cookies HttpOnly
- Support email/password out-of-the-box
- Middleware Next.js simple à intégrer

---

## 6. Conclusion

**Next.js 16 (React 19) + Shadcn UI + Tailwind CSS + Recharts + Zustand + Better Auth** a été retenu car cette stack :

1. **Couvre tous les besoins** exprimés dans le cahier des charges (responsive, accessible, APIs IA, visualisations)
2. **Maximise la vélocité** de développement (4 devs, 50h de formation)
3. **Garantit la pérennité** (écosystème le plus riche, Vercel comme sponsor principal)
4. **Respecte WCAG AA** par défaut via Radix UI
5. **Permet le déploiement B2B en marque blanche** (tokens CSS customisables, theming dynamique)

Cette stack est également celle privilégiée par les acteurs référents du marché (Vercel, Linear, Cal.com, Shadcn ecosystem).
