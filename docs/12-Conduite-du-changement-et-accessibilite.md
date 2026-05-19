# Analyse des choix operes : Accessibilite et Conduite du changement

## 1. Introduction

Dans le cadre du projet **HealthAI Coach**, nous avons developpe un frontend web en **Next.js/React** integrant des fonctionnalites IA pour l'analyse nutrition/sport et l'accompagnement utilisateur.

Notre analyse des choix d'implementation repond a un enjeu MSPR central : demontrer que les decisions UX/UI et techniques ne sont pas uniquement "fonctionnelles", mais qu'elles soutiennent deux objectifs metier critiques :

- **L'inclusion** (accessibilite numerique, conformite RGAA/WCAG AA, utilisabilite reellement multi-profils).
- **L'adoption** (comprehension de l'IA, confiance, engagement B2C et appropriation B2B).

Nous avons donc structure cette analyse autour des choix concrets realises dans le code, et de leur impact direct sur les utilisateurs finaux et les partenaires.

## 2. Analyse des choix techniques d'Accessibilite (Next.js / RGAA niveau AA)

### 2.1 Pourquoi Next.js a ete un atout pour la base accessible

Nous avons choisi Next.js pour consolider une base technique compatible avec les exigences RGAA/WCAG :

- **Rendu HTML natif et structurel** : les pages reposent sur des balises semantiques (`header`, `nav`, `main`, `section`, `footer`) qui facilitent la navigation assistee.
- **Composants server-first + metadata** : les metadonnees de page (`title`, `description`) sont declarees explicitement, ce qui ameliore clarte contextuelle et coherence de navigation.
- **Architecture composable React** : l'accessibilite est mutualisee dans les composants UI (focus ring, labels, etats), ce qui reduit les regressions sur les nouveaux ecrans.

Ce choix nous a permis d'industrialiser de "bons defaults" d'accessibilite au lieu de traiter l'a11y ecran par ecran.

### 2.2 Analyse des choix d'implementation realises

#### a) Structure du DOM et semantique

Nous avons choisi de structurer les pages principales avec une hierarchie semantique explicite :

- Landing page organisee avec `header` + `nav` + `main` + `section`.
- Pages dashboard decoupees en sections avec `aria-labelledby` et titres "sr-only" pour conserver un plan logique pour les lecteurs d'ecran.
- Navigation laterale avec `aria-label="Navigation principale"` et `aria-current="page"` pour signaler la page active.

**Impact utilisateur** : cette structure ameliore l'orientation pour les personnes naviguant au lecteur d'ecran et diminue le cout cognitif de parcours.

#### b) Balises ARIA et etiquetage des controles

Nous avons choisi d'ajouter ARIA uniquement lorsqu'il y a un gain concret de comprehension :

