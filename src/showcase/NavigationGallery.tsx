import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { FAB, Icon, Menu, TouchableRipple } from 'react-native-paper';

import {
  BadgedIcon,
  Breadcrumb,
  KitAppBar,
  KitAvatar,
  KitBottomSheet,
  KitButton,
  KitIconButton,
  KitNavigationBar,
  KitNavigationRail,
  KitPaginator,
  KitStepper,
  KitTabs,
  KitTextField,
  ModalDrawer,
  NavigationDrawerContent,
  PageHeader,
  RoundIconButton,
  Sidecar,
  StatusBadge,
  StepsIndicator,
} from '../components';
import { useKitSnack } from '../core/snack';
import { DEMO_CLIENTS, DEMO_MENU } from '../data/showcase';
import { font, space, useKitTheme } from '../theme';
import { Demo, DocPage, Gap, type DocSection } from './doc';

const menuLabel = (id: string) => {
  for (const m of DEMO_MENU) {
    if (m.id === id) return m.label;
    const ch = m.children?.find((c) => c.id === id);
    if (ch) return `${m.label} › ${ch.label}`;
  }
  return id;
};

/** `/components/navigation` — barres, tiroir / Sidecar, barre basse, onglets, fil d'Ariane, pagination, étapes, menus. */
export function NavigationGallery({ initialSection }: { initialSection?: string }) {
  const { kit, roles } = useKitTheme();
  const snack = useKitSnack();
  const [menu, setMenu] = useState('dashboard');
  const [nav, setNav] = useState(0);
  const [rail, setRail] = useState(0);
  const [page, setPage] = useState(3);
  const [pageSize, setPageSize] = useState(10);
  const [loaded, setLoaded] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const [step, setStep] = useState(1);
  const [vstep, setVstep] = useState(0);
  const [wizard, setWizard] = useState(1);
  const [searching, setSearching] = useState(false);
  const [sel, setSel] = useState(2);
  const [tab, setTab] = useState(0);
  const [tab2, setTab2] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(false);
  const [cascade, setCascade] = useState<'closed' | 'root' | 'data'>('closed');
  const [sheet, setSheet] = useState(false);
  const [scrollY] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const bar = (i: string, label: string, onPress?: () => void, color?: string) => (
    <KitIconButton
      icon={i}
      accessibilityLabel={label}
      iconColor={color ?? kit.textSecondary}
      onPress={onPress ?? (() => undefined)}
    />
  );
  const smallTitle = scrollY.interpolate({ inputRange: [40, 70], outputRange: [0, 1], extrapolate: 'clamp' });

  const sections: DocSection[] = [
    {
      id: 'header',
      title: 'Header (barre d’application)',
      source: 'KitAppBar · grand titre au défilement',
      description:
        'La toolbar sticky du shell devient l’AppBar : menu, titre, actions (thème, tâches, notifications, compte). Modes recherche et sélection contextuelle.',
      children: [
        <Demo key="shell" label="Barre du shell" flush>
          <KitAppBar
            leading={bar('mi:menu', 'Menu', undefined, kit.textPrimary)}
            title="Tableau de bord"
            actions={
              <>
                <TouchableRipple
                  borderless
                  onPress={() => undefined}
                  accessibilityRole="button"
                  accessibilityLabel="Tâches, 7"
                  style={styles.iconBtn}
                >
                  <BadgedIcon icon="mi:checklist" count={7} />
                </TouchableRipple>
                <TouchableRipple
                  borderless
                  onPress={() => undefined}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications, 3"
                  style={styles.iconBtn}
                >
                  <BadgedIcon icon="bell-outline" count={3} />
                </TouchableRipple>
                <View style={styles.mr12}>
                  <KitAvatar name="Jean Kouassi" size={32} />
                </View>
              </>
            }
          />
        </Demo>,
        <Demo key="search" label="Mode recherche" hint="touchez la loupe" flush>
          <KitAppBar
            leading={
              searching
                ? bar('mi:arrow-back', 'Fermer la recherche', () => setSearching(false), kit.textPrimary)
                : bar('mi:menu', 'Menu', undefined, kit.textPrimary)
            }
            title={
              searching ? (
                <TextInput
                  autoFocus
                  placeholder="Rechercher un client…"
                  placeholderTextColor={kit.textMuted}
                  selectionColor={kit.primary}
                  accessibilityLabel="Rechercher un client"
                  style={[font('400', 16), { color: kit.textPrimary }]}
                />
              ) : (
                'Clients'
              )
            }
            actions={
              <>
                {searching ? null : bar('mi:search', 'Rechercher', () => setSearching(true))}
                {bar('mi:more-vert', 'Plus d’options')}
              </>
            }
          />
        </Demo>,
        <Demo key="selection" label="Sélection contextuelle" flush>
          <KitAppBar
            background={kit.primaryLight}
            leading={bar('mi:close', 'Annuler la sélection', () => setSel(0), kit.textPrimary)}
            title={<Text style={[font('700', 18), styles.ml4, { color: kit.primary }]}>{`${sel} sélectionné(s)`}</Text>}
            actions={
              <>
                {bar('mi:archive', 'Archiver')}
                {bar('mi:delete-outline', 'Supprimer', undefined, kit.error)}
              </>
            }
          />
        </Demo>,
        <Demo key="large" label="Grand titre (défilement)" flush>
          <View style={styles.h260}>
            <KitAppBar
              leading={<View style={styles.w12} />}
              title={
                <Animated.Text style={[font('700', 20, 'heading'), { color: kit.textPrimary, opacity: smallTitle }]}>
                  Registre des clients
                </Animated.Text>
              }
              background={kit.bg}
              actions={bar('mi:filter-list', 'Filtrer')}
            />
            <Animated.ScrollView
              nestedScrollEnabled
              scrollEventThrottle={16}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
            >
              <Text accessibilityRole="header" style={[styles.largeTitle, { color: kit.textPrimary }]}>
                Registre des clients
              </Text>
              {DEMO_CLIENTS.slice(0, 12).map((x) => (
                <View key={x.id} style={styles.listRow}>
                  <KitAvatar name={x.raisonSociale} size={32} />
                  <Text style={[font('500', 14), { color: kit.textPrimary }]}>{x.raisonSociale}</Text>
                </View>
              ))}
            </Animated.ScrollView>
          </View>
        </Demo>,
      ],
    },
    {
      id: 'sidebar',
      title: 'Sidebar / drawer',
      source: 'Sidecar · NavigationDrawer · NavigationRail',
      description:
        'Sidecar : rail d’icônes + seconde colonne des sous-menus d’un module. En mobile il s’ouvre dans un tiroir ; sur tablette, le NavigationRail reste visible.',
      children: [
        <Demo key="sidecar" label="Sidecar" hint="touchez un module à chevron" flush>
          <View style={styles.h420}>
            <Sidecar items={DEMO_MENU} selected={menu} onSelect={(m) => setMenu(m.id)} />
            <View style={[styles.fill, styles.centerPad, { backgroundColor: kit.bg }]}>
              <Text
                style={[font('400', 14), styles.textCenter, { color: kit.textSecondary }]}
              >{`Page : ${menuLabel(menu)}`}</Text>
            </View>
          </View>
        </Demo>,
        <Demo key="drawer" label="Tiroir de navigation">
          <KitButton label="Ouvrir le tiroir" icon="mi:menu-open" variant="secondary" onPress={() => setDrawer(true)} />
        </Demo>,
        <Demo key="rail" label="NavigationRail (tablette)" flush>
          <View style={[styles.h420, styles.row]}>
            <KitNavigationRail
              selected={rail}
              onSelect={setRail}
              leading={<FAB icon="mi:add" size="small" accessibilityLabel="Ajouter" onPress={() => undefined} />}
              destinations={DEMO_MENU.slice(0, 4).map((m) => ({
                label: m.label.split(' ')[0] ?? m.label,
                icon: m.icon,
              }))}
            />
            <View style={[styles.fill, styles.centerPad]}>
              <Text style={[font('400', 14), { color: kit.textSecondary }]}>{DEMO_MENU[rail]?.label}</Text>
            </View>
          </View>
        </Demo>,
      ],
    },
    {
      id: 'navbar',
      title: 'Barre de navigation',
      source: 'KitNavigationBar · PageHeader',
      description:
        'La barre basse porte 3 à 5 destinations principales, à portée de pouce ; l’en-tête de page reprend titre, fil d’Ariane et actions.',
      children: [
        <Demo key="bar" label="Barre basse" flush>
          <KitNavigationBar
            selected={Math.min(nav, 3)}
            onSelect={setNav}
            destinations={[
              { label: 'Accueil', icon: 'view-dashboard-outline', selectedIcon: 'mi:dashboard' },
              { label: 'Clients', icon: 'account-multiple-outline', selectedIcon: 'mi:people' },
              { label: 'Interventions', icon: 'wrench-outline', selectedIcon: 'mi:build', badge: 4 },
              { label: 'Compte', icon: 'account-outline', selectedIcon: 'mi:person' },
            ]}
          />
        </Demo>,
        <Demo key="header" label="En-tête de page">
          <PageHeader
            breadcrumb="Service client"
            title="Requêtes clients"
            subtitle="42 requêtes ouvertes · 6 en retard"
            badge={<StatusBadge label="Live" tone="success" icon="mi:circle" />}
            actions={
              <>
                <RoundIconButton icon="mi:refresh" accessibilityLabel="Rafraîchir" onPress={() => undefined} />
                <KitButton
                  label="Nouvelle requête"
                  icon="mi:add"
                  size="create"
                  shape="rounded"
                  variant="raised"
                  onPress={() => undefined}
                />
              </>
            }
          />
        </Demo>,
      ],
    },
    {
      id: 'tabs',
      title: 'Tabs',
      source: 'KitTabs',
      cols: 2,
      children: [
        <Demo key="counts" label="Onglets avec compteurs" flush>
          <KitTabs
            tabs={[{ label: 'Infos' }, { label: 'Véhicules', count: 12 }, { label: 'Factures' }]}
            selected={tab}
            onSelect={setTab}
          />
          <View style={styles.tabPanel}>
            <Text style={[font('400', 14), { color: kit.textSecondary }]}>
              {['Coordonnées et contrat', '12 véhicules suivis', '3 factures en attente'][tab]}
            </Text>
          </View>
        </Demo>,
        <Demo key="icons" label="Défilants avec icônes" flush>
          <KitTabs
            tabs={DEMO_MENU.slice(0, 6).map((m) => ({ label: m.label.split(' ')[0] ?? m.label, icon: m.icon }))}
            selected={tab2}
            onSelect={setTab2}
          />
        </Demo>,
      ],
    },
    {
      id: 'breadcrumb',
      title: 'Breadcrumb',
      source: 'Breadcrumb',
      description: 'Défile horizontalement et reste calé sur la page courante quand il est long.',
      children: (
        <Demo label="Fil d’Ariane">
          <Gap>
            <Breadcrumb
              items={['Accueil', 'Clients', 'Transports Yao & Fils']}
              onPress={(i) => snack.show(`Retour niveau ${i}`)}
            />
            <Breadcrumb
              items={[
                'Accueil',
                'Finance',
                'Facturation',
                'Groupes de facturation',
                'Flotte Abidjan Sud',
                'Profil 2026',
              ]}
              separator="mi:arrow-right"
            />
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'pagination',
      title: 'Pagination',
      source: 'KitPaginator · chargement progressif',
      description:
        'Pages numérotées, version compacte, ou « charger plus » (préférable sur mobile pour les longues listes).',
      children: [
        <Demo key="full" label="Complète">
          <KitPaginator page={page} pageSize={pageSize} total={248} onPage={setPage} onPageSize={setPageSize} />
        </Demo>,
        <Demo key="compact" label="Compacte">
          <KitPaginator page={page} pageSize={pageSize} total={248} compact onPage={setPage} />
        </Demo>,
        <Demo key="more" label="Charger plus" flush>
          {DEMO_CLIENTS.slice(0, loaded).map((x) => (
            <View key={x.id} style={styles.denseRow}>
              <KitAvatar name={x.raisonSociale} size={30} />
              <View>
                <Text style={[font('500', 14), { color: kit.textPrimary }]}>{x.raisonSociale}</Text>
                <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{x.ville}</Text>
              </View>
            </View>
          ))}
          <View style={styles.pad12}>
            {loaded >= DEMO_CLIENTS.length ? (
              <Text style={[font('400', 12), { color: kit.textMuted }]}>Tous les clients sont affichés</Text>
            ) : (
              <KitButton
                label={`Charger plus (${DEMO_CLIENTS.length - loaded})`}
                loading={loadingMore}
                loadingLabel="Chargement…"
                variant="outline"
                expand
                onPress={() => {
                  setLoadingMore(true);
                  clearTimeout(timer.current);
                  timer.current = setTimeout(() => {
                    setLoadingMore(false);
                    setLoaded((l) => l + 6);
                  }, 700);
                }}
              />
            )}
          </View>
        </Demo>,
      ],
    },
    {
      id: 'stepper',
      title: 'Stepper',
      source: 'StepsIndicator · KitStepper',
      cols: 2,
      children: [
        <Demo key="wizard" label="Assistant (indicateur compact)">
          <Gap>
            <StepsIndicator
              steps={['Client', 'Véhicules', 'Offre', 'Validation']}
              current={wizard}
              onPress={setWizard}
            />
            <View style={styles.between}>
              <KitButton
                label="Précédent"
                variant="secondary"
                onPress={wizard === 0 ? undefined : () => setWizard(wizard - 1)}
              />
              <KitButton label="Suivant" onPress={wizard === 3 ? undefined : () => setWizard(wizard + 1)} />
            </View>
          </Gap>
        </Demo>,
        <Demo key="h" label="Stepper horizontal (M3)" flush>
          <KitStepper
            horizontal
            current={step}
            onChange={setStep}
            steps={[
              { label: 'Devis', content: <Text style={{ color: kit.textPrimary }}>Devis DEV-2026-118 validé.</Text> },
              {
                label: 'Pose',
                content: <Text style={{ color: kit.textPrimary }}>Installation planifiée le 24/10.</Text>,
              },
              { label: 'Recette', content: <Text style={{ color: kit.textPrimary }}>Contrôle du signal GPS.</Text> },
            ]}
          />
        </Demo>,
        <Demo key="v" label="Stepper vertical" flush>
          <KitStepper
            current={vstep}
            onChange={setVstep}
            steps={[
              {
                label: 'Informations client',
                subtitle: 'Raison sociale, contact',
                content: <KitTextField hint="Raison sociale" />,
              },
              { label: 'Véhicules', content: <KitTextField hint="Immatriculations" /> },
              {
                label: 'Confirmation',
                content: <Text style={{ color: kit.textPrimary }}>Vérifiez puis validez.</Text>,
              },
            ]}
          />
        </Demo>,
      ],
    },
    {
      id: 'menu',
      title: 'Menu',
      source: 'Menu · sous-menu · feuille d’actions',
      description: 'Sur mobile, les menus longs ou destructifs s’ouvrent de préférence en feuille basse.',
      cols: 3,
      children: [
        <Demo key="ctx" label="Menu contextuel">
          <Menu
            visible={ctxMenu}
            onDismiss={() => setCtxMenu(false)}
            contentStyle={{ backgroundColor: roles.surfaceContainer }}
            anchor={
              <KitIconButton
                icon="mi:more-vert"
                accessibilityLabel="Plus d’options"
                iconColor={kit.textSecondary}
                onPress={() => setCtxMenu(true)}
              />
            }
          >
            {(
              [
                ['Voir', 'mi:visibility'],
                ['Modifier', 'mi:edit'],
                ['Dupliquer', 'mi:content-copy'],
              ] as const
            ).map(([l, i]) => (
              <Menu.Item
                key={l}
                title={l}
                leadingIcon={i}
                onPress={() => {
                  setCtxMenu(false);
                  snack.show(l);
                }}
              />
            ))}
            <View style={[styles.menuDivider, { backgroundColor: kit.border }]} />
            <Menu.Item
              title="Supprimer"
              titleStyle={{ color: kit.error }}
              leadingIcon={({ size }) => <Icon source="mi:delete-outline" size={size} color={kit.error} />}
              onPress={() => {
                setCtxMenu(false);
                snack.show('Supprimer');
              }}
            />
          </Menu>
        </Demo>,
        <Demo key="cascade" label="Menu en cascade">
          <Menu
            visible={cascade !== 'closed'}
            onDismiss={() => setCascade('closed')}
            contentStyle={{ backgroundColor: roles.surfaceContainer }}
            anchor={
              <KitButton
                label="Exporter"
                icon="mi:file-download"
                variant="secondary"
                onPress={() => setCascade('root')}
              />
            }
          >
            {cascade === 'data' ? (
              <>
                <Menu.Item title="Données" leadingIcon="mi:arrow-back" onPress={() => setCascade('root')} />
                {(
                  [
                    ['Tableur (.xlsx)', 'Export XLSX'],
                    ['CSV', 'Export CSV'],
                  ] as const
                ).map(([l, a]) => (
                  <Menu.Item
                    key={l}
                    title={l}
                    onPress={() => {
                      setCascade('closed');
                      snack.demoAction(a);
                    }}
                  />
                ))}
              </>
            ) : (
              <>
                <Menu.Item
                  title="Données"
                  leadingIcon="mi:table-view"
                  trailingIcon="mi:chevron-right"
                  onPress={() => setCascade('data')}
                />
                <Menu.Item
                  title="PDF"
                  leadingIcon="mi:picture-as-pdf"
                  onPress={() => {
                    setCascade('closed');
                    snack.demoAction('Export PDF');
                  }}
                />
              </>
            )}
          </Menu>
        </Demo>,
        <Demo key="sheet" label="Feuille d’actions">
          <KitButton label="Actions" icon="mi:more-horiz" variant="outline" onPress={() => setSheet(true)} />
        </Demo>,
      ],
    },
  ];

  const actions: [string, string, boolean][] = [
    ['Partager', 'mi:share', false],
    ['Imprimer', 'mi:print', false],
    ['Archiver', 'mi:archive', false],
    ['Supprimer', 'mi:delete-outline', true],
  ];

  return (
    <View style={styles.fill}>
      <DocPage
        title="Navigation"
        icon="mi:explore"
        initialSection={initialSection}
        testID="category-navigation"
        subtitle="Éléments de navigation du shell adaptés au mobile : barres d’application, tiroir et Sidecar, barre de navigation basse, onglets, fil d’Ariane, pagination, étapes et menus."
        sections={sections}
      />
      <ModalDrawer visible={drawer} onDismiss={() => setDrawer(false)}>
        <NavigationDrawerContent
          header={<Text style={[font('700', 22, 'brand'), styles.brand, { color: kit.textPrimary }]}>Lookas</Text>}
          destinations={[
            ...DEMO_MENU.slice(0, 6).map((m) => ({ label: m.label, icon: m.icon })),
            { label: 'Paramètres', icon: 'cog-outline' },
          ]}
          selected={nav}
          onSelect={(i) => {
            setNav(i);
            setDrawer(false);
          }}
        />
      </ModalDrawer>
      <KitBottomSheet visible={sheet} onDismiss={() => setSheet(false)}>
        <View style={styles.sheet}>
          {actions.map(([l, i, danger]) => (
            <TouchableRipple key={l} onPress={() => setSheet(false)} accessibilityRole="button" style={styles.sheetRow}>
              <View style={styles.rowGap}>
                <Icon source={i} size={24} color={danger ? kit.error : kit.textSecondary} />
                <Text style={[font('500', 14), { color: danger ? kit.error : kit.textPrimary }]}>{l}</Text>
              </View>
            </TouchableRipple>
          ))}
        </View>
      </KitBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: space.s4 },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  textCenter: { textAlign: 'center' },
  centerPad: { alignItems: 'center', justifyContent: 'center', padding: space.s3 },
  ml4: { marginLeft: 4 },
  mr12: { marginRight: space.s3, marginLeft: space.s1 },
  w12: { width: space.s3 },
  pad12: { padding: space.s3 },
  iconBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  h260: { height: 260 },
  h420: { height: 420, flexDirection: 'row' },
  largeTitle: {
    ...font('400', 28, 'heading'),
    paddingHorizontal: space.s4,
    paddingTop: space.s3,
    paddingBottom: space.l,
  },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: space.s4, paddingHorizontal: space.s4, minHeight: 56 },
  denseRow: { flexDirection: 'row', alignItems: 'center', gap: space.s4, paddingHorizontal: space.s4, minHeight: 64 },
  tabPanel: { height: 120, alignItems: 'center', justifyContent: 'center' },
  menuDivider: { height: 1, marginVertical: space.s2 },
  brand: { paddingLeft: 16, paddingTop: space.s5, paddingBottom: space.s3 },
  sheet: { paddingBottom: space.s2 },
  sheetRow: { minHeight: 56, justifyContent: 'center', paddingHorizontal: space.l },
});
