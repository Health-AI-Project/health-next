# 05 - Freemium Guard UI

> Branche: `frontend/freemium-guard`

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
- [ ] Creer un hook `usePremiumStatus()` qui retourne `{ isPremium, isLoading }` depuis le contexte utilisateur
- [ ] Creer un composant `PremiumGuard` qui wrap les sections bloquees
- [ ] Le composant doit accepter un `children` (contenu premium) et un `fallback` optionnel (contenu degrade)

### 2) Composant de blocage (upgrade modal)
- [ ] Creer `components/premium/upgrade-dialog.tsx` utilisant le Dialog Shadcn
- [ ] Contenu du dialog : titre, description de la feature bloquee, bouton CTA vers l'upgrade
- [ ] Styler avec le Badge Shadcn pour afficher "Premium" ou "Premium+"
- [ ] Le dialog doit etre reutilisable avec un message personnalise par feature

### 3) Indicateurs visuels
- [ ] Ajouter un Badge "Premium" sur les elements bloques dans le sidebar ou les cards
- [ ] Griser / ajouter un overlay sur les sections bloquees
- [ ] Ajouter une icone cadenas sur les features non accessibles

### 4) Appliquer le guard sur les pages
- [ ] Dashboard analytics : bloquer l'acces pour les users FREE (afficher le dialog d'upgrade)
- [ ] Nutrition : bloquer les analyses avancees (garder le suivi basique accessible)
- [ ] Settings : bloquer les options premium (coaching, notifications intelligentes)
- [ ] Verifier que la navigation sidebar montre un indicateur sur les pages bloquees

### 5) Gestion des cas limites
- [ ] Que se passe-t-il si `is_premium` est `undefined` (chargement) ? Afficher un Skeleton
- [ ] Que se passe-t-il si l'API ne repond pas ? Ne pas bloquer par defaut (fail open)
- [ ] Verifier que le guard fonctionne en mode dark et light

### 6) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] `npm run test` : pas de regression
- [ ] Tester avec `is_premium: true` → toutes les features accessibles
- [ ] Tester avec `is_premium: false` → features bloquees avec dialog d'upgrade
- [ ] Verifier l'accessibilite du dialog (focus trap, Escape pour fermer, aria-labels)
