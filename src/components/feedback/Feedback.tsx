import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Icon, TouchableRipple } from 'react-native-paper';

import { fileSize } from '../../core/format';
import { KitIconButton } from '../../mobile/KitIconButton';
import { useReducedMotion } from '../../mobile/useReducedMotion';
import {
  font,
  mix,
  radius,
  space,
  toneColor,
  toneLight,
  toneText,
  useKitTheme,
  withAlpha,
  type KitTone,
} from '../../theme';
import { KitButton } from '../core/Button';
import { KitProgressBar } from '../core/Layout';
import { DEMO_FILES, type DemoFile } from '../inputs/Upload';

/** Icône par défaut d'une teinte (`toneIcon` Flutter). */
export function toneIcon(t: KitTone): string {
  switch (t) {
    case 'success':
      return 'mi:check-circle';
    case 'warning':
      return 'mi:warning-amber';
    case 'error':
      return 'mi:error';
    case 'info':
      return 'mi:info';
    default:
      return 'mi:notifications';
  }
}

/** Alerte en ligne : fond léger, bordure gauche teintée, action, fermeture (`KitAlert` Flutter). */
export function KitAlert({
  tone,
  text,
  title,
  icon,
  onClose,
  action,
  onAction,
  compact = false,
  filled = false,
}: {
  tone: KitTone;
  text: string;
  title?: string;
  icon?: string;
  onClose?: () => void;
  action?: string;
  onAction?: () => void;
  compact?: boolean;
  filled?: boolean;
}) {
  const { kit } = useKitTheme();
  const col = toneColor(tone, kit);
  const fg = filled ? kit.onTone : toneText(tone, kit);
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.alert,
        {
          backgroundColor: filled ? col : toneLight(tone, kit),
          borderLeftColor: col,
          paddingLeft: compact ? space.s3 : space.s4,
          paddingVertical: compact ? space.s2 : space.s3,
          paddingRight: onClose ? space.s1 : space.s4,
          alignItems: compact ? 'center' : 'flex-start',
        },
      ]}
    >
      <Icon source={icon ?? toneIcon(tone)} size={compact ? 18 : 22} color={filled ? kit.onTone : col} />
      <View style={styles.fill}>
        {title && !compact ? <Text style={[styles.alertTitle, { color: fg }]}>{title}</Text> : null}
        <Text style={[styles.alertText, { color: filled ? kit.onTone : kit.textPrimary }]}>
          {compact && title ? `${title} — ${text}` : text}
        </Text>
        {action && !compact ? (
          <Text
            onPress={onAction}
            accessibilityRole="link"
            suppressHighlighting
            style={[styles.alertAction, { color: fg, textDecorationColor: fg }]}
          >
            {action}
          </Text>
        ) : null}
      </View>
      {onClose ? (
        <KitIconButton
          icon="mi:close"
          size={18}
          accessibilityLabel="Fermer l’alerte"
          iconColor={filled ? kit.onTone : kit.textSecondary}
          onPress={onClose}
        />
      ) : null}
    </View>
  );
}

/** Bannière globale (`<app-banner>`) : maintenance, incident, abonnement, nouveauté (`GlobalBanner` Flutter). */
export function GlobalBanner({
  tone,
  title,
  text,
  icon,
  action,
  onAction,
  onClose,
}: {
  tone: KitTone;
  title: string;
  text?: string;
  icon?: string;
  action?: string;
  onAction?: () => void;
  onClose?: () => void;
}) {
  const { kit } = useKitTheme();
  const col = toneColor(tone, kit);
  const light = toneLight(tone, kit);
  const alpha = light.length === 9 ? parseInt(light.slice(7), 16) / 255 : 1;
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: mix(light, kit.card, alpha), borderBottomColor: withAlpha(col, 0.35) }]}
    >
      <Icon source={icon ?? toneIcon(tone)} size={20} color={col} />
      <Text style={[styles.bannerText, { color: kit.textPrimary }]}>
        <Text style={font('700', 12.5)}>{title}</Text>
        {text ? ` · ${text}` : ''}
      </Text>
      {action ? (
        <TouchableRipple onPress={onAction} borderless accessibilityRole="button" style={styles.bannerAction}>
          <Text style={[font('600', 14), { color: toneText(tone, kit) }]}>{action}</Text>
        </TouchableRipple>
      ) : null}
      {onClose ? (
        <KitIconButton
          icon="mi:close"
          size={18}
          accessibilityLabel="Fermer la bannière"
          iconColor={kit.textSecondary}
          onPress={onClose}
        />
      ) : null}
    </View>
  );
}

