import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Drawer, Searchbar, Text } from 'react-native-paper';

import { KIT_CATEGORIES } from '../showcase/kitNav';
import { searchCatalog } from '../showcase/search';
import { MIN_TOUCH, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';
import { activeIndex, DESTINATIONS } from './destinations';

/** Contenu du panneau latéral (permanent > 840 dp, ou tiroir modal) : destinations + catégories. */
export function NavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const theme = useKitTheme();
  const current = activeIndex(pathname);
  const [query, setQuery] = useState('');
  const hits = searchCatalog(query);
  const searching = query.trim().length > 0;
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
            {DESTINATIONS.map((d, i) => (
              <Drawer.Item
                key={d.key}
                label={d.label}
                icon={i === current ? d.activeIcon : d.icon}
                active={i === current}
                onPress={() => go(d.href)}
                style={styles.item}
                accessibilityLabel={d.label}
              />
            ))}
          </Drawer.Section>
          <Drawer.Section title="Composants" showDivider={false}>
            {KIT_CATEGORIES.map((c) => (
              <Drawer.Item
                key={c.id}
                label={c.label}
                icon={c.icon}
                active={pathname === `/components/${c.id}`}
                onPress={() => go(`/components/${c.id}`)}
                style={styles.item}
                accessibilityLabel={c.label}
              />
            ))}
          </Drawer.Section>
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
  empty: { padding: space.s6, textAlign: 'center' },
});
