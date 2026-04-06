# 10 - Calcul et affichage de l'IMC

> Branche: `calcul-imc`

## Pourquoi cette tache

Le cahier des charges (section Business Model, Freemium) liste le **calcul d'IMC** comme fonctionnalite de base gratuite. Actuellement, le poids est collecte (wizard + settings) mais la taille n'est pas demandee, et aucun calcul d'IMC n'est affiche nulle part dans le frontend.

L'IMC (Indice de Masse Corporelle) est un indicateur simple qui ne necessite pas d'API : il se calcule avec `poids / (taille_m)^2`. C'est une fonctionnalite Freemium qui apporte de la valeur immediate a l'utilisateur.

## Checklist

### 1) Collecter la taille de l'utilisateur
- [ ] Ajouter un champ "Taille (cm)" dans le wizard (apres le step poids ou dans le meme step)
- [ ] Ajouter le schema Zod correspondant dans `wizard-schemas.ts` (min 100cm, max 250cm)
- [ ] Ajouter le champ "Taille" dans la page settings (section Profil)
- [ ] Mettre a jour le store wizard pour stocker la taille

### 2) Calculer et afficher l'IMC
- [ ] Creer un composant `components/dashboard/bmi-card.tsx` qui calcule l'IMC a partir du poids et de la taille
- [ ] Afficher l'IMC avec une interpretation coloree :
  - < 18.5 : Insuffisance ponderale (bleu)
  - 18.5 - 24.9 : Poids normal (vert)
  - 25 - 29.9 : Surpoids (orange)
  - >= 30 : Obesite (rouge)
- [ ] Utiliser Card Shadcn + Badge pour l'interpretation + Progress pour la jauge visuelle

### 3) Integrer dans le dashboard
- [ ] Ajouter la card IMC dans le dashboard principal (`app/dashboard/page.tsx`) ou dans analytics
- [ ] L'IMC doit etre visible pour les utilisateurs Freemium (pas de PremiumGuard)

### 4) Validation
- [ ] `npm run lint` : 0 erreur
- [ ] `npm run build` : 0 erreur
- [ ] Verification visuelle avec donnees demo
- [ ] Verifier les calculs : 74.5kg / 1.75m = IMC 24.3 (normal)
