import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FAB, Icon, TouchableRipple } from 'react-native-paper';

import {
  EmptyState,
  KitButton,
  KitCard,
  KitCheckbox,
  KitChip,
  KitProgressBar,
  KitSwitch,
  KitTextField,
  ResponsiveGrid,
  StatusBadge,
} from '../components';
import { useKitSnack } from '../core/snack';
import { MATERIAL_ICONS, iconSource } from '../data/materialIcons';
import { ThemeSettings } from '../shell/ThemeSettings';
import { Demo, DemoWrap, DocPage, type DocSection } from '../showcase/doc';
import { KIT_CATEGORIES } from '../showcase/kitNav';
import { LAYOUT_TEMPLATES } from '../showcase/layouts/templates';
import { useThemeStore } from '../store/themeStore';
import { PALETTE_META } from '../theme/generated/palettes';
import {
  elevation,
  font,
  kitText,
  radius,
  space,
  tabular,
  useKitTheme,
  withAlpha,
  type KitColors,
  type KitTone,
} from '../theme';

/** Nombre de widgets que l'assistant du harnais sait afficher. */
const HARNAIS_WIDGETS = 29;

/** Raccourcis vers les sections les plus consultées (catégorie, section). */
const QUICK: [string, string, string | null, string][] = [
  ['Buttons', 'buttons', null, 'mi:smart-button'],
  ['Inputs', 'forms', 'input', 'mi:input'],
  ['Selects', 'forms', 'select', 'mi:arrow-drop-down-circle'],
  ['Forms', 'forms', 'validation', 'mi:fact-check'],
  ['Tables', 'data', 'table', 'mi:table-rows'],
  ['Cards', 'data', 'cards', 'mi:view-agenda'],
  ['Modals', 'feedback', 'modal', 'mi:open-in-new'],
  ['Drawers', 'feedback', 'drawer', 'mi:view-sidebar'],
  ['Alerts', 'feedback', 'alert', 'mi:report'],
  ['Toasts', 'feedback', 'toast', 'mi:chat-bubble'],
  ['Navigation', 'navigation', null, 'mi:explore'],
  ['Pagination', 'navigation', 'pagination', 'mi:last-page'],
  ['Accordion', 'material', 'accordion', 'mi:expand-circle-down'],
  ['Tree', 'material', 'tree', 'mi:account-tree'],
  ['Drag & drop', 'material', 'drag-drop', 'mi:drag-indicator'],
  ['Loading', 'feedback', 'loading', 'mi:hourglass-top'],
  ['Empty states', 'data', 'empty', 'mi:inbox'],
  ['Error states', 'feedback', 'error', 'mi:error'],
  ['Kanban', 'planning', 'kanban', 'mi:view-kanban'],
  ['Timeline', 'planning', 'timeline', 'mi:view-timeline'],
  ['Agenda', 'planning', 'agenda', 'mi:calendar-month'],
  ['Maps', 'maps', null, 'mi:map'],
];

const openCategory = (id: string, section?: string | null) =>
  router.navigate((section ? `/components/${id}?section=${section}` : `/components/${id}`) as never);

/** `#RRGGBB`, suivi de l'opacité quand la couleur est translucide. */
function hexLabel(color: string): string {
  const c = color.toUpperCase();
  if (c.length === 9) return `${c.slice(0, 7)} · ${Math.round((parseInt(c.slice(7), 16) / 255) * 100)} %`;
  return c;
}

