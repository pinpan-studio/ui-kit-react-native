import { useState, type ReactNode } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { useKitSnack } from '../../core/snack';
import { font, radius, space, useKitTheme, withAlpha } from '../../theme';

/** Petit bouton icône des en-têtes de démo et de code (32 dp visibles, cible de 48 dp). */
function HeaderIcon({
  icon,
  color,
  label,
  onPress,
}: {
  icon: string;
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.headerIcon}
    >
      <Icon source={icon} size={18} color={color} />
    </TouchableRipple>
  );
}

/** Cadre de démonstration d'une variante, avec extrait de code copiable (`Demo` Flutter, `<kit-demo>`). */
export function Demo({
  label,
  hint,
  code,
  flush = false,
  muted = false,
  padding,
  children,
}: {
  label: string;
  hint?: string;
  code?: string;
  /** Sans marge interne (cartes, tableaux pleine largeur). */
  flush?: boolean;
  /** Fond atténué (scène « page »). */
  muted?: boolean;
  padding?: number;
  children: ReactNode;
}) {
  const { kit } = useKitTheme();
  const [showCode, setShowCode] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
    setShowCode((v) => !v);
  };
  return (
    <View style={[styles.demo, { backgroundColor: kit.card }]}>
      <View style={[styles.bar, { backgroundColor: withAlpha(kit.hover, 0.5) }]}>
        <Text style={[styles.label, hint ? styles.shrink : styles.fill, { color: kit.textPrimary }]}>{label}</Text>
        {hint ? (
          <Text numberOfLines={1} style={[styles.hint, styles.fill, { color: kit.textMuted }]}>
            {hint}
          </Text>
        ) : null}
        {code ? (
          <HeaderIcon
            icon={showCode ? 'mi:code-off' : 'mi:code'}
            color={showCode ? kit.primary : kit.textMuted}
            label={showCode ? 'Masquer le code' : 'Voir le code'}
            onPress={toggle}
          />
        ) : (
          <View style={styles.headerIcon} />
        )}
      </View>
      <View style={[muted && { backgroundColor: kit.bg }, { padding: flush ? 0 : (padding ?? space.m) }]}>
        {children}
      </View>
      {code && showCode ? <CodeBlock code={code.trim()} /> : null}
    </View>
  );
}

/** Bloc de code monospace, défilant horizontalement, avec bouton copier (`CodeBlock` Flutter). */
export function CodeBlock({ code, file, rounded = false }: { code: string; file?: string; rounded?: boolean }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  return (
    <View style={[{ backgroundColor: kit.codeBg }, rounded && styles.rounded]}>
      <View style={styles.codeBar}>
        <Text style={[styles.file, { color: kit.codeMuted }]}>{file ?? ''}</Text>
        <HeaderIcon
          icon="mi:content-copy"
          color={kit.codeMuted}
          label="Copier"
          onPress={() => snack.copy(code, 'Extrait copié dans le presse-papiers')}
        />
      </View>
      <ScrollView horizontal contentContainerStyle={styles.codeScroll}>
        <Text selectable style={[styles.code, { color: kit.codeFg }]}>
          {code}
        </Text>
      </ScrollView>
    </View>
  );
}

/** Petite légende sous une démo. */
export function DemoNote({ text, icon = 'information-outline' }: { text: string; icon?: string }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.note}>
      <Icon source={icon} size={16} color={kit.textMuted} />
      <Text style={[styles.noteText, { color: kit.textMuted }]}>{text}</Text>
    </View>
  );
}

/** Rangée qui passe à la ligne (boutons, badges…). */
export function DemoWrap({
  children,
  spacing = 10,
  style,
}: {
  children: ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.wrap, { gap: spacing }, style]}>{children}</View>;
}

/** Colonne espacée. */
export function Gap({ children, gap = 12 }: { children: ReactNode; gap?: number }) {
  return <View style={{ gap }}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  shrink: { flexShrink: 1 },
  demo: { borderRadius: radius.card, overflow: 'hidden' },
  bar: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingLeft: space.s4,
    paddingRight: space.s1,
    paddingVertical: space.s1,
  },
  label: font('700', 12),
  hint: font('400', 11),
  headerIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rounded: { borderRadius: radius.md, overflow: 'hidden' },
  codeBar: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: space.s1, minHeight: 40 },
  file: { ...font('400', 11, 'mono'), flex: 1 },
  codeScroll: { paddingHorizontal: space.s4, paddingBottom: space.s4 },
  code: { ...font('400', 11.5, 'mono'), lineHeight: 17.8 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  noteText: { ...font('400', 12), lineHeight: 17.4, flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
