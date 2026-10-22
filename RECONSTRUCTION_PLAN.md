# Reconstruction de ui-kit-react-native

Référence visuelle et fonctionnelle : `/Users/MAC/UIX/ui-kit-flutter` (application statique mobile, sans backend).
Le but est une adaptation React Native native — même design system, mêmes composants, mêmes états — pas une copie
du code Flutter.

## État — 22 octobre 2026

Les étapes 0 à 10 sont terminées sur `feat/flutter-parity` : design system, composants du kit, système de
documentation, 13 galeries, Showcase, gabarits, pages d'exemple (applications, authentification, formulaires),
Showcases et Harnais (33 widgets). Chaque étape a été vérifiée par typecheck, lint, Prettier, Jest, export Android
et comparaison de captures avec les goldens Flutter.

## Étapes

| #   | Étape                    | Contenu                                                                                     |
| --- | ------------------------ | ------------------------------------------------------------------------------------------- |
| 0   | Sécuriser l'existant     | branche `feat/flutter-parity`, Prettier, commit du travail en cours                         |
| 1   | Design system            | `KitColors` + `KitTone`, `KitText`, polices, points de rupture, élévations, icônes, Paper   |
| 2   | Composants de base       | Button, IconButton, Card, StatusBadge, Avatar, Chip, Skeleton, EmptyState, ErrorState, KPI… |
| 3   | Système de documentation | DocPage, DocSection, Demo, CodeBlock ; pilotes Typographie et Boutons                       |
| 4   | Champs et feedback       | TextField, Select, champs avancés, Alert, Banner, dialogues, Snackbar, upload, résultat     |
| 5   | Navigation et données    | Breadcrumb, Steps, Paginator, Tabs, DataTable, Timeline, Diff, Audit, graphiques (SVG)      |
| 6   | Galeries restantes       | Planning, Cartes, Médias, Interactions, Material, Layout                                    |
| 7   | Showcase et layouts      | 6 sections du Showcase (studio de thème), 7 gabarits                                        |
| 8   | Pages d'exemple          | données Flutter, 16 pages, 11 variantes d'authentification, 6 formulaires                   |
| 9   | Harnais                  | modèle, scénarios, flux simulé, 33 renderers                                                |
| 10  | Nettoyage et validation  | suppression des anciens aperçus, accessibilité, Android / iOS, comparaison finale           |

## Décisions

- Grand écran : rail 600–840 dp et panneau ≥ 840 dp (Material 3) conservés, écart documenté dans le README.
- Graphiques : `react-native-svg`, sans bibliothèque de graphiques supplémentaire.
- Studio de thème : non porté ; la feuille « Apparence » couvre le choix de palette et de mode.
- Showcases : écrans à la taille réelle de l'appareil, sans sélecteur de cadre.

## Règles de parité

- Garder les mêmes identifiants de catégories et de sections que `src/showcase/kitNav.ts` et `lib/showcase/kit_nav.dart`.
- Aucune couleur, taille ou police en dur dans les écrans : tout passe par `src/theme` et `src/components`.
- Conserver les mêmes libellés, contenus de démonstration et états observables.
- Données locales déterministes ; aucun backend ou service réseau.
- Une étape n'est terminée qu'après typecheck, lint, Prettier, tests et vérification en clair et en sombre.