/** Vue d'ensemble : chiffres clés et raccourcis. */
function Overview() {
  const { kit } = useKitTheme();
  const sections = KIT_CATEGORIES.reduce((n, k) => n + k.sections.length, 0);
  const stat = (icon: string, value: number, label: string, href: string) => (
    <KitCard padding={space.s4} onPress={() => router.navigate(href as never)} accessibilityLabel={`${value} ${label}`}>
      <View style={styles.rowGap10}>
        <Icon source={icon} size={24} color={kit.primary} />
        <View style={styles.fill}>
          <Text style={[font('700', 22, 'heading'), { color: kit.textPrimary }]}>{value}</Text>
          <Text numberOfLines={2} style={[font('400', 12), styles.statLabel, { color: kit.textSecondary }]}>
            {label}
          </Text>
        </View>
      </View>
    </KitCard>
  );
  return (
    <View style={styles.overview}>
      <ResponsiveGrid minItemWidth={150} spacing={10}>
        {stat('mi:widgets', KIT_CATEGORIES.length, 'galeries de composants', '/components')}
        {stat('mi:segment', sections, 'sections documentées', '/components')}
        {stat('mi:dashboard-customize', LAYOUT_TEMPLATES.length, 'gabarits d’écran', '/layouts')}
        {stat('mi:auto-awesome', HARNAIS_WIDGETS, 'widgets du harnais', '/harnais')}
      </ResponsiveGrid>
      <View style={styles.quick}>
        {QUICK.map(([label, cat, section, icon]) => (
          <KitChip key={label} label={label} icon={icon} onPress={() => openCategory(cat, section)} />
        ))}
      </View>
    </View>
  );
}

/** Réglages de thème, rôles M3 et aperçu des composants. */
function Themes() {
  const { roles } = useKitTheme();
  const snack = useKitSnack();
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [filter, setFilter] = useState(true);
  const pairs: [string, keyof typeof roles, keyof typeof roles][] = [
    ['Primary', 'primary', 'onPrimary'],
    ['Primary container', 'primaryContainer', 'onPrimaryContainer'],
    ['Secondary', 'secondary', 'onSecondary'],
    ['Secondary container', 'secondaryContainer', 'onSecondaryContainer'],
    ['Tertiary', 'tertiary', 'onTertiary'],
    ['Tertiary container', 'tertiaryContainer', 'onTertiaryContainer'],
    ['Error', 'error', 'onError'],
    ['Error container', 'errorContainer', 'onErrorContainer'],
    ['Surface', 'surface', 'onSurface'],
    ['Surface container', 'surfaceContainer', 'onSurface'],
    ['Surface container highest', 'surfaceContainerHighest', 'onSurfaceVariant'],
    ['Inverse surface', 'inverseSurface', 'inverseOnSurface'],
  ];
  const noop = () => snack.demoAction('Action');
  return (
    <View>
      <View style={[styles.settings, { backgroundColor: roles.surfaceContainer }]}>
        <ThemeSettings />
      </View>
      <View style={styles.mtM}>
        <ResponsiveGrid minItemWidth={150} spacing={8}>
          {pairs.map(([label, token, on_]) => (
            <TouchableRipple
              key={token}
              onPress={() => snack.copy(`roles.${token}`, `« roles.${token} » copié`)}
              accessibilityRole="button"
              accessibilityLabel={`${label}, copier le jeton`}
              style={[styles.role, { backgroundColor: roles[token], borderColor: roles.outlineVariant }]}
            >
              <View>
                <Text style={[font('600', 13), { color: roles[on_] }]}>{label}</Text>
                <Text style={[font('400', 10.5, 'mono'), styles.roleHex, { color: withAlpha(roles[on_], 0.8) }]}>
                  {`${token} · ${hexLabel(roles[token])}`}
                </Text>
              </View>
            </TouchableRipple>
          ))}
        </ResponsiveGrid>
      </View>
      <DemoWrap spacing={8} style={styles.mtM}>
        <KitButton label="Filled" onPress={noop} />
        <KitButton label="Tonal" variant="tonal" onPress={noop} />
        <KitButton label="Outlined" variant="outline" onPress={noop} />
        <KitButton label="Elevated" variant="raised" onPress={noop} />
        <KitButton label="Text" variant="ghost" onPress={noop} />
        <FAB icon="mi:edit" label="FAB" onPress={noop} />
      </DemoWrap>
      <DemoWrap spacing={8} style={[styles.mtS, styles.center]}>
        <KitSwitch value={on} onChange={setOn} accessibilityLabel="Interrupteur" />
        <KitCheckbox value={checked} onChange={setChecked} accessibilityLabel="Case à cocher" />
        <KitChip label="Filtre" selected={filter} onPress={() => setFilter(!filter)} />
        <View style={styles.progress}>
          <KitProgressBar value={0.62} />
        </View>
      </DemoWrap>
    </View>
  );
}

