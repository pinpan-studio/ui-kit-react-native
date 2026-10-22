import * as Clipboard from 'expo-clipboard';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, Snackbar, TouchableRipple } from 'react-native-paper';

import { elevation, font, mix, radius, space, useKitTheme } from '../theme';

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
  /** Bannière en haut de l'écran, refermée après 3 s (`MaterialBanner` Flutter). */
  banner: (message: string, icon?: string) => void;
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
  const { kit, roles, colorMode } = useKitTheme();
  const [snack, setSnack] = useState<SnackState | null>(null);
  /** Identifiant de la snackbar affichée : une fermeture tardive n'éteint pas la suivante. */
  const [visibleId, setVisibleId] = useState<number | null>(null);
  const [top, setTop] = useState<{ message: string; icon: string } | null>(null);
  const topTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(topTimer.current), []);

  const nextId = useRef(0);
  const show = useCallback((message: string, options: SnackOptions = {}) => {
    const id = ++nextId.current;
    setSnack({ ...options, message, id });
    setVisibleId(id);
  }, []);

  const api = useMemo<SnackApi>(
    () => ({
      show,
      copy: async (text, label) => {
        await Clipboard.setStringAsync(text);
        show(label ?? `« ${text} » copié`);
      },
      demoAction: (what) => show(`${what} (démo statique)`, { kind: 'info' }),
      banner: (message, icon = 'mi:info') => {
        setTop({ message, icon });
        clearTimeout(topTimer.current);
        topTimer.current = setTimeout(() => setTop(null), 3000);
      },
    }),
    [show],
  );

  const kind = snack?.kind ?? 'neutral';
  const tint = kind === 'neutral' ? undefined : kit[kind];
  const textColor = tint ?? roles.inverseOnSurface;

  return (
    <SnackContext.Provider value={api}>
      {children}
      {top ? (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[
            styles.top,
            { backgroundColor: roles.surfaceContainerLow, borderBottomColor: roles.outlineVariant },
            elevation(1, colorMode),
          ]}
        >
          <Icon source={top.icon} size={24} color={kit.info} />
          <Text style={[styles.text, styles.topText, { color: kit.textPrimary }]}>{top.message}</Text>
          <TouchableRipple onPress={() => setTop(null)} borderless accessibilityRole="button" style={styles.topAction}>
            <Text style={[font('600', 14), { color: kit.primary }]}>OK</Text>
          </TouchableRipple>
        </View>
      ) : null}
      <Snackbar
        key={snack?.id}
        visible={snack !== null && visibleId === snack.id}
        onDismiss={() => {
          const id = snack?.id;
          setVisibleId((cur) => (cur === id ? null : cur));
        }}
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

const NOOP_API: SnackApi = {
  show: () => undefined,
  copy: async () => undefined,
  demoAction: () => undefined,
  banner: () => undefined,
};

/** Snackbars du kit ; sans `SnackProvider` (tests isolés), les appels sont ignorés. */
export const useKitSnack = (): SnackApi => useContext(SnackContext) ?? NOOP_API;

const styles = StyleSheet.create({
  snack: { borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { ...font('400', 14), flexShrink: 1 },
  tinted: font('600', 14),
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s4,
    paddingLeft: space.s4,
    paddingRight: space.s2,
    paddingVertical: space.s2,
    borderBottomWidth: 1,
  },
  topText: { flex: 1 },
  topAction: { minHeight: 40, paddingHorizontal: space.s3, justifyContent: 'center', borderRadius: 20 },
});
