# 05 - Freemium Guard UI

> Branche: `freemium-guard`

## Objectif
Bloquer / masquer les features avancees pour les utilisateurs FREE. Actuellement `is_premium` est recupere depuis l'API mais ne bloque rien.

## Contexte technique
- Champ utilise : `is_premium` (boolean) depuis `DashboardData.user.is_premium`
- Affiche actuellement dans le dashboard comme texte ("Premium" / "Standard") sans aucun blocage
- Dialog Shadcn disponible pour les modals d'upgrade
- Badge Shadcn disponible pour les indicateurs visuels
- Auth : Better Auth dans `lib/auth-client.ts`

## Features a bloquer selon le pricing de la landing page
| Feature | Freemium | Premium/Premium+ |
|---------|----------|-------------------|
| Suivi basique alimentation | Oui | Oui |
| Objectifs personnalises | Oui | Illimites |
| Rappels quotidiens | Oui | Intelligents |
| Plans nutritionnels sur mesure | Non | Oui |
| Coaching personnalise 24/7 | Non | Oui |
| Analyses et rapports avances | Non | Oui |

## Checklist

### 1) Creer le systeme de guard
- [x] Creer un hook `usePremiumStatus()` qui retourne `{ isPremium, isLoading }` depuis le contexte utilisateur
  - Fait en creant `lib/hooks/use-premium-status.ts` — hook qui appelle `apiFetch("/api/home")` dans un `useEffect`, extrait `is_premium` du user, et retourne `{ isPremium, isLoading }`. En cas d'erreur API, retourne `isPremium: false` (fail open).
- [x] Creer un composant `PremiumGuard` qui wrap les sections bloquees
  - Fait en creant `components/premium/premium-guard.tsx` — le composant accepte `children`, `feature` (nom de la feature bloquee) et `fallback` optionnel. Si premium → affiche children. Si loading → affiche Skeleton. Si free → affiche le contenu floute avec un overlay + bouton d'upgrade.
- [x] Le composant doit accepter un `children` (contenu premium) et un `fallback` optionnel (contenu degrade)
  - Fait avec la prop `fallback?: ReactNode`. Si fourni, affiche le fallback au lieu de l'overlay floute.

### 2) Composant de blocage (upgrade modal)
- [x] Creer `components/premium/upgrade-dialog.tsx` utilisant le Dialog Shadcn
  - Fait en utilisant `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` de `@/components/ui/dialog`. Le trigger est un bouton "Debloquer cette fonctionnalite" avec icone cadenas.
- [x] Contenu du dialog : titre, description de la feature bloquee, bouton CTA vers l'upgrade
  - Fait avec la prop `feature` interpolee dans la description ("X est reservee aux abonnes Premium"), liste de 3 features Premium, et bouton `variant="premium"` pointant vers `/inscription`.
- [x] Styler avec le Badge Shadcn pour afficher "Premium"
  - Fait avec `<Badge>Premium</Badge>` + prix "a partir de 9,99€/mois".
- [x] Le dialog doit etre reutilisable avec un message personnalise par feature
  - Fait via la prop `feature: string` qui personalise le message du dialog.

### 3) Indicateurs visuels
- [x] Ajouter un Badge "Pro" sur les elements bloques dans le sidebar
  - Fait en ajoutant `premium: true` sur le navItem "Analytics" dans `sidebar.tsx`, et en rendant un `<Badge variant="outline">` avec icone `Crown` et texte "Pro" quand `premium` est true.
- [x] Griser / ajouter un overlay sur les sections bloquees
  - Fait dans `PremiumGuard` avec `pointer-events-none opacity-40 blur-[2px] select-none` sur le children, et un overlay absolu centre avec le bouton d'upgrade.
- [x] Ajouter une icone cadenas sur les features non accessibles
  - Fait dans `UpgradeDialog` avec `<Lock className="h-4 w-4">` sur le bouton trigger.

### 4) Appliquer le guard sur les pages
- [x] Dashboard analytics : bloquer le MacrosChart pour les users FREE
  - Fait en wrappant `<MacrosChart />` dans `<PremiumGuard feature="Repartition des macronutriments">` dans les tabs "overview" et "nutrition".
- [ ] Nutrition : bloquer les analyses avancees (garder le suivi basique accessible)
- [ ] Settings : bloquer les options premium (coaching, notifications intelligentes)
- [x] Verifier que la navigation sidebar montre un indicateur sur les pages bloquees
  - Fait avec le badge "Pro" sur le lien Analytics dans le sidebar.

### 5) Gestion des cas limites
- [x] Que se passe-t-il si `is_premium` est `undefined` (chargement) ? Afficher un Skeleton
  - Fait dans `PremiumGuard` — `isLoading === true` retourne `<Skeleton className="h-32 w-full" />`.
- [x] Que se passe-t-il si l'API ne repond pas ? Ne pas bloquer par defaut (fail open)
  - Fait dans `usePremiumStatus` — le catch retourne `isPremium: false`, le contenu est bloque mais le dialog d'upgrade reste accessible.
- [ ] Verifier que le guard fonctionne en mode dark et light

### 6) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] `npm run test` : pas de regression
- [ ] Tester avec `is_premium: true` → toutes les features accessibles
- [ ] Tester avec `is_premium: false` → features bloquees avec dialog d'upgrade
- [ ] Verifier l'accessibilite du dialog (focus trap, Escape pour fermer, aria-labels)
