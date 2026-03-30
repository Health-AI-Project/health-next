# Changelog : ce qui a change entre la v1 et la v2 du plan de migration

Ce document explique les modifications apportees au plan de migration UI.
L'idee est simple : on a relu tout le plan original, on a verifie dans le code si ce qui etait ecrit etait vrai, et on a corrige ce qui ne l'etait pas.

---

## 1. Le composant `select` a ete retire de la liste des composants manquants

**Avant (v1):** Le document disait que `select`, `dialog`, `tabs`, `table` et `badge` n'existaient pas encore dans le dossier `components/ui/`.

**Probleme:** Le composant `select.tsx` avait deja ete cree lors de la migration du sidebar (qui est marquee comme resolue juste au-dessus dans le meme document). C'etait donc une contradiction : on dit que c'est fait, mais on le laisse dans la liste "pas encore fait".

**Correction (v2):** On a retire `select` de cette liste. Maintenant elle ne contient que `dialog`, `tabs`, `table` et `badge` — les composants qui manquent vraiment.

---

## 2. Un import `toast` incoherent a ete documente

**Avant (v1):** Le document ne mentionnait pas du tout comment les notifications (toasts) etaient importees dans le code.

**Probleme:** En verifiant le code, on a decouvert que presque tout le projet importe `toast` depuis `@/components/ui/toaster` (notre fichier qui sert de point d'entree unique), sauf un fichier — `signup-step.tsx` — qui importe directement depuis la librairie `sonner`. Ca marche, mais ce n'est pas coherent.

Pourquoi c'est important ? Si un jour on decide de changer de librairie de notifications, on veut modifier un seul fichier (`toaster.tsx`), pas chercher dans tout le projet. Avoir un import direct vers `sonner` casse cette logique.

**Correction (v2):** On a ajoute une tache P2 dediee pour standardiser cet import.

---

## 3. La tache "migrer les modals et popovers" a ete reformulee

**Avant (v1):** La tache disait "Migrer interactions (modals, popovers, dropdowns) vers composants Shadcn UI".

**Probleme:** Le mot "migrer" sous-entend qu'il existe des modals ou des popovers natifs dans le code a remplacer. Or, apres verification, il n'y en a aucun. Pas de `<dialog>`, pas de dropdown custom, pas de popover maison. Ces composants n'ont tout simplement jamais ete crees.

**Correction (v2):** La tache dit maintenant "Installer les composants Shadcn UI manquants (dialog, tabs, badge)". C'est plus juste : on ne migre rien, on prepare la base pour les futures fonctionnalites (comme le freemium guard qui aura besoin de modals).

---

## 4. La tache "migrer les tableaux" a ete precisee

**Avant (v1):** La tache disait "Migrer tableaux/listes avec composants standardises" sans preciser quels fichiers etaient concernes.

**Probleme:** C'est trop vague. Quelqu'un qui decouvre le projet ne sait pas par ou commencer. En verifiant le code, on a trouve exactement un seul tableau HTML natif dans tout le projet : celui dans `nutrition-result-table.tsx`.

**Correction (v2):** La tache cite maintenant le fichier exact, les balises HTML presentes (`<table>`, `<thead>`, etc.), et ce par quoi les remplacer (`Table`, `TableHeader`, `TableBody`, etc. de Shadcn).

---

## 5. Des fichiers manquaient dans l'audit

**Avant (v1):** L'audit ne mentionnait que les pages prioritaires et le sidebar. Les fichiers du module nutrition n'apparaissaient nulle part.

**Probleme:** `nutrition-tracker.tsx` et `nutrition-result-table.tsx` utilisent des composants UI (Card, Button, Input, toast) et un tableau HTML natif. Ne pas les mentionner dans l'audit, c'est risquer de les oublier lors de la migration.

**Correction (v2):** Ces fichiers ont ete ajoutes dans une nouvelle section "Fichiers supplementaires dans le perimetre" et dans les ecarts detectes.

---

## 6. Les listes `<ul>/<li>` de summary-step ont ete documentees

**Avant (v1):** Le document mentionnait l'exception du `<input>` de react-dropzone dans meal-uploader, mais pas les `<ul>` et `<li>` dans summary-step.

**Probleme:** Pour etre complet, il faut lister tous les elements HTML natifs qui restent dans le code et expliquer pourquoi ils sont la. Les `<ul>` et `<li>` servent a afficher les listes de goals et d'allergies — c'est de l'HTML semantique correct (un lecteur d'ecran les annonce comme des listes, ce qui est le comportement voulu).

**Correction (v2):** On les a ajoutes comme "exception semantique legitime" dans les ecarts detectes.

---

## 7. Le refactor styling a ete detaille

**Avant (v1):** La section "Refactor styling" contenait des taches generiques ("Supprimer les classes redondantes").

**Probleme:** L'audit avait identifie des duplications precises (le pattern de navigation wizard, le pattern d'espacement), mais la section refactor ne faisait pas le lien avec ces decouvertes.

**Correction (v2):** On a ajoute des taches concretes, comme "Extraire le pattern de navigation wizard dans un composant reutilisable", directement liees aux duplications trouvees pendant l'audit.

---

## 8. Le detail `justify-end` vs `justify-between` a ete corrige

**Avant (v1):** Le document disait que le pattern `flex justify-between pt-4` etait present dans tous les wizard steps, y compris `age-step.tsx`.

**Probleme:** `age-step.tsx` utilise en realite `flex justify-end pt-4` (pas `justify-between`) parce que c'est le premier step du formulaire — il n'a pas de bouton "Precedent", donc pas besoin de repartir les boutons aux deux extremites.

**Correction (v2):** La description precise maintenant cette variante.

---

## Resume

En bref, la v2 corrige des contradictions, ajoute des fichiers oublies, precise les taches vagues, et documente des ecarts qui existaient dans le code mais pas dans le plan. Rien n'a change dans le code lui-meme — c'est uniquement le document de suivi qui a ete mis a jour pour refleter la realite du projet.
