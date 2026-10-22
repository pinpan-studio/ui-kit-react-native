import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Divider, Icon, TouchableRipple } from 'react-native-paper';

import {
  CommandPalette,
  CountDot,
  GestureArea,
  KeyCap,
  KitAvatar,
  KitButton,
  KitChip,
  KitTextField,
  KpiCard,
  LongPressMenu,
  NotificationCenter,
  Popover,
  RoundIconButton,
  Tour,
  TrendChip,
  type PaletteCommand,
  type TourStep,
} from '../components';
import { ago } from '../core/format';
import { useKitSnack } from '../core/snack';
import { DEMO_CLIENTS } from '../data/showcase';
import { font, radius, space, tabular, useKitTheme } from '../theme';
import { Demo, DemoWrap, DocPage, Gap, type DocSection } from './doc';
import { KIT_CATEGORIES } from './kitNav';

type ViewRef = ComponentRef<typeof View>;

const COMMANDS: PaletteCommand[] = [
  ...KIT_CATEGORIES.map((c) => ({
    label: c.label,
    icon: c.icon,
    group: 'Navigation',
    hint: 'Galerie de composants',
    keywords: c.description,
  })),
  { label: 'Nouveau client', icon: 'mi:person-add', group: 'Actions', shortcut: '⌘N' },
  { label: 'Nouvelle intervention', icon: 'mi:build', group: 'Actions', shortcut: '⌘I' },
  { label: 'Basculer le thème', icon: 'mi:dark-mode', group: 'Actions', shortcut: '⌘⇧L' },
  { label: 'Exporter la liste', icon: 'mi:download', group: 'Actions', shortcut: '⌘E' },
  ...DEMO_CLIENTS.slice(0, 6).map((x) => ({
    label: x.raisonSociale,
    icon: 'mi:business',
    group: 'Clients',
    hint: `${x.code} · ${x.ville}`,
  })),
];

const SHORTCUTS: [string, string][] = [
  ['⌘ K', 'Palette de commandes'],
  ['⌘ N', 'Nouveau client'],
  ['⌘ E', 'Exporter'],
  ['?', 'Aide des raccourcis'],
];

const GESTURES = ['Toucher', 'Double-toucher', 'Appui long', 'Balayage', 'Pincement', 'Tirer pour rafraîchir'];

const BREAKDOWN: [string, string][] = [
  ['Abonnements', '38,1 M'],
  ['Installations', '11,4 M'],
  ['Matériel', '6,3 M'],
];

const FILES = ['Contrat-cadre-2026.pdf', 'Photos installation', 'Relevé T3.xlsx', 'Rapport INT-0412.pdf'];

type FileAction = 'open' | 'star' | 'share' | 'delete';

const fileIcon = (f: string) =>
  f.endsWith('.pdf') ? 'mi:picture-as-pdf' : f.endsWith('.xlsx') ? 'mi:table-view' : 'mi:folder';

