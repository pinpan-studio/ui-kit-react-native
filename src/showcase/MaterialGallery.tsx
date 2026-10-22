import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import {
  DemoArt,
  DragArea,
  Draggable,
  DropTarget,
  ExpansionTile,
  KitBottomSheet,
  KitButton,
  KitCard,
  KitIconButton,
  KitProgressBar,
  ReorderList,
  SheetHeader,
  StatusBadge,
  TagInput,
  TreeView,
} from '../components';
import { date, number, time } from '../core/format';
import { useKitSnack } from '../core/snack';
import { DEMO_CLIENTS, FILES_TREE, VILLES } from '../data/showcase';
import {
  breakpoints,
  elevation,
  font,
  kitText,
  radius,
  space,
  toneColor,
  toneLight,
  toneText,
  useKitTheme,
  withAlpha,
  type KitTone,
} from '../theme';
import { BLACK, WHITE } from '../theme/swatches';
import { Demo, DocPage, type DocSection } from './doc';

const PANELS: [string, string, string][] = [
  ['Informations client', 'mi:business', 'Transports Yao & Fils · CLI-1040 · Abidjan, Yopougon'],
  ['Contrat', 'mi:description', 'Premium — Flotte · 24 véhicules · échéance 28/02/2027'],
  ['Facturation', 'mi:receipt-long', 'Virement à 30 jours · 1 250 000 FCFA / mois'],
];

const FAQ: [string, string][] = [
  [
    'Comment réinitialiser une balise ?',
    'Envoyez la commande « cpureset » depuis la fiche équipement, ou coupez l’alimentation 30 s.',
  ],
  ['Quelle est la précision GPS ?', 'Entre 2 et 5 m en zone dégagée ; jusqu’à 15 m en milieu urbain dense.'],
  ['Puis-je exporter l’historique ?', 'Oui, au format XLSX ou CSV depuis l’onglet Trajets (90 jours glissants).'],
];

const SUGGESTIONS = ['Abidjan', 'Bouaké', 'Poids lourds', 'Utilitaires', 'Premium', 'Essentiel', 'Impayés'];

const SHARE: [string, string, KitTone][] = [
  ['E-mail', 'mi:mail', 'info'],
  ['WhatsApp', 'mi:chat', 'success'],
  ['SMS', 'mi:sms', 'warning'],
  ['Lien', 'mi:link', 'purple'],
  ['Imprimer', 'mi:print', 'neutral'],
];

const ROW = 52;
const VIRTUAL_COUNT = 10000;
const VIRTUAL_HEIGHT = 280;
const VIRTUAL_START = new Date(2026, 9, 15).getTime();

const SHEET_BOX = 220;

type Lane = 'todo' | 'done';

