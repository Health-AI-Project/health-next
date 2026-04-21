# Conduite du changement — Frontend HealthNext

## 1. Objectif

Ce document explique les choix opérés pour **assurer l'accessibilité** de la solution et **accompagner son adoption** auprès des différents profils d'utilisateurs de HealthAI Coach.

---

## 2. Profils utilisateurs

### 2.1 Matrice des personas

| Persona | Tier | Âge | Besoins | Contraintes |
|---|---|---|---|---|
| **Léa** — étudiante | Freemium | 22 | Découverte, prix zéro | Mobile-first, débutante |
| **Thomas** — urbain actif | Premium | 30 | Gain de temps, coaching | Peu de temps, recherche efficacité |
| **Sarah** — sportive accomplie | Premium+ | 35 | Biométrie, suivi fin | Utilisatrice avancée, exigeante |
| **Marc** — gérant de salle de sport | B2B | 45 | Valoriser son offre | Moins technophile, veut du clé en main |
| **Julie** — nutritionniste partenaire | B2B Pro | 40 | Consulter ses patients | Travail professionnel, rigueur |

### 2.2 Adaptations par profil

**Léa (Freemium)** :
- Wizard d'inscription guidé (6 étapes courtes)
- Bandeau "Mode démonstration" quand données fictives
- PremiumGuard avec blur (elle voit ce qu'elle peut débloquer)
- Landing page avec prix lisibles (0€ clairement affiché)

**Thomas (Premium)** :
- Dashboard synthétique (4 KPIs en haut)
- Génération rapide de plans (1 clic)
- Raccourcis clavier pour naviguer
- Cache intelligent = pages réactives

**Sarah (Premium+)** :
- Onglets Analytics avancés
- Page Settings complète (profil, objectifs, abonnement)
- Accès aux graphiques détaillés (macros)
- Upgrade path clair (via page offres)

**Marc (B2B)** :
- Page Clients dédiée (`/dashboard/clients`)
- Theming dynamique (marque blanche possible)
- Données anonymisées (pas d'exposition RGPD)

**Julie (B2B Pro)** :
- Accès aux profils santé des patients
- Documentation OpenAPI pour intégration
- Export possible des données

---

## 3. Parcours d'adoption

### 3.1 Découverte (Awareness)

**Landing page `/`** :
- Hero clair : "Votre parcours santé personnalisé"
- 3 offres lisibles côte à côte (Freemium / Premium / Premium+)
- CTAs multiples (haut de page, cards, bas de page)
- Aucune friction : pas de popup, pas de demande email pour découvrir

### 3.2 Inscription (Consideration)

**Wizard `/inscription`** :
- **6 étapes** plutôt qu'un formulaire long (cognitive load réduit)
- **Progression visible** (barre + "Étape X sur 6")
- **Persistance localStorage** → l'utilisateur peut fermer et revenir
- **Validations contextuelles** (messages sous chaque champ)
- **Navigation libre** (bouton Précédent toujours accessible)

### 3.3 Onboarding (Activation)

Première connexion → Dashboard :
- **Données demo par défaut** si aucune donnée utilisateur
- **Bandeau explicite** : "Uploadez un repas pour voir vos vraies stats"
- **Sidebar avec tous les modules** (pas de cachette)
- **Badges 🔒 / 👑** sur les fonctionnalités premium (clarté sur ce qui est accessible)

### 3.4 Fidélisation (Retention)

- **Historique nutrition** : valorise les efforts
- **Graphiques progression** : poids, calories dans le temps
- **BMI card** : feedback santé immédiat
- **Plans repas/workout** : relance l'usage régulier

### 3.5 Upgrade (Conversion)

- **PremiumGuard** : l'utilisateur voit ce qu'il débloquerait (blur + preview)
- **UpgradeDialog** : modal avec avantages clairs
- **Page Settings > Abonnement** : CTA direct

---

## 4. Stratégies d'accessibilité

### 4.1 Accessibilité technique

Voir `04-Accessibilite-WCAG-RGAA.md` pour le détail WCAG 2.1 AA.

### 4.2 Accessibilité cognitive

- **Langage simple** : pas de jargon technique
- **Phrases courtes** : descriptions sous les champs limitées à 1 ligne
- **Icônes + texte** : toujours les deux (ex: "Se connecter" avec icône flèche)
- **Couleurs sémantiques** : vert = succès, rouge = erreur, jaune = alerte
- **Feedback immédiat** : toasts, loaders, transitions

### 4.3 Accessibilité situationnelle

- **Connexion faible** : `cachedFetch()` évite les refetchs inutiles
- **Backend down** : fallback demo + bandeau jaune (pas d'écran blanc)
- **Device mobile** : layout adapté (375px-1920px testé)
- **Clavier uniquement** : 100% navigable (testé Playwright + manuel)
- **Mode sombre** : `prefers-color-scheme` respecté

---

## 5. Formation & documentation

### 5.1 Pour les utilisateurs finaux

Le frontend **s'auto-explique** par le design :
- Labels explicites
- Placeholders montrant des exemples
- Tooltips sur les icônes (via `aria-label`)
- Messages d'erreur actionnables ("Entrez un nombre entre 18 et 100")

**Pas besoin de formation** : la plateforme vise le grand public (Millennials/Gen Z habitués aux UX modernes).

### 5.2 Pour les équipes internes

- **README** : instructions d'installation et démarrage
- **docs/** : documentation technique (11 fichiers fonctionnalités + TODO)
- **Storybook** : non implémenté (reporté post-MVP)
- **Types TypeScript** : autocomplétion IDE complète

### 5.3 Pour les partenaires B2B

- **Swagger UI** sur `/ui` (backend) : documentation API interactive
- **OpenAPI spec** sur `/doc` : import possible dans Postman/Insomnia
- **Types exportables** : possibilité de générer un SDK client

---

## 6. Gestion des erreurs & continuité de service

### 6.1 Principes

L'utilisateur ne doit **jamais** voir :
- Un écran blanc
- Une stack trace technique
- Un message HTTP brut (404, 500)
- Un état bloqué sans action possible

### 6.2 Mise en œuvre

**API indisponible** → Fallback demo + bandeau "Mode démonstration"
```tsx
try {
  const data = await cachedFetch('/api/home');
  setData(data);
} catch {
  setData(DEMO_DATA);
  setIsDemo(true);
}
```

**401 Non authentifié** → Redirect auto vers `/connexion`

**403 Premium requis** → Toast explicite + `UpgradeDialog`

**429 Too Many Requests** → Toast "Trop de requêtes, réessayez dans X secondes"

**Validation Zod** → Message inline sous le champ, annoncé aux lecteurs d'écran

**Upload échoué** → Toast avec détail du problème (image trop lourde, format non supporté, IA indisponible)

---

## 7. Monitoring & feedback

### 7.1 Collecte de feedback

**Dans l'application** :
- Mécanisme de correction des prédictions IA (`FeedbackRequest`) → améliore le modèle
- Bouton "Signaler un problème" (roadmap)

**Hors application** :
- GitHub Issues pour les bugs techniques
- Enquête utilisateur trimestrielle (post-MVP)

### 7.2 Métriques suivies

**Performance** :
- Lighthouse : Performance, Accessibilité, SEO, Best Practices
- Core Web Vitals : LCP, FID, CLS

**Qualité** :
- Taux de tests passants (objectif : 100%)
- Couverture a11y (objectif : 0 violation critical/serious)
- Lint ESLint (objectif : 0 warning)

**Business** (post-MVP) :
- Taux de conversion Freemium → Premium
- Rétention J+7 / J+30
- NPS (Net Promoter Score)

---

## 8. Gestion du changement technique

### 8.1 Mises à jour

- **Dépendances** : renouvelées en batch mensuel (Dependabot)
- **Next.js** : montée de version testée sur branche dédiée
- **React 19** : déjà adopté (dernière stable)
- **Breaking changes** : communiqués via CHANGELOG.md

### 8.2 Feature flags

Système de feature flags implicite via :
- `PremiumGuard` (accès selon tier)
- Variables d'environnement (`NEXT_PUBLIC_*`)
- A/B testing possible via Vercel Edge Config (roadmap)

### 8.3 Rollback

- Déploiement sur Vercel : **rollback en 1 clic** vers version précédente
- Branches Git : chaque feature sur sa branche, merge sur main
- Tests CI : bloquent le deploy si violations a11y ou tests cassés

---

## 9. Roadmap d'amélioration

### 9.1 Court terme (Q2 2026)

- **i18n** : support anglais (viser les marchés UK/US)
- **Notifications push** (PWA + Service Worker)
- **Mode hors-ligne** pour le journal nutrition
- **Storybook** pour les composants UI

### 9.2 Moyen terme (Q3-Q4 2026)

- **App mobile iOS/Android** (React Native ou Expo)
- **Intégration objets connectés** (Web Bluetooth)
- **Consultations vidéo** (WebRTC)
- **Assistant vocal** (Web Speech API)

### 9.3 Long terme (2027+)

- **IA conversationnelle** (chat avec coach virtuel)
- **Communauté** (forum, challenges)
- **Gamification** (badges, streaks)

---

## 10. Conclusion

Le frontend HealthNext a été conçu avec une **approche centrée utilisateur** :

1. **Accessibilité systémique** : WCAG AA by default via Radix UI + tests axe-core automatisés
2. **Résilience** : fallbacks partout, aucun écran blanc possible
3. **Progressive disclosure** : Freemium → Premium → Premium+ avec guards clairs
4. **Multi-tenant B2B** : theming dynamique pour marque blanche
5. **Qualité** : 33 tests e2e passants, lint clean, build optimisé

Cette approche garantit une **adoption fluide** par tous les profils cibles, depuis l'étudiante curieuse jusqu'au gérant de salle de sport, tout en respectant les standards d'accessibilité les plus exigeants du marché français (RGAA).
