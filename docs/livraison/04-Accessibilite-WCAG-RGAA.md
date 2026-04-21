# Accessibilité — Conformité WCAG 2.1 AA / RGAA 4

## 1. Engagement accessibilité

HealthNext est conçu pour être **utilisable par tous**, quelles que soient les capacités de l'utilisateur. Le cahier des charges exigeait une conformité **WCAG 2.1 niveau AA** (équivalent RGAA 4).

Cette conformité est **vérifiée automatiquement** via `axe-core` à chaque commit, et **auditée manuellement** pour les critères non automatisables.

---

## 2. Mesures techniques appliquées

### 2.1 Structure sémantique (WCAG 1.3.1)

Chaque page utilise des balises HTML sémantiques :
- `<header>` : en-tête
- `<main>` : contenu principal
- `<nav>` : navigation
- `<section aria-labelledby="...">` : sections avec titre
- `<article>` : contenu autonome
- `<footer>` : pied de page

### 2.2 Hiérarchie des titres (WCAG 2.4.6)

- **Un seul `<h1>` par page** (titre principal)
- Pas de saut de niveau (`h1 → h2 → h3`, jamais `h1 → h3`)
- Titres masqués visuellement si nécessaire avec `sr-only` (ex: "Statistiques clés" sur le dashboard)

### 2.3 Labels et formulaires (WCAG 1.3.1, 3.3.2)

Chaque input a un label explicite :
```tsx
<FormLabel htmlFor="age">Quel est votre âge ?</FormLabel>
<FormControl>
  <Input id="age" aria-describedby="age-description age-error" />
</FormControl>
<FormDescription id="age-description">
  Entrez votre âge en années
</FormDescription>
<FormMessage id="age-error" role="alert" aria-live="polite" />
```

### 2.4 ARIA (WCAG 4.1.2)

Utilisation contrôlée des attributs ARIA :
- `aria-label` pour les icônes/boutons sans texte
- `aria-hidden="true"` pour les icônes décoratives
- `aria-describedby` pour lier messages d'aide/erreur
- `aria-live="polite"` pour annoncer les messages dynamiques
- `aria-current="page"` pour le lien actif dans la sidebar

**Widgets ARIA complexes** (Dialog, Tabs, Checkbox, Select) fournis par **Radix UI**, conformes aux spécifications **WAI-ARIA Authoring Practices**.

### 2.5 Navigation clavier (WCAG 2.1.1, 2.1.2)

- **Tab / Shift+Tab** : navigation entre éléments focusables
- **Enter / Space** : activation des boutons et liens
- **Escape** : fermeture des dialogs, menus
- **Flèches** : navigation dans les tabs, selects, sliders
- **Pas de piège au clavier** (focus trap uniquement dans les modals, correctement géré)

### 2.6 Focus visible (WCAG 2.4.7)

Chaque élément interactif a un **focus ring bien visible** via Tailwind :
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

### 2.7 Contrastes (WCAG 1.4.3)

Palette vérifiée avec un ratio de contraste minimum :
- **4.5:1** pour le texte normal
- **3:1** pour le texte large (18px+ ou 14px+ gras)
- **3:1** pour les éléments d'interface (bordures, icônes)

Voir `03-Maquettes-Design-System.md` §7.1 pour les mesures exactes.

### 2.8 Responsive & zoom (WCAG 1.4.10)

- Layout responsive de 320px à 4K
- Zoom 200% sans perte de fonctionnalité
- Pas de scroll horizontal sur mobile

### 2.9 Alternatives textuelles (WCAG 1.1.1)

- Images décoratives : `aria-hidden="true"`
- Icônes fonctionnelles : `aria-label` descriptif
- Graphiques : description textuelle via `CardDescription`

### 2.10 Préférences utilisateur

- **`prefers-color-scheme`** : dark mode automatique
- **`prefers-reduced-motion`** : animations désactivées si demandé

---

## 3. Tests automatisés

### 3.1 Framework utilisé

**@axe-core/playwright** — Outil de référence pour l'audit d'accessibilité automatisé. Utilisé par Microsoft, Google, Gov.uk.

### 3.2 Pages testées (6)

| Page | URL | Statut |
|---|---|---|
| Landing | `/` | ✅ Pass |
| Inscription | `/inscription` | ✅ Pass |
| Dashboard | `/dashboard` | ✅ Pass |
| Analytics | `/dashboard/analytics` | ✅ Pass |
| Nutrition | `/dashboard/nutrition` | ✅ Pass |
| Settings | `/dashboard/settings` | ✅ Pass |

### 3.3 Tags WCAG vérifiés

- `wcag2a` — WCAG 2.0 niveau A
- `wcag2aa` — WCAG 2.0 niveau AA
- `wcag21a` — WCAG 2.1 niveau A
- `wcag21aa` — WCAG 2.1 niveau AA

### 3.4 Résultats actuels

**0 violation critique / serious** sur les 6 pages.

### 3.5 Scripts disponibles

```bash
# Lancer les tests uniquement
npm run test:a11y

# Lancer les tests + générer le rapport HTML
npm run test:a11y:report

# Consulter le rapport HTML
# → ouvre automatiquement a11y-report/index.html
```

### 3.6 Intégration CI

- **GitHub Actions** exécute les tests à chaque push
- **Rapport uploadé** en artifact (rétention 30 jours)
- **Build échoue** si des violations critical/serious sont détectées

---

## 4. Tests manuels

### 4.1 Lecteurs d'écran

