# ui-kit-react-native

Kit d'interface **mobile** en React Native (Expo), pendant de `ui-kit-flutter` : mêmes écrans, même structure,
mêmes règles mobiles. Les couleurs viennent de la référence Angular (`ui-kit`, 41 palettes Material 3 en clair et en sombre).

## Pile technique

- Expo SDK 58 (React Native 0.88, React 19.3), TypeScript strict (`noUncheckedIndexedAccess`)
- Expo Router (routes dans `src/app/`)
- React Native Paper 5 (Material 3)
- zustand + AsyncStorage (palette et mode persistés)
- Polices embarquées : Inter, Outfit, Space Mono (`@expo-google-fonts/*`)
- ESLint (`eslint-config-expo`), Prettier, Jest (`jest-expo`) + Testing Library

## Démarrer

Node **22.13 ou plus** (voir `.nvmrc`).

```bash
npm install
npm start            # serveur Expo (Expo Go ou build de dev)
npm run android      # ouvre sur un émulateur / appareil Android
```

## Scripts

| Commande                 | Rôle                                                     |
| ------------------------ | -------------------------------------------------------- |
| `npm run typecheck`      | `tsc --noEmit`                                           |
| `npm run lint`           | ESLint (`expo lint`)                                     |
| `npm run format:check`   | Prettier en vérification                                 |
| `npm test`               | Jest                                                     |
| `npm run export:android` | bundle Android (contrôle de build)                       |
| `npm run generate:theme` | régénère `src/theme/generated/` depuis `scripts/source/` |

## Structure

```
scripts/
  source/                 exports Angular (palettes, tokens, routes) + paletteMeta
  generate-theme.mjs      JSON → TypeScript typé, sans recalcul de couleurs
src/
  app/                    routes Expo Router (Showcase, Composants, Layouts, Harnais)
  theme/                  ≈ lib/theme Flutter : tokens, palettes générées, buildTheme, polices
  store/                  préférences de thème (zustand persisté)
  shell/                  ≈ lib/showcase/kit_shell : navigation adaptative, app bar, feuille de palettes
  showcase/               ≈ lib/showcase/kit_nav : catalogue des 13 catégories
  mobile/                 règles mobiles : cible 48 dp, haptique, retour Android, clavier, décoratif
__tests__/                tests du thème et du shell
```

## Thème

- `buildTheme(paletteId, mode)` renvoie un thème Paper MD3 dont chaque rôle reprend **exactement** la valeur
  Angular (`angular-palettes.json`). `theme.roles` expose les 51 rôles bruts, `theme.kit` les couleurs du kit
  (success, warning, info, texte du bouton Success `#052e16`, état désactivé M3 : on-surface 38 % / 12 %).
- Hook : `useKitTheme()`.
- Jetons : `space`, `radius`, `elevation(0..5, mode)`, `breakpoints`, `MIN_TOUCH`.

## Règles mobiles (kit Flutter)

1. Cibles tactiles ≥ 48 × 48 dp (`KitIconButton`, `minHeight`).
2. Zones sûres : fonds bord à bord, contenu hors encoche / barre d'état / barre de gestes.
3. Clavier : `KeyboardSafe` garde le champ actif visible, le pied de page remonte.
4. Navigation : barre en bas < 600 dp, rail 600–840 dp, panneau latéral au-delà.
5. Retour Android : `useBackClose` ferme d'abord la feuille ou le tiroir ouvert.
6. Mode sombre et taille de texte : suit le système, aucune hauteur fixe sur les textes.
7. Lecteurs d'écran : chaque bouton d'icône a un `accessibilityLabel` obligatoire, le décoratif est masqué.

## APK de test, sans compte Expo

Prérequis : JDK 17 et Android SDK (`ANDROID_HOME`).

```bash
npx expo prebuild -p android          # génère android/ (non versionné)
cd android && ./gradlew assembleRelease
# APK : android/app/build/outputs/apk/release/app-release.apk
```

Signature : la clé de test (`.jks` / `.keystore`) et ses mots de passe restent **hors du dépôt**
(par ex. `~/.android-keys/` et variables d'environnement ou `~/.gradle/gradle.properties`).
`.gitignore` exclut `*.jks`, `*.keystore`, `keystore.properties` et `android/`.
Aucun secret ne doit figurer dans le code ni dans la documentation.