/** Page de résultat (`<app-result>`) : disque qui rebondit, titre, sous-titre, complément, actions (`ResultView`). */
export function ResultView({
  tone,
  title,
  subtitle,
  icon,
  actions,
  extra,
}: {
  tone: KitTone;
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
  extra?: ReactNode;
}) {
  const { kit } = useKitTheme();
  const reduced = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(reduced ? 1 : 0.6));
  useEffect(() => {
    if (reduced) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
  }, [scale, reduced]);
  return (
    <View style={styles.result} accessibilityLiveRegion="polite">
      <Animated.View style={[styles.resultDisc, { backgroundColor: toneLight(tone, kit), transform: [{ scale }] }]}>
        <Icon source={icon ?? toneIcon(tone)} size={44} color={toneColor(tone, kit)} />
      </Animated.View>
      <Text accessibilityRole="header" style={[styles.resultTitle, { color: kit.textPrimary }]}>
        {title}
      </Text>
      {subtitle ? <Text style={[styles.resultSubtitle, { color: kit.textSecondary }]}>{subtitle}</Text> : null}
      {extra ? <View style={styles.resultExtra}>{extra}</View> : null}
      {actions ? <View style={styles.resultActions}>{actions}</View> : null}
    </View>
  );
}

/** Bloc de chargement plein cadre (`<app-overlay-spiner>`, `OverlaySpinner` Flutter). */
export function OverlaySpinner({
  message = 'Chargement…',
  absolute = false,
}: {
  message?: string;
  absolute?: boolean;
}) {
  const { kit } = useKitTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      style={[styles.overlay, absolute && StyleSheet.absoluteFill, { backgroundColor: withAlpha(kit.bg, 0.72) }]}
    >
      <ActivityIndicator size={36} color={kit.primary} />
      <Text style={[font('500', 14), { color: kit.textSecondary }]}>{message}</Text>
    </View>
  );
}

