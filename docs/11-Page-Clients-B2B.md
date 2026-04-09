# 11 - Page Clients (interface B2B) (TERMINEE)

> Branche: `page-clients-b2b`

## Pourquoi cette tache

Le cahier des charges (section Business Model, B2B) decrit une offre en **marque blanche** destinee aux salles de sport, mutuelles et entreprises. Le systeme de themes B2B existe deja (4 themes dans le sidebar), mais il n'y a **aucune page Clients** pour gerer les utilisateurs cote B2B.

Le lien "Clients" est present dans le sidebar (`/dashboard/clients`) mais la page n'existe pas. Pour un partenaire B2B, cette page permettrait de voir les statistiques agregees de ses utilisateurs.

## Checklist

### 1) Creer la page Clients
- [x] Cree `app/dashboard/clients/page.tsx`
  - Fait en creant un composant client avec fetch API + fallback sur 8 clients demo. Tableau complet avec nom, email, abonnement, date inscription, calories moyennes, seances, statut actif/inactif.
- [x] Table Shadcn avec 7 colonnes (Nom, Email, Abonnement, Inscription, Cal. moy., Seances, Statut)
  - Fait avec les composants Table, TableHeader, TableBody, TableRow, TableHead, TableCell.
- [x] Skeleton pour le chargement, donnees demo (8 clients avec profils varies)

### 2) Statistiques agregees
- [x] 4 cards resume : Total clients, Actifs (7j), Taux Premium (%), Calories moyennes
  - Fait avec le meme pattern Card que les autres pages. Le taux Premium est calcule dynamiquement. Les clients actifs sont ceux connectes dans les 7 derniers jours.

### 3) Connecter a l'API
- [x] Appel `GET /api/clients` via `apiFetch()`, fallback sur `DEMO_CLIENTS`
  - Fait dans un `useEffect` avec try/catch.
- [x] Interface `Client` definie (id, name, email, subscription_tier, last_active, joined, calories_avg, workouts_count)
- [x] 8 clients demo avec des tiers varies (3 free, 3 premium, 2 premium_plus)

### 4) Guard et navigation
- [x] Le lien "Clients" dans le sidebar existait deja et pointe vers `/dashboard/clients`
- [x] Badges abonnement colores : Free (outline), Premium (secondary), Premium+ (default)
- [x] Badges statut : Actif (vert) si connecte dans les 7 derniers jours, Inactif (orange) sinon

### 5) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur, route `/dashboard/clients` listee
- [x] Responsive : tableau scrollable horizontalement sur mobile
- [x] Accessibilite : sr-only headings, aria-hidden sur icones

## Modifications apportees

### Fichiers crees
- `app/dashboard/clients/page.tsx` : page clients B2B avec 4 cards stats, tableau 8 clients demo, badges tier et statut
