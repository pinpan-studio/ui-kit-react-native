import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Drawer, List, Searchbar, Text } from 'react-native-paper';

import { KIT_CATEGORIES } from '../showcase/kitNav';
import { searchCatalog } from '../showcase/search';
import { MIN_TOUCH, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';
import { activeIndex } from './destinations';
import { DRAWER_ENTRIES, EXTRA_PATHS } from './drawerEntries';

/** Contenu du panneau latéral (permanent > 840 dp, ou tiroir modal) : destinations + catégories. */
export function NavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const theme = useKitTheme();
  const current = activeIndex(pathname);
  const [query, setQuery] = useState('');
  const hits = searchCatalog(query);
  const searching = query.trim().length > 0;
  const [expanded, setExpanded] = useState<string | null>(null);
  const extraActive = EXTRA_PATHS.includes(pathname);
  const go = (href: string) => {
    router.navigate(href as never);
    onNavigate?.();
  };
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.brand}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]} accessible={false} />
        <View>
          <Text variant="titleMedium">UI Kit</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            React Native · mobile
          </Text>
        </View>
      </View>
      <Searchbar
        placeholder="Rechercher un composant…"
        accessibilityLabel="Rechercher un composant"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        inputStyle={styles.searchInput}
        testID="drawer-search"
      />
      {searching ? (
        <View testID="drawer-results">
          {hits.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}
              accessibilityLiveRegion="polite"
            >
              Aucun résultat pour « {query.trim()} »
            </Text>
          ) : (
            hits.map((h) =>
              h.kind === 'category' ? (
                <Drawer.Item
                  key={`c-${h.category.id}`}
                  label={h.category.label}
                  icon={h.category.icon}
                  onPress={() => go(`/components/${h.category.id}`)}
                  style={styles.item}
                  accessibilityLabel={`Catégorie ${h.category.label}`}
                />
              ) : (
                <Drawer.Item
                  key={`s-${h.category.id}-${h.section.id}`}
                  label={`${h.section.label} · ${h.category.label}`}
                  icon="subdirectory-arrow-right"
                  onPress={() => go(`/components/${h.category.id}?section=${h.section.id}`)}
                  style={[styles.item, styles.indent]}
                  accessibilityLabel={`${h.section.label}, dans ${h.category.label}`}
                />
              ),
            )
          )}
        </View>
      ) : (
        <>
          <Drawer.Section showDivider>
            {DRAWER_ENTRIES.map((e) => {
              const active = e.destIndex !== undefined ? e.destIndex === current && !extraActive : pathname === e.href;
              return (
                <Drawer.Item
                  key={e.href}
                  label={e.label}
                  icon={e.icon}
                  active={active}
                  onPress={() => go(e.href)}
                  style={styles.item}
                  accessibilityLabel={e.label}
                  testID={`drawer-${e.key}`}
                />
              );
            })}
          </Drawer.Section>
          <Text variant="labelSmall" style={[styles.overline, { color: theme.colors.onSurfaceVariant }]}>
            COMPOSANTS
          </Text>
          {KIT_CATEGORIES.map((c) => (
            <List.Accordion
              key={c.id}
              title={c.label}
              left={(p) => <List.Icon {...p} icon={c.icon} />}
              expanded={expanded === c.id}
              onPress={() => setExpanded((x) => (x === c.id ? null : c.id))}
              style={styles.item}
              accessibilityLabel={`${c.label}, ${c.sections.length} sections`}
              testID={`drawer-cat-${c.id}`}
            >
              {c.sections.map((s) => (
                <List.Item
                  key={s.id}
                  title={s.label}
                  onPress={() => go(`/components/${c.id}?section=${s.id}`)}
                  style={[styles.item, styles.sub]}
                  accessibilityLabel={`${s.label}, dans ${c.label}`}
                />
              ))}
            </List.Accordion>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: space.s2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: space.s4 },
  logo: { width: 32, height: 32, borderRadius: 10 },
  item: { minHeight: MIN_TOUCH },
  indent: { marginLeft: space.s6 },
  search: { marginHorizontal: space.s3, marginBottom: space.s2, minHeight: MIN_TOUCH },
  searchInput: { minHeight: MIN_TOUCH },
  overline: { paddingHorizontal: space.s4, paddingTop: space.s4, paddingBottom: space.s2, letterSpacing: 1 },
  sub: { paddingLeft: space.s8 },
  empty: { padding: space.s6, textAlign: 'center' },
});
