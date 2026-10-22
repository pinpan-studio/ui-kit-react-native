import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { EmptyState, KitCard, KitChip, KitTextField, ResponsiveGrid, StatusBadge } from '../components';
import { PAGE_EXAMPLES, pageKind } from '../showcase/pageExamples';
import { font, kitText, space, useKitTheme } from '../theme';

const GROUPS = ['Applications', 'Authentification', 'Formulaires'] as const;
const KINDS = [...new Set(PAGE_EXAMPLES.map((p) => pageKind(p.route)))].sort();

/** `/pages-gallery` — galerie des pages (`PagesGallery` Flutter) : recherche, filtre par type, routes. */
export default function PagesGalleryScreen() {
  const { kit } = useKitTheme();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const query = q.trim().toLowerCase();
  const groups = GROUPS.map(
    (g) =>
      [
        g,
        PAGE_EXAMPLES.filter(
          (p) =>
            p.group === g &&
            (!kind || pageKind(p.route) === kind) &&
            (!query || `${p.route} ${p.title} ${p.description} ${g}`.toLowerCase().includes(query)),
        ),
      ] as const,
  ).filter(([, list]) => list.length);
  const count = groups.reduce((n, [, list]) => n + list.length, 0);

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" testID="pages-gallery-screen">
      <KitTextField
        hint="Rechercher une page, une route…"
        icon="mi:search"
        value={q}
        onChangeText={setQ}
        accessibilityLabel="Rechercher une page"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <KitChip label="Tous les types" selected={!kind} onPress={() => setKind('')} />
        {KINDS.map((k) => (
          <KitChip key={k} label={k} selected={kind === k} onPress={() => setKind(k)} />
        ))}
      </ScrollView>
      <Text style={[font('400', 14), { color: kit.textMuted }]}>{`${count} page${count > 1 ? 's' : ''}`}</Text>
      {groups.length === 0 ? (
        <EmptyState icon="mi:search-off" title="Aucune page" subtitle="Ajustez votre recherche ou le filtre de type." />
      ) : null}
      {groups.map(([g, list]) => (
        <View key={g}>
          <Text accessibilityRole="header" style={[kitText.overline, styles.group, { color: kit.textMuted }]}>
            {`${g.toUpperCase()} (${list.length})`}
          </Text>
          <ResponsiveGrid minItemWidth={260} spacing={space.s3}>
            {list.map((p) => (
              <KitCard
                key={p.slug}
                onPress={() => router.push(`/pages/${p.slug}` as never)}
                accessibilityLabel={p.title}
              >
                <View style={styles.row}>
                  <Icon source={p.icon} size={24} color={kit.primary} />
                  <View style={styles.fill}>
                    <Text style={[font('600', 14), { color: kit.textPrimary }]}>{p.title}</Text>
                    <Text
                      numberOfLines={1}
                      style={[font('400', 11, 'mono'), { color: kit.textMuted }]}
                    >{`/examples/${p.route}`}</Text>
                    <View style={styles.badge}>
                      <StatusBadge label={pageKind(p.route)} uppercase={false} />
                    </View>
                  </View>
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
  body: { padding: space.s4, gap: space.s3 },
  chips: { gap: space.s2 },
  group: { letterSpacing: 1, marginLeft: space.s1, marginTop: space.l, marginBottom: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  badge: { marginTop: space.s1 },
});
