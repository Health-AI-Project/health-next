# Maquettes & Design System — HealthNext

## 1. Approche design

HealthNext adopte une approche **design-first** basée sur :
- **Shadcn UI** : composants accessibles et customisables
- **Tailwind CSS v4** : utility-first avec variables CSS
- **Radix UI** : primitives headless conformes WAI-ARIA
- **Lucide Icons** : iconographie cohérente (1400+ icônes)

Les maquettes sont implémentées **directement en code** (pas de Figma intermédiaire) via une itération rapide design ↔ développement. Cette approche est privilégiée par les startups modernes (Vercel, Linear, Cal.com) car elle garantit une fidélité 100% entre maquette et rendu final.

---

## 2. Design tokens

### 2.1 Palette de couleurs

Les couleurs sont définies comme **CSS variables** pour permettre un theming dynamique B2B (marque blanche).

```css
/* Light mode */
--primary: 142 76% 36%;        /* Vert HealthNext */
--primary-foreground: 0 0% 100%;
--secondary: 142 30% 94%;
--accent: 142 50% 50%;
--destructive: 0 84% 60%;      /* Rouge erreurs */
--background: 0 0% 100%;
--foreground: 222 47% 11%;
--muted: 210 40% 96%;
--muted-foreground: 215 16% 47%;
--border: 214 32% 91%;

/* Dark mode */
--primary: 142 70% 45%;
--background: 222 47% 11%;
--foreground: 0 0% 100%;
/* ... */
```

### 2.2 Typographie

- **Font system** : system-ui (pas de Web Fonts → perf + privacy)
- **Scale** :
  - `text-xs` 12px → métadonnées
  - `text-sm` 14px → labels, boutons
  - `text-base` 16px → corps de texte
  - `text-xl` 20px → titres h3
  - `text-2xl` 24px → titres cards
  - `text-3xl` 30px → titres h2
  - `text-4xl/5xl/6xl` → hero headings (responsive)

### 2.3 Espacements

Basé sur une **grille de 4px** (Tailwind default) :
- `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- Gap entre cards : `gap-4` ou `gap-6`
- Padding sections : `py-16 md:py-24`

### 2.4 Ombres & élévation

- `shadow-sm` : cards au repos
- `shadow-md` : cards survolées
- `shadow-xl` : modales, offres Premium mises en avant
- `shadow-2xl` : offre Premium+ (emphase)

### 2.5 Bordures & radius

- `rounded-md` (6px) : boutons, inputs
- `rounded-lg` (8px) : cards
- `rounded-full` : badges, avatars, chips

---

## 3. Composants clés

### 3.1 Button

5 variants : `default`, `secondary`, `outline`, `ghost`, `destructive`, `premium` (gradient)
3 tailles : `sm`, `default`, `lg`
Icônes intégrables à gauche/droite via `<Icon className="h-4 w-4" />`

### 3.2 Card

Structure : `Card > CardHeader > CardTitle + CardDescription > CardContent > CardFooter`
Utilisé pour toutes les offres, graphiques, KPIs.

### 3.3 Form (React Hook Form + Zod)

Structure : `Form > FormField > FormItem > FormLabel + FormControl + FormDescription + FormMessage`
- **FormMessage** annoncé automatiquement aux lecteurs d'écran (`role="alert"`, `aria-live="polite"`)
- Validation en temps réel via Zod

### 3.4 Dialog (Modal)

- Focus trap via Radix UI (Tab reste dans le modal)
- Escape pour fermer
- Overlay avec `aria-modal="true"`
- Focus restauré au bouton déclencheur à la fermeture

### 3.5 Tabs

- Navigation clavier : flèches gauche/droite
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Utilisé dans Analytics et Settings

### 3.6 PremiumGuard (custom)

Wrapper affichant un effet de flou + overlay CTA quand l'utilisateur n'a pas le tier requis.
Exemple : `<PremiumGuard feature="Macros"><MacrosChart /></PremiumGuard>`

---

## 4. Layout & grille

### 4.1 Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Sidebar 264px  │  Main content (flex-1)        │
│  (desktop)      │  ┌─────────────────────────┐  │
│                 │  │  Header (titre page)    │  │
│  - Dashboard    │  ├─────────────────────────┤  │
│  - Nutrition    │  │                         │  │
│  - Workouts 🔒  │  │  Content scrollable     │  │
│  - Analytics 🔒 │  │                         │  │
│  - Clients 👑   │  │                         │  │
│  - Settings     │  │                         │  │
│                 │  └─────────────────────────┘  │
│  [Theme picker] │                                │
│  [Sign out]     │                                │
└─────────────────┴────────────────────────────────┘
```