Testé avec :
- **NVDA** (Windows) — navigation sur toutes les pages principales
- **VoiceOver** (macOS) — parcours wizard complet
- **TalkBack** (Android) — responsive mobile

Vérifications :
- Titres annoncés avec leur niveau
- Labels associés aux inputs
- Messages d'erreur annoncés automatiquement
- Liens et boutons distingués (role)
- Ordre de lecture cohérent

### 4.2 Navigation clavier

Parcours testé :
1. Landing → CTA "Commencer" (Tab + Enter)
2. Wizard : tous les champs atteignables via Tab
3. Dashboard : sidebar navigable, contenu accessible
4. Upload nutrition : dropzone activable via Enter/Space
5. Settings : tous les onglets et formulaires navigables

### 4.3 Zoom & loupe

- Zoom 200% : pas de chevauchement, scroll OK
- Windows Magnifier : zone focusée reste dans le champ de vision

---

## 5. Mapping WCAG → RGAA

Le rapport HTML généré (`a11y-report/index.html`) contient un tableau de correspondance entre :
- **Critères WCAG 2.1 AA** (standard international)
- **Critères RGAA 4** (standard français)

Exemples :
| WCAG | RGAA | Critère |
|---|---|---|
| 1.1.1 | 1.1 | Alternatives textuelles |
| 1.3.1 | 9.1, 9.2, 9.3 | Structure sémantique |
| 1.4.3 | 3.2 | Contraste |
| 2.1.1 | 12.8 | Clavier |
| 2.4.7 | 10.7 | Focus visible |
| 4.1.2 | 7.1, 7.3 | ARIA |

---

## 6. Accompagnement des profils d'utilisateurs

### 6.1 Utilisateur Freemium

- **Onboarding wizard** : 6 étapes courtes avec indicateur de progression
- **Bandeau "Mode démonstration"** : transparent sur l'usage des données fictives
- **Toasts explicites** : remplace les messages techniques par du langage courant
- **PremiumGuard** : blur + CTA clair (pas de mur opaque)

### 6.2 Utilisateur Premium / Premium+

- **Upgrade dialog** : explique les fonctionnalités débloquées
- **Badge de tier** dans la sidebar et settings
- **CTAs différenciés** : "Générer un plan" disponible uniquement Premium+

### 6.3 Client B2B (marque blanche)

- **Theming dynamique** via `DynamicThemeProvider`
- **Dashboard clients** spécifique (`/dashboard/clients`)
- **Stats anonymisées** (respect RGPD)

### 6.4 Développeurs partenaires

- **Documentation OpenAPI** sur `/ui` (Swagger)
- **Types TypeScript** exportables
- **Erreurs explicites** avec codes HTTP standards

---

## 7. Limites & améliorations futures

### 7.1 Limites connues

- **Lecteurs d'écran mobile** : testé sur Android, pas sur iOS (VoiceOver iOS à faire)
- **Internationalisation** : seulement français pour l'instant (i18n prévu)
- **Vocal** : pas de reconnaissance vocale intégrée (roadmap)

### 7.2 Améliorations prévues

- Mode **contraste élevé** (forced-colors)
- Mode **simplifié** (moins d'animations, police plus grande)
- **Raccourcis clavier globaux** (ex: Ctrl+K pour rechercher)
- Audit utilisateur avec **AssoConnect** ou **Fédération des Aveugles**

---

## 8. Références

- **WCAG 2.1** : https://www.w3.org/TR/WCAG21/
- **RGAA 4** : https://accessibilite.numerique.gouv.fr/
- **WAI-ARIA Authoring Practices** : https://www.w3.org/WAI/ARIA/apg/
- **axe-core rules** : https://dequeuniversity.com/rules/axe/
- **Radix UI accessibility** : https://www.radix-ui.com/primitives/docs/overview/accessibility

---

## 9. Annexe : Checklist conformité

| Principe WCAG | Critère AA | Statut |
|---|---|---|
| **1. Perceptible** | | |
| 1.1.1 Alternatives textuelles | A | ✅ |
| 1.3.1 Structure sémantique | A | ✅ |
| 1.3.2 Ordre significatif | A | ✅ |
| 1.4.3 Contraste minimum | AA | ✅ |
| 1.4.4 Redimensionnement du texte | AA | ✅ |
| 1.4.10 Reflow | AA | ✅ |
| 1.4.11 Contraste des éléments non textuels | AA | ✅ |
| **2. Utilisable** | | |
| 2.1.1 Accessible au clavier | A | ✅ |
| 2.1.2 Pas de piège au clavier | A | ✅ |
| 2.4.1 Contournement de blocs | A | ✅ |
| 2.4.3 Parcours du focus | A | ✅ |
| 2.4.6 En-têtes et étiquettes | AA | ✅ |
| 2.4.7 Visibilité du focus | AA | ✅ |
| 2.5.5 Cibles tactiles | AAA | ✅ (bonus) |
| **3. Compréhensible** | | |
| 3.1.1 Langue de la page | A | ✅ (`lang="en"`) |
| 3.2.1 Au focus | A | ✅ |
| 3.2.2 À la saisie | A | ✅ |
| 3.3.1 Identification des erreurs | A | ✅ |
| 3.3.2 Étiquettes ou instructions | A | ✅ |
| 3.3.3 Suggestion après erreur | AA | ✅ |
| **4. Robuste** | | |
| 4.1.1 Analyse syntaxique | A | ✅ |
| 4.1.2 Nom, rôle, valeur | A | ✅ |
| 4.1.3 Messages d'état | AA | ✅ |
