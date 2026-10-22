import { router } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { KitCard, ResponsiveGrid } from '../../components';
import { useScrollToTopOnReselect } from '../../shell/tabReselect';
import { KIT_CATEGORIES } from '../../showcase/kitNav';
import { font, kitText, radius, space, useKitTheme } from '../../theme';

const TOTAL = KIT_CATEGORIES.reduce((n, c) => n + c.sections.length, 0);

/** `/components` — index des galeries (`ComponentsIndexPage` Flutter) : une carte par catégorie. */
export default function ComponentsIndex() {
  const { kit } = useKitTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  useScrollToTopOnReselect(scroll);
  return (
    <ScrollView ref={scroll} contentContainerStyle={styles.body} testID="components-index">
      <Text style={[kitText.bodySm, styles.intro, { color: kit.textSecondary }]}>
        {`${KIT_CATEGORIES.length} galeries · ${TOTAL} sections documentées`}
      </Text>
      <ResponsiveGrid minItemWidth={300}>
        {KIT_CATEGORIES.map((c) => (
          <KitCard
            key={c.id}
            onPress={() => router.navigate(`/components/${c.id}`)}
            accessibilityLabel={`${c.label}, ${c.sections.length} sections`}
          >
            <View style={styles.row}>
              <View style={[styles.icon, { backgroundColor: kit.primaryLight }]}>
                <Icon source={c.icon} size={24} color={kit.primary} />
              </View>
              <View style={styles.fill}>
                <View style={styles.head}>
                  <Text style={[kitText.cardTitle, styles.fill, { color: kit.textPrimary }]}>{c.label}</Text>
                  <Text style={[font('700', 12), { color: kit.textMuted }]}>{c.sections.length}</Text>
                  <Icon source="mi:chevron-right" size={18} color={kit.textMuted} />
                </View>
                <Text numberOfLines={3} style={[kitText.bodySm, styles.desc, { color: kit.textSecondary }]}>
                  {c.description}
                </Text>
              </View>
            </View>
          </KitCard>
        ))}
      </ResponsiveGrid>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: space.m, paddingTop: space.s, paddingBottom: space.xl },
  intro: { marginBottom: space.m },
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  head: { flexDirection: 'row', alignItems: 'center' },
  desc: { fontSize: 12.5, marginTop: 4 },
});
