import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { KitIconButton } from '../../mobile/KitIconButton';
import {
  breakpoints,
  font,
  radius,
  space,
  toneColor,
  toneLight,
  useKitTheme,
  withAlpha,
  type KitTone,
} from '../../theme';
import { StatusBadge } from '../core/Badges';
import { KitButton } from '../core/Button';
import { CheckboxTile } from '../inputs/Choice';
import { KitTextField } from '../inputs/TextField';
import { KitBottomSheet, KitDialog } from './Overlays';

/** Disque d'icône des dialogues (56 dp, fond léger de la teinte). */
function DialogIcon({ icon, tone }: { icon: string; tone: KitTone }) {
  const { kit } = useKitTheme();
  return (
    <View style={[styles.disc, { backgroundColor: toneLight(tone, kit) }]}>
      <Icon source={icon} size={28} color={toneColor(tone, kit)} />
    </View>
  );
}

/** `modal.alert(...)` (`showKitAlert` Flutter) : icône teintée, titre et message centrés, un bouton. */
export function AlertDialog({
  visible,
  onDismiss,
  title,
  message,
  icon = 'mi:info-outline',
  tone = 'info',
  ok = 'Compris',
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  icon?: string;
  tone?: KitTone;
  ok?: string;
}) {
  const { kit } = useKitTheme();
  return (
    <KitDialog
      visible={visible}
      onDismiss={onDismiss}
      center
      icon={<DialogIcon icon={icon} tone={tone} />}
      title={title}
      actions={<KitButton label={ok} onPress={onDismiss} />}
    >
      <Text style={[styles.message, styles.center, { color: kit.textSecondary }]}>{message}</Text>
    </KitDialog>
  );
}

/**
 * `modal.confirm(...)` (`showKitConfirm` Flutter) : bouton rouge pour les actions destructives ;
 * `typeToConfirm` impose de recopier un code avant de confirmer.
 */
export function ConfirmDialog({
  visible,
  onResult,
  title,
  message,
  confirm = 'Confirmer',
  cancel = 'Annuler',
  danger = false,
  icon,
  typeToConfirm,
}: {
  visible: boolean;
  onResult: (confirmed: boolean) => void;
  title: string;
  message: string;
  confirm?: string;
  cancel?: string;
  danger?: boolean;
  icon?: string;
  typeToConfirm?: string;
}) {
  const { kit } = useKitTheme();
  const [typed, setTyped] = useState('');
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setTyped('');
  }
  const ok = !typeToConfirm || typed.trim() === typeToConfirm;
  return (
    <KitDialog
      visible={visible}
      onDismiss={() => onResult(false)}
      center
      icon={
        <DialogIcon
          icon={icon ?? (danger ? 'mi:delete-forever' : 'mi:help-outline')}
          tone={danger ? 'error' : 'primary'}
        />
      }
      title={title}
      actions={
        <>
          <KitButton label={cancel} variant="ghost" onPress={() => onResult(false)} />
          <KitButton
            label={confirm}
            variant={danger ? 'danger' : 'primary'}
            onPress={ok ? () => onResult(true) : undefined}
          />
        </>
      }
    >
      <Text style={[styles.message, styles.center, { color: kit.textSecondary }]}>{message}</Text>
      {typeToConfirm ? (
        <View style={styles.gap8}>
          <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>
            Saisissez <Text style={font('700', 12.5, 'mono')}>{typeToConfirm}</Text> pour confirmer
          </Text>
          <KitTextField
            autoFocus
            value={typed}
            onChangeText={setTyped}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel={`Saisissez ${typeToConfirm} pour confirmer`}
          />
        </View>
      ) : null}
    </KitDialog>
  );
}

/** `modal.prompt(...)` (`showKitPrompt` Flutter) : saisie d'un texte ; `null` si annulé. */
export function PromptDialog({
  visible,
  onResult,
  title,
  message,
  initial = '',
  hint = '',
  ok = 'Valider',
}: {
  visible: boolean;
  onResult: (value: string | null) => void;
  title: string;
  message?: string;
  initial?: string;
  hint?: string;
  ok?: string;
}) {
  const { kit } = useKitTheme();
  const [value, setValue] = useState(initial);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setValue(initial);
  }
  return (
    <KitDialog
      visible={visible}
      onDismiss={() => onResult(null)}
      title={title}
      actions={
        <>
          <KitButton label="Annuler" variant="ghost" onPress={() => onResult(null)} />
          <KitButton label={ok} onPress={() => onResult(value)} />
        </>
      }
    >
      {message ? <Text style={[styles.message, { color: kit.textSecondary }]}>{message}</Text> : null}
      <KitTextField
        autoFocus
        value={value}
        onChangeText={setValue}
        hint={hint}
        accessibilityLabel={hint || title}
        onSubmitEditing={() => onResult(value)}
      />
    </KitDialog>
  );
}

