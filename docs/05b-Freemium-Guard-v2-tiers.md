# 05b - Freemium Guard v2 : distinction Premium / Premium+ (TERMINEE)

> Branche: `freemium-guard-v2`

## Pourquoi cette etape supplementaire

L'etape 05 a mis en place le systeme de guard avec un boolean `is_premium` (free vs premium).
Mais le cahier des charges definit **3 tiers** avec des fonctionnalites differentes :

- **Freemium** : journal alimentaire, suivi d'activite, IMC, tableaux simples
- **Premium** (9,99€) : recommandations IA, plans nutritionnels/sportifs, suivi fin des objectifs
- **Premium+** (19,99€) : biometrie (FC, sommeil, poids), objets connectes, consultations nutritionnistes

Le guard actuel ne distingue pas Premium et Premium+ : un utilisateur Premium ne devrait pas avoir acces aux fonctionnalites exclusives Premium+ (biometrie, consultations). Il faut passer d'un boolean a un systeme de tiers.

## Checklist

### 1) Refactorer le hook usePremiumStatus vers un systeme de tiers
- [x] Remplacer `isPremium: boolean` par `tier: "free" | "premium" | "premium_plus"`
  - Fait en creant un type `SubscriptionTier` exporte, et en changeant le state interne du hook. Le hook lit `subscription_tier` depuis l'API (nouveau champ) avec fallback sur `is_premium` (retrocompatibilite).
- [x] Ajouter des helpers : `isPremium`, `isPremiumPlus`, `canAccess(requiredTier)`
  - Fait en utilisant un objet `tierLevel = { free: 0, premium: 1, premium_plus: 2 }` et en comparant les niveaux. `canAccess` retourne true si le niveau du user >= le niveau requis.
- [x] Adapter le fallback quand l'API ne repond pas (`tier: "free"`)
  - Fait dans le catch — retourne `{ tier: "free", isLoading: false }`.

### 2) Refactorer PremiumGuard pour accepter un tier minimum
- [x] Ajouter une prop `requiredTier: "premium" | "premium_plus"` (defaut: `"premium"`)
  - Fait avec `requiredTier?: SubscriptionTier` et valeur par defaut `"premium"`.
- [x] Le guard compare le tier de l'utilisateur avec le tier requis
  - Fait en appelant `canAccess(requiredTier)` du hook au lieu de verifier un boolean.
- [x] Adapter le message du dialog d'upgrade selon le tier requis
  - Fait en passant `requiredTier` et `currentTier` au composant `UpgradeDialog`.

### 3) Adapter UpgradeDialog selon le tier
- [x] Si le user est free et la feature est premium → proposer Premium a 9,99€
  - Fait via `TIER_CONFIG["premium"]` qui contient label, prix, icone Crown, et 3 features Premium.
- [x] Si le user est free ou premium et la feature est premium_plus → proposer Premium+ a 19,99€
  - Fait via `TIER_CONFIG["premium_plus"]` avec icone Gem, prix 19,99€, et 3 features Premium+ (biometrie, objets connectes, consultations).
- [x] Adapter le texte, le prix et les features listees dans le dialog
  - Fait avec un message conditionnel : si le user est Premium et la feature est premium_plus → "Vous etes Premium. Passez a Premium+ pour debloquer..."

### 4) Mettre a jour la page settings (section Abonnement)
- [x] Afficher le tier actuel avec Badge (Freemium / Premium / Premium+)
  - Fait avec un rendu conditionnel sur `subscription_tier` : Badge avec icone Crown pour Premium, Gem pour Premium+, variant secondary pour Freemium.
- [x] Si Freemium → proposer upgrade vers Premium ET Premium+ (2 cards cote a cote)
  - Fait avec une grille `md:grid-cols-2` affichant les 2 offres avec prix, description et bouton CTA.
- [x] Si Premium → proposer upgrade vers Premium+ uniquement
  - Fait avec un message "Vous etes Premium" + une card Premium+ avec CTA.
- [x] Si Premium+ → message de confirmation
  - Fait avec un encadre "Vous etes Premium+" confirmant l'acces a toutes les fonctionnalites.

### 5) Indicateurs visuels dans le sidebar
- [x] Badge "Pro" pour les features Premium
  - Deja en place depuis l'etape 05 sur le lien Analytics.

### 6) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur
- [x] Verification visuelle du scenario free (demo data)

## Modifications apportees

### Fichiers modifies
- `lib/hooks/use-premium-status.ts` : refactorise de boolean vers systeme de tiers avec `SubscriptionTier`, helpers `isPremium`, `isPremiumPlus`, `canAccess`
- `components/premium/premium-guard.tsx` : prop `requiredTier` ajoutee, passe `currentTier` au dialog
- `components/premium/upgrade-dialog.tsx` : `TIER_CONFIG` avec 2 configs (premium/premium_plus), message conditionnel selon le tier actuel et requis
- `app/dashboard/settings/page.tsx` : section Abonnement refaite avec 3 scenarios (free, premium, premium+), type `SubscriptionTier`, icones Crown/Gem
