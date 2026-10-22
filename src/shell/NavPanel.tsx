import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { KIT_CATEGORIES, type KitCategory } from '../showcase/kitNav';
import { searchCatalog } from '../showcase/search';
import { font, kitText, radius, space, useKitTheme } from '../theme';
import { MIN_TOUCH } from '../theme/tokens';

/** Entrées principales du tiroir, dans l'ordre de `KitDrawer` Flutter. */
const MAIN: { label: string; icon: string; href: string; match: (p: string) => boolean }[] = [
  { label: 'UI Showcase', icon: 'palette-outline', href: '/', match: (p) => p === '/' },
  { label: 'Composants', icon: 'widgets-outline', href: '/components', match: (p) => p.startsWith('/components') },
  { label: 'Layouts', icon: 'view-grid-plus-outline', href: '/layouts', match: (p) => p.startsWith('/layouts') },
  {
    label: 'Harnais (assistant IA)',
    icon: 'creation-outline',
    href: '/harnais',
    match: (p) => p.startsWith('/harnais'),
  },
  {
    label: 'Pages d’exemple',
    icon: 'application-outline',
    href: '/pages',
    match: (p) => p.startsWith('/pages/') || p === '/pages',
  },
  {
    label: 'Galerie des pages',
    icon: 'bookmark-box-multiple-outline',
    href: '/pages-gallery',
    match: (p) => p === '/pages-gallery',
  },
  { label: 'Showcases', icon: 'devices', href: '/showcases', match: (p) => p.startsWith('/showcases') },
];

/**
 * Tiroir du catalogue (`KitDrawer` Flutter) : marque, recherche pilule, destinations, puis catégories dépliables
 * listant leurs sections. Sert aussi de panneau latéral permanent au-delà de 840 dp.
 */
