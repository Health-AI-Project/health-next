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
  - Fait en se basant sur le business model du cahier des charges qui definit 3 tiers : Freemium (0€), Premium (9,99€), Premium+ (19,99€).
- [x] Definir la liste des features : tout Premium + integration biometrique + objets connectes + consultations nutritionnistes
  - Fait en reprenant les 6 features Premium et en ajoutant les 3 exclusivites Premium+ du cahier des charges : donnees biometriques, objets connectes, consultations nutritionnistes.
- [x] Definir l'icone : **Gem** (diamant) importe depuis lucide-react
  - Fait en choisissant `Gem` pour marquer un cran au-dessus de `Crown` (Premium). Import ajoute dans `app/page.tsx`.

### 2) Modifier la landing page
- [x] Cree le tableau `PREMIUM_PLUS_FEATURES` dans `app/page.tsx` avec 9 features (toutes incluses)
  - Fait en ajoutant un tableau statique de 9 objets `{ included: true, text: "..." }` apres `PREMIUM_FEATURES`, suivant le meme pattern.
- [x] Grille passee de `md:grid-cols-2` a `md:grid-cols-2 lg:grid-cols-3` et `max-w-4xl` a `max-w-6xl`
  - Fait en modifiant les classes de la `<div>` grid : ajout du breakpoint `lg:grid-cols-3` pour 3 colonnes sur desktop et elargissement du container avec `max-w-6xl`.
- [x] Ajoutee la 3e card Premium+ apres la card Premium, meme structure (CardHeader, CardContent, CardFooter)
  - Fait en dupliquant la structure de la card Premium et en remplacant le contenu : titre "Premium+", description, prix 19,99€, mapping de `PREMIUM_PLUS_FEATURES`.
- [x] Card stylee avec : gradient plus prononce (`from-primary/10 to-primary/20`), `shadow-2xl`, badge "Premium+" en haut a droite avec gradient
  - Fait en augmentant les valeurs du gradient par rapport a Premium (`/10 to /20` vs `/5 to /10`), en ajoutant `shadow-2xl`, et en creant un badge avec `bg-gradient-to-r from-primary to-primary/80`.
- [x] Bouton CTA utilise la variante `premium` existante avec icone Gem
  - Fait avec `<Button variant="premium">` et `<Gem className="h-4 w-4">` a l'interieur. La variante `premium` (gradient) avait ete creee lors de la migration Shadcn.
- [x] Metadata de la page mise a jour pour mentionner les 3 offres
  - Fait en modifiant le champ `description` de `export const metadata` pour inclure "Freemium, Premium et Premium+".

### 3) Responsive
- [x] Verifier l'affichage mobile : les 3 cards passent en colonne (`grid-cols-1`)
  - Verifie visuellement en reduisant la fenetre du navigateur — les cards s'empilent verticalement sous le breakpoint `md`.
- [x] Verifier l'affichage tablette : 2 colonnes (`md:grid-cols-2`), 3 sur desktop (`lg:grid-cols-3`)
  - Verifie visuellement — 2 colonnes a partir de `md` (768px), 3 colonnes a partir de `lg` (1024px).
- [x] Verifier que les cards ont une hauteur equilibree sur desktop
  - Verifie visuellement — la grille CSS `grid` aligne automatiquement les hauteurs des cards sur la meme ligne.

### 4) Accessibilite
- [x] Verifier le contraste des textes sur la nouvelle card
  - Verifie — tous les textes utilisent les memes tokens que les cards existantes (`foreground`, `muted-foreground`, `primary`).
- [x] Verifier la navigation clavier (Tab) sur le nouveau bouton — fonctionne, anneau focus-visible present
  - Verifie en appuyant sur Tab — le bouton "Essayer Premium+" recoit le focus avec `focus-visible:ring-2`.
- [x] Lancer `npm run test:a11y` : test Landing Page passe sans violation
  - Fait — le test axe-core sur la page `/` passe sans violation critical ni serious apres ajout de la 3e card.

### 5) Validation
- [x] `npm run lint` : 0 erreur
- [x] `npm run build` : 0 erreur TypeScript, compilation reussie
- [x] `npm run test` : 6/8 (2 echecs = backend absent, aucune regression)
- [x] Verification visuelle sur la page `/`

### 6) Hover harmonise
- [x] Harmoniser le hover sur les 3 cards
  - Fait en ajoutant `hover:scale-[1.02] transition-all` + shadow progressive sur les 3 cards (Freemium: `hover:shadow-xl`, Premium: `hover:shadow-2xl`, Premium+: `hover:shadow-3xl`). Initialement Premium et Premium+ avaient `hover:border-primary` qui ne changeait rien visuellement car la bordure etait deja `border-primary`.

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
