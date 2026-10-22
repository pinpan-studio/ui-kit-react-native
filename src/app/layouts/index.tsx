import { router } from 'expo-router';
import { Fragment, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { CheckboxTile, KitCard, SidePanel } from '../../components';
import { DEMO_CLIENTS } from '../../data/showcase';
import { DocPage, type DocSection } from '../../showcase/doc';
import { LAYOUT_TEMPLATES, type LayoutTemplate, type Wire } from '../../showcase/layouts/templates';
import { elevation, font, radius, space, useKitTheme, withAlpha } from '../../theme';

/** Maquette schématique d'un gabarit (blocs gris dans un téléphone). */
function Wireframe({ wire }: { wire: Wire }) {
  const { kit, colorMode } = useKitTheme();
  const grey = withAlpha(kit.textMuted, 0.35);
  const accent = withAlpha(kit.primary, 0.7);
  const b = (h: number, opts: { w?: number; color?: string; r?: number; flex?: boolean } = {}) => (
    <View
      style={[
        { height: h, borderRadius: opts.r ?? 3, backgroundColor: opts.color ?? grey },
        opts.w ? { width: opts.w } : null,
        opts.flex ? styles.fill : null,
      ]}
    />
  );
  const gap = (h: number) => <View style={{ height: h }} />;
  const spacer = <View style={styles.fill} />;
  const row = (n: number, h: number, r = 3) => (
    <View style={styles.wireRow}>
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={[styles.fill, { height: h, borderRadius: r, backgroundColor: grey }]} />
      ))}
    </View>
  );
  const content: Record<Wire, ReactNode[]> = {
    shell: [b(10, { color: accent }), gap(5), row(2, 18), gap(4), b(30), spacer, b(10)],
    detail: [b(28, { color: accent }), gap(4), row(3, 5), gap(4), b(14), gap(3), b(14), gap(3), b(14)],
    auth: [
      spacer,
      <View key="logo" style={styles.selfCenter}>
        {b(18, { w: 18, color: accent, r: 6 })}
      </View>,
      gap(6),
      b(7),
      gap(3),
      b(7),
      gap(5),
      b(9, { color: accent, r: 9 }),
      spacer,
    ],
    public: [b(8), gap(5), b(9, { w: 36 }), gap(5), b(34), spacer, b(10, { color: accent, r: 10 })],
    drawer: [
      b(8),
      gap(4),
      b(20),
      spacer,
      <View key="sheet" style={[styles.wireSheet, { backgroundColor: withAlpha(kit.primary, 0.7 * 0.35) }]} />,
    ],
    dialog: [
      b(8),
      spacer,
      <View key="dlg" style={[styles.wireDialog, { backgroundColor: kit.card }, elevation(3, colorMode)]}>
        {b(6)}
        {gap(3)}
        {b(6)}
        {spacer}
        {b(8, { color: accent })}
      </View>,
    ],
    kit: [b(8), gap(4), row(3, 6, 6), gap(4), b(22), gap(3), b(22), spacer, b(10, { color: accent })],
  };
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.phone, { backgroundColor: kit.card, borderColor: withAlpha(kit.textMuted, 0.5) }]}
    >
      {content[wire].map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </View>
  );
}

function TemplateCard({ t, onOpen }: { t: LayoutTemplate; onOpen: () => void }) {
  const { kit } = useKitTheme();
  return (
    <KitCard padding={0} onPress={onOpen} accessibilityLabel={`${t.title}. ${t.description}`}>
      <View style={[styles.preview, { backgroundColor: withAlpha(kit.hover, 0.6) }]}>
        <Wireframe wire={t.id} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Icon source={t.icon} size={20} color={kit.primary} />
          <Text style={[font('700', 16, 'heading'), styles.fill, { color: kit.textPrimary }]}>{t.title}</Text>
          <Icon source="mi:open-in-new" size={18} color={kit.textMuted} />
        </View>
        <Text style={[font('400', 12.5), styles.desc, { color: kit.textSecondary }]}>{t.description}</Text>
        <Text style={[font('400', 10.5, 'mono'), { color: kit.textMuted }]}>{t.file}</Text>
      </View>
    </KitCard>
  );
}

/** `/layouts` — gabarits d'écran complets : maquette schématique + exemple vivant. */
export default function LayoutsPage() {
  const [panel, setPanel] = useState(false);
  const [done, setDone] = useState([0, 1, 2]);

  const open = (t: LayoutTemplate) => {
    const o = t.open;
    if (o.kind === 'demo') router.push(`/layouts/${o.demo}` as never);
    else if (o.kind === 'panel') setPanel(true);
    else if (o.kind === 'gallery') router.navigate(`/components/${o.category}?section=${o.section}` as never);
    else router.navigate('/');
  };

  const sections: DocSection[] = [
    {
      id: 'layouts',
      title: `${LAYOUT_TEMPLATES.length} gabarits`,
      cols: 2,
      children: LAYOUT_TEMPLATES.map((t) => <TemplateCard key={t.id} t={t} onOpen={() => open(t)} />),
    },
  ];

  return (
    <>
      <DocPage
        title="Layouts"
        eyebrow="Gabarits"
        icon="mi:dashboard-customize"
        testID="layouts"
        subtitle="Les gabarits d’écran complets, adaptés au mobile. Chaque carte montre la structure schématique et ouvre un exemple vivant. Les briques (grilles, panneaux, conteneurs) sont dans Composants › Layout."
        sections={sections}
      />
      <SidePanel visible={panel} onDismiss={() => setPanel(false)} title="Tâches du jour" icon="mi:checklist">
        {DEMO_CLIENTS.slice(0, 8).map((c, i) => (
          <CheckboxTile
            key={c.id}
            value={done.includes(i)}
            onChange={(v) => setDone((d) => (v ? [...d, i] : d.filter((x) => x !== i)))}
            title={`Relancer ${c.raisonSociale}`}
          />
        ))}
      </SidePanel>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  selfCenter: { alignSelf: 'center' },
  preview: { height: 150, padding: space.s4, alignItems: 'center', justifyContent: 'center' },
  phone: { width: 66, aspectRatio: 74 / 130, borderRadius: radius.md, borderWidth: 2, padding: 5 },
  wireRow: { flexDirection: 'row', gap: 3 },
  wireSheet: { height: 60, borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
  wireDialog: { height: 70, borderRadius: radius.sm, padding: space.s1 },
  body: { padding: space.s4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  desc: { lineHeight: 18, marginTop: 6, marginBottom: 8 },
});
