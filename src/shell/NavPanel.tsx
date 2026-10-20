import { router, usePathname } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Drawer, Text } from 'react-native-paper';

import { KIT_CATEGORIES } from '../showcase/kitNav';
import { MIN_TOUCH, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';
import { activeIndex, DESTINATIONS } from './destinations';

/** Contenu du panneau latéral (permanent > 840 dp, ou tiroir modal) : destinations + catégories. */
export function NavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const theme = useKitTheme();
  const current = activeIndex(pathname);
  const go = (href: string) => {
    router.navigate(href as never);
    onNavigate?.();
  };
  return (
    <ScrollView contentContainerStyle={styles.content} accessibilityRole="menu">
      <View style={styles.brand}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]} accessible={false} />
        <View>
          <Text variant="titleMedium">UI Kit</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            React Native · mobile
          </Text>
        </View>
      </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: space.s2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: space.s4 },
  logo: { width: 32, height: 32, borderRadius: 10 },
  item: { minHeight: MIN_TOUCH },
});