/** `modal.bottomConfirm(...)` (`showBottomConfirm` Flutter) : confirmation en feuille basse, au pouce. */
export function BottomConfirm({
  visible,
  onResult,
  title,
  message,
  confirm = 'Confirmer',
  danger = false,
  icon = 'mi:help-outline',
}: {
  visible: boolean;
  onResult: (confirmed: boolean) => void;
  title: string;
  message: string;
  confirm?: string;
  danger?: boolean;
  icon?: string;
}) {
  const { kit } = useKitTheme();
  return (
    <KitBottomSheet visible={visible} onDismiss={() => onResult(false)}>
      <View style={styles.bottomConfirm}>
        <View style={styles.centerItems}>
          <DialogIcon icon={icon} tone={danger ? 'error' : 'primary'} />
        </View>
        <Text accessibilityRole="header" style={[styles.sheetTitle, { color: kit.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.message, styles.center, { color: kit.textSecondary }]}>{message}</Text>
        <View style={styles.bottomActions}>
          <KitButton label={confirm} variant={danger ? 'danger' : 'primary'} expand onPress={() => onResult(true)} />
          <KitButton label="Annuler" variant="outline" expand onPress={() => onResult(false)} />
        </View>
      </View>
    </KitBottomSheet>
  );
}

/** Message poussé (`showPushMessage` Flutter) : bandeau illustré en dégradé, badge « Nouveau », deux actions. */
export function PushMessage({
  visible,
  onDismiss,
  title,
  message,
  cta = 'Découvrir',
  icon = 'mi:campaign',
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  cta?: string;
  icon?: string;
}) {
  const { kit, roles } = useKitTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.modalCenter}>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(roles.scrim, 0.32) }]}
        />
        <View accessibilityViewIsModal style={[styles.push, { backgroundColor: roles.surfaceContainerHigh }]}>
          <View style={styles.pushHero}>
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="push" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={kit.primary} />
                  <Stop offset="1" stopColor={kit.info} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#push)" />
            </Svg>
            <Icon source={icon} size={56} color={kit.onTone} />
          </View>
          <View style={styles.pushBody}>
            <StatusBadge label="Nouveau" tone="primary" />
            <Text accessibilityRole="header" style={[styles.pushTitle, { color: kit.textPrimary }]}>
              {title}
            </Text>
            <Text style={[styles.message, styles.center, { color: kit.textSecondary, lineHeight: 21 }]}>{message}</Text>
          </View>
          <View style={styles.pushActions}>
            <KitButton label="Plus tard" variant="ghost" expand style={styles.fill} onPress={onDismiss} />
            <KitButton label={cta} expand style={styles.fill} onPress={onDismiss} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Message prioritaire bloquant (`showPriorityMessage` Flutter) : il faut cocher « J’ai lu » pour continuer. */
export function PriorityMessage({
  visible,
  onDismiss,
  title,
  message,
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
}) {
  const { kit } = useKitTheme();
  const [read, setRead] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setRead(false);
  }
  return (
    <KitDialog
      visible={visible}
      onDismiss={onDismiss}
      dismissible={false}
      center
      icon={<DialogIcon icon="mi:priority-high" tone="error" />}
      title={title}
      actions={<KitButton label="Continuer" onPress={read ? onDismiss : undefined} />}
    >
      <View style={[styles.priority, { backgroundColor: kit.errorLight }]}>
        <Text style={[styles.message, { color: kit.errorText, lineHeight: 21 }]}>{message}</Text>
      </View>
      <CheckboxTile value={read} onChange={setRead} title="J’ai lu et compris ce message" />
    </KitDialog>
  );
}

/**
 * Panneau latéral (`showSidePanel` Flutter, drawer droit de 360 dp du shell) : feuille basse sur téléphone,
 * panneau glissé depuis la droite sur tablette.
 */
