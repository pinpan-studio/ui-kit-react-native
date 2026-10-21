import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { FAB, Icon } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  KitAppBar,
  KitAvatar,
  KitButton,
  KitCard,
  KitChart,
  KitIconButton,
  KitNavigationBar,
  KitNavigationRail,
  KitSlider,
  KpiCard,
  PageHeader,
  ResponsiveGrid,
  SegmentedToggle,
  StatusBadge,
  type NavDestination,
} from '../components';
import { useKitSnack } from '../core/snack';
import { CA_2026, DEMO_CLIENTS, MOIS, STATUT_LABEL, STATUT_TONE, TIMELINE_EVENTS } from '../data/showcase';
import { breakpoints, columns, font, kitText, radius, space, toneColor, useKitTheme, withAlpha } from '../theme';
import { WHITE } from '../theme/swatches';
import { Demo, DocPage, Gap, type DocSection } from './doc';

/**
 * Cadre d'appareil : rend son contenu à une largeur logique donnée puis le met à l'échelle de la place
 * disponible, pour comparer téléphone et tablette sur un même écran.
 */
function DeviceFrame({ width, height = 420, children }: { width: number; height?: number; children: ReactNode }) {
  const { kit } = useKitTheme();
  const [avail, setAvail] = useState(0);
  const outerW = width + 16;
  const outerH = height + 16;
  const scale = avail ? Math.max(0.2, Math.min(1, avail / outerW)) : 0;
  return (
    <View onLayout={(e) => setAvail(e.nativeEvent.layout.width)} style={styles.frameHost}>
      {scale ? (
        <View style={{ width: outerW * scale, height: outerH * scale }}>
          <View
            style={[
              styles.frame,
              {
                width: outerW,
                height: outerH,
                left: (outerW * scale - outerW) / 2,
                top: (outerH * scale - outerH) / 2,
                transform: [{ scale }],
                backgroundColor: kit.textPrimary,
              },
            ]}
          >
            <View style={[styles.screen, { width, height, backgroundColor: kit.bg }]}>{children}</View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Ligne libellé / valeur des fiches. */
function Line({ k, v }: { k: string; v: string }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.line}>
      <Text style={[font('400', 12.5), styles.fill, { color: kit.textSecondary }]}>{k}</Text>
      <Text style={[font('600', 13), styles.lineValue, { color: kit.textPrimary }]}>{v}</Text>
    </View>
  );
}

/** Colonne principale + latérale (ratio 2 : 1), empilées sous 600 dp. */
function TwoCols({ main, side }: { main: ReactNode; side: ReactNode }) {
  const [w, setW] = useState(0);
  const stacked = w < breakpoints.md;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={stacked ? styles.stack : styles.cols}>
      <View style={stacked ? undefined : styles.flex2}>{main}</View>
      <View style={stacked ? undefined : styles.fill}>{side}</View>
    </View>
  );
}

/** Bandeau en dégradé primaire → info. */
function Banner({ children }: { children: ReactNode }) {
  const { kit } = useKitTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={styles.banner}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {size.w ? (
        <Svg width={size.w} height={size.h} style={styles.abs}>
          <Defs>
            <LinearGradient id="banner" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={kit.primary} />
              <Stop offset="1" stopColor={kit.info} />
            </LinearGradient>
          </Defs>
          <Rect width={size.w} height={size.h} fill="url(#banner)" />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

const NAV: NavDestination[] = [
  { label: 'Accueil', icon: 'mi:dashboard' },
  { label: 'Clients', icon: 'mi:people-outline', selectedIcon: 'mi:people' },
  { label: 'Missions', icon: 'mi:build' },
];

const OFFERS: [string, string, string][] = [
  ['Essentiel', '9 900 F', 'mi:gps-fixed'],
  ['Standard', '14 500 F', 'mi:verified'],
  ['Premium', '24 000 F', 'mi:workspace-premium'],
];

const BREAKPOINTS: [keyof typeof breakpoints, string][] = [
  ['xs', 'Petits mobiles'],
  ['sm', 'Mobiles standard'],
  ['md', 'Grands mobiles — 2 colonnes'],
  ['tablet', 'Tablette portrait — rail visible'],
  ['lg', 'Tablette paysage — 3 colonnes'],
  ['xl', 'Desktop'],
];

/** `/components/layout` — conteneur, tableau de bord, colonnes, barre latérale, pleine largeur, sections, responsive. */
export function LayoutGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const { width: screen } = useWindowDimensions();
  const [device, setDevice] = useState<'phone' | 'tablet'>('phone');
  const [resp, setResp] = useState(360);
  const [nav, setNav] = useState(1);
  const w = device === 'phone' ? 375 : 820;
  const phone = device === 'phone';
  const noop = () => snack.demoAction('Action');

  const sections: DocSection[] = [
    {
      id: 'page',
      title: 'Page layout',
      source: 'KitAppBar + PageHeader + contenu défilant',
      children: (
        <Demo label="Page liste" muted>
          <DeviceFrame width={w}>
            <KitAppBar
              leading={<KitIconButton icon="mi:menu" accessibilityLabel="Menu" onPress={noop} />}
              title="Clients"
              actions={<KitIconButton icon="mi:notifications-none" accessibilityLabel="Notifications" onPress={noop} />}
            />
            <ScrollView nestedScrollEnabled contentContainerStyle={styles.pad16}>
              <PageHeader
                breadcrumb="Registre"
                title="Clients"
                subtitle="40 clients · 31 actifs"
                actions={phone ? undefined : <KitButton label="Nouveau client" icon="mi:add" onPress={noop} />}
              />
              <View style={styles.list}>
                {DEMO_CLIENTS.slice(0, 5).map((x) => (
                  <KitCard key={x.id} padding={space.s3}>
                    <View style={styles.rowGap10}>
                      <KitAvatar name={x.raisonSociale} size={34} />
                      <Text numberOfLines={1} style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>
                        {x.raisonSociale}
                      </Text>
                      <StatusBadge label={STATUT_LABEL[x.statut]} tone={STATUT_TONE[x.statut]} />
                    </View>
                  </KitCard>
                ))}
              </View>
            </ScrollView>
            {phone ? <FAB icon="mi:add" accessibilityLabel="Nouveau client" onPress={noop} style={styles.fab} /> : null}
          </DeviceFrame>
        </Demo>
      ),
    },
    {
      id: 'dashboard',
      title: 'Dashboard layout',
      source: 'ResponsiveGrid (KPI) + graphiques',
      description:
        'KPI en 2 colonnes sur téléphone, 4 sur tablette ; les graphiques passent côte à côte au-delà de 600 px.',
      children: (
        <Demo label="Tableau de bord" muted>
          <DeviceFrame width={w} height={520}>
            <ScrollView nestedScrollEnabled contentContainerStyle={styles.pad16}>
              <Text style={[kitText.pageTitle, styles.mb12, { color: kit.textPrimary }]}>Tableau de bord</Text>
              <ResponsiveGrid minItemWidth={160} spacing={10}>
                <KpiCard icon="mi:groups" value="1 284" label="Clients" tone="primary" />
                <KpiCard icon="mi:local-shipping" value="8 432" label="Véhicules" tone="info" />
                <KpiCard icon="mi:payments" value="55,8 M" label="CA" tone="success" />
                <KpiCard icon="mi:warning-amber" value="17" label="Alertes" tone="warning" />
              </ResponsiveGrid>
              <View style={styles.mt10}>
                <ResponsiveGrid minItemWidth={300} spacing={10} maxColumns={2}>
                  <KitCard title="Chiffre d’affaires">
                    <KitChart
                      kind="area"
                      labels={MOIS.slice(0, 10)}
                      series={[{ label: '2026', data: CA_2026.slice(0, 10) }]}
                      height={130}
                      showLegend={false}
                    />
                  </KitCard>
                  <KitCard title="Répartition">
                    <KitChart
                      kind="doughnut"
                      labels={['Abonnement', 'Installation', 'Matériel']}
                      series={[{ label: 'Part', data: [60, 25, 15] }]}
                      height={130}
                      showLegend={false}
                    />
                  </KitCard>
                </ResponsiveGrid>
              </View>
            </ScrollView>
          </DeviceFrame>
        </Demo>
      ),
    },
    {
      id: 'two-cols',
      title: 'Two columns',
      source: 'fiche détail : colonne principale + colonne latérale',
      description: 'Sur téléphone la colonne latérale passe sous la principale ; sur tablette, ratio 2 : 1.',
      children: (
        <Demo label="Fiche client" muted>
          <DeviceFrame width={w} height={460}>
            <ScrollView nestedScrollEnabled contentContainerStyle={styles.pad16}>
              <TwoCols
                main={
                  <KitCard title="Informations" icon="mi:info-outline">
                    <Line k="Raison sociale" v="Transports Yao & Fils" />
                    <Line k="Contact" v="Jean Kouassi" />
                    <Line k="Ville" v="Abidjan" />
                    <Line k="Véhicules" v="24" />
                  </KitCard>
                }
                side={
                  <KitCard title="Activité" icon="mi:history">
                    {TIMELINE_EVENTS.slice(0, 3).map((e) => (
                      <View key={e.titre} style={styles.activity}>
                        <Icon source={e.icon} size={18} color={toneColor(e.tone, kit)} />
                        <Text style={[font('500', 14), styles.fill, { color: kit.textPrimary }]}>{e.titre}</Text>
                      </View>
                    ))}
                  </KitCard>
                }
              />
            </ScrollView>
          </DeviceFrame>
        </Demo>
      ),
    },
    {
      id: 'three-cols',
      title: 'Three columns',
      source: 'ResponsiveGrid maxColumns={3}',
      children: (
        <Demo label="Offres" muted>
          <DeviceFrame width={w} height={440}>
            <ScrollView nestedScrollEnabled contentContainerStyle={styles.pad16}>
              <ResponsiveGrid minItemWidth={220} maxColumns={3} spacing={10}>
                {OFFERS.map(([t, p, ic]) => (
                  <KitCard key={t}>
                    <Icon source={ic} size={24} color={kit.primary} />
                    <Text style={[kitText.cardTitle, styles.mt8, { color: kit.textPrimary }]}>{t}</Text>
                    <Text style={[font('400', 14), { color: kit.textSecondary }]}>{`${p} / mois`}</Text>
                  </KitCard>
                ))}
              </ResponsiveGrid>
            </ScrollView>
          </DeviceFrame>
        </Demo>
      ),
    },
    {
      id: 'sidebar',
      title: 'Sidebar layout',
      source: 'KitNavigationRail (tablette) / tiroir (téléphone)',
      children: (
        <Demo label="Navigation adaptative" muted>
          <DeviceFrame width={w} height={360}>
            {phone ? (
              <View style={styles.fill}>
                <KitAppBar
                  leading={<KitIconButton icon="mi:menu" accessibilityLabel="Menu" onPress={noop} />}
                  title="Clients"
                />
                <View style={styles.centered}>
                  <Text style={[font('400', 14), { color: kit.textPrimary }]}>Contenu — menu dans le tiroir</Text>
                </View>
                <KitNavigationBar destinations={NAV} selected={nav} onSelect={setNav} />
              </View>
            ) : (
              <View style={styles.row}>
                <KitNavigationRail destinations={NAV} selected={nav} onSelect={setNav} />
                <View style={[styles.vrule, { backgroundColor: kit.divider }]} />
                <View style={styles.centered}>
                  <Text style={[font('400', 14), { color: kit.textPrimary }]}>Contenu</Text>
                </View>
              </View>
            )}
          </DeviceFrame>
        </Demo>
      ),
    },
    {
      id: 'full',
      title: 'Full width',
      source: 'contenu bord à bord (carte, média)',
      children: (
        <Demo label="Bandeau pleine largeur" flush>
          <Banner>
            <Text style={[font('700', 22, 'heading'), { color: WHITE }]}>Votre flotte, en temps réel</Text>
          </Banner>
        </Demo>
      ),
    },
    {
      id: 'sections',
      title: 'Card sections',
      source: 'KitCard (title, icon, trailing)',
      cols: 2,
      children: [
        <KitCard
          key="contact"
          title="Coordonnées"
          icon="mi:contact-mail"
          trailing={<KitIconButton icon="mi:edit" size={18} accessibilityLabel="Modifier" onPress={noop} />}
        >
          <Line k="Téléphone" v="+225 07 10 20 30 40" />
          <Line k="E-mail" v="contact@yao.ci" />
        </KitCard>,
        <KitCard
          key="equip"
          title="Équipements"
          icon="mi:settings-input-antenna"
          trailing={<StatusBadge label="24" tone="primary" />}
        >
          <Line k="Balises actives" v="22" />
          <Line k="Hors ligne" v="2" />
        </KitCard>,
      ],
    },
    {
      id: 'responsive',
      title: 'Responsive containers',
      source: 'onLayout · ResponsiveGrid',
      description: 'Faites glisser pour changer la largeur disponible : la grille recalcule son nombre de colonnes.',
      children: (
        <Demo label={`Largeur : ${Math.round(resp)} px`}>
          <Gap>
            <KitSlider value={resp} min={280} max={1024} onChange={setResp} accessibilityLabel="Largeur disponible" />
            <DeviceFrame width={resp} height={240}>
              <View style={styles.pad12}>
                <Text style={[font('700', 14), styles.mb8, { color: kit.textPrimary }]}>
                  {`${columns(resp - 24, 4)} colonne(s)`}
                </Text>
                <ResponsiveGrid minItemWidth={150} spacing={8}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <View key={i} style={[styles.cell, { backgroundColor: withAlpha(kit.primary, 0.12 + i * 0.05) }]}>
                      <Text style={[font('400', 14), { color: kit.textPrimary }]}>{i + 1}</Text>
                    </View>
                  ))}
                </ResponsiveGrid>
              </View>
            </DeviceFrame>
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'breakpoints',
      title: 'Breakpoints',
      source: 'breakpoints (theme/tokens)',
      children: [
        <KitCard key="table" padding={0}>
          {BREAKPOINTS.map(([n, u]) => (
            <View key={n} style={styles.bpRow}>
              <Text
                style={[font('400', 11.5, 'mono'), styles.bpName, { color: kit.primary }]}
              >{`breakpoints.${n}`}</Text>
              <View style={styles.fill}>
                <Text style={[font('500', 14), { color: kit.textPrimary }]}>{`${breakpoints[n]} px`}</Text>
                <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{u}</Text>
              </View>
              {screen >= breakpoints[n] ? <Icon source="mi:check-circle" size={18} color={kit.success} /> : null}
            </View>
          ))}
        </KitCard>,
        <Text key="current" style={[font('400', 12), { color: kit.textMuted }]}>
          {`Largeur actuelle : ${Math.round(screen)} px`}
        </Text>,
      ],
    },
  ];

  return (
    <DocPage
      title="Layout"
      icon="mi:dashboard-customize"
      initialSection={initialSection}
      testID="category-layout"
      subtitle="Structures de page : conteneur, en-tête, grilles de tableau de bord, fiche en colonnes, panneaux de section, conteneurs responsive. Basculez téléphone / tablette pour voir la recomposition."
      header={
        <SegmentedToggle
          value={device}
          onChange={setDevice}
          options={[
            { value: 'phone', label: 'Téléphone', icon: 'mi:smartphone' },
            { value: 'tablet', label: 'Tablette', icon: 'mi:tablet-mac' },
          ]}
        />
      }
      sections={sections}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex2: { flex: 2 },
  abs: { position: 'absolute', left: 0, top: 0 },
  row: { flex: 1, flexDirection: 'row' },
  rowGap10: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pad12: { padding: space.s3 },
  pad16: { padding: space.s4 },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  frameHost: { alignItems: 'center' },
  frame: { position: 'absolute', borderRadius: 28, padding: space.s2 },
  screen: { borderRadius: radius.xl, overflow: 'hidden' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  list: { gap: space.s2, marginTop: 12 },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.s2, gap: space.s2 },
  lineValue: { flexShrink: 1, textAlign: 'right' },
  stack: { gap: 12 },
  cols: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  activity: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 40 },
  vrule: { width: 1 },
  banner: { height: 130, padding: space.s5, justifyContent: 'flex-end', overflow: 'hidden' },
  cell: { height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  bpRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, paddingHorizontal: space.m },
  bpName: { width: 120 },
});
