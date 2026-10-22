import { useLocalSearchParams } from 'expo-router';

import { HarnaisScreen } from '../harnais/HarnaisScreen';
import { useShellExit } from '../shell/AdaptiveShell';

/** Harnais en plein écran ; `?c=<id>` ouvre une conversation au démarrage (`/harnais/:id` Flutter). */
export default function HarnaisRoute() {
  const { c } = useLocalSearchParams<{ c?: string }>();
  const exit = useShellExit();
  // Une conversation demandée remonte l'écran (store neuf), comme une nouvelle route Flutter.
  return <HarnaisScreen key={c ?? ''} onExit={exit} initialConversation={c} />;
}