export function SidePanel({
  visible,
  onDismiss,
  title,
  icon = 'mi:view-sidebar',
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  icon?: string;
  children: ReactNode;
}) {
  const { kit, roles } = useKitTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const head = (
    <View style={styles.panelHead}>
      <Icon source={icon} size={24} color={kit.primary} />
      <Text accessibilityRole="header" style={[styles.sheetTitleLeft, { color: kit.textPrimary }]}>
        {title}
      </Text>
      <KitIconButton icon="mi:close" accessibilityLabel="Fermer" iconColor={kit.textSecondary} onPress={onDismiss} />
    </View>
  );
  const body = (
    <>
      {head}
      <View style={[styles.divider, { backgroundColor: kit.border }]} />
      <ScrollView style={styles.fill}>{children}</ScrollView>
    </>
  );
  if (width < breakpoints.tablet) {
    return (
      <KitBottomSheet visible={visible} onDismiss={onDismiss} handle={false} maxHeightRatio={0.85}>
        <View style={{ height: height * 0.85 }}>{body}</View>
      </KitBottomSheet>
    );
  }
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.panelHost}>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(roles.scrim, 0.32) }]}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.panel,
            {
              backgroundColor: kit.card,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingRight: insets.right,
            },
          ]}
        >
          {body}
        </View>
      </View>
    </Modal>
  );
}

/** Tiroir modal gauche (`Drawer` Flutter) : 300 dp, coins droits arrondis, voile qui ferme au toucher. */
export function ModalDrawer({
  visible,
  onDismiss,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const { kit, roles } = useKitTheme();
  // Insets explicites : dans une Modal native, SafeAreaView ne reçoit pas les marges (iOS).
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.fill}>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fermer le menu"
          style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(roles.scrim, 0.32) }]}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.drawer,
            {
              backgroundColor: kit.card,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

/** Dialogue plein écran (`Dialog.fullscreen` Flutter) : barre avec fermeture, titre et action texte. */
export function FullscreenDialog({
  visible,
  onDismiss,
  title,
  action,
  onAction,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  const { kit } = useKitTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={[styles.fill, { backgroundColor: kit.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.fullBar}>
          <KitIconButton icon="mi:close" accessibilityLabel="Fermer" iconColor={kit.textPrimary} onPress={onDismiss} />
          <Text accessibilityRole="header" style={[styles.fullTitle, { color: kit.textPrimary }]}>
            {title}
          </Text>
          {action ? (
            <TouchableRipple onPress={onAction} borderless accessibilityRole="button" style={styles.fullAction}>
              <Text style={[font('600', 14), { color: kit.primary }]}>{action}</Text>
            </TouchableRipple>
          ) : null}
        </View>
        <ScrollView contentContainerStyle={styles.fullBody}>{children}</ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { textAlign: 'center' },
  centerItems: { alignItems: 'center' },
  gap8: { gap: space.s2 },
  disc: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  message: font('400', 14),
  bottomConfirm: { paddingHorizontal: space.s6, paddingBottom: space.s4, gap: 6 },
  sheetTitle: { ...font('600', 19, 'heading'), textAlign: 'center', marginTop: 6 },
  sheetTitleLeft: { ...font('600', 18, 'heading'), flex: 1 },
  bottomActions: { gap: space.s2, marginTop: 14 },
  modalCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.l },
  push: { width: '100%', maxWidth: 400, borderRadius: radius.x2l, overflow: 'hidden' },
  pushHero: { height: 120, alignItems: 'center', justifyContent: 'center' },
  pushBody: {
    alignItems: 'center',
    paddingHorizontal: space.s6,
    paddingTop: space.s5,
    paddingBottom: space.s2,
    gap: space.s2,
  },
  pushTitle: { ...font('700', 20, 'heading'), textAlign: 'center', marginTop: 2 },
  pushActions: {
    flexDirection: 'row',
    gap: space.s2,
    paddingHorizontal: space.s4,
    paddingTop: space.s2,
    paddingBottom: space.s4,
  },
  priority: { padding: space.s3, borderRadius: radius.md },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: space.s5,
    paddingRight: space.s2,
    paddingVertical: space.s2,
  },
  divider: { height: 1 },
  panelHost: { flex: 1, alignItems: 'flex-end' },
  drawer: {
    width: 300,
    maxWidth: '85%',
    height: '100%',
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  panel: {
    width: 360,
    height: '100%',
    borderTopLeftRadius: radius.x2l,
    borderBottomLeftRadius: radius.x2l,
    overflow: 'hidden',
  },
  fullBar: { flexDirection: 'row', alignItems: 'center', height: 64, paddingHorizontal: space.s1 },
  fullTitle: { ...font('700', 20, 'heading'), flex: 1, marginLeft: space.s2 },
  fullAction: { paddingHorizontal: space.s3, minHeight: 48, justifyContent: 'center', borderRadius: 24 },
  fullBody: { padding: space.s5 },
});
