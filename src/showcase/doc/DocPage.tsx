import { useRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { Chip, Text } from 'react-native-paper';

import { KeyboardSafe } from '../../mobile';
import { MIN_TOUCH, radius, space } from '../../theme/tokens';
import { useKitTheme } from '../../theme/useKitTheme';
import { createSectionScroller } from './sectionScroller';

export interface DocSectionDef {
  id: string;
  title: string;
  description?: string;
  source?: string;
  children?: ReactNode;
}

interface Props {
  title: string;
  subtitle?: string;
  initialSection?: string;
  sections: readonly DocSectionDef[];
  testID?: string;
  /** Injection pour les tests. */
  onScrollTo?: (y: number) => void;
}

/** Page de documentation (DocPage Flutter) : en-tête, puces de sections, sections ancrées. */
export function DocPage({ title, subtitle, initialSection, sections, testID, onScrollTo }: Props) {
  const theme = useKitTheme();
  const ref = useRef<ScrollViewInstance>(null);
  const scroller = useRef<ReturnType<typeof createSectionScroller> | null>(null);
  const scrollTo = (y: number, animated: boolean) => {
    if (onScrollTo) onScrollTo(y);
    else ref.current?.scrollTo({ y, animated });
  };
  // Créé au premier onLayout (gestionnaire d'évènement), jamais pendant le rendu.
  const getScroller = () => {
    scroller.current ??= createSectionScroller(initialSection, (y) => scrollTo(y, false));
    return scroller.current;
  };
  const goTo = (id: string) => {
    const y = scroller.current?.positions.get(id);
    if (y !== undefined) scrollTo(Math.max(0, y - 8), true);
  };
  return (
    <KeyboardSafe scrollRef={ref} testID={testID} contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <Text variant="headlineSmall" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {sections.map((s) => (
          <Chip
            key={s.id}
            compact
            selected={s.id === initialSection}
            style={styles.chip}
            onPress={() => goTo(s.id)}
            accessibilityLabel={`Aller à la section ${s.title}`}
          >
            {s.title}
          </Chip>
        ))}
      </ScrollView>
      {sections.map((s) => (
        <View
          key={s.id}
          testID={`doc-section-${s.id}`}
          onLayout={(e) => getScroller().onLayout(s.id, e.nativeEvent.layout.y)}
          style={[styles.section, { borderColor: theme.colors.outlineVariant }]}
        >
          <Text variant="titleMedium" accessibilityRole="header">
            {s.title}
          </Text>
          {s.source ? (
            <Text variant="labelSmall" style={[styles.source, { color: theme.colors.onSurfaceVariant }]}>
              {s.source}
            </Text>
          ) : null}
          {s.description ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {s.description}
            </Text>
          ) : null}
          {s.children}
        </View>
      ))}
    </KeyboardSafe>
  );
}

/** Démo d'une section (`Demo` Flutter). */
export function Demo({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const theme = useKitTheme();
  return (
    <View style={[styles.demo, { backgroundColor: theme.roles.surfaceContainerLow }]}>
      <Text variant="labelLarge">
        {label}
        {hint ? <Text style={{ color: theme.colors.onSurfaceVariant }}>{` · ${hint}`}</Text> : null}
      </Text>
      {children}
    </View>
  );
}

/** Rangée qui revient à la ligne (`DemoWrap`). */
export function DemoWrap({ children, gap = space.s2 }: { children: ReactNode; gap?: number }) {
  return <View style={[styles.wrap, { gap }]}>{children}</View>;
}

const styles = StyleSheet.create({
  content: { padding: space.s4, gap: space.s4, paddingBottom: space.s8 },
  head: { gap: space.s1 },
  chips: { gap: space.s2 },
  chip: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  section: { gap: space.s3, paddingTop: space.s4, borderTopWidth: StyleSheet.hairlineWidth },
  source: { fontFamily: 'SpaceMono_400Regular' },
  demo: { gap: space.s3, padding: space.s4, borderRadius: radius.lg },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
