import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Badge, Chip, FAB, Menu, Portal, SegmentedButtons, Snackbar, Text } from 'react-native-paper';

import {
  FilterChipButton,
  KitButton,
  LineAction,
  PageHeader,
  RoundIconButton,
  SegmentedToggle,
  SplitButton,
  ViewModeToggle,
  type KitButtonVariant,
  type KitTone,
  type ViewMode,
} from '../../components/buttons';
import { hapticToggle, KitIconButton } from '../../mobile';
import { MIN_TOUCH, space } from '../../theme/tokens';
import { useKitTheme } from '../../theme/useKitTheme';
import { Demo, DemoWrap, DocPage } from '../doc/DocPage';

const VARIANTS: readonly [string, KitButtonVariant][] = [
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

const CHIPS: readonly [string, string, number, KitTone][] = [
  ['all', 'Tous', 48, 'primary'],
  ['ok', 'Actifs', 31, 'success'],
  ['plan', 'Planifiés', 6, 'warning'],
  ['out', 'Désinstallés', 4, 'error'],
];

/** `/components/buttons` — même découpage et ordre de sections que buttons_gallery.dart. */
export function ButtonsGallery({ initialSection }: { initialSection?: string }) {
  const theme = useKitTheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('card');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [tab, setTab] = useState('mois');
  const [range, setRange] = useState('day');
  const [chip, setChip] = useState('all');
  const [menu, setMenu] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const simulate = (key: string) => {
    setLoading(key);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(null), 1600);
  };
  const tap = (what: string) => setSnack(what);

  return (
    <>
      <DocPage
        testID="buttons-gallery"
        title="Boutons"
        subtitle="Boutons Material 3 du projet (bouton plein primaire majoritaire, bouton « create » des en-têtes de liste, contour, danger) et variantes maison (rafraîchir, bascules segmentées, chips de filtre). Cibles tactiles ≥ 48 dp."
        initialSection={initialSection}
        sections={[
          {
            id: 'variants',
            title: 'Variantes',
            source: '<KitButton variant="…" />',
            description:
              'Primary = plein primaire ; Secondary = contour primaire ; Outline = contour neutre ; Ghost = texte ; Danger = rôle M3 error. « Success » dérive des jetons success.',
            children: (
              <>
                <Demo label="Toutes les variantes">
                  <DemoWrap>
                    {VARIANTS.map(([l, v]) => (
                      <KitButton key={v} testID={`btn-${v}`} label={l} variant={v} onPress={() => tap(l)} />
                    ))}
                  </DemoWrap>
                </Demo>
                <Demo label="Avec icône (Icon + Text)">
                  <DemoWrap>
                    <KitButton label="Enregistrer" icon="content-save" onPress={() => tap('Enregistré')} />
                    <KitButton label="Modifier" icon="pencil" variant="secondary" onPress={() => undefined} />
                    <KitButton label="Exporter" icon="download" variant="outline" onPress={() => undefined} />
                    <KitButton label="Voir" icon="eye" variant="ghost" onPress={() => undefined} />
                    <KitButton label="Supprimer" icon="delete" variant="dangerOutline" onPress={() => undefined} />
                    <KitButton label="Valider" icon="check-circle" variant="success" onPress={() => undefined} />
                    <KitButton label="Fiche produit" iconEnd="arrow-right" variant="ghost" onPress={() => undefined} />
                  </DemoWrap>
                </Demo>
              </>
            ),
          },
          {
            id: 'states',
            title: 'États',
            description: 'Désactivé, chargement (indicateur intégré — touchez pour simuler), pleine largeur.',
            children: (
              <>
                <Demo label="Disabled">
                  <DemoWrap>
                    <KitButton testID="btn-disabled-primary" label="Primary" />
                    <KitButton label="Outline" variant="outline" />
                    <KitButton label="Ghost" variant="ghost" />
                    <KitIconButton icon="delete" accessibilityLabel="Supprimer (désactivé)" disabled />
                  </DemoWrap>
                </Demo>
                <Demo label="Loading" hint="touchez">
                  <DemoWrap>
                    <KitButton
                      testID="btn-save"
                      label="Enregistrer"
                      loadingLabel="Enregistrement…"
                      icon="content-save"
                      loading={loading === 'save'}
                      onPress={() => simulate('save')}
                    />
                    <KitButton
                      label="Synchroniser"
                      icon="sync"
                      variant="secondary"
                      loading={loading === 'sync'}
                      onPress={() => simulate('sync')}
                    />
                    <SpinningRefresh spinning={loading === 'refresh'} onPress={() => simulate('refresh')} />
                  </DemoWrap>
                </Demo>
                <Demo label="Pleine largeur (dialogues, authentification)">
                  <View style={styles.gap}>
                    <KitButton label="Accepter et continuer" expand onPress={() => undefined} />
                    <KitButton label="Connectez-vous par e-mail" variant="secondary" expand onPress={() => undefined} />
                  </View>
                </Demo>
                <Demo label="Connexion Google">
                  <KitButton
                    label="Se connecter avec Google"
                    icon="google"
                    variant="raised"
                    onPress={() => undefined}
                  />
                </Demo>
              </>
            ),
          },
          {
            id: 'icon',
            title: 'Icon buttons',
            source: 'KitIconButton · RoundIconButton',
            children: (
              <>
                <Demo label="Icon button">
                  <DemoWrap>
                    <KitIconButton icon="pencil" accessibilityLabel="Modifier" onPress={() => undefined} />
                    <KitIconButton
                      icon="plus-circle"
                      iconColor={theme.colors.primary}
                      accessibilityLabel="Ajouter"
                      onPress={() => undefined}
                    />
                    <KitIconButton
                      icon="delete"
                      iconColor={theme.colors.error}
                      accessibilityLabel="Supprimer"
                      onPress={() => undefined}
                    />
                    <KitIconButton
                      icon="dots-vertical"
                      mode="contained-tonal"
                      accessibilityLabel="Options"
                      onPress={() => undefined}
                    />
                  </DemoWrap>
                </Demo>
                <Demo label="refresh-btn">
                  <DemoWrap>
                    <RoundIconButton icon="refresh" label="Rafraîchir" onPress={() => undefined} />
                    <RoundIconButton icon="tune" label="Filtres" onPress={() => undefined} />
                    <RoundIconButton icon="download" label="Exporter" onPress={() => undefined} />
                    <RoundIconButton icon="filter" label="Filtre actif" active onPress={() => undefined} />
                  </DemoWrap>
                </Demo>
                <Demo label="Toolbar (shell)">
                  <View style={styles.toolbar}>
                    <KitIconButton icon="menu" accessibilityLabel="Menu" onPress={() => undefined} />
                    <View style={styles.flex} />
                    <KitIconButton icon="weather-night" accessibilityLabel="Mode sombre" onPress={() => undefined} />
                    <BadgeIcon icon="checkbox-marked-outline" count={7} label="7 tâches" />
                    <BadgeIcon icon="bell-outline" count={3} label="3 notifications" />
                    <Avatar.Text size={32} label="JK" accessibilityLabel="Jean Kouassi" />
                  </View>
                </Demo>
              </>
            ),
          },
          {
            id: 'header',
            title: 'Actions de page',
            source: '<PageHeader actions={…} />',
            description:
              'Groupe d’actions des pages liste : bascule cartes/liste, rafraîchir, créer, suppression groupée. Sur mobile, il passe sous le titre et revient à la ligne.',
            children: (
              <>
                <Demo label="En-tête de liste">
                  <PageHeader
                    breadcrumb="Catalogue"
                    title="Produits"
                    subtitle="128 produits référencés"
                    actions={
                      <>
                        <ViewModeToggle mode={view} onChange={setView} />
                        <RoundIconButton icon="refresh" label="Rafraîchir" onPress={() => undefined} />
                        <KitButton
                          label="Nouveau produit"
                          icon="plus"
                          variant="raised"
                          size="create"
                          shape="rounded"
                          onPress={() => tap('Création')}
                        />
                        <KitButton
                          label="(3)"
                          accessibilityLabel="Supprimer 3 éléments"
                          icon="delete"
                          variant="dangerOutline"
                          onPress={() => undefined}
                        />
                      </>
                    }
                  />
                </Demo>
                <Demo label="En-tête de fiche (détail)">
                  <View style={styles.toolbar}>
                    <KitIconButton icon="arrow-left" accessibilityLabel="Retour" onPress={() => undefined} />
                    <View style={styles.flex} />
                    <KitIconButton
                      icon="pencil"
                      mode="outlined"
                      accessibilityLabel="Modifier"
                      onPress={() => undefined}
                    />
                    <KitIconButton
                      icon="delete"
                      mode="outlined"
                      iconColor={theme.colors.error}
                      accessibilityLabel="Supprimer"
                      onPress={() => undefined}
                    />
                    <KitButton label="Envoyer" icon="send" onPress={() => undefined} />
                  </View>
                </Demo>
              </>
            ),
          },
          {
            id: 'segmented',
            title: 'Segmentés & toggles',
            source: 'SegmentedToggle · SegmentedButtons · FilterChipButton',
            children: (
              <>
                <Demo label="m3-filter-toggle">
                  <SegmentedToggle
                    value={period}
                    onChange={setPeriod}
                    accessibilityLabel="Période"
                    options={[
                      { value: 'month', label: 'Mois' },
                      { value: 'quarter', label: 'Trimestre' },
                      { value: 'year', label: 'Année' },
                    ]}
                  />
                </Demo>
                <Demo label="chart-tab-toggles">
                  <DemoWrap>
                    {[
                      ['mois', 'Mois'],
                      ['trim', 'Trimestre'],
                      ['annee', 'Année'],
                    ].map(([k, l]) => (
                      <Chip
                        key={k}
                        selected={tab === k}
                        showSelectedCheck={false}
                        style={styles.chip}
                        onPress={() => {
                          hapticToggle();
                          setTab(k ?? 'mois');
                        }}
                      >
                        {l}
                      </Chip>
                    ))}
                  </DemoWrap>
                </Demo>
                <Demo label="ViewModeToggle">
                  <DemoWrap gap={12}>
                    <ViewModeToggle mode={view} onChange={setView} />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      mode = {view}
                    </Text>
                  </DemoWrap>
                </Demo>
                <Demo label="Chips de filtre" hint=".filter-chip">
                  <DemoWrap>
                    {CHIPS.map(([k, l, n, t]) => (
                      <FilterChipButton
                        key={k}
                        label={l}
                        count={n}
                        tone={t}
                        active={chip === k}
                        onPress={() => setChip(k)}
                      />
                    ))}
                  </DemoWrap>
                </Demo>
                <Demo label="SegmentedButton (M3)">
                  <SegmentedButtons
                    value={range}
                    onValueChange={(v) => {
                      hapticToggle();
                      setRange(v);
                    }}
                    buttons={[
                      { value: 'day', label: 'Jour', style: styles.seg },
                      { value: 'week', label: 'Semaine', style: styles.seg },
                      { value: 'month', label: 'Mois', style: styles.seg },
                    ]}
                  />
                </Demo>
                <Demo label="Lien d’action (.line-action)">
                  <LineAction label="Voir l’historique" onPress={() => undefined} />
                </Demo>
              </>
            ),
          },
          {
            id: 'menu',
            title: 'Menu & split',
            source: 'Menu · SplitButton',
            children: (
              <>
                <Demo label="Bouton menu">
                  <Menu
                    visible={menu}
                    onDismiss={() => setMenu(false)}
                    anchor={
                      <KitButton
                        label="Exporter"
                        icon="download"
                        iconEnd="chevron-down"
                        variant="outline"
                        onPress={() => setMenu(true)}
                      />
                    }
                  >
                    {['Excel', 'PDF'].map((v) => (
                      <Menu.Item
                        key={v}
                        leadingIcon={v === 'PDF' ? 'file-pdf-box' : 'table'}
                        title={v}
                        onPress={() => {
                          setMenu(false);
                          tap(`Export ${v}`);
                        }}
                      />
                    ))}
                    <Menu.Item
                      leadingIcon="delete"
                      title="Supprimer"
                      titleStyle={{ color: theme.colors.error }}
                      onPress={() => {
                        setMenu(false);
                        tap('Supprimé (démo)');
                      }}
                    />
                  </Menu>
                </Demo>
                <Demo label="Split button">
                  <SplitButton
                    label="Envoyer"
                    icon="send"
                    onPress={() => tap('Envoyé (démo)')}
                    items={[
                      { label: 'Programmer l’envoi', icon: 'send-clock' },
                      { label: 'Enregistrer en brouillon', icon: 'email-edit-outline' },
                    ]}
                    onSelect={tap}
                  />
                </Demo>
              </>
            ),
          },
          {
            id: 'fab',
            title: 'FAB',
            source: 'FAB (react-native-paper)',
            description:
              'Sur mobile, le FAB porte l’action principale de l’écran (création), en bas à droite au-dessus de la barre de navigation.',
            children: (
              <>
                <Demo label="FAB">
                  <DemoWrap gap={16}>
                    <FAB icon="plus" accessibilityLabel="Ajouter" onPress={() => undefined} />
                    <FAB icon="pencil" size="small" accessibilityLabel="Modifier" onPress={() => undefined} />
                    <FAB icon="plus" label="Nouvelle mission" onPress={() => undefined} />
                  </DemoWrap>
                </Demo>
                <Demo label="Bouton d’action principale (shell)" hint=".action-main-btn">
                  <KitButton
                    label="Action rapide"
                    icon="lightning-bolt"
                    variant="secondary"
                    onPress={() => undefined}
                  />
                </Demo>
              </>
            ),
          },
          {
            id: 'sizes',
            title: 'Tailles & formes',
            description:
              'Hauteurs : compact 32, standard 40, create 42, large 48 (zone tactile toujours ≥ 48 dp). Rayons : pilule, 10 dp (create-btn).',
            children: (
              <>
                <Demo label="Hauteurs">
                  <DemoWrap>
                    <KitButton label="Compact" size="compact" onPress={() => undefined} />
                    <KitButton label="Standard" onPress={() => undefined} />
                    <KitButton
                      label="create-btn"
                      size="create"
                      shape="rounded"
                      variant="raised"
                      onPress={() => undefined}
                    />
                    <KitButton label="Large" size="large" onPress={() => undefined} />
                  </DemoWrap>
                </Demo>
                <Demo label="Formes">
                  <DemoWrap>
                    <KitButton label="Pilule (M3)" onPress={() => undefined} />
                    <KitButton label="Rayon 10 dp" shape="rounded" variant="raised" onPress={() => undefined} />
                    <KitButton label="Contour arrondi" variant="secondary" onPress={() => undefined} />
                  </DemoWrap>
                </Demo>
              </>
            ),
          },
        ]}
      />
      <Portal>
        <Snackbar visible={snack !== null} onDismiss={() => setSnack(null)} duration={2500}>
          {snack ?? ''}
        </Snackbar>
      </Portal>
    </>
  );
}

function BadgeIcon({
  icon,
  count,
  label,
}: {
  icon: 'bell-outline' | 'checkbox-marked-outline';
  count: number;
  label: string;
}) {
  return (
    <View>
      <KitIconButton icon={icon} accessibilityLabel={label} onPress={() => undefined} />
      <Badge size={16} style={styles.badge} accessible={false}>
        {count}
      </Badge>
    </View>
  );
}

/** Bouton rafraîchir qui tourne pendant le chargement (`_SpinningRefresh`). */
function SpinningRefresh({ spinning, onPress }: { spinning: boolean; onPress: () => void }) {
  const theme = useKitTheme();
  const [rot] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!spinning) {
      rot.stopAnimation();
      rot.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spinning, rot]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel="Rafraîchir"
      accessibilityState={{ busy: spinning }}
      style={[styles.refresh, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.onSurfaceVariant} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gap: { gap: space.s3 },
  flex: { flex: 1 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: space.s1, flexWrap: 'wrap' },
  chip: { minHeight: MIN_TOUCH - 8, justifyContent: 'center' },
  seg: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  badge: { position: 'absolute', top: 6, right: 6 },
  refresh: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
