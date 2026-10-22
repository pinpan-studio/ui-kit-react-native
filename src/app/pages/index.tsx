import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { KitCard, ResponsiveGrid } from '../../components';
import { PAGE_EXAMPLES } from '../../showcase/pageExamples';
import { font, kitText, space, useKitTheme } from '../../theme';

const GROUPS = ['Applications', 'Authentification', 'Formulaires'] as const;

/** `/pages` — index des pages d'exemple (`ExamplesIndex` Flutter), par groupe. */
export default function PagesGallery() {
  const { kit } = useKitTheme();
  return (
    <ScrollView contentContainerStyle={styles.body} testID="pages-gallery">
      {GROUPS.map((group) => (
        <View key={group}>
          <Text accessibilityRole="header" style={[kitText.overline, styles.group, { color: kit.textMuted }]}>
            {group.toUpperCase()}
          </Text>
          <ResponsiveGrid minItemWidth={260} spacing={space.s3}>
            {PAGE_EXAMPLES.filter((p) => p.group === group).map((p) => (
              <KitCard
                key={p.slug}
                onPress={() => router.push(`/pages/${p.slug}` as never)}
                accessibilityLabel={`${p.title}. ${p.description}`}
              >
                <View style={styles.row}>
                  <Icon source={p.icon} size={24} color={kit.primary} />
                  <View style={styles.fill}>
                    <Text style={[font('600', 14), { color: kit.textPrimary }]}>{p.title}</Text>
                    <Text style={[font('400', 12), { color: kit.textMuted }]}>{p.description}</Text>
                  </View>
                  <Icon source="mi:chevron-right" size={24} color={kit.textMuted} />
                </View>
              </KitCard>
            ))}
          </ResponsiveGrid>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { padding: space.s4 },
  group: { letterSpacing: 1, marginLeft: space.s1, marginTop: space.s4, marginBottom: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
});
