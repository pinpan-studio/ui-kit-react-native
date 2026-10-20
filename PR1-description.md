# PR #1 — Fondation de ui-kit-react-native

Étape 1 du kit mobile React Native (Expo), pendant de `ui-kit-flutter` (référence : `fix/success-contrast`,
`0caeea5` + `3547854` + `6921a8a`). Couleurs : référence Angular `c0789b6` (41 palettes M3, clair et sombre).

## Contenu

- **Pile** : Expo SDK 58 (React Native 0.88, React 19.3), TypeScript strict + `noUncheckedIndexedAccess`,
  Expo Router, React Native Paper 5 (MD3), zustand + AsyncStorage, Inter / Outfit / Space Mono embarquées.
- **Thème** (`src/theme`) : les 41 palettes et les jetons sont générés depuis les exports Angular, sans
  recalcul (`scripts/generate-theme.mjs`). `buildTheme(palette, mode)` reprend chaque rôle M3 à
  l'identique ; tertiaire `#964900` / `#ffb787`, texte du bouton Success `#052e16`, état désactivé M3
  (on-surface 38 % / 12 %). Espacements, rayons, élévations 0 à 5.
- **Préférences** : palette et mode clair / sombre / système, persistés.
- **Shell** : app bar, navigation adaptative, tiroir avec recherche « Rechercher un composant… »
  (catégories et sections, sans tenir compte de la casse ni des accents, état vide), feuille de choix
  du thème, bascule du mode sombre, accueil Showcase, index des 13 catégories (147 sections), Layouts, Harnais.
- **Règles mobiles du kit Flutter** : cibles ≥ 48 dp, zones sûres, clavier, retour Android qui ferme
  d'abord la feuille / le tiroir, haptique sur les bascules, libellés d'accessibilité obligatoires sur
  les boutons d'icône, éléments décoratifs masqués, pas de hauteur fixe sur les textes.
- **Harnais** : navigation masquée comme dans `kit_shell.dart`, sortie par ✕ ou retour Android vers la
  destination précédente.

## Écart volontaire avec Flutter

Sur téléphone (< 600 dp), le comportement est celui de Flutter : barre en bas + tiroir. Au-delà, on suit
les classes de largeur Material 3 : **rail de 600 à 840 dp**, **panneau latéral permanent au-delà de
840 dp** (Flutter garde la barre du bas à toutes les largeurs).

## Vérifications

`tsc --noEmit`, `expo lint`, `prettier --check`, `jest` et `expo export -p android` passent (Node 22).
L'APK se construit en local sans compte Expo (`npx expo prebuild -p android` puis
`cd android && ./gradlew assembleRelease`), clé de signature hors du dépôt. Aucun secret dans le code.

## Hors périmètre

Composants (étape 2), pages d'exemple (étape 3), lot contraste (branche séparée).
Rien n'est fusionné sans l'accord de Parfait.
