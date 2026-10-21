# Reconstruction de ui-kit-react-native

Référence visuelle et fonctionnelle : `/Users/MAC/UIX/ui-kit-flutter` (application statique mobile, sans backend).
Le but est une adaptation React Native native — même design system, mêmes composants, mêmes états — pas une copie
du code Flutter.

## État réel — 21 octobre 2026

- **Conservé** : Expo Router, shell adaptatif (barre / rail / panneau), recherche du tiroir, `kitNav.ts` (mêmes
  identifiants que `kit_nav.dart`), 41 palettes générées depuis Angular, store persisté, règles mobiles
  (`KitIconButton`, `useBackClose`, `KeyboardSafe`, `Decorative`) et leurs tests.
- **Première passe à reprendre** : les 13 galeries, pages, layouts et Harnais existent mais utilisent Paper brut,
  sans couche de composants du kit, avec couleurs codées en dur et cartes à contour. Ils ne sont pas encore
  conformes visuellement à Flutter.
- **Manques du socle** : échelle `KitText`, `KitColors` complet (textes, fonds, bordures, `fieldBg`…), `KitTone`,
  formes des composants (boutons pilule 40 dp, champs remplis rayon 12, cartes sans contour rayon 24), polices
  TT Wellingtons et graisses 300 / 800, Material Icons, points de rupture et colonnes Flutter.

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
- Studio de thème : porté à l'étape 7.

## Règles de parité

- Garder les mêmes identifiants de catégories et de sections que `src/showcase/kitNav.ts` et `lib/showcase/kit_nav.dart`.
- Aucune couleur, taille ou police en dur dans les écrans : tout passe par `src/theme` et `src/components`.
- Conserver les mêmes libellés, contenus de démonstration et états observables.
- Données locales déterministes ; aucun backend ou service réseau.
- Une étape n'est terminée qu'après typecheck, lint, Prettier, tests et vérification en clair et en sombre.