/** Barre de progression indéterminée (`LinearProgressIndicator()` Flutter) : un segment glisse en boucle. */
export function IndeterminateBar({
  height = 4,
  accessibilityLabel = 'Chargement',
}: {
  height?: number;
  accessibilityLabel?: string;
}) {
  const { kit, roles } = useKitTheme();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const [p] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced || !w) return;
    const loop = Animated.loop(
      Animated.timing(p, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [p, reduced, w]);
  const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [-w * 0.4, w] });
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[styles.track, { height, backgroundColor: roles.secondaryContainer }]}
    >
      <Animated.View
        style={[
          styles.segment,
          { width: reduced ? '40%' : w * 0.4, backgroundColor: kit.primary, transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

/** Infobulle (`Tooltip` Flutter) : appui long (ou toucher), bulle inverse-surface, masquée après 1,5 s. */
export function KitTooltip({
  message,
  children,
  trigger = 'longPress',
}: {
  message: ReactNode;
  children: ReactNode;
  trigger?: 'longPress' | 'tap';
}) {
  const { roles } = useKitTheme();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const show = () => {
    setOpen(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 1500);
  };
  const label = typeof message === 'string' ? message : undefined;
  return (
    <View style={styles.tipHost}>
      {open ? (
        <View pointerEvents="none" style={[styles.tip, { backgroundColor: roles.inverseSurface }]}>
          {typeof message === 'string' ? (
            <Text style={[font('400', 12), { color: roles.inverseOnSurface }]}>{message}</Text>
          ) : (
            message
          )}
        </View>
      ) : null}
      <TouchableRipple
        borderless
        onPress={trigger === 'tap' ? show : undefined}
        onLongPress={show}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={trigger === 'tap' ? 'Touchez pour afficher l’aide' : 'Appui long pour afficher l’aide'}
        style={styles.tipTarget}
      >
        <View>{children}</View>
      </TouchableRipple>
    </View>
  );
}

type UploadStatus = 'queued' | 'uploading' | 'done' | 'error' | 'paused';

interface UploadItem {
  id: number;
  file: DemoFile;
  fail: boolean;
  progress: number;
  status: UploadStatus;
}

/**
 * File d'envoi multiple (`<app-upload-queue>`, `UploadQueue` Flutter) : progression simulée,
 * deux envois simultanés, pause / reprise, échec (le fichier « photo ») et nouvelle tentative. Aucun réseau.
 */
export function UploadQueue({ concurrency = 2 }: { concurrency?: number }) {
  const { kit } = useKitTheme();
  const [items, setItems] = useState<UploadItem[]>([]);
  const nextId = useRef(0);
  const running = items.some((i) => i.status === 'queued' || i.status === 'uploading');
  const tick = useRef(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      tick.current++;
      setItems((list) => {
        let slots = concurrency - list.filter((i) => i.status === 'uploading').length;
        const next = list.map((i) => {
          if (slots > 0 && i.status === 'queued') {
            slots--;
            return { ...i, status: 'uploading' as UploadStatus };
          }
          return i;
        });
        const stepped = next.map((i) => {
          if (i.status !== 'uploading') return i;
          const speed = (0.6e6 / Math.max(i.file.bytes, 80000)) * 0.12;
          const progress = Math.min(1, i.progress + speed + (tick.current % 3) * 0.004);
          const status: UploadStatus = i.fail && progress > 0.62 ? 'error' : progress >= 1 ? 'done' : 'uploading';
          return { ...i, progress, status };
        });
        return stepped;
      });
    }, 120);
    return () => clearInterval(timer);
  }, [running, concurrency]);

  const add = () => {
    setItems((l) => [
      ...l,
      ...DEMO_FILES.map((f) => ({
        id: nextId.current++,
        file: f,
        fail: f.name.includes('photo'),
        progress: 0,
        status: 'queued' as UploadStatus,
      })),
    ]);
  };
  const update = (id: number, patch: Partial<UploadItem>) =>
    setItems((l) => l.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const total = items.length ? items.reduce((a, i) => a + i.progress, 0) / items.length : 0;
  const done = items.filter((i) => i.status === 'done').length;
  const errors = items.filter((i) => i.status === 'error').length;

  return (
    <View>
      <View style={styles.queueActions}>
        <KitButton label="Envoyer 5 fichiers" icon="mi:upload-file" expand style={styles.fill} onPress={add} />
        <KitButton label="Vider" variant="outline" onPress={items.length ? () => setItems([]) : undefined} />
      </View>
      {items.length ? (
        <View style={styles.queue}>
          <View style={styles.row}>
            <Text
              accessibilityLiveRegion="polite"
              style={[font('600', 12.5), styles.fill, { color: kit.textSecondary }]}
            >
              {`${done} / ${items.length} envoyé(s)${errors ? ` · ${errors} échec(s)` : ''}`}
            </Text>
            <Text style={[font('700', 12.5), { color: kit.primary }]}>{`${Math.round(total * 100)} %`}</Text>
          </View>
          <KitProgressBar value={total} accessibilityLabel="Progression totale" />
          {items.map((i) => {
            const err = i.status === 'error';
            const status =
              i.status === 'queued'
                ? `En attente · ${fileSize(i.file.bytes)}`
                : i.status === 'uploading'
                  ? `${Math.round(i.progress * 100)} % · ${fileSize(i.file.bytes)}`
                  : i.status === 'paused'
                    ? `En pause · ${Math.round(i.progress * 100)} %`
                    : i.status === 'done'
                      ? `Envoyé · ${fileSize(i.file.bytes)}`
                      : 'Échec : délai dépassé';
            return (
              <View
                key={i.id}
                style={[
                  styles.item,
                  { backgroundColor: kit.card, borderColor: err ? withAlpha(kit.error, 0.5) : kit.border },
                ]}
              >
                <Icon source={i.file.icon} size={24} color={err ? kit.error : kit.primary} />
                <View style={[styles.fill, styles.itemBody]}>
                  <Text numberOfLines={1} style={[font('600', 13), { color: kit.textPrimary }]}>
                    {i.file.name}
                  </Text>
                  {i.status === 'uploading' || i.status === 'paused' ? (
                    <KitProgressBar
                      value={i.progress}
                      height={4}
                      tone={i.status === 'paused' ? 'warning' : 'primary'}
                    />
                  ) : null}
                  <Text
                    style={[
                      font('400', 11.5),
                      { color: err ? kit.errorText : i.status === 'done' ? kit.successText : kit.textMuted },
                    ]}
                  >
                    {status}
                  </Text>
                </View>
                {i.status === 'done' ? (
                  <View style={styles.doneIcon}>
                    <Icon source="mi:check-circle" size={24} color={kit.success} />
                  </View>
                ) : i.status === 'error' ? (
                  <KitIconButton
                    icon="mi:refresh"
                    iconColor={kit.error}
                    accessibilityLabel={`Réessayer ${i.file.name}`}
                    onPress={() => update(i.id, { fail: false, progress: 0, status: 'queued' })}
                  />
                ) : i.status === 'uploading' ? (
                  <KitIconButton
                    icon="mi:pause"
                    accessibilityLabel="Pause"
                    onPress={() => update(i.id, { status: 'paused' })}
                  />
                ) : i.status === 'paused' ? (
                  <KitIconButton
                    icon="mi:play-arrow"
                    accessibilityLabel="Reprendre"
                    onPress={() => update(i.id, { status: 'queued' })}
                  />
                ) : (
                  <KitIconButton
                    icon="mi:close"
                    accessibilityLabel={`Retirer ${i.file.name}`}
                    onPress={() => setItems((l) => l.filter((x) => x.id !== i.id))}
                  />
                )}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  alert: { flexDirection: 'row', gap: 10, borderRadius: radius.md, borderLeftWidth: 4 },
  alertTitle: { ...font('700', 14), marginBottom: 2 },
  alertText: { ...font('400', 13), lineHeight: 18.85 },
  alertAction: { ...font('700', 13), marginTop: 6, textDecorationLine: 'underline', alignSelf: 'flex-start' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    paddingLeft: space.s4,
    paddingRight: space.s1,
    paddingVertical: space.s1,
    minHeight: 48,
  },
  bannerText: { ...font('400', 12.5), lineHeight: 17.5, flex: 1 },
  bannerAction: { paddingHorizontal: space.s3, minHeight: 40, justifyContent: 'center', borderRadius: 20 },
  result: { alignItems: 'center', paddingVertical: space.s6, paddingHorizontal: space.s3 },
  resultDisc: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { ...font('700', 22, 'heading'), textAlign: 'center', marginTop: 18 },
  resultSubtitle: { ...font('400', 14), lineHeight: 21, textAlign: 'center', marginTop: 6 },
  resultExtra: { marginTop: space.s4, alignSelf: 'stretch' },
  resultActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: space.s5 },
  overlay: { alignItems: 'center', justifyContent: 'center', gap: 12, flex: 1 },
  track: { borderRadius: 999, overflow: 'hidden' },
  segment: { height: '100%', borderRadius: 999 },
  tipHost: { alignItems: 'center' },
  tip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 6,
    borderRadius: radius.sm,
    paddingHorizontal: space.s2,
    paddingVertical: 6,
    zIndex: 10,
    minWidth: 120,
  },
  tipTarget: { borderRadius: 999, padding: space.s1 },
  queueActions: { flexDirection: 'row', gap: space.s2 },
  queue: { marginTop: 14, gap: space.s2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingLeft: space.s3,
    paddingRight: space.s1,
    paddingVertical: space.s2,
  },
  itemBody: { gap: 4 },
  doneIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