/** Pastille de jeton de couleur : toucher copie la valeur hexadécimale. */
function Swatch({
  name,
  token,
  color,
  note,
  bordered,
}: {
  name: string;
  token: string;
  color: string;
  note?: string;
  bordered?: boolean;
}) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const hex = hexLabel(color);
  return (
    <KitCard
      padding={space.s3}
      onPress={() => snack.copy(hex, `« ${hex} » copié (${token})`)}
      accessibilityLabel={`${name}, ${hex}`}
    >
      <View
        style={[
          styles.chip,
          { backgroundColor: color },
          bordered && { borderWidth: 1, borderColor: withAlpha(kit.textMuted, 0.3) },
        ]}
      />
      <Text style={[font('700', 13), styles.mt8, { color: kit.textPrimary }]}>{name}</Text>
      <Text style={[font('400', 10.5, 'mono'), { color: kit.textSecondary }]}>{`kit.${token}`}</Text>
      <Text style={[font('400', 10.5, 'mono'), { color: kit.textMuted }]}>{hex}</Text>
      {note ? <Text style={[font('400', 11), styles.italic, { color: kit.textMuted }]}>{note}</Text> : null}
    </KitCard>
  );
}

/** Jetons de couleur du kit (marque, sémantique, surfaces) et badges de statut. */
function Colors() {
  const { kit, colorMode } = useKitTheme();
  const setMode = useThemeStore((s) => s.setMode);
  const dark = colorMode === 'dark';
  const swatches = (list: [string, keyof KitColors, string?][], bordered = false) => (
    <ResponsiveGrid minItemWidth={150} spacing={10}>
      {list.map(([name, token, note]) => (
        <Swatch key={token} name={name} token={token} color={kit[token]} note={note} bordered={bordered} />
      ))}
    </ResponsiveGrid>
  );
  const sub = (t: string) => <Text style={[kitText.h4, styles.sub, { color: kit.textPrimary }]}>{t}</Text>;
  const tones: KitTone[] = ['success', 'warning', 'error', 'info', 'purple', 'cyan', 'neutral'];
  return (
    <View>
      <KitCard padding={space.s3}>
        <View style={styles.rowGap10}>
          <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>
            Thème actuel : <Text style={font('700', 14)}>{dark ? 'sombre' : 'clair'}</Text>
          </Text>
          <KitButton
            label="Basculer"
            icon={dark ? 'mi:light-mode' : 'mi:dark-mode'}
            variant="outline"
            size="compact"
            onPress={() => setMode(dark ? 'light' : 'dark')}
          />
        </View>
      </KitCard>
      {sub('Marque')}
      {swatches([
        ['Primary', 'primary', 'M3 primary (thème courant)'],
        ['Primary light', 'primaryLight'],
        ['Tertiary', 'tertiary', 'M3 tertiary (thème courant)'],
        ['Tertiary light', 'tertiaryLight'],
      ])}
      {sub('Sémantique')}
      {swatches([
        ['Success', 'success'],
        ['Success light', 'successLight'],
        ['Success text', 'successText'],
        ['Warning', 'warning'],
        ['Warning light', 'warningLight'],
        ['Warning text', 'warningText'],
        ['Error', 'error'],
        ['Error light', 'errorLight'],
        ['Error text', 'errorText'],
        ['Info', 'info'],
        ['Purple', 'purple'],
        ['Cyan', 'cyan'],
      ])}
      {sub('Surfaces & texte')}
      {swatches(
        [
          ['Background', 'bg'],
          ['Card', 'card'],
          ['Hover', 'hover'],
          ['Table header', 'tableHeader'],
          ['Border', 'border'],
          ['Text primary', 'textPrimary'],
          ['Text secondary', 'textSecondary'],
          ['Text muted', 'textMuted'],
        ],
        true,
      )}
      {sub('Badges de statut')}
      <DemoWrap spacing={8}>
        {tones.map((t) => (
          <StatusBadge key={t} label={t} tone={t} />
        ))}
      </DemoWrap>
    </View>
  );
}

