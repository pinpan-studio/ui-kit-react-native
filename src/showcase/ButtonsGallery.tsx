import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, FAB, Icon, Menu, SegmentedButtons, TouchableRipple } from 'react-native-paper';

import {
  FilterChipButton,
  KitAvatar,
  KitButton,
  KitChip,
  KitIconButton,
  LineAction,
  PageHeader,
  RoundIconButton,
  SegmentedToggle,
  SplitButton,
  ViewModeToggle,
  type KitButtonVariant,
  type ViewMode,
} from '../components';
import { useKitSnack } from '../core/snack';
import { font, space, useKitTheme, type KitTone } from '../theme';
import { Demo, DemoWrap, DocPage, Gap, type DocSection } from './doc';

const VARIANTS: [string, KitButtonVariant][] = [
  ['Primary', 'primary'],
  ['Raised', 'raised'],
  ['Secondary', 'secondary'],
  ['Outline', 'outline'],
  ['Ghost', 'ghost'],
  ['Danger', 'danger'],
  ['Danger outline', 'dangerOutline'],
  ['Success', 'success'],
  ['Tertiary', 'tertiary'],
];

const FILTERS: [string, string, number, KitTone][] = [
  ['all', 'Tous', 48, 'primary'],
  ['ok', 'Actifs', 31, 'success'],
  ['plan', 'Planifiés', 6, 'warning'],
  ['out', 'Désinstallés', 4, 'error'],
];

const noop = () => undefined;