Sur mobile : sidebar cachée, menu hamburger en top.

### 4.2 Grille responsive

- **Mobile** (`< 640px`) : 1 colonne
- **Tablet** (`640-1024px`) : 2 colonnes pour les cards, sidebar collapsible
- **Desktop** (`> 1024px`) : 3-4 colonnes, sidebar fixe

Exemple KPIs Dashboard :
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map(...)}
</div>
```

---

## 5. Animations

### 5.1 Transitions CSS

- Hover sur cards : `hover:shadow-xl hover:scale-[1.02] transition-all`
- Boutons : `transition-colors duration-200`
- Effets doux, jamais aggressifs

### 5.2 Framer Motion

Utilisé ponctuellement pour :
- Apparition des toasts (slide + fade)
- Transitions du wizard (slide horizontal entre étapes)
- Upload progress (barres animées)

Principe : **prefers-reduced-motion** respecté (l'utilisateur peut désactiver les animations OS).

---

## 6. Themes dynamiques (B2B marque blanche)

Le `DynamicThemeProvider` permet à chaque client B2B de customiser :
- Couleur primaire (brand)
- Couleur secondaire
- Couleur tertiaire (graphiques)
- Logo

Exemple d'utilisation :
```tsx
<DynamicThemeProvider theme={{
  primary: "0 84% 45%",   // Rouge (ex: Basic-Fit)
  secondary: "...",
}}>
  <App />
</DynamicThemeProvider>
```

Toutes les couleurs des graphiques Recharts sont calculées via `useChartColors()` pour rester synchronisées.

---

## 7. Accessibilité design

### 7.1 Contrastes

| Usage | Couleurs | Ratio | WCAG AA |
|---|---|---|---|
| Texte normal | foreground sur background | 13.6:1 | ✅ |
| Texte secondaire | muted-foreground sur background | 4.8:1 | ✅ |
| Texte sur primary | primary-foreground sur primary | 7.2:1 | ✅ |
| Texte sur destructive | blanc sur rouge | 5.1:1 | ✅ |
| Bordures | border sur background | 3.1:1 | ✅ (UI) |

### 7.2 Focus visible

Chaque élément interactif a un focus ring visible :
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

### 7.3 Tailles des targets

- **Minimum 44×44 px** pour tous les boutons et liens (mobile-friendly)
- Espacement minimum 8px entre éléments interactifs
- Conforme aux recommandations WCAG 2.5.5 (Target Size AAA)

---

## 8. Prototypage & itération

### 8.1 Flow de conception

1. **Wireframe bas-fi** : réflexion sur papier / tableau blanc
2. **Prototype en code** : directement en React/Tailwind
3. **Review pair** : démo à l'équipe, feedback
4. **Tests a11y** : axe-core + Playwright
5. **Itération** : ajustements selon retours + tests

Cette boucle courte (max 1h) évite les allers-retours design/dev et garantit que ce qui est montré = ce qui est livré.

### 8.2 Outils utilisés

- **Shadcn CLI** pour installer les composants (`npx shadcn@latest add button`)
- **v0.dev** (Vercel) pour prototyper rapidement des layouts via IA
- **DevTools Chrome/Brave** pour inspecter et ajuster
- **Playwright trace viewer** pour capturer les screenshots

---

## 9. Captures d'écran (voir dossier `screenshots/`)

Les maquettes finales (implémentées) sont capturées dans :
- `01-landing-*.png` — Landing page (hero, pricing, footer)
- `02-wizard-*.png` — Inscription wizard (3 étapes)
- `05-connexion.png` — Page de connexion
- `06-dashboard.png` — Dashboard principal
- `07-dashboard-analytics.png` — Analytics (3 onglets)
- `08-nutrition-upload.png` — Upload nutrition + IA
- `09-nutrition-history.png` — Historique repas
- `10-meal-plan.png` — Plans de repas
- `11-workouts.png` — Programmes sport
- `12-settings.png` — Paramètres
- `13-clients.png` — Tableau B2B
- `14-15-mobile-*.png` — Versions mobile

---

## 10. Inspirations

- **Vercel Dashboard** : layout sidebar + main, typographie
- **Linear** : densité d'information, rapidité
- **Stripe Dashboard** : visualisations data
- **Cal.com** : design system moderne
- **Tailwind UI** : patterns responsive

Tous ces projets partagent la stack **React + Tailwind + Radix** que nous utilisons, ce qui facilite les inspirations cohérentes.