/** Échelle typographique du kit. */
function TypeScale() {
  const { kit } = useKitTheme();
  const rows: [string, string, object][] = [
    ['h1 · 32/700', 'Référentiel unique', kitText.h1],
    ['Titre de page · Outfit 22', 'Registre des Produits', kitText.pageTitle],
    ['h2 · 24/600', 'Tableau de bord Finance', kitText.h2],
    ['h3 · 20/600', 'Informations générales', kitText.h3],
    ['Titre de carte · Outfit 16', 'Abonnement Standard', kitText.cardTitle],
    [
      'Corps · Inter 14',
      'Le client signale une perte de signal récurrente entre 18h et 20h sur l’axe Yopougon–Abobo.',
      kitText.body,
    ],
    [
      'Secondaire · 13',
      'Catalogue des offres : tarifs d’installation, d’abonnement et de désinstallation.',
      kitText.bodySm,
    ],
    ['Libellé · 12/600', 'Raison sociale', kitText.label],
    ['En-tête de table · 11/700', 'CODE CLIENT', { ...font('700', 11), letterSpacing: 0.5, color: kit.textSecondary }],
    ['Code · Space Mono 11', 'FAC-2026-0912', { ...kitText.mono, fontSize: 11.5, color: kit.primary }],
    ['Montant · tabulaire', '1 245 000 F CFA', [font('700', 13), tabular]],
    ['Marque · TT Wellingtons', 'Lookas', { ...kitText.brand, fontSize: 22, color: kit.primary }],
  ];
  return (
    <KitCard padding={0}>
      {rows.map(([k, sample, style], i) => (
        <View key={k} style={[styles.typeRow, i > 0 && { borderTopWidth: 1, borderTopColor: kit.divider }]}>
          <Text style={[font('400', 10.5, 'mono'), styles.mb4, { color: kit.textMuted }]}>{k}</Text>
          <Text style={[{ color: kit.textPrimary }, style]}>{sample}</Text>
        </View>
      ))}
    </KitCard>
  );
}

const SPACES: (keyof typeof space)[] = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
const RADII: [keyof typeof radius, string][] = [
  ['xs', '4'],
  ['md', '12'],
  ['x2l', '24'],
  ['full', '9999'],
];

function Spacing() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  return (
    <Demo
      label="Échelle d’espacement"
      code={'<View style={{ gap: space.m }} /> // 16\n<View style={{ padding: space.l }} /> // 24'}
    >
      {SPACES.map((n) => (
        <TouchableRipple
          key={n}
          onPress={() => snack.copy(`space.${n}`)}
          accessibilityRole="button"
          accessibilityLabel={`space.${n}, ${space[n]} pixels`}
        >
          <View style={styles.spaceRow}>
            <Text
              style={[font('400', 11, 'mono'), styles.spaceName, { color: kit.textSecondary }]}
            >{`space.${n}`}</Text>
            <View style={[styles.spaceBar, { width: space[n] * 3, backgroundColor: withAlpha(kit.primary, 0.75) }]} />
            <Text style={[font('400', 12), { color: kit.textMuted }]}>{`${space[n]} px`}</Text>
          </View>
        </TouchableRipple>
      ))}
    </Demo>
  );
}

