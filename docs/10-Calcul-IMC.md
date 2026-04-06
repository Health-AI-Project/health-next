# 10 - Calcul et affichage de l'IMC (TERMINEE)

> Branche: `calcul-imc`

## Pourquoi cette tache

Le cahier des charges (section Business Model, Freemium) liste le **calcul d'IMC** comme fonctionnalite de base gratuite. Actuellement, le poids est collecte (wizard + settings) mais la taille n'est pas demandee, et aucun calcul d'IMC n'est affiche nulle part dans le frontend.

L'IMC (Indice de Masse Corporelle) est un indicateur simple qui ne necessite pas d'API : il se calcule avec `poids / (taille_m)^2`. C'est une fonctionnalite Freemium qui apporte de la valeur immediate a l'utilisateur.

## Checklist

### 1) Collecter la taille de l'utilisateur
- [x] Champ "Taille (cm)" ajoute dans le wizard step poids
  - Fait en ajoutant `height` dans `weightSchema` (Zod, min 100, max 250) dans `wizard-schemas.ts`, dans `WizardData` du store, et un `FormField` "Quelle est votre taille ?" dans `weight-step.tsx` avec input number + suffixe "cm".
- [x] Taille ajoutee dans le summary-step avec icone Ruler
  - Fait en ajoutant un `SummaryCard` "Taille" affichant `{data.height} cm`.
- [x] Champ "Taille (cm)" ajoute dans la page settings (section Profil)
  - Fait en ajoutant `height?: number` a `UserSettings`, `height: 175` dans `DEMO_SETTINGS`, et un `<Input>` "Taille (cm)" dans le formulaire profil.

### 2) Calculer et afficher l'IMC
- [x] Cree `components/dashboard/bmi-card.tsx`
  - Fait avec calcul `poids / (taille_m)^2`, interpretation coloree en 4 niveaux (bleu < 18.5, vert 18.5-25, orange 25-30, rouge >= 30), Badge avec la categorie, et barre Progress mappant l'IMC 15-40 sur 0-100%.
- [x] Affichage : valeur IMC coloree, Badge categorie, jauge Progress, echelle textuelle (Maigre → Normal → Surpoids → Obesite)
- [x] Cas "N/A" gere si poids ou taille manquants

### 3) Integrer dans le dashboard
- [x] Card IMC ajoutee dans le dashboard principal entre les stats et les charts
  - Fait en ajoutant `<BmiCard weight={data?.user?.weight} height={data?.user?.height} />` dans `dashboard/page.tsx`. Interface `DashboardData` mise a jour avec `height`.
- [x] Pas de PremiumGuard — fonctionnalite Freemium accessible a tous

### 4) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur
- [x] Calcul verifie : 74.5kg / 1.75m = IMC 24.3 (Poids normal, vert)

## Modifications apportees

### Fichiers crees
- `components/dashboard/bmi-card.tsx` : composant card IMC avec calcul, interpretation coloree, jauge Progress

### Fichiers modifies
- `lib/schemas/wizard-schemas.ts` : ajout `height` dans `weightSchema` (Zod, min 100, max 250)
- `lib/stores/wizard-store.ts` : ajout `height?: number` dans `WizardData`
- `components/wizard/steps/weight-step.tsx` : ajout FormField taille avec input number + suffixe "cm"
- `components/wizard/steps/summary-step.tsx` : ajout SummaryCard taille avec icone Ruler
- `app/dashboard/settings/page.tsx` : ajout champ taille dans le profil + `height: 175` dans demo
- `app/dashboard/page.tsx` : ajout BmiCard + `height` dans DashboardData
