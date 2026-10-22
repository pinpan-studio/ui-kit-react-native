import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Retour haptique léger sur les bascules (interrupteurs, mode sombre, sélection).
 * Android : passe par l'API système (View.performHapticFeedback) pour respecter le réglage
 * « retour tactile » de l'appareil. iOS : UISelectionFeedbackGenerator. Sans effet sur le web.
 */
export function hapticToggle(): void {
  if (Platform.OS === 'web') return;
  const run =
    Platform.OS === 'android'
      ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick)
      : Haptics.selectionAsync();
  run.catch(() => undefined);
}