function Radii() {
  const { kit, colorMode } = useKitTheme();
  const snack = useKitSnack();
  return (
    <Demo label="Rayons & ombres">
      <View style={styles.row}>
        {RADII.map(([n, px]) => (
          <TouchableRipple
            key={n}
            onPress={() => snack.copy(`radius.${n}`)}
            accessibilityRole="button"
            accessibilityLabel={`radius.${n}, ${px} pixels`}
            style={styles.radiusCell}
          >
            <View
              style={[
                styles.box,
                {
                  borderRadius: radius[n],
                  backgroundColor: kit.card,
                  borderWidth: 1.5,
                  borderColor: withAlpha(kit.primary, 0.5),
                },
              ]}
            >
              <Text style={[font('400', 11, 'mono'), { color: kit.textSecondary }]}>{n}</Text>
              <Text style={[font('400', 10.5), { color: kit.textMuted }]}>{`${px} px`}</Text>
            </View>
          </TouchableRipple>
        ))}
      </View>
      <View style={[styles.row, styles.mt12]}>
        {([1, 3] as const).map((l) => (
          <View key={l} style={styles.shadowCell}>
            <View style={[styles.box, { borderRadius: radius.md, backgroundColor: kit.card }, elevation(l, colorMode)]}>
              <Text style={[font('400', 11, 'mono'), { color: kit.textSecondary }]}>{`elevation-${l}`}</Text>
            </View>
          </View>
        ))}
      </View>
    </Demo>
  );
}