- `aria-hidden="true"` sur les icones decoratives pour eviter une lecture vocale parasite.
- `aria-label` sur des elements interactifs critiques (ex. selection de theme/entreprise, suppression d'image, champs d'edition nutritionnelle).
- `aria-live="polite"` dans le wizard pour annoncer le changement d'etape sans interrompre l'utilisateur.
- `aria-describedby` sur les champs de formulaire (description + message d'erreur) pour relier saisie, aide et validation.

**Impact utilisateur** : les controles sont annonces avec un contexte clair, ce qui renforce l'autonomie des utilisateurs non-visuels et limite les erreurs de saisie.

#### c) Navigation clavier et gestion du focus

Nous avons choisi une strategie "clavier-first" sur les composants UI :

- Presence systematique d'un style `focus-visible` sur boutons, champs, onglets, selecteurs et dialogues.
- Utilitaire commun `.focus-ring` dans les styles globaux pour harmoniser les etats de focus.
- Composants compatibles clavier via la librairie UI utilisee (dialogues fermables, menus deroulants, selecteurs actionnables au clavier).

**Impact utilisateur** : les parcours restent operables sans souris, avec un repere visuel stable sur l'element actif.

#### d) Contrastes, theming et mode sombre

Nous avons choisi une architecture par variables CSS (`:root` / `.dark`) avec theming dynamique :

- Tokens de couleur centralises pour textes, fonds, bordures et etats interactifs.
- Support du **mode sombre** et du **mode systeme** (`prefers-color-scheme`) pour adapter l'interface aux contextes de consultation.
- Themes "entreprise" (marque blanche) appliques sans casser la structure visuelle globale.

**Impact utilisateur** : meilleure lisibilite selon l'environnement lumineux, et continuite de marque B2B sans deperdition ergonomique.

#### e) Verification outillee de la conformite

Nous avons choisi d'automatiser une partie du controle a11y via Playwright + Axe-Core :

- Scan de plusieurs pages strategiques (landing, inscription, dashboard, analytics, nutrition, settings).
- Controle sur les tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`.
- Export de rapports JSON exploitables pour suivi des ecarts.
- Echec des tests en cas de violations `critical` ou `serious`.

**Impact equipe/jury** : traçabilite objective des controles et integration de l'accessibilite dans la chaine qualite, et non en correction tardive.

## 3. Analyse de la Conduite du Changement et de l'Adoption Utilisateur

### 3.1 Adoption B2C : demystifier l'IA par l'interface

Nous avons choisi de rendre l'IA progressive et explicable plutot que "opaque" :

- **Onboarding en etapes** (wizard) : l'utilisateur construit son profil par micro-decisions (age, poids, objectifs, allergies) avec progression visible.
- **Feedback continu** : recapitulatif avant validation, toasts d'etat pendant l'analyse d'image (en cours, succes, erreur).
- **Interpretation des resultats** : dans la nutrition, l'interface ne montre pas seulement des chiffres ; elle ajoute des statuts (deficit/equilibre/exces) et des suggestions actionnables.
- **Aides contextuelles** : descriptions de champs, messages d'erreur explicites, tooltips sur graphiques pour rendre les donnees lisibles au survol.

Nous avons donc choisi une logique pedagogique : **"montrer -> expliquer -> proposer une action"**, ce qui augmente la confiance dans les recommandations IA.

### 3.2 Adoption B2B : appropriation via deploiement web et marque blanche

Pour les partenaires (salles, mutuelles), nous avons choisi une approche qui facilite l'integration et la gouvernance :

- **Marque blanche configurable** : selection de themes entreprise avec identite visuelle dediee.
- **Acces par niveau d'offre** : garde-fous premium/premium+ pour aligner fonctionnalites et contrat partenaire.
- **Espace Clients B2B** : page dediee avec KPI operationnels (total clients, activite 7 jours, taux premium, calories moyennes).
- **Protection des donnees** : affichage prudent des informations sensibles et messages d'acces restreint lorsque necessaire.

L'implementation web Next.js facilite en pratique le deploiement (hebergement standard, mises a jour centralisees, maintenance simplifiee), ce qui reduit la resistance au changement cote partenaires.

### 3.3 Boucle de feedback et amelioration continue

Nous avons choisi d'installer une boucle courte entre usage, retour utilisateur et evolution produit :

- Collecte de signaux d'usage (parcours completes/non completes, ecrans les plus utilises).
- Retour qualitatif integre (notifications d'erreur, comprehension des recommandations, points de friction).
- Ajustement progressif de l'UX (libelles, priorisation des informations, ordonnancement des actions).
- Recalibrage des regles de recommandation nutrition/sport lorsque les comportements reels montrent un decalage.

Cette logique de changement continu permet de maintenir la confiance dans l'IA et d'eviter une adoption "one-shot".

## Conclusion

Notre implementation montre une coherence entre choix techniques et objectifs d'usage :

- Nous avons choisi Next.js/React pour poser un socle semantique, testable et evolutif en accessibilite.
- Nous avons implemente des mecanismes concrets (ARIA, focus, contrastes, tests Axe) pour viser un niveau RGAA/WCAG AA robuste.
- Nous avons construit une experience B2C qui explique l'IA plutot que de l'imposer.
- Nous avons prepare l'appropriation B2B via la marque blanche, la gouvernance d'acces et des indicateurs metier lisibles.

En synthese, l'accessibilite et la conduite du changement ne sont pas des chantiers annexes dans HealthAI Coach : ce sont des leviers de performance produit, de conformite et d'adoption durable.
