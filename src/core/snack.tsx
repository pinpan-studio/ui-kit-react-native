import * as Clipboard from 'expo-clipboard';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, Snackbar } from 'react-native-paper';

import { font, mix, radius, useKitTheme } from '../theme';

export type SnackKind = 'neutral' | 'success' | 'error' | 'info';

export interface SnackOptions {
  kind?: SnackKind;
  action?: string;
  onAction?: () => void;
  /** Durée d'affichage en ms (2 400 par défaut, comme Flutter). */
  duration?: number;
}

export interface SnackApi {
  /** `showKitSnack` Flutter : fond teinté à 22 % sur l'arrière-plan, texte dans la couleur de l'état. */
  show: (message: string, options?: SnackOptions) => void;
  /** Copie dans le presse-papiers + confirmation (`copyToClipboard`). */
  copy: (text: string, label?: string) => Promise<void>;
  /** Action « métier » sans effet réel, signalée comme telle (règle du kit statique). */
  demoAction: (what: string) => void;
}

interface SnackState extends SnackOptions {
  message: string;
  id: number;
}

const SnackContext = createContext<SnackApi | null>(null);

const ICONS: Record<Exclude<SnackKind, 'neutral'>, string> = {
  success: 'mi:check-circle',
  error: 'mi:error',
  info: 'mi:info',
};

/** Fournit `useKitSnack()` et affiche la snackbar en bas du conteneur (au-dessus de la barre de navigation). */
export function SnackProvider({ children, bottomInset = 0 }: { children: ReactNode; bottomInset?: number }) {
  const { kit, roles } = useKitTheme();
  const [snack, setSnack] = useState<SnackState | null>(null);
  const [visible, setVisible] = useState(false);

  const show = useCallback((message: string, options: SnackOptions = {}) => {
    setSnack((prev) => ({ ...options, message, id: (prev?.id ?? 0) + 1 }));
    setVisible(true);
  }, []);

  const api = useMemo<SnackApi>(
    () => ({
      show,
      copy: async (text, label) => {
        await Clipboard.setStringAsync(text);
        show(label ?? `« ${text} » copié`);
      },
      demoAction: (what) => show(`${what} (démo statique)`, { kind: 'info' }),
    }),
    [show],
  );

  const kind = snack?.kind ?? 'neutral';
  const tint = kind === 'neutral' ? undefined : kit[kind];
  const textColor = tint ?? roles.inverseOnSurface;

  return (
    <SnackContext.Provider value={api}>
      {children}
      <Snackbar
        key={snack?.id}
        visible={visible && snack !== null}
        onDismiss={() => setVisible(false)}
        duration={snack?.duration ?? 2400}
        wrapperStyle={{ paddingBottom: bottomInset }}
        style={[styles.snack, { backgroundColor: tint ? mix(tint, kit.bg, 0.22) : roles.inverseSurface }]}
        action={snack?.action ? { label: snack.action, textColor, onPress: () => snack.onAction?.() } : undefined}
      >
        <View style={styles.row} accessibilityLiveRegion="polite">
          {kind === 'neutral' ? null : <Icon source={ICONS[kind]} size={20} color={tint} />}
          <Text style={[styles.text, tint ? styles.tinted : null, { color: textColor }]}>{snack?.message}</Text>
        </View>
      </Snackbar>
    </SnackContext.Provider>
  );
}

const NOOP_API: SnackApi = { show: () => undefined, copy: async () => undefined, demoAction: () => undefined };

/** Snackbars du kit ; sans `SnackProvider` (tests isolés), les appels sont ignorés. */
export const useKitSnack = (): SnackApi => useContext(SnackContext) ?? NOOP_API;

const styles = StyleSheet.create({
  snack: { borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { ...font('400', 14), flexShrink: 1 },
  tinted: font('600', 14),
});
