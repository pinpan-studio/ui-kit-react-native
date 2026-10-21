import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { font, space, useKitTheme, useKitText, withAlpha } from '../../theme';
import { KitButton } from './Button';

/** `<app-empty-state>` : icône dans un disque, titre, sous-titre, action (`EmptyState` Flutter). */
export function EmptyState({
  icon = 'inbox-outline',
  title = 'Aucun résultat',
  subtitle = 'Il n’y a rien à afficher pour le moment.',
  actionLabel,
  actionIcon = 'plus',
  onAction,
  compact = false,
}: {
  icon?: string;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  const { kit } = useKitTheme();
  const t = useKitText();
  const d = compact ? 56 : 80;
  return (
    <View style={[styles.state, { paddingVertical: compact ? space.l : space.s12 }]}>
      <View style={[styles.disc, { width: d, height: d, borderRadius: d / 2, backgroundColor: kit.fieldBg }]}>
        <Icon source={icon} size={d * 0.45} color={withAlpha(kit.textSecondary, 0.5)} />
      </View>
      <Text accessibilityRole="header" style={[t.h4, styles.title, { marginTop: 20 }]}>
        {title}
      </Text>
      <Text style={[t.body, styles.subtitle, { color: kit.textSecondary }]}>{subtitle}</Text>
      {actionLabel ? (
        <KitButton label={actionLabel} icon={actionIcon} onPress={onAction ?? noop} style={styles.action} />
      ) : null}
    </View>
  );
}

/** État d'erreur (`ErrorState` Flutter) : icône rouge, message, code optionnel, réessayer. */
export function ErrorState({
  title = 'Une erreur est survenue',
  subtitle = 'Impossible de charger les données. Vérifiez votre connexion puis réessayez.',
  code,
  onRetry,
}: {
  title?: string;
  subtitle?: string;
  code?: string;
  onRetry?: () => void;
}) {
  const { kit } = useKitTheme();
  const t = useKitText();
  return (
    <View style={[styles.state, { paddingVertical: space.s10 }]} accessibilityLiveRegion="polite">
      <View style={[styles.disc, styles.errorDisc, { backgroundColor: kit.errorLight }]}>
        <Icon source="alert-circle-outline" size={34} color={kit.error} />
      </View>
      <Text accessibilityRole="header" style={[t.h4, styles.title, { marginTop: space.s4 }]}>
        {title}
      </Text>
      <Text style={[t.bodySm, styles.center, { marginTop: 6 }]}>{subtitle}</Text>
      {code ? <Text style={[t.mono, styles.code, { color: kit.textMuted }]}>{code}</Text> : null}
      {onRetry ? (
        <KitButton label="Réessayer" icon="refresh" variant="secondary" onPress={onRetry} style={styles.action} />
      ) : null}
    </View>
  );
}

const noop = () => undefined;

const styles = StyleSheet.create({
  state: { alignItems: 'center', paddingHorizontal: space.xl },
  disc: { alignItems: 'center', justifyContent: 'center' },
  errorDisc: { width: 72, height: 72, borderRadius: 36 },
  title: { ...font('700', 18, 'heading'), textAlign: 'center' },
  subtitle: { textAlign: 'center', maxWidth: 300, marginTop: space.s2 },
  center: { textAlign: 'center' },
  code: { fontSize: 11, marginTop: space.s2 },
  action: { alignSelf: 'center', marginTop: space.s4 },
});
