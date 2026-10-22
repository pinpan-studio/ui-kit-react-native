import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitIconButton } from '../../mobile/KitIconButton';
import { font, radius, space, useKitTheme, withAlpha } from '../../theme';
import { KitButton } from '../core/Button';

/** Fond assombri commun : touche pour fermer, ignoré des lecteurs d'écran sauf comme action « Fermer ». */
function Scrim({ onPress }: { onPress?: () => void }) {
  const { roles } = useKitTheme();
  if (!onPress) return <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(roles.scrim, 0.32) }]} />;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Fermer"
      style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(roles.scrim, 0.32) }]}
    />
  );
}

/**
 * Feuille basse modale Material 3 (`showModalBottomSheet` Flutter) : surface-container-low, coins de 24,
 * poignée, hauteur bornée ; le clavier la remonte, le retour Android la ferme.
 */
export function KitBottomSheet({
  visible,
  onDismiss,
  children,
  maxHeightRatio = 0.75,
  handle = true,
  resizable,
  testID,
}: {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  maxHeightRatio?: number;
  handle?: boolean;
  /** Feuille extensible (`DraggableScrollableSheet` Flutter) : hauteurs initiale, minimale et maximale. */
  resizable?: { initial: number; min: number; max: number };
  testID?: string;
}) {
  const { roles } = useKitTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [ratio, setRatio] = useState(resizable?.initial ?? 0);
  const dragStart = useRef<{ y: number; ratio: number } | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible && resizable) setRatio(resizable.initial);
  }
  const [slide] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!visible) return;
    slide.setValue(1);
    Animated.timing(slide, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);
  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.4] });
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView style={styles.end} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Scrim onPress={onDismiss} />
        <Animated.View
          testID={testID}
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: roles.surfaceContainerLow,
              ...(resizable
                ? { height: height * ratio + insets.bottom }
                : { maxHeight: height * maxHeightRatio + insets.bottom }),
              paddingBottom: insets.bottom,
              transform: [{ translateY }],
            },
          ]}
        >
          {handle ? (
            <View
              style={styles.handleArea}
              accessible={!!resizable}
              accessibilityRole={resizable ? 'adjustable' : undefined}
              accessibilityLabel={resizable ? 'Hauteur de la feuille' : undefined}
              accessibilityActions={resizable ? [{ name: 'increment' }, { name: 'decrement' }] : undefined}
              onAccessibilityAction={(e) =>
                resizable && setRatio(e.nativeEvent.actionName === 'increment' ? resizable.max : resizable.min)
              }
              onStartShouldSetResponder={() => !!resizable}
              onMoveShouldSetResponder={() => !!resizable}
              onResponderGrant={(e) => {
                dragStart.current = { y: e.nativeEvent.pageY, ratio };
              }}
              onResponderMove={(e) => {
                if (!resizable || !dragStart.current) return;
                const next = dragStart.current.ratio - (e.nativeEvent.pageY - dragStart.current.y) / height;
                if (next < resizable.min - 0.08) onDismiss();
                else setRatio(Math.min(resizable.max, Math.max(resizable.min, next)));
              }}
              onResponderRelease={() => {
                dragStart.current = null;
              }}
            >
              <View style={[styles.handle, { backgroundColor: withAlpha(roles.onSurfaceVariant, 0.4) }]} />
            </View>
          ) : null}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Fenêtre de dialogue Material 3 (`AlertDialog` Flutter) : surface-container-high, coins de 24. */
