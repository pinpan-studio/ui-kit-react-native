import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';

/** Polices embarquées (aucune requête réseau à l'exécution). Une famille par graisse : Android l'exige. */
export const FONT_ASSETS = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  SpaceMono_400Regular,
  SpaceMono_700Bold,
};

export type FontRole = 'body' | 'heading' | 'mono';
const FAMILY: Record<FontRole, string> = { body: 'Inter', heading: 'Outfit', mono: 'SpaceMono' };
const WEIGHT: Record<string, string> = { '400': 'Regular', '500': 'Medium', '600': 'SemiBold', '700': 'Bold' };

/** Nom de famille chargé pour un rôle et une graisse (ex. `Outfit_600SemiBold`). */
export function fontFamily(role: FontRole, weight: string = '400'): string {
  const w = role === 'mono' ? (weight >= '600' ? '700' : '400') : weight;
  return `${FAMILY[role]}_${w}${WEIGHT[w] ?? 'Regular'}`;
}
