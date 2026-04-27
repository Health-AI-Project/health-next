# 12 - Role administrateur et gestion des clients

> Branche : `frontend` (commit direct sur main suite a la demande utilisateur)

## Pourquoi cette tache

Dans la version precedente de la page Clients, l'acces etait filtre par tier `premium_plus` mais
aucune logique de role n'existait : un Premium+ voyait les stats agregees, mais personne ne pouvait
acceder aux donnees nominatives ni gerer les utilisateurs.

Pour preparer la production et permettre une vraie administration de la plateforme, on introduit
un role `admin` qui se superpose au systeme de tiers d'abonnement. Un admin a acces a la liste
nominative des utilisateurs et peut modifier leur abonnement et leur role.

## Modele

- **Tier d'abonnement** (`free` | `premium` | `premium_plus`) : ce que l'utilisateur a paye, ouvre
  l'acces a des fonctionnalites (meal plan, workouts, page Clients en lecture).
- **Role** (`user` | `admin`) : niveau de privilege technique, distinct du tier. Un admin peut
  gerer les autres utilisateurs.

## Fichiers crees

- `lib/hooks/use-user-role.ts` - Hook `useUserRole()` qui expose `role`, `isAdmin`, `isLoading`.
  Lit la valeur depuis l'API (`/api/home`) ou un flag de demo dans `localStorage`. Une fonction
  `setDemoAdmin(boolean)` permet d'activer le mode admin pour la demo orale.

## Fichiers modifies

- `app/dashboard/clients/page.tsx` - Refondu pour gerer trois cas d'acces :
  1. Non-Premium+ et non-admin : ecran "Acces reserve" avec bouton de demo admin.
  2. Premium+ non-admin : 4 cards stats + repartition par abonnement (anonyme, agregee).
  3. Admin (peu importe le tier) : 4 cards stats (admins compte au lieu des calories) + tableau
     complet avec selecteurs pour modifier l'abonnement et le role de chaque utilisateur.

## Securite et confidentialite

- Le check d'admin est fait cote frontend via le hook. Cote backend, les routes sensibles
  (`/api/clients/:id/role`, `/api/clients/:id/tier`) doivent verifier le role admin sur la
  session avant d'appliquer la modification.
- Le mode demo (`localStorage`) est volontairement isole : il permet de presenter la fonctionnalite
  sans backend, mais il n'accorde aucun privilege reel cote serveur.

## Mode demonstration

Pour la demo orale MSPR, un bouton "Activer le role admin (demo)" est present sur l'ecran d'acces
reserve et sur la vue Premium+. Il permet de basculer en mode admin sans backend, parfait pour
montrer la fonctionnalite en live.

## Validation

- `npx tsc --noEmit` : 0 erreur.
- Le build `npm run build` doit lister `/dashboard/clients` sans erreur.
- A11y : selecteurs `Select` ont un `aria-label` explicite par utilisateur.