/** `/components/interactions` — palette de commandes, raccourcis & gestes, popover, visite guidée, notifications, menu contextuel. */
export function InteractionsGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [now] = useState(() => new Date());
  const [palette, setPalette] = useState(false);
  const [gesture, setGesture] = useState('Essayez un geste dans la zone ci-dessous');
  const [scale, setScale] = useState(1);
  const [unread, setUnread] = useState(3);
  const [touring, setTouring] = useState(false);
  const [files, setFiles] = useState(FILES);
  const [starred, setStarred] = useState<string[]>([]);
  const tSearch = useRef<ViewRef>(null);
  const tKpis = useRef<ViewRef>(null);
  const tAlerts = useRef<ViewRef>(null);
  const tCreate = useRef<ViewRef>(null);

  const tour: TourStep[] = [
    {
      target: tSearch,
      title: 'Recherche instantanée',
      text: 'Retrouvez un véhicule par immatriculation, chauffeur ou client.',
      icon: 'mi:search',
    },
    {
      target: tKpis,
      title: 'Indicateurs clés',
      text: 'Suivez l’état de la flotte d’un coup d’œil. Touchez une tuile pour le détail.',
      icon: 'mi:insights',
    },
    {
      target: tAlerts,
      title: 'Alertes',
      text: 'Les sorties de zone et excès de vitesse arrivent ici en temps réel.',
      icon: 'mi:notifications-active',
    },
    {
      target: tCreate,
      title: 'Créer une mission',
      text: 'Planifiez une intervention et assignez un technicien en deux étapes.',
      icon: 'mi:add-task',
    },
  ];

  const run = (cmd: PaletteCommand) => {
    setPalette(false);
    const cat = KIT_CATEGORIES.find((k) => k.label === cmd.label);
    if (cat) router.navigate(`/components/${cat.id}` as never);
    else snack.show(`« ${cmd.label} » exécuté (démo)`, { kind: 'info' });
  };

  const onFile = (f: string, action: FileAction) => {
    if (action === 'star') setStarred((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));
    else if (action === 'delete') {
      const i = files.indexOf(f);
      setFiles((all) => all.filter((x) => x !== f));
      snack.show(`« ${f} » supprimé`, {
        action: 'Annuler',
        onAction: () => setFiles((all) => [...all.slice(0, i), f, ...all.slice(i)]),
      });
    } else snack.demoAction(`${action === 'open' ? 'Ouverture de' : 'Partage de'} « ${f} »`);
  };

  const sections: DocSection[] = [
    {
      id: 'palette',
      title: 'Palette de commandes (⌘K)',
      source: 'CommandPalette',
      description:
        'Recherche floue sur les pages, actions et clients. Sur téléphone : feuille plein écran ouverte par la loupe ; avec un clavier : ⌘K / Ctrl+K.',
      children: (
        <Demo
          label="Ouvrir la palette"
          code="<CommandPalette visible={open} commands={commands} onRun={run} onDismiss={close} />"
        >
          <TouchableRipple
            borderless
            onPress={() => setPalette(true)}
            accessibilityRole="search"
            accessibilityLabel="Rechercher ou lancer une commande"
            style={[styles.paletteField, { backgroundColor: kit.fieldBg }]}
          >
            <View style={styles.paletteRow}>
              <Icon source="mi:search" size={20} color={kit.textSecondary} />
              <Text numberOfLines={1} style={[font('400', 14), styles.fill, { color: kit.textMuted }]}>
                Rechercher ou lancer une commande…
              </Text>
              <View style={[styles.kbd, { borderColor: kit.border }]}>
                <Text style={[font('400', 11, 'mono'), { color: kit.textMuted }]}>⌘K</Text>
              </View>
            </View>
          </TouchableRipple>
        </Demo>
      ),
    },
    {
      id: 'shortcuts',
      title: 'Raccourcis & gestes',
      source: 'KeyCap · GestureArea',
      description:
        'Les raccourcis clavier restent actifs sur tablette avec clavier ; sur téléphone, les gestes prennent le relais.',
      cols: 2,
      children: [
        <Demo key="keys" label="Clavier physique">
          {SHORTCUTS.map(([k, l]) => (
            <View key={k} style={styles.shortcut}>
              <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>{l}</Text>
              <View style={styles.keys}>
                {k.split(' ').map((key) => (
                  <KeyCap key={key} label={key} />
                ))}
              </View>
            </View>
          ))}
        </Demo>,
        <Demo key="gestures" label="Gestes tactiles">
          <Gap>
            <GestureArea
              onGesture={(label, s) => {
                setGesture(label);
                setScale(s);
              }}
              style={[styles.gestureZone, { backgroundColor: kit.primaryLight }]}
            >
              <View style={[styles.gestureContent, { transform: [{ scale }] }]}>
                <Icon source="mi:touch-app" size={36} color={kit.primary} />
                <Text style={[font('700', 14), styles.center, { color: kit.primary }]}>{gesture}</Text>
              </View>
            </GestureArea>
            <DemoWrap spacing={6}>
              {GESTURES.map((g) => (
                <KitChip key={g} label={g} />
              ))}
            </DemoWrap>
          </Gap>
        </Demo>,
      ],
    },
    {
      id: 'popover',
      title: 'Popover riche',
      source: 'Popover',
      description: 'Carte flottante ancrée (au-dessus ou au-dessous selon la place) ; toucher en dehors la ferme.',
      cols: 2,
      children: [
        <Demo key="profile" label="Carte de profil">
          <View style={styles.start}>
            <Popover
              accessibilityLabel="Profil de Koffi N’Guessan"
              content={(close) => (
                <View style={styles.popPad}>
                  <View style={styles.rowGap10}>
                    <KitAvatar name="Koffi N’Guessan" size={44} online />
                    <View style={styles.fill}>
                      <Text style={[font('700', 14), { color: kit.textPrimary }]}>Koffi N’Guessan</Text>
                      <Text style={[font('400', 12), { color: kit.textSecondary }]}>Technicien · Abidjan Sud</Text>
                    </View>
                  </View>
                  <View style={[styles.rowGap6, styles.mt10]}>
                    <Icon source="mi:phone" size={16} color={kit.textSecondary} />
                    <Text style={[font('400', 12.5), { color: kit.textPrimary }]}>+225 07 22 31 44 58</Text>
                  </View>
                  <View style={[styles.rowGap6, styles.mt4]}>
                    <Icon source="mi:task-alt" size={16} color={kit.textSecondary} />
                    <Text style={[font('400', 12.5), { color: kit.textPrimary }]}>4 interventions aujourd’hui</Text>
                  </View>
                  <View style={[styles.rowGap8, styles.mt10]}>
                    <View style={styles.fill}>
                      <KitButton label="Appeler" variant="outline" size="compact" expand onPress={close} />
                    </View>
                    <View style={styles.fill}>
                      <KitButton label="Assigner" size="compact" expand onPress={close} />
                    </View>
                  </View>
                </View>
              )}
            >
              <View style={[styles.personChip, { backgroundColor: kit.fieldBg }]}>
                <KitAvatar name="Koffi N’Guessan" size={24} />
                <Text style={[font('500', 14), { color: kit.textPrimary }]}>Koffi N’Guessan</Text>
              </View>
            </Popover>
          </View>
        </Demo>,
        <Demo key="kpi" label="Aperçu d’indicateur">
          <Popover
            width={240}
            style={styles.kpiAnchor}
            accessibilityLabel="Détail du CA du mois"
            content={() => (
              <View style={styles.popPad}>
                <Text style={[font('400', 12), { color: kit.textSecondary }]}>CA d’octobre</Text>
                <Text style={[font('700', 22, 'heading'), { color: kit.textPrimary }]}>55,8 M FCFA</Text>
                <View style={styles.start}>
                  <TrendChip text="+9,2 % vs septembre" up />
                </View>
                <Divider style={styles.divider} />
                {BREAKDOWN.map(([l, v]) => (
                  <View key={l} style={styles.breakdown}>
                    <Text style={[font('400', 12.5), styles.fill, { color: kit.textPrimary }]}>{l}</Text>
                    <Text style={[font('700', 12.5), tabular, { color: kit.textPrimary }]}>{v}</Text>
                  </View>
                ))}
              </View>
            )}
          >
            <KpiCard icon="mi:payments" value="55,8" unit="M" label="CA du mois" tone="success" />
          </Popover>
        </Demo>,
      ],
    },
    {
      id: 'tour',
      title: 'Visite guidée / onboarding',
      source: 'Tour (TourStep[])',
      description:
        'Projecteur percé dans un voile, bulle positionnée selon la place disponible, navigation et progression.',
      children: (
        <Demo label="Mini-tableau de bord">
          <Gap>
            <View ref={tSearch} collapsable={false}>
              <KitTextField
                hint="Rechercher un véhicule…"
                icon="mi:search"
                accessibilityLabel="Rechercher un véhicule"
              />
            </View>
            <View ref={tKpis} collapsable={false} style={styles.rowGap10}>
              <View style={styles.fill}>
                <KpiCard icon="mi:local-shipping" value="42" label="Actifs" tone="primary" />
              </View>
              <View style={styles.fill}>
                <KpiCard icon="mi:speed" value={`96${' '}%`} label="Dispo." tone="success" />
              </View>
            </View>
            <View style={styles.between}>
              <View ref={tAlerts} collapsable={false}>
                <RoundIconButton
                  icon="mi:notifications-none"
                  accessibilityLabel={`Alertes, ${unread} non lues`}
                  onPress={() => snack.demoAction('Ouverture des alertes')}
                />
                {unread > 0 ? (
                  <View pointerEvents="none" style={styles.badge}>
                    <CountDot count={unread} />
                  </View>
                ) : null}
              </View>
              <View ref={tCreate} collapsable={false}>
                <KitButton label="Mission" icon="mi:add" onPress={() => snack.demoAction('Nouvelle mission')} />
              </View>
            </View>
            <KitButton
              label="Lancer la visite"
              icon="mi:play-circle-outline"
              variant="tonal"
              expand
              onPress={() => setTouring(true)}
            />
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'notifications',
      title: 'Centre de notifications',
      source: 'NotificationCenter',
      description: 'Filtres par catégorie, non lues, « tout marquer lu », balayage pour supprimer, toucher pour lire.',
      children: (
        <Demo label="Boîte de réception" hint={`${unread} non lue(s)`}>
          <NotificationCenter onUnreadChange={setUnread} />
        </Demo>
      ),
    },
    {
      id: 'context-menu',
      title: 'Menu contextuel',
      source: 'LongPressMenu',
      description: 'Appui long sur un élément : menu positionné sous le doigt, avec retour haptique.',
      children: (
        <Demo label="Documents" flush>
          {files.map((f) => {
            const star = starred.includes(f);
            return (
              <LongPressMenu<FileAction>
                key={f}
                accessibilityLabel={f}
                onSelect={(a) => onFile(f, a)}
                items={[
                  { value: 'open', label: 'Ouvrir', icon: 'mi:open-in-new' },
                  {
                    value: 'star',
                    label: star ? 'Retirer des favoris' : 'Ajouter aux favoris',
                    icon: star ? 'mi:star' : 'mi:star-border',
                  },
                  { value: 'share', label: 'Partager', icon: 'mi:share' },
                  'divider',
                  { value: 'delete', label: 'Supprimer', icon: 'mi:delete-outline', danger: true },
                ]}
              >
                <View style={styles.fileRow}>
                  <Icon source={fileIcon(f)} size={24} color={kit.primary} />
                  <View style={styles.fill}>
                    <Text numberOfLines={1} style={[font('500', 14), { color: kit.textPrimary }]}>
                      {f}
                    </Text>
                    <Text numberOfLines={1} style={[font('400', 12.5), { color: kit.textSecondary }]}>
                      {`Modifié ${ago(new Date(now.getTime() - f.length * 3600000), now)} · appui long pour le menu`}
                    </Text>
                  </View>
                  {star ? <Icon source="mi:star" size={24} color={kit.warning} /> : null}
                </View>
              </LongPressMenu>
            );
          })}
        </Demo>
      ),
    },
  ];

  return (
    <View style={styles.fill}>
      <DocPage
        title="Interactions"
        icon="mi:touch-app"
        initialSection={initialSection}
        testID="category-interactions"
        subtitle="Ce qui rend une application « finie » : palette de commandes, raccourcis (clavier physique) et gestes tactiles, popovers riches, visite guidée, centre de notifications et menus contextuels à l’appui long."
        sections={sections}
      />
      <CommandPalette visible={palette} onDismiss={() => setPalette(false)} commands={COMMANDS} onRun={run} />
      <Tour steps={tour} visible={touring} onClose={() => setTouring(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { textAlign: 'center' },
  start: { alignSelf: 'flex-start' },
  paletteField: { height: 46, borderRadius: radius.full, paddingHorizontal: space.s4, justifyContent: 'center' },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  kbd: { borderWidth: 1, borderRadius: 5, paddingHorizontal: space.s2, paddingVertical: 2 },
  shortcut: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  keys: { flexDirection: 'row', gap: space.s1 },
  gestureZone: { height: 150, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  gestureContent: { alignItems: 'center', gap: 6, paddingHorizontal: space.m },
  popPad: { padding: space.s4 },
  rowGap6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowGap8: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowGap10: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mt4: { marginTop: 4 },
  mt10: { marginTop: 10 },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: space.s3,
    minHeight: 32,
  },
  divider: { marginVertical: 9 },
  kpiAnchor: { width: 200 },
  breakdown: { flexDirection: 'row', paddingVertical: 2 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { position: 'absolute', top: 2, right: 2 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    minHeight: 72,
    paddingHorizontal: space.m,
    paddingVertical: space.s2,
  },
});
