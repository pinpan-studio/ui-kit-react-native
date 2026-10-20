import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Retour haptique léger sur les bascules (interrupteurs, mode sombre, sélection). Sans effet sur le web. */
export function hapticToggle(): void {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => undefined);
}