/** Grille d'icônes filtrable ; toucher copie le code JSX. */
function IconGrid() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [q, setQ] = useState('');
  const [width, setWidth] = useState(0);
  const query = q.trim().toLowerCase();
  const icons = MATERIAL_ICONS.filter((n) => !query || n.includes(query));
  const cols = Math.max(3, Math.min(10, Math.floor(width / 92)));
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.rowGap10}>
        <View style={styles.fill}>
          <KitTextField
            hint="Filtrer les icônes…"
            icon="mi:search"
            value={q}
            onChangeText={setQ}
            accessibilityLabel="Filtrer les icônes"
          />
        </View>
        <Text style={[font('400', 12), { color: kit.textMuted }]}>{`${icons.length} icône(s)`}</Text>
      </View>
      {icons.length === 0 ? (
        <EmptyState icon="mi:search-off" title="Aucune icône" subtitle="Essayez un autre mot-clé." />
      ) : (
        <View style={styles.iconGrid}>
          {icons.map((n) => (
            <View key={n} style={[styles.iconCell, { width: `${100 / cols}%` }]}>
              <TouchableRipple
                borderless
                onPress={() => snack.copy(`<Icon source="${iconSource(n)}" />`, `« ${n} » copié`)}
                accessibilityRole="button"
                accessibilityLabel={n}
                style={[styles.iconTile, { backgroundColor: kit.card }]}
              >
                <View style={styles.iconInner}>
                  <Icon source={iconSource(n)} size={24} color={kit.textPrimary} />
                  <Text numberOfLines={2} style={[font('400', 9.5), styles.centerText, { color: kit.textMuted }]}>
                    {n}
                  </Text>
                </View>
              </TouchableRipple>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Accès direct aux galeries, aux gabarits et au harnais. */
function Catalog() {
  const { kit } = useKitTheme();
  const card = (key: string, icon: string, title: string, desc: string, onPress: () => void) => (
    <KitCard key={key} onPress={onPress} accessibilityLabel={title}>
      <View style={styles.catalogRow}>
        <View style={[styles.catalogDisc, { backgroundColor: kit.primaryLight }]}>
          <Icon source={icon} size={20} color={kit.primary} />
        </View>
        <View style={styles.fill}>
          <Text style={[font('700', 14), { color: kit.textPrimary }]}>{title}</Text>
          <Text numberOfLines={2} style={[font('400', 12), styles.mt2, { color: kit.textSecondary }]}>
            {desc}
          </Text>
        </View>
      </View>
    </KitCard>
  );
  return (
    <ResponsiveGrid minItemWidth={280} spacing={10}>
      {KIT_CATEGORIES.map((c) => card(c.id, c.icon, c.label, c.description, () => openCategory(c.id)))}
      {card(
        'layouts',
        'mi:view-compact',
        'Layouts',
        'Shell mobile, fiche détail, authentification, bottom sheets, dialogs, catalogue.',
        () => router.navigate('/layouts'),
      )}
      {card(
        'harnais',
        'mi:auto-awesome',
        'Harnais',
        'Assistant IA simulé qui répond avec des widgets : cartes, graphiques, formulaires, planning…',
        () => router.navigate('/harnais'),
      )}
    </ResponsiveGrid>
  );
}

/** `/` — vue d'ensemble du design system (`UiShowcasePage` Flutter). */
export default function ShowcaseHome() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const sections: DocSection[] = [
    {
      id: 'themes',
      title: 'Thèmes',
      source: 'theme/generated/palettes.ts (généré par scripts/generate-theme.mjs) · themeStore · ThemeSettings',
      description: `${PALETTE_META.length} thèmes de couleur Material 3, chacun en clair, en sombre ou selon le réglage du système. Les palettes tonales sont calculées dans l’espace HCT à partir d’une couleur source : les rôles (primary, container, surface…) garantissent les contrastes Material quelle que soit la couleur. Mêmes tons que le UI Kit Angular et Flutter.`,
      children: <Themes />,
    },
    {
      id: 'colors',
      title: 'Colors',
      source: 'KitColors · dérivés du thème M3 courant',
      description:
        'Jetons définis pour les thèmes clair et sombre. Touchez une pastille pour copier sa valeur hexadécimale. Basculez le thème pour voir les valeurs sombres.',
      children: <Colors />,
    },
    {
      id: 'typography',
      title: 'Typography',
      source: 'Outfit (titres) · Inter (texte) · Space Mono (codes)',
      description: 'Polices embarquées dans assets/fonts : aucune requête vers Google Fonts.',
      children: <TypeScale />,
    },
    {
      id: 'spacing',
      title: 'Espacements & rayons',
      source: 'theme/tokens.ts · space / radius / elevation',
      cols: 2,
      children: [<Spacing key="space" />, <Radii key="radii" />],
    },
    {
      id: 'icons',
      title: 'Icons',
      source: 'Material Icons (@expo/vector-icons)',
      description: 'Sélection des icônes utilisées dans le projet. Touchez pour copier le code JSX.',
      children: <IconGrid />,
    },
    {
      id: 'catalog',
      title: 'Catalogue',
      description: 'Accès direct aux galeries détaillées.',
      children: <Catalog />,
    },
  ];
  return (
    <DocPage
      title="UI Showcase"
      icon="mi:auto-awesome-mosaic"
      eyebrow="Catalogue visuel"
      testID="home"
      key={section}
      initialSection={section}
      subtitle="Vue globale du design system : jetons de couleur, typographie, icônes, composants et layouts, adaptés au mobile. Tout fonctionne sans backend."
      header={<Overview />}
      sections={sections}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  rowGap10: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  italic: { fontStyle: 'italic' },
  mt2: { marginTop: 2 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mb4: { marginBottom: 4 },
  mtS: { marginTop: space.s },
  mtM: { marginTop: space.m },
  overview: { gap: space.m },
  statLabel: { lineHeight: 15 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  settings: { padding: space.l, borderRadius: radius.lg },
  role: { borderWidth: 1, borderRadius: radius.md, padding: space.s3, overflow: 'hidden' },
  roleHex: { marginTop: 14 },
  progress: { width: 160 },
  chip: { height: 44, borderRadius: radius.md },
  sub: { marginTop: space.s5, marginBottom: space.s3 },
  typeRow: { paddingHorizontal: space.s4, paddingVertical: space.s3 },
  spaceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.s2 },
  spaceName: { width: 82 },
  spaceBar: { height: 14, borderRadius: radius.xs, marginRight: 10 },
  radiusCell: { flex: 1, padding: space.s1 },
  shadowCell: { flex: 1, padding: space.s2 },
  box: { height: 72, alignItems: 'center', justifyContent: 'center' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: -4, marginTop: 8 },
  iconCell: { aspectRatio: 1, padding: 4 },
  iconTile: { flex: 1, borderRadius: radius.md },
  iconInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: space.s2 },
  catalogRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  catalogDisc: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
