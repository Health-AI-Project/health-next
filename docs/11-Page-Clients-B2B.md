# 11 - Page Clients (interface B2B)

> Branche: `page-clients-b2b`

## Pourquoi cette tache

Le cahier des charges (section Business Model, B2B) decrit une offre en **marque blanche** destinee aux salles de sport, mutuelles et entreprises. Le systeme de themes B2B existe deja (4 themes dans le sidebar), mais il n'y a **aucune page Clients** pour gerer les utilisateurs cote B2B.

Le lien "Clients" est present dans le sidebar (`/dashboard/clients`) mais la page n'existe pas. Pour un partenaire B2B, cette page permettrait de voir les statistiques agregees de ses utilisateurs.

## Checklist

### 1) Creer la page Clients
- [ ] Creer `app/dashboard/clients/page.tsx`
- [ ] Afficher un tableau listant les utilisateurs du partenaire B2B (nom, email, date inscription, statut abonnement)
- [ ] Utiliser Table Shadcn avec tri et pagination basique
- [ ] Gerer le chargement (Skeleton) et les donnees demo

### 2) Statistiques agregees
- [ ] Afficher des cards resume en haut de page : nombre total d'utilisateurs, utilisateurs actifs, taux Premium, calories moyennes
- [ ] Optionnel : chart de croissance des inscriptions

### 3) Connecter a l'API
- [ ] Definir l'endpoint backend a appeler (ex: `/api/clients` ou `/api/b2b/users`)
- [ ] Definir l'interface TypeScript `Client` (id, name, email, subscription_tier, last_active, etc.)
- [ ] Prevoir des donnees demo

### 4) Guard et navigation
- [ ] Cette page est accessible uniquement aux comptes B2B (PremiumGuard ou guard specifique)
- [ ] Le lien "Clients" dans le sidebar existe deja

### 5) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] Verification visuelle avec donnees demo
- [ ] Responsive et accessibilite
