import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

/**
 * Polices embarquées (aucune requête réseau à l'exécution), mêmes graisses que `pubspec.yaml` Flutter.
 * Une famille par graisse : Android l'exige.
 */
export const FONT_ASSETS = {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  SpaceMono_400Regular,
  SpaceMono_700Bold,
  TTWellingtons_400Regular: require('../../assets/fonts/TTWellingtons-regular.otf'),
  TTWellingtons_500Medium: require('../../assets/fonts/TTWellingtons-medium.otf'),
  TTWellingtons_600SemiBold: require('../../assets/fonts/TTWellingtons-demibold.otf'),
  TTWellingtons_700Bold: require('../../assets/fonts/TTWellingtons-bold.otf'),
  ...MaterialIcons.font,
  ...MaterialCommunityIcons.font,
};

/** `Fonts` Flutter : heading Outfit, body Inter, mono Space Mono, brand TT Wellingtons. */
export type FontRole = 'body' | 'heading' | 'mono' | 'brand';
export type FontWeight = '300' | '400' | '500' | '600' | '700' | '800';

const FAMILY: Record<FontRole, string> = {
  body: 'Inter',
  heading: 'Outfit',
  mono: 'SpaceMono',
  brand: 'TTWellingtons',
};
const WEIGHT_NAME: Record<FontWeight, string> = {
  '300': 'Light',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'SemiBold',
  '700': 'Bold',
  '800': 'ExtraBold',
};

/** Graisse réellement embarquée la plus proche pour chaque rôle. */
function available(role: FontRole, weight: FontWeight): FontWeight {
  if (role === 'mono') return weight >= '600' ? '700' : '400';
  if (role === 'brand') return weight < '400' ? '400' : weight > '700' ? '700' : weight;
  return weight;
}

/** Nom de famille chargé pour un rôle et une graisse (ex. `Outfit_600SemiBold`). */
export function fontFamily(role: FontRole, weight: FontWeight = '400'): string {
  const w = available(role, weight);
  return `${FAMILY[role]}_${w}${WEIGHT_NAME[w]}`;
}