/** `/components/material` — accordéon, arbre, glisser-déposer, puces, cartes, grille, feuille basse, liste virtualisée, ondulation. */
export function MaterialGallery({ initialSection }: { initialSection?: string }) {
  const { kit, roles, colorMode } = useKitTheme();
  const snack = useKitSnack();
  const { width } = useWindowDimensions();
  const [panel, setPanel] = useState<number | null>(0);
  const [treeSel, setTreeSel] = useState<{ id: string; label: string } | null>(null);
  const [order, setOrder] = useState([
    'Vérifier l’alimentation 12 V',
    'Fixer le boîtier',
    'Brancher le relais',
    'Positionner l’antenne',
    'Tester la remontée GPS',
  ]);
  const [lanes, setLanes] = useState<Record<Lane, string[]>>({
    todo: ['Balise CI-4521-AB', 'Sonde carburant SOTRA', 'Caméra Actros'],
    done: ['Firmware 12 balises'],
  });
  const [chips, setChips] = useState(['Abidjan', 'Poids lourds', 'Premium']);
  const [share, setShare] = useState(false);
  const [sheetRatio, setSheetRatio] = useState(0.35);
  const sheetStart = useRef({ y: 0, ratio: 0 });
  const [offset, setOffset] = useState(0);
  const [virtualTap, setVirtualTap] = useState(-1);

  const move = (item: string, to: Lane) =>
    setLanes((l) => {
      const from: Lane = to === 'todo' ? 'done' : 'todo';
      return { ...l, [from]: l[from].filter((x) => x !== item), [to]: [...l[to], item] };
    });

  const lane = (key: Lane, title: string, tone: KitTone) => {
    const items = lanes[key];
    const other: Lane = key === 'todo' ? 'done' : 'todo';
    return (
      <DropTarget
        id={key}
        accepts={(d) => typeof d === 'string' && !items.includes(d)}
        onDrop={(d) => move(String(d), key)}
        style={styles.fill}
      >
        {(hovering) => (
          <View
            style={[
              styles.lane,
              {
                backgroundColor: hovering ? toneLight(tone, kit) : withAlpha(kit.hover, 0.5),
                borderColor: hovering ? toneColor(tone, kit) : 'transparent',
              },
            ]}
          >
            <Text style={[font('700', 12.5), { color: toneText(tone, kit) }]}>{`${title} (${items.length})`}</Text>
            {items.map((it) => (
              <Draggable
                key={it}
                data={it}
                width={150}
                accessibilityLabel={it}
                accessibilityActions={[
                  { name: 'move', label: `Déplacer vers ${other === 'done' ? 'Terminé' : 'À faire'}` },
                ]}
                onAccessibilityAction={() => move(it, other)}
                ghost={
                  <View style={[styles.laneCard, { backgroundColor: kit.card }]}>
                    <Text style={[font('400', 12.5), { color: kit.textPrimary }]}>{it}</Text>
                  </View>
                }
              >
                <View style={[styles.laneCard, { backgroundColor: kit.card }]}>
                  <Text style={[font('400', 12.5), { color: kit.textPrimary }]}>{it}</Text>
                </View>
              </Draggable>
            ))}
          </View>
        )}
      </DropTarget>
    );
  };

  const gridCols = width >= breakpoints.tablet ? 4 : 2;
  const first = Math.max(0, Math.floor(offset / ROW) - 4);
  const last = Math.min(VIRTUAL_COUNT, Math.ceil((offset + VIRTUAL_HEIGHT) / ROW) + 4);
  const visible = Array.from({ length: last - first }, (_, k) => first + k);

  const sections: DocSection[] = [
    {
      id: 'accordion',
      title: 'Accordion / Expansion panel',
      source: 'ExpansionTile',
      cols: 2,
      children: [
        <Demo key="radio" label="Panneau unique ouvert" flush>
          {PANELS.map(([t, ic, body], i) => (
            <ExpansionTile
              key={t}
              title={t}
              icon={ic}
              divider={i > 0}
              expanded={panel === i}
              onToggle={(open) => setPanel(open ? i : null)}
            >
              <Text style={[font('400', 14), { color: kit.textSecondary }]}>{body}</Text>
            </ExpansionTile>
          ))}
        </Demo>,
        <Demo key="faq" label="FAQ (multiples)" flush>
          {FAQ.map(([q, a]) => (
            <ExpansionTile key={q} title={q}>
              <Text style={[font('400', 14), { color: kit.textSecondary }]}>{a}</Text>
            </ExpansionTile>
          ))}
        </Demo>,
      ],
    },
    {
      id: 'tree',
      title: 'Tree',
      source: 'TreeView (TreeNodeData)',
      children: (
        <Demo label="Explorateur de fichiers" hint={treeSel?.label} flush>
          <TreeView
            nodes={FILES_TREE}
            initiallyOpen={['src', 'app']}
            selected={treeSel?.id}
            onSelect={(n) => setTreeSel({ id: n.id, label: n.label })}
          />
        </Demo>
      ),
    },
    {
      id: 'drag-drop',
      title: 'Drag & drop',
      source: 'ReorderList · Draggable / DropTarget',
      description: 'Réordonner avec la poignée ; déplacer une carte entre deux listes par appui long.',
      cols: 2,
      children: [
        <Demo key="reorder" label="Réordonner (checklist de pose)" flush>
          <ReorderList
            items={order}
            onReorder={(from, to) =>
              setOrder((o) => {
                const next = [...o];
                const [it] = next.splice(from, 1);
                if (it !== undefined) next.splice(to, 0, it);
                return next;
              })
            }
            renderItem={(t, i) => (
              <View style={styles.reorderItem}>
                <View style={[styles.stepDot, { backgroundColor: kit.primaryLight }]}>
                  <Text style={[font('700', 12), { color: kit.primary }]}>{i + 1}</Text>
                </View>
                <Text numberOfLines={1} style={[font('500', 14), styles.fill, { color: kit.textPrimary }]}>
                  {t}
                </Text>
              </View>
            )}
          />
        </Demo>,
        <Demo key="lanes" label="Entre deux listes">
          <DragArea style={styles.lanes}>
            {lane('todo', 'À faire', 'warning')}
            {lane('done', 'Terminé', 'success')}
          </DragArea>
        </Demo>,
      ],
    },
    {
      id: 'chips-input',
      title: 'Chips input',
      source: 'TagInput · InputChip',
      children: (
        <Demo label="Critères de segmentation">
          <TagInput tags={chips} suggestions={SUGGESTIONS} onChange={setChips} />
        </Demo>
      ),
    },
    {
      id: 'card',
      title: 'Card',
      source: 'KitCard (elevated · média · outlined)',
      cols: 3,
      children: [
        <Demo key="elevated" label="Elevated" muted>
          <KitCard shadow padding={0}>
            <View style={styles.tile}>
              <Icon source="mi:local-shipping" size={24} color={kit.textSecondary} />
              <View style={styles.fill}>
                <Text style={[font('500', 14), { color: kit.textPrimary }]}>Toyota Hilux</Text>
                <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>CI-1024-AB</Text>
              </View>
              <KitIconButton
                icon="mi:more-vert"
                accessibilityLabel="Options"
                onPress={() => snack.demoAction('Options du véhicule')}
              />
            </View>
          </KitCard>
        </Demo>,
        <Demo key="media" label="Média + actions">
          <KitCard padding={0}>
            <View style={styles.media}>
              <DemoArt seed={0} label="Dépôt de Koumassi" />
            </View>
            <View style={styles.mediaText}>
              <Text style={[font('500', 14), { color: kit.textPrimary }]}>Dépôt de Koumassi</Text>
              <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>12 véhicules · 3 techniciens</Text>
            </View>
            <View style={styles.actions}>
              <KitButton label="Itinéraire" variant="ghost" onPress={() => snack.demoAction('Itinéraire')} />
              <KitButton label="Détails" variant="ghost" onPress={() => snack.demoAction('Détails du dépôt')} />
            </View>
          </KitCard>
        </Demo>,
        <Demo key="outlined" label="Outlined">
          <KitCard borderColor={kit.border}>
            <Text style={[font('700', 11), styles.overline, { color: kit.textMuted }]}>ABONNEMENT</Text>
            <Text style={[kitText.cardTitle, styles.mt4, { color: kit.textPrimary }]}>Premium — Flotte</Text>
            <View style={styles.mt6}>
              <KitProgressBar value={0.62} />
            </View>
            <Text style={[font('400', 12), styles.mt4, { color: kit.textSecondary }]}>62 % de la période écoulée</Text>
          </KitCard>
        </Demo>,
      ],
    },
    {
      id: 'grid-list',
      title: 'Grid list',
      source: 'ResponsiveGrid + tuile',
      children: (
        <Demo label="Sites clients">
          <View style={styles.grid}>
            {VILLES.slice(0, 6).map((v, i) => (
              <View
                key={v}
                style={[styles.gridTile, { width: `${100 / gridCols}%` }]}
                accessible
                accessibilityLabel={`${v}, ${3 + i * 2} sites`}
              >
                <View style={styles.gridInner}>
                  <DemoArt seed={i} />
                  <View style={[styles.gridBar, { backgroundColor: withAlpha(BLACK, 0.45) }]}>
                    <View style={styles.fill}>
                      <Text numberOfLines={1} style={[font('400', 16), { color: WHITE }]}>
                        {v}
                      </Text>
                      <Text style={[font('400', 12), { color: WHITE }]}>{`${3 + i * 2} sites`}</Text>
                    </View>
                    <Icon source="mi:chevron-right" size={24} color={WHITE} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Demo>
      ),
    },
    {
      id: 'bottom-sheet',
      title: 'Bottom sheet',
      source: 'KitBottomSheet',
      cols: 2,
      children: [
        <Demo key="modal" label="Partage">
          <View style={styles.start}>
            <KitButton label="Partager" icon="mi:share" variant="tonal" onPress={() => setShare(true)} />
          </View>
        </Demo>,
        <Demo key="persistent" label="Feuille persistante (aperçu)" flush>
          <View style={styles.sheetBox}>
            <DemoArt seed={5} />
            <View
              style={[
                styles.inlineSheet,
                elevation(3, colorMode),
                { height: SHEET_BOX * sheetRatio, backgroundColor: roles.surfaceContainerLow },
              ]}
            >
              <View
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel="Hauteur de la feuille"
                accessibilityValue={{ text: `${Math.round(sheetRatio * 100)} %` }}
                accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                onAccessibilityAction={(e) =>
                  setSheetRatio((r) => (e.nativeEvent.actionName === 'increment' ? 0.95 : r > 0.35 ? 0.35 : 0.2))
                }
                onStartShouldSetResponder={() => true}
                onResponderTerminationRequest={() => false}
                onResponderGrant={(e) => {
                  sheetStart.current = { y: e.nativeEvent.pageY, ratio: sheetRatio };
                }}
                onResponderMove={(e) => {
                  const dy = e.nativeEvent.pageY - sheetStart.current.y;
                  setSheetRatio(Math.min(0.95, Math.max(0.2, sheetStart.current.ratio - dy / SHEET_BOX)));
                }}
                style={styles.grab}
              >
                <View style={[styles.grabber, { backgroundColor: kit.textMuted }]} />
              </View>
              <ScrollView nestedScrollEnabled contentContainerStyle={styles.sheetContent}>
                <Text style={[font('700', 14), { color: kit.textPrimary }]}>8 véhicules à proximité</Text>
                {DEMO_CLIENTS.slice(0, 6).map((x) => (
                  <View key={x.id} style={styles.denseRow}>
                    <Icon source="truck-outline" size={22} color={kit.textSecondary} />
                    <Text numberOfLines={1} style={[font('500', 14), styles.fill, { color: kit.textPrimary }]}>
                      {x.raisonSociale}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Demo>,
      ],
    },
    {
      id: 'virtual-scroll',
      title: 'Virtual scroll',
      source: 'fenêtrage manuel (hauteur de ligne fixe)',
      description: '10 000 positions GPS : seules les lignes visibles sont construites.',
      children: (
        <Demo label="10 000 lignes" hint={virtualTap < 0 ? undefined : `ligne ${number(virtualTap + 1)}`} flush>
          <ScrollView
            nestedScrollEnabled
            style={styles.virtual}
            scrollEventThrottle={16}
            onScroll={(e) => setOffset(e.nativeEvent.contentOffset.y)}
          >
            <View style={{ height: VIRTUAL_COUNT * ROW }}>
              {visible.map((i) => {
                const t = new Date(VIRTUAL_START + i * 30000);
                const speed = (i * 37) % 95;
                const tone: KitTone = speed > 80 ? 'error' : speed === 0 ? 'neutral' : 'success';
                return (
                  <TouchableRipple
                    key={i}
                    onPress={() => setVirtualTap(i)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: i === virtualTap }}
                    style={[
                      styles.virtualRow,
                      { top: i * ROW },
                      i === virtualTap && { backgroundColor: kit.primaryLight },
                    ]}
                  >
                    <>
                      <Text style={[font('400', 11, 'mono'), styles.virtualIdx, { color: kit.textMuted }]}>
                        {`#${number(i + 1)}`}
                      </Text>
                      <View style={styles.fill}>
                        <Text
                          style={[
                            font('400', 12.5, 'mono'),
                            { color: i === virtualTap ? kit.primary : kit.textPrimary },
                          ]}
                        >
                          {`${(5.3 + (i % 97) / 1000).toFixed(4)}, ${(-4.01 - (i % 89) / 1000).toFixed(4)}`}
                        </Text>
                        <Text style={[font('400', 12), { color: kit.textSecondary }]}>
                          {`${date(t)} à ${time(t.getHours(), t.getMinutes())}`}
                        </Text>
                      </View>
                      <StatusBadge label={`${speed} km/h`} tone={tone} uppercase={false} />
                    </>
                  </TouchableRipple>
                );
              })}
            </View>
          </ScrollView>
        </Demo>
      ),
    },
    {
      id: 'ripple',
      title: 'Ripple',
      source: 'TouchableRipple',
      cols: 3,
      children: [
        <Demo key="primary" label="Ondulation primaire">
          <TouchableRipple
            onPress={() => undefined}
            rippleColor={withAlpha(kit.primary, 0.25)}
            accessibilityRole="button"
            style={[styles.rippleBox, { backgroundColor: kit.primaryLight }]}
          >
            <Text style={[font('700', 14), { color: kit.primary }]}>Touchez-moi</Text>
          </TouchableRipple>
        </Demo>,
        <Demo key="centered" label="Ondulation centrée">
          <View style={styles.centerItems}>
            <TouchableRipple
              onPress={() => undefined}
              borderless
              rippleColor={withAlpha(kit.tertiary, 0.3)}
              accessibilityRole="button"
              accessibilityLabel="Empreinte"
              style={[styles.rippleCircle, { backgroundColor: kit.tertiaryLight }]}
            >
              <Icon source="mi:fingerprint" size={40} color={kit.tertiary} />
            </TouchableRipple>
          </View>
        </Demo>,
        <Demo key="unbounded" label="Sans limite (unbounded)">
          <View style={styles.unbounded}>
            <TouchableRipple
              onPress={() => undefined}
              borderless
              rippleColor={withAlpha(kit.error, 0.2)}
              accessibilityRole="button"
              accessibilityLabel="J’aime"
              style={styles.unboundedHit}
            >
              <Icon source="mi:favorite" size={36} color={kit.error} />
            </TouchableRipple>
          </View>
        </Demo>,
      ],
    },
  ];

  return (
    <View style={styles.fill}>
      <DocPage
        title="Material"
        icon="mi:extension"
        initialSection={initialSection}
        testID="category-material"
        subtitle="Composants Material habillés aux couleurs du kit : accordéon, arbre, glisser-déposer, saisie de puces, cartes, grille, feuille basse, liste virtualisée et effet d’ondulation — tous interactifs, données locales."
        sections={sections}
      />
      <KitBottomSheet visible={share} onDismiss={() => setShare(false)}>
        <SheetHeader title="Partager le rapport" />
        <View style={styles.shareRow}>
          {SHARE.map(([l, ic, tone]) => (
            <TouchableRipple
              key={l}
              borderless
              onPress={() => {
                setShare(false);
                snack.demoAction(`Partage par ${l}`);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Partager par ${l}`}
              style={styles.shareItem}
            >
              <>
                <View style={[styles.shareDisc, { backgroundColor: toneLight(tone, kit) }]}>
                  <Icon source={ic} size={24} color={toneColor(tone, kit)} />
                </View>
                <Text style={[font('400', 12), { color: kit.textPrimary }]}>{l}</Text>
              </>
            </TouchableRipple>
          ))}
        </View>
      </KitBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  start: { alignSelf: 'flex-start' },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  reorderItem: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingLeft: space.m },
  stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  lanes: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  lane: { minHeight: 160, padding: space.s2, borderRadius: radius.md, borderWidth: 1.5, gap: space.s2 },
  laneCard: { padding: space.s3, borderRadius: radius.md },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingLeft: space.m,
    paddingRight: space.s1,
    minHeight: 72,
  },
  media: { height: 110 },
  mediaText: { paddingHorizontal: space.m, paddingVertical: space.s3 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.s2, padding: space.s2 },
  overline: { letterSpacing: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -4 },
  gridTile: { aspectRatio: 1, padding: 4 },
  gridInner: { flex: 1, borderRadius: radius.md, overflow: 'hidden' },
  gridBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.m,
    paddingVertical: 6,
  },
  sheetBox: { height: SHEET_BOX, overflow: 'hidden' },
  inlineSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  grab: { height: 24, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 32, height: 4, borderRadius: 2 },
  sheetContent: { paddingHorizontal: space.s4, paddingBottom: space.s4 },
  denseRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 40 },
  virtual: { height: VIRTUAL_HEIGHT },
  virtualRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ROW,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingHorizontal: space.m,
  },
  virtualIdx: { minWidth: 48 },
  rippleBox: { height: 90, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  centerItems: { alignItems: 'center' },
  rippleCircle: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  unbounded: { height: 90, alignItems: 'center', justifyContent: 'center' },
  unboundedHit: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  shareRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    rowGap: 16,
    paddingHorizontal: space.s4,
    paddingBottom: space.s4,
  },
  shareItem: { alignItems: 'center', gap: 6 },
  shareDisc: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