/** `/components/buttons` — variantes, états, icônes, actions de page, segmentés, menus, FAB, tailles. */
export function ButtonsGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [loading, setLoading] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('card');
  const [period, setPeriod] = useState('month');
  const [tab, setTab] = useState('mois');
  const [range, setRange] = useState('day');
  const [chip, setChip] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const simulate = (key: string) => {
    setLoading(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(null), 1600);
  };
  const tap = (what: string) => snack.show(what);

  const sections: DocSection[] = [
    {
      id: 'variants',
      title: 'Variantes',
      source: 'KitButton variant=…',
      description:
        'Primary = flat primaire ; Secondary = contour primaire ; Outline = contour neutre ; Ghost = texte ; Danger = warn. « Success » dérive des jetons success.',
      children: [
        <Demo
          key="all"
          label="Toutes les variantes"
          code={`<KitButton label="Primary" onPress={save} />
<KitButton label="Secondary" variant="secondary" onPress={…} />
<KitButton label="Danger" variant="danger" onPress={…} />`}
        >
          <DemoWrap>
            {VARIANTS.map(([l, v]) => (
              <KitButton key={v} label={l} variant={v} onPress={() => tap(l)} />
            ))}
          </DemoWrap>
        </Demo>,
        <Demo key="icons" label="Avec icône (icône + texte)">
          <DemoWrap>
            <KitButton label="Enregistrer" icon="mi:save" onPress={() => tap('Enregistré')} />
            <KitButton label="Modifier" icon="mi:edit" variant="secondary" onPress={noop} />
            <KitButton label="Exporter" icon="mi:file-download" variant="outline" onPress={noop} />
            <KitButton label="Voir" icon="mi:visibility" variant="ghost" onPress={noop} />
            <KitButton label="Supprimer" icon="mi:delete" variant="dangerOutline" onPress={noop} />
            <KitButton label="Valider" icon="mi:check-circle" variant="success" onPress={noop} />
            <KitButton label="Fiche produit" iconEnd="mi:arrow-forward" variant="ghost" onPress={noop} />
          </DemoWrap>
        </Demo>,
      ],
    },
    {
      id: 'states',
      title: 'États',
      description: 'Désactivé, chargement (indicateur intégré — touchez pour simuler), pleine largeur.',
      cols: 2,
      children: [
        <Demo key="disabled" label="Disabled">
          <DemoWrap>
            <KitButton label="Primary" />
            <KitButton label="Outline" variant="outline" />
            <KitButton label="Ghost" variant="ghost" />
            <KitIconButton icon="mi:delete" accessibilityLabel="Supprimer" disabled />
          </DemoWrap>
        </Demo>,
        <Demo
          key="loading"
          label="Loading"
          hint="touchez"
          code={`<KitButton
  label="Enregistrer"
  loadingLabel="Enregistrement…"
  icon="mi:save"
  loading={saving}
  onPress={save}
/>`}
        >
          <DemoWrap>
            <KitButton
              label="Enregistrer"
              loadingLabel="Enregistrement…"
              icon="mi:save"
              loading={loading === 'save'}
              onPress={() => simulate('save')}
            />
            <KitButton
              label="Synchroniser"
              icon="mi:sync"
              variant="secondary"
              loading={loading === 'sync'}
              onPress={() => simulate('sync')}
            />
            <SpinningRefresh spinning={loading === 'refresh'} onPress={() => simulate('refresh')} />
          </DemoWrap>
        </Demo>,
        <Demo key="expand" label="Pleine largeur (dialogs, auth)">
          <Gap>
            <KitButton label="Accepter et continuer" expand onPress={noop} />
            <KitButton label="Connectez-vous par e-mail" variant="secondary" expand onPress={noop} />
          </Gap>
        </Demo>,
        <Demo key="google" label="Connexion Google">
          <KitButton label="Se connecter avec Google" icon="mi:login" variant="raised" onPress={noop} />
        </Demo>,
      ],
    },
    {
      id: 'icon',
      title: 'Icon buttons',
      source: 'KitIconButton · RoundIconButton',
      cols: 3,
      children: [
        <Demo
          key="icon"
          label="Icon button"
          code={`<KitIconButton icon="mi:edit" accessibilityLabel="Modifier" onPress={edit} />`}
        >
          <DemoWrap>
            <KitIconButton icon="mi:edit" accessibilityLabel="Modifier" iconColor={kit.textSecondary} onPress={noop} />
            <KitIconButton icon="mi:add-circle" accessibilityLabel="Ajouter" iconColor={kit.primary} onPress={noop} />
            <KitIconButton icon="mi:delete" accessibilityLabel="Supprimer" iconColor={kit.error} onPress={noop} />
            <KitIconButton icon="mi:more-vert" accessibilityLabel="Options" mode="contained-tonal" onPress={noop} />
          </DemoWrap>
        </Demo>,
        <Demo key="refresh" label="refresh-btn">
          <DemoWrap>
            <RoundIconButton icon="mi:refresh" accessibilityLabel="Rafraîchir" onPress={noop} />
            <RoundIconButton icon="mi:tune" accessibilityLabel="Filtres" onPress={noop} />
            <RoundIconButton icon="mi:file-download" accessibilityLabel="Exporter" onPress={noop} />
            <RoundIconButton icon="mi:filter-alt" accessibilityLabel="Filtre actif" active onPress={noop} />
          </DemoWrap>
        </Demo>,
        <Demo key="toolbar" label="Toolbar (shell)">
          <View style={styles.row}>
            <KitIconButton icon="mi:menu" accessibilityLabel="Menu" iconColor={kit.textSecondary} onPress={noop} />
            <View style={styles.flex} />
            <KitIconButton
              icon="mi:dark-mode"
              accessibilityLabel="Mode sombre"
              iconColor={kit.textSecondary}
              onPress={noop}
            />
            <BadgedIcon icon="mi:checklist" count={7} label="Tâches" />
            <BadgedIcon icon="bell-outline" count={3} label="Notifications" />
            <KitAvatar name="Jean Kouassi" size={32} />
          </View>
        </Demo>,
      ],
    },
    {
      id: 'header',
      title: 'Actions de page',
      source: 'PageHeader actions={…}',
      description:
        'Groupe d’actions des pages liste : bascule cartes/liste, rafraîchir, créer, suppression groupée. Sur mobile, il passe sous le titre et revient à la ligne.',
      children: [
        <Demo
          key="list"
          label="En-tête de liste"
          code={`<PageHeader
  breadcrumb="Catalogue"
  title="Produits"
  actions={<>
    <ViewModeToggle mode={mode} onChange={setMode} />
    <RoundIconButton icon="mi:refresh" accessibilityLabel="Rafraîchir" onPress={reload} />
    <KitButton label="Nouveau produit" icon="mi:add" variant="raised"
      size="create" shape="rounded" onPress={create} />
  </>}
/>`}
        >
          <PageHeader
            breadcrumb="Catalogue"
            title="Produits"
            subtitle="128 produits référencés"
            actions={
              <>
                <ViewModeToggle mode={view} onChange={setView} />
                <RoundIconButton icon="mi:refresh" accessibilityLabel="Rafraîchir" onPress={noop} />
                <KitButton
                  label="Nouveau produit"
                  icon="mi:add"
                  variant="raised"
                  size="create"
                  shape="rounded"
                  onPress={() => snack.demoAction('Création')}
                />
                <KitButton
                  label="(3)"
                  icon="mi:delete"
                  variant="dangerOutline"
                  accessibilityLabel="Supprimer 3 éléments"
                  onPress={noop}
                />
              </>
            }
          />
        </Demo>,
        <Demo key="detail" label="En-tête de fiche (détail)">
          <View style={[styles.row, styles.gap6]}>
            <KitIconButton
              icon="mi:arrow-back"
              accessibilityLabel="Retour"
              iconColor={kit.textSecondary}
              onPress={noop}
            />
            <View style={styles.flex} />
            <KitIconButton icon="mi:edit" accessibilityLabel="Modifier" mode="outlined" onPress={noop} />
            <KitIconButton
              icon="mi:delete"
              accessibilityLabel="Supprimer"
              mode="outlined"
              iconColor={kit.error}
              onPress={noop}
            />
            <KitButton label="Envoyer" icon="mi:send" onPress={noop} />
          </View>
        </Demo>,
      ],
    },
    {
      id: 'segmented',
      title: 'Segmentés & toggles',
      source: 'SegmentedToggle · SegmentedButtons · FilterChipButton',
      cols: 3,
      children: [
        <Demo
          key="toggle"
          label="m3-filter-toggle"
          code={`<SegmentedToggle
  value={period}
  onChange={setPeriod}
  options={[
    { value: 'month', label: 'Mois' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Année' },
  ]}
/>`}
        >
          <SegmentedToggle
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'month', label: 'Mois' },
              { value: 'quarter', label: 'Trimestre' },
              { value: 'year', label: 'Année' },
            ]}
          />
        </Demo>,
        <Demo key="tabs" label="chart-tab-toggles">
          <DemoWrap spacing={space.s2}>
            {(
              [
                ['mois', 'Mois'],
                ['trim', 'Trimestre'],
                ['annee', 'Année'],
              ] as const
            ).map(([k, l]) => (
              <KitChip key={k} label={l} selected={tab === k} check={false} onPress={() => setTab(k)} />
            ))}
          </DemoWrap>
        </Demo>,
        <Demo key="view" label="ViewModeToggle">
          <DemoWrap spacing={12}>
            <ViewModeToggle mode={view} onChange={setView} />
            <Text style={[font('400', 12), { color: kit.textMuted }]}>{`mode = ${view}`}</Text>
          </DemoWrap>
        </Demo>,
        <Demo key="chips" label="Chips de filtre" hint=".filter-chip">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {FILTERS.map(([k, l, n, tone]) => (
              <FilterChipButton
                key={k}
                label={l}
                count={n}
                tone={tone}
                active={chip === k}
                onPress={() => setChip(k)}
              />
            ))}
          </ScrollView>
        </Demo>,
        <Demo key="m3" label="SegmentedButtons (M3)">
          <SegmentedButtons
            value={range}
            onValueChange={setRange}
            buttons={[
              { value: 'day', label: 'Jour' },
              { value: 'week', label: 'Semaine' },
              { value: 'month', label: 'Mois' },
            ]}
          />
        </Demo>,
        <Demo key="line" label="Lien d’action (.line-action)">
          <LineAction label="Voir l’historique" onPress={noop} />
        </Demo>,
      ],
    },
    {
      id: 'menu',
      title: 'Menu & split',
      source: 'Menu · SplitButton',
      cols: 2,
      children: [
        <Demo
          key="menu"
          label="Bouton menu"
          code={`<Menu
  visible={open}
  onDismiss={close}
  anchor={<KitButton label="Exporter" icon="mi:file-download"
    iconEnd="mi:expand-more" variant="outline" onPress={openMenu} />}
>
  <Menu.Item leadingIcon="mi:table-view" title="Excel" onPress={…} />
  <Menu.Item leadingIcon="mi:picture-as-pdf" title="PDF" onPress={…} />
</Menu>`}
        >
          <Menu
            visible={menuOpen}
            onDismiss={() => setMenuOpen(false)}
            anchor={
              <KitButton
                label="Exporter"
                icon="mi:file-download"
                iconEnd="mi:expand-more"
                variant="outline"
                onPress={() => setMenuOpen(true)}
              />
            }
          >
            {(
              [
                ['Excel', 'mi:table-view'],
                ['PDF', 'mi:picture-as-pdf'],
              ] as const
            ).map(([l, i]) => (
              <Menu.Item
                key={l}
                leadingIcon={i}
                title={l}
                onPress={() => {
                  setMenuOpen(false);
                  snack.demoAction(`Export ${l}`);
                }}
              />
            ))}
            <Menu.Item
              leadingIcon={({ size }) => <Icon source="mi:delete" size={size} color={kit.error} />}
              title="Supprimer"
              titleStyle={{ color: kit.error }}
              onPress={() => {
                setMenuOpen(false);
                snack.show('Supprimé (démo)', { kind: 'error' });
              }}
            />
          </Menu>
        </Demo>,
        <Demo key="split" label="Split button">
          <SplitButton
            label="Envoyer"
            icon="mi:send"
            onPress={() => snack.show('Envoyé (démo)', { kind: 'success' })}
            items={[
              { label: 'Programmer l’envoi', icon: 'mi:schedule-send' },
              { label: 'Enregistrer en brouillon', icon: 'mi:drafts' },
            ]}
            onSelect={(v) => snack.show(v)}
          />
        </Demo>,
      ],
    },
    {
      id: 'fab',
      title: 'FAB',
      source: 'FAB',
      description:
        'Sur mobile, le FAB porte l’action principale de l’écran (création), en bas à droite au-dessus de la barre de navigation.',
      cols: 2,
      children: [
        <Demo key="fab" label="FAB">
          <DemoWrap spacing={16}>
            <FAB icon="mi:add" accessibilityLabel="Ajouter" onPress={noop} />
            <FAB icon="mi:edit" size="small" accessibilityLabel="Modifier" onPress={noop} />
            <FAB icon="mi:add" label="Nouvelle mission" onPress={noop} />
          </DemoWrap>
        </Demo>,
        <Demo key="main" label="Bouton d’action principale (shell)" hint=".action-main-btn">
          <KitButton label="Action rapide" icon="mi:bolt" variant="secondary" onPress={noop} />
        </Demo>,
      ],
    },
    {
      id: 'sizes',
      title: 'Tailles & formes',
      description:
        'Hauteurs : compact 32, standard 40, create 42, large 48. Rayons : pilule (radius-button), 10 px (create-btn).',
      cols: 2,
      children: [
        <Demo key="heights" label="Hauteurs">
          <DemoWrap>
            <KitButton label="Compact" size="compact" onPress={noop} />
            <KitButton label="Standard" onPress={noop} />
            <KitButton label="create-btn" size="create" shape="rounded" variant="raised" onPress={noop} />
            <KitButton label="Large" size="large" onPress={noop} />
          </DemoWrap>
        </Demo>,
        <Demo key="shapes" label="Formes">
          <DemoWrap>
            <KitButton label="Pilule (M3)" onPress={noop} />
            <KitButton label="Rayon 10 px" shape="rounded" variant="raised" onPress={noop} />
            <KitButton label="Contour arrondi" variant="secondary" onPress={noop} />
          </DemoWrap>
        </Demo>,
      ],
    },
  ];

  return (
    <DocPage
      title="Boutons"
      icon="mi:smart-button"
      initialSection={initialSection}
      testID="category-buttons"
      subtitle="Boutons Material 3 du projet (bouton plein primaire majoritaire, bouton « create » des en-têtes de liste, contour, warn) et variantes maison (refresh, toggles segmentés, chips de filtre). Cibles tactiles ≥ 48 dp."
      sections={sections}
    />
  );
}

/** Bouton d'icône avec pastille de compteur M3 (`Badge` Flutter). */
function BadgedIcon({ icon, count, label }: { icon: string; count: number; label: string }) {
  const { kit } = useKitTheme();
  return (
    <View>
      <KitIconButton
        icon={icon}
        accessibilityLabel={`${label}, ${count}`}
        iconColor={kit.textSecondary}
        onPress={noop}
      />
      <Badge size={16} style={styles.badge}>
        {count}
      </Badge>
    </View>
  );
}

/** `refresh-btn` dont l'icône tourne pendant le chargement. */
function SpinningRefresh({ spinning, onPress }: { spinning: boolean; onPress: () => void }) {
  const { kit } = useKitTheme();
  const [turn] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!spinning) {
      turn.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(turn, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spinning, turn]);
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel="Rafraîchir"
      accessibilityState={{ busy: spinning }}
      style={[styles.refresh, { backgroundColor: kit.card, borderColor: kit.border }]}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon source="mi:refresh" size={20} color={kit.textSecondary} />
      </Animated.View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  gap6: { gap: 6 },
  chips: { gap: space.s2 },
  badge: { position: 'absolute', top: 6, right: 6 },
  refresh: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