export function NavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { kit } = useKitTheme();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState<string[]>([]);
  const hits = searchCatalog(query);
  const searching = query.trim().length > 0;
  const go = (href: string) => {
    router.navigate(href as never);
    onNavigate?.();
  };
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  return (
    <View style={styles.fill}>
      <View style={styles.brand}>
        <View style={[styles.logo, { backgroundColor: kit.primary }]}>
          <Icon source="mi:widgets" size={18.5} color={kit.onPrimary} />
        </View>
        <View>
          <Text style={[font('700', 17, 'brand'), { color: kit.textPrimary, lineHeight: 19 }]}>UI Kit</Text>
          <Text style={[font('400', 11), { color: kit.textMuted }]}>React Native · mobile</Text>
        </View>
      </View>
      <View
        style={[styles.search, { backgroundColor: kit.fieldBg, borderColor: focused ? kit.primary : 'transparent' }]}
      >
        <Icon source="mi:search" size={20} color={kit.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Rechercher un composant…"
          placeholderTextColor={kit.textMuted}
          accessibilityLabel="Rechercher un composant"
          style={[font('400', 15), styles.searchInput, { color: kit.textPrimary }]}
          testID="drawer-search"
        />
      </View>
      <ScrollView style={styles.fill} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {searching ? (
          <View testID="drawer-results">
            {hits.length === 0 ? (
              <Text style={[font('400', 14), styles.empty, { color: kit.textMuted }]} accessibilityLiveRegion="polite">
                {`Aucun résultat pour « ${query.trim()} »`}
              </Text>
            ) : (
              hits.map((h) =>
                h.kind === 'category' ? (
                  <Tile
                    key={`c-${h.category.id}`}
                    icon={h.category.icon}
                    label={h.category.label}
                    bold
                    accessibilityLabel={`Catégorie ${h.category.label}`}
                    onPress={() => go(`/components/${h.category.id}`)}
                  />
                ) : (
                  <Tile
                    key={`s-${h.category.id}-${h.section.id}`}
                    icon="subdirectory-arrow-right"
                    label={h.section.label}
                    subtitle={h.category.label}
                    indent
                    accessibilityLabel={`${h.section.label}, dans ${h.category.label}`}
                    onPress={() => go(`/components/${h.category.id}?section=${h.section.id}`)}
                  />
                ),
              )
            )}
          </View>
        ) : (
          <>
            {MAIN.map((d) => (
              <Tile key={d.href} icon={d.icon} label={d.label} active={d.match(pathname)} onPress={() => go(d.href)} />
            ))}
            <Text style={[kitText.overline, styles.overline, { color: kit.textMuted }]}>COMPOSANTS</Text>
            {KIT_CATEGORIES.map((c) => (
              <Category
                key={c.id}
                category={c}
                expanded={open.includes(c.id)}
                active={pathname === `/components/${c.id}`}
                onToggle={() => toggle(c.id)}
                onSection={(s) => go(`/components/${c.id}?section=${s}`)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** Ligne du tiroir (`ListTile` Flutter : icône 20, libellé 14/500). */
function Tile({
  icon,
  label,
  subtitle,
  onPress,
  active = false,
  bold = false,
  indent = false,
  dense = false,
  accessibilityLabel,
}: {
  icon?: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  active?: boolean;
  bold?: boolean;
  indent?: boolean;
  dense?: boolean;
  accessibilityLabel?: string;
}) {
  const { kit } = useKitTheme();
  const color = active ? kit.primary : kit.textPrimary;
  return (
    <TouchableRipple
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tile, { minHeight: dense ? 40 : indent ? 48 : 56, paddingLeft: indent ? space.s6 : space.s3 }]}
    >
      <View style={styles.row}>
        {icon ? <Icon source={icon} size={20} color={active ? kit.primary : kit.textSecondary} /> : null}
        <View style={styles.fill}>
          <Text style={[font(bold ? '700' : '500', dense ? 13 : 14), { color }]}>{label}</Text>
          {subtitle ? <Text style={[font('400', 12), { color: kit.textSecondary }]}>{subtitle}</Text> : null}
        </View>
      </View>
    </TouchableRipple>
  );
}

/** Catégorie dépliable (`ExpansionTile` dense) listant ses sections. */
function Category({
  category: c,
  expanded,
  active,
  onToggle,
  onSection,
}: {
  category: KitCategory;
  expanded: boolean;
  active: boolean;
  onToggle: () => void;
  onSection: (id: string) => void;
}) {
  const { kit } = useKitTheme();
  return (
    <View>
      <TouchableRipple
        accessibilityRole="button"
        accessibilityLabel={c.label}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={styles.category}
      >
        <View style={styles.row}>
          <Icon source={c.icon} size={20} color={active ? kit.primary : kit.textSecondary} />
          <Text style={[font('500', 14), styles.fill, { color: active ? kit.primary : kit.textPrimary }]}>
            {c.label}
          </Text>
          <View style={expanded && styles.flipped}>
            <Icon source="mi:expand-more" size={24} color={kit.textSecondary} />
          </View>
        </View>
      </TouchableRipple>
      {expanded ? (
        <View style={styles.sections}>
          {c.sections.map((s) => (
            <Tile
              key={s.id}
              label={s.label}
              dense
              accessibilityLabel={`${s.label}, dans ${c.label}`}
              onPress={() => onSection(s.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s4 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: space.s5,
    paddingRight: space.s4,
    paddingTop: space.s4,
    paddingBottom: space.s3,
  },
  logo: { width: 32, height: 32, borderRadius: 9.6, alignItems: 'center', justifyContent: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    marginHorizontal: space.s3,
    marginBottom: space.s2,
    paddingHorizontal: space.s3,
    minHeight: MIN_TOUCH,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  searchInput: { flex: 1, minHeight: MIN_TOUCH, paddingVertical: 0 },
  list: { paddingHorizontal: space.s2, paddingVertical: space.s1 },
  tile: { justifyContent: 'center', paddingRight: space.s3, borderRadius: radius.sm },
  overline: { paddingHorizontal: space.s3, paddingTop: space.s4, paddingBottom: space.s2, letterSpacing: 1 },
  category: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: space.s3, borderRadius: radius.sm },
  flipped: { transform: [{ rotate: '180deg' }] },
  sections: { paddingLeft: 28 },
  empty: { padding: space.s6, textAlign: 'center' },
});
