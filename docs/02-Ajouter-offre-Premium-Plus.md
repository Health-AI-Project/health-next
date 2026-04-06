# 02 - Ajouter l'offre Premium+ sur la landing page (TERMINEE)

> Branche: `premium-plus` (basee sur `frontend`)

## Objectif
Ajouter un 3e tier de pricing "Premium+" sur la landing page. Actuellement 2 offres (Freemium, Premium), le cahier des charges en demande 3.

## Contexte technique
- Fichier principal : `app/page.tsx`
- Grille actuelle : `md:grid-cols-2` (2 cards)
- Variante bouton `premium` deja disponible dans `components/ui/button.tsx`
- Features actuelles definies dans `FREEMIUM_FEATURES` et `PREMIUM_FEATURES` (tableaux statiques)

## Source du contenu
Contenu defini a partir du business model du cahier des charges :
- Premium+ a 19,99€/mois
- Integration donnees biometriques (frequence cardiaque, sommeil, poids) via objets connectes
- Consultations en ligne avec nutritionnistes partenaires

## Checklist

### 1) Definir le contenu du tier Premium+
- [x] Definir le prix : **19,99€/mois** (cahier des charges)
- [x] Definir la liste des features : tout Premium + integration biometrique + objets connectes + consultations nutritionnistes
- [x] Definir l'icone : **Gem** (diamant) importe depuis lucide-react

### 2) Modifier la landing page
- [x] Cree le tableau `PREMIUM_PLUS_FEATURES` dans `app/page.tsx` avec 9 features (toutes incluses)
- [x] Grille passee de `md:grid-cols-2` a `md:grid-cols-2 lg:grid-cols-3` et `max-w-4xl` a `max-w-6xl`
- [x] Ajoutee la 3e card Premium+ apres la card Premium, meme structure (CardHeader, CardContent, CardFooter)
- [x] Card stylee avec : gradient plus prononce (`from-primary/10 to-primary/20`), `shadow-2xl`, badge "Premium+" en haut a droite avec gradient
- [x] Bouton CTA utilise la variante `premium` existante avec icone Gem
- [x] Metadata de la page mise a jour pour mentionner les 3 offres

### 3) Responsive
- [x] Verifier l'affichage mobile : les 3 cards passent en colonne (`grid-cols-1`)
- [x] Verifier l'affichage tablette : 2 colonnes (`md:grid-cols-2`), 3 sur desktop (`lg:grid-cols-3`)
- [x] Verifier que les cards ont une hauteur equilibree sur desktop

### 4) Accessibilite
- [x] Verifier le contraste des textes sur la nouvelle card
- [x] Verifier la navigation clavier (Tab) sur le nouveau bouton — fonctionne, anneau focus-visible present
- [x] Lancer `npm run test:a11y` : test Landing Page passe sans violation

### 5) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur TypeScript, compilation reussie
- [x] `npm run test` : 6/8 (2 echecs = backend absent, aucune regression)
- [x] Verification visuelle sur la page `/`

## Modifications apportees

### Fichiers modifies
- `app/page.tsx` :
  - Import ajoute : `Gem` depuis lucide-react
  - Tableau `PREMIUM_PLUS_FEATURES` cree (9 features, toutes `included: true`)
  - Grille : `md:grid-cols-2 lg:grid-cols-3 max-w-6xl`
  - 3e card ajoutee avec badge gradient "Premium+", icone Gem, prix 19,99€, bouton variante `premium`
  - Metadata description mise a jour
  - Hover harmonise sur les 3 cards : `hover:scale-[1.02]` + shadow au hover (Freemium: `hover:shadow-xl`, Premium: `hover:shadow-2xl`, Premium+: `hover:shadow-3xl`)

### Aucun nouveau fichier cree
La card utilise les memes composants Shadcn que les 2 existantes (Card, Button, Check) et la variante `premium` du Button deja disponible.
