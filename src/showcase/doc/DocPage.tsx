import { Children, useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { KeyboardSafe } from '../../mobile';
import { breakpoints, columns, font, kitText, space, useKitTheme } from '../../theme';

/** Section documentée : ancre, titre, description, source, démos (`DocSection` Flutter, `<kit-section>`). */
export interface DocSection {
  id: string;
  title: string;
  description?: string;
  source?: string;
  /** Colonnes sur tablette (1 colonne sur téléphone). */
  cols?: number;
  tocLabel?: string;
  children: ReactNode;
}

const TOP_PADDING = space.l;
/** Une section devient active quand son titre passe sous cette distance du haut de la zone défilante. */
const ACTIVE_OFFSET = 48;

/**
 * Page de documentation du catalogue (`DocPage` Flutter, `<kit-doc-page>`) : hero (icône, sur-titre, titre,
 * sous-titre), sommaire en puces collant qui suit la section visible, sections. La barre d'application
 * (titre, mode, palette) est celle du shell.
 */
export function DocPage({
  title,
  subtitle,
  icon = 'mi:widgets',
  eyebrow = 'Composants',
  sections,
  header,
  initialSection,
  testID,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  eyebrow?: string;
  sections: DocSection[];
  /** Contenu libre entre le hero et la première section. */
  header?: ReactNode;
  initialSection?: string;
  testID?: string;
}) {
  const { kit } = useKitTheme();
  const { width: screen } = useWindowDimensions();
  const pad = screen < breakpoints.tablet ? space.m : space.l;
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const toc = useRef<ComponentRef<typeof ScrollView>>(null);
  const offsets = useRef<Record<string, number>>({});
  const chips = useRef<Record<string, { x: number; width: number }>>({});
  const tocWidth = useRef(0);
  const pendingInitial = useRef(initialSection);
  const [active, setActive] = useState(sections[0]?.id);
  const [contentWidth, setContentWidth] = useState(0);

  // Le sommaire garde la puce active visible.
  useEffect(() => {
    const chip = active ? chips.current[active] : undefined;
    if (chip) toc.current?.scrollTo({ x: Math.max(0, chip.x - (tocWidth.current - chip.width) / 2), animated: true });
  }, [active]);

  const goTo = (id: string, animated = true) => {
    const y = offsets.current[id];
    if (y === undefined) return;
    setActive(id);
    scroll.current?.scrollTo({ y: TOP_PADDING + y, animated });
  };

  const onSectionLayout = (id: string) => (e: LayoutChangeEvent) => {
    offsets.current[id] = e.nativeEvent.layout.y;
    if (pendingInitial.current === id) {
      pendingInitial.current = undefined;
      requestAnimationFrame(() => goTo(id, false));
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    let current = sections[0]?.id;
    for (const s of sections) {
      const top = offsets.current[s.id];
      if (top !== undefined && TOP_PADDING + top - y < ACTIVE_OFFSET) current = s.id;
    }
    if (current !== active) setActive(current);
  };

  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]} testID={testID}>
      {sections.length >= 2 ? (
        <ScrollView
          ref={toc}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={(e) => (tocWidth.current = e.nativeEvent.layout.width)}
          style={[styles.toc, { backgroundColor: kit.bg }]}
          contentContainerStyle={[styles.tocContent, { paddingHorizontal: pad }]}
          accessibilityRole="tablist"
          accessibilityLabel="Sommaire"
        >
          {sections.map((s) => {
            const on = s.id === active;
            return (
              <TouchableRipple
                key={s.id}
                onPress={() => goTo(s.id)}
                onLayout={(e) => (chips.current[s.id] = e.nativeEvent.layout)}
                borderless
                hitSlop={{ top: 8, bottom: 8 }}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={[styles.chip, { backgroundColor: on ? kit.primaryLight : kit.fieldBg }]}
              >
                <Text style={[styles.chipLabel, { color: on ? kit.primary : kit.textSecondary }]}>
                  {s.tocLabel ?? s.title}
                </Text>
              </TouchableRipple>
            );
          })}
        </ScrollView>
      ) : null}
      <KeyboardSafe
        ref={scroll}
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingHorizontal: pad, paddingTop: TOP_PADDING, paddingBottom: space.s12 }}
      >
        <View style={styles.page} onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}>
          <Hero icon={icon} eyebrow={eyebrow} title={title} subtitle={subtitle} />
          {header ? <View style={styles.header}>{header}</View> : null}
          {sections.map((s) => (
            <View key={s.id} onLayout={onSectionLayout(s.id)} testID={`section-${s.id}`}>
              <SectionView section={s} width={contentWidth} />
            </View>
          ))}
        </View>
      </KeyboardSafe>
    </View>
  );
}

function Hero({ icon, eyebrow, title, subtitle }: { icon: string; eyebrow: string; title: string; subtitle?: string }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.hero}>
      <View style={[styles.heroDisc, { backgroundColor: kit.primaryLight }]}>
        <Icon source={icon} size={28} color={kit.primary} />
      </View>
      <View style={styles.fill}>
        <Text style={[styles.eyebrow, { color: kit.textMuted }]}>{eyebrow.toUpperCase()}</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: kit.textPrimary }]}>
          {title}
        </Text>
        {subtitle ? <Text style={[styles.subtitle, { color: kit.textSecondary }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function SectionView({ section: s, width }: { section: DocSection; width: number }) {
  const { kit } = useKitTheme();
  const items = Children.toArray(s.children);
  const cols = Math.min(s.cols ?? 1, columns(width, s.cols ?? 1));
  const itemWidth = cols > 1 ? (width - space.m * (cols - 1)) / cols : undefined;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text accessibilityRole="header" style={[kitText.h3, { color: kit.textPrimary }]}>
          {s.title}
        </Text>
        {s.source ? (
          <View style={[styles.source, { backgroundColor: kit.hover }]}>
            <Text style={[styles.sourceText, { color: kit.textMuted }]}>{s.source}</Text>
          </View>
        ) : null}
      </View>
      {s.description ? <Text style={[styles.description, { color: kit.textSecondary }]}>{s.description}</Text> : null}
      <View style={[styles.items, cols > 1 && styles.grid]}>
        {items.map((child, i) => (
          <View key={i} style={itemWidth ? { width: itemWidth } : undefined}>
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  toc: { flexGrow: 0, height: 48 },
  tocContent: { alignItems: 'center', gap: space.s2 },
  chip: { borderRadius: 999, paddingHorizontal: space.s3, paddingVertical: space.s2 },
  chipLabel: font('600', 12),
  page: { width: '100%', maxWidth: 1280, alignSelf: 'center' },
  header: { marginBottom: space.l },
  hero: { flexDirection: 'row', alignItems: 'flex-start', gap: space.m, marginBottom: space.l },
  heroDisc: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { ...font('700', 11), letterSpacing: 1.1, marginBottom: 2 },
  title: { ...font('700', 26, 'heading'), lineHeight: 32.5, letterSpacing: -0.24 },
  subtitle: { ...font('400', 14), lineHeight: 21, marginTop: space.s1 },
  section: { paddingBottom: space.xl },
  sectionHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 10, rowGap: space.s1 },
  source: { borderRadius: 8, paddingHorizontal: space.s2, paddingVertical: space.s0_5 },
  sourceText: font('400', 10.5, 'mono'),
  description: { ...font('400', 13), lineHeight: 19.5, marginTop: space.s },
  items: { gap: space.m, marginTop: space.m },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
