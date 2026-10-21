import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { KitCard, ResponsiveGrid, StatusBadge } from '../../components';
import { SHOWCASES, SHOWCASE_GROUPS } from '../../showcase/examples/showcases';
import { font, kitText, space, useKitTheme } from '../../theme';

/** `/showcases` — écrans complets regroupés par usage (`ShowcasesGallery` Flutter). */
export default function ShowcasesGallery() {
  const { kit } = useKitTheme();
  return (
    <ScrollView contentContainerStyle={styles.body} testID="showcases">
      <Text style={[font('400', 14), { color: kit.textMuted }]}>
        {`${SHOWCASES.length} écrans complets, à prévisualiser en plein écran.`}
      </Text>
      {SHOWCASE_GROUPS.map(([id, label, , desc]) => (
        <View key={id}>
          <Text accessibilityRole="header" style={[kitText.overline, styles.group, { color: kit.textMuted }]}>
            {label.toUpperCase()}
          </Text>
          <Text style={[font('400', 13), styles.desc, { color: kit.textSecondary }]}>{desc}</Text>
          <ResponsiveGrid minItemWidth={260} spacing={space.s3}>
            {SHOWCASES.filter((s) => s.group === id).map((s) => (
              <KitCard
                key={s.id}
                onPress={() =>
                  'href' in s.target ? router.navigate(s.target.href) : router.push(`/showcases/${s.id}` as never)
                }
                accessibilityLabel={s.label}
              >
                <View style={styles.row}>
                  <Icon source={s.icon} size={24} color={kit.primary} />
                  <Text style={[font('600', 14), styles.fill, { color: kit.textPrimary }]}>{s.label}</Text>
                  <Icon source="mi:chevron-right" size={24} color={kit.textMuted} />
                </View>
                <Text numberOfLines={1} style={[font('400', 11, 'mono'), styles.mv8, { color: kit.textMuted }]}>
                  {s.path}
                </Text>
                <View style={styles.tags}>
                  {s.tags.map((t) => (
                    <StatusBadge key={t} label={t} uppercase={false} />
                  ))}
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
  group: { letterSpacing: 1, marginLeft: space.s1, marginTop: space.l, marginBottom: space.s1 },
  desc: { marginBottom: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  mv8: { marginVertical: space.s2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s1 },
});