export function KitDialog({
  visible,
  onDismiss,
  icon,
  title,
  children,
  actions,
  center = false,
  dismissible = true,
  testID,
}: {
  visible: boolean;
  onDismiss: () => void;
  /** `false` : ni le fond ni le retour Android ne ferment (message bloquant). */
  dismissible?: boolean;
  icon?: ReactNode;
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  /** Titre et actions centrés (dialogue avec icône). */
  center?: boolean;
  testID?: string;
}) {
  const { roles, kit } = useKitTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissible ? onDismiss : () => undefined}
    >
      <KeyboardAvoidingView style={styles.center} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Scrim onPress={dismissible ? onDismiss : undefined} />
        <View
          testID={testID}
          accessibilityViewIsModal
          style={[styles.dialog, { backgroundColor: roles.surfaceContainerHigh }]}
        >
          {icon ? <View style={styles.dialogIcon}>{icon}</View> : null}
          {title ? (
            <Text
              accessibilityRole="header"
              style={[styles.dialogTitle, { color: kit.textPrimary }, center && styles.textCenter]}
            >
              {title}
            </Text>
          ) : null}
          {children}
          {actions ? <View style={[styles.actions, center && styles.actionsCenter]}>{actions}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/**
 * Formulaire en feuille quasi plein écran (`showFormSheet` / `CrudDialog` Flutter) : en-tête titré,
 * contenu défilant, barre d'actions collée en bas.
 */
export function FormSheet({
  visible,
  onDismiss,
  title,
  subtitle,
  icon = 'mi:edit-note',
  children,
  submitLabel = 'Enregistrer',
  readOnly = false,
  onSubmit,
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  children: ReactNode;
  submitLabel?: string;
  readOnly?: boolean;
  onSubmit?: () => void;
}) {
  const { kit } = useKitTheme();
  return (
    <KitBottomSheet visible={visible} onDismiss={onDismiss} maxHeightRatio={0.92} handle={false}>
      <View style={styles.formHead}>
        <View style={[styles.formDisc, { backgroundColor: kit.primaryLight }]}>
          <Icon source={icon} size={20} color={kit.primary} />
        </View>
        <View style={styles.fill}>
          <Text accessibilityRole="header" style={[styles.formTitle, { color: kit.textPrimary }]}>
            {title}
          </Text>
          {subtitle ? <Text style={[styles.formSubtitle, { color: kit.textSecondary }]}>{subtitle}</Text> : null}
        </View>
        <KitIconButton icon="mi:close" accessibilityLabel="Fermer" iconColor={kit.textSecondary} onPress={onDismiss} />
      </View>
      <View style={[styles.divider, { backgroundColor: kit.border }]} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formBody}>
        {children}
      </ScrollView>
      <View style={[styles.divider, { backgroundColor: kit.border }]} />
      <View style={styles.formActions}>
        <KitButton
          label={readOnly ? 'Fermer' : 'Annuler'}
          variant="outline"
          expand
          onPress={onDismiss}
          style={styles.fill}
        />
        {readOnly ? null : <KitButton label={submitLabel} expand onPress={onSubmit} style={styles.fill} />}
      </View>
    </KitBottomSheet>
  );
}

/** En-tête de feuille : titre Outfit 18/600 et actions à droite. */
export function SheetHeader({ title, children }: { title: string; children?: ReactNode }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.sheetHead}>
      <Text accessibilityRole="header" style={[styles.formTitle, styles.fill, { color: kit.textPrimary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  end: { flex: 1, justifyContent: 'flex-end' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: space.l },
  sheet: { borderTopLeftRadius: radius.x2l, borderTopRightRadius: radius.x2l, overflow: 'hidden' },
  handleArea: { height: 36, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 32, height: 4, borderRadius: 2 },
  dialog: { width: '100%', maxWidth: 560, minWidth: 280, borderRadius: radius.x2l, padding: space.l, gap: space.m },
  dialogIcon: { alignItems: 'center' },
  dialogTitle: font('600', 20, 'heading'),
  textCenter: { textAlign: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: space.s2, marginTop: space.s2 },
  actionsCenter: { justifyContent: 'center' },
  formHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: space.s5,
    paddingRight: space.s2,
    paddingTop: space.s4,
    paddingBottom: space.s3,
  },
  formDisc: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  formTitle: font('600', 18, 'heading'),
  formSubtitle: font('400', 12.5),
  divider: { height: 1 },
  formBody: { padding: space.s5, gap: 14 },
  formActions: { flexDirection: 'row', gap: 10, paddingHorizontal: space.s4, paddingVertical: space.s3 },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingLeft: space.s5,
    paddingRight: space.s3,
    paddingBottom: space.s2,
  },
});

export const dialogIconDisc = (icon: string, color: string, background: string) => (
  <View style={[styles.formDisc, { width: 56, height: 56, borderRadius: 28, backgroundColor: background }]}>
    <Icon source={icon} size={28} color={color} />
  </View>
);
