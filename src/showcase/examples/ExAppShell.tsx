import { router } from 'expo-router';
import { useState, type ComponentType } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Divider, Icon, Menu, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BadgedIcon, KitAvatar, KitIconButton, KitTextField, ModalDrawer, SidePanel } from '../../components';
import { useKitSnack } from '../../core/snack';
import { CHAT_CONVERSATIONS, CURRENT_USER } from '../../data/examples';
import { useBackClose } from '../../mobile';
import { useThemeStore } from '../../store/themeStore';
import { breakpoints, font, radius, space, useKitTheme } from '../../theme';
import { ExampleForm } from '../ExampleForms';
import { ChatExample, ChatPanel, FeedExample, InboxExample } from './AppComms';
import { ArticleExample, BlogExample, DocsExample } from './AppContent';
import { ClientDetailExample, ClientsExample } from './AppCrm';
import { DashboardExample } from './AppDashboard';
import {
  BoardExample,
  CatalogExample,
  FilesColumnsExample,
  FilesExample,
  ModulesExample,
  MonitoringExample,
} from './AppOps';
import { SettingsExample } from './AppSettings';
import { ExNavContext, ExPage } from './ExKit';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  page: ComponentType;
  badge?: number;
  /** Titre et fil d'Ariane de la barre supérieure. */
  title?: string;
  crumb?: string;
}

const form = (slug: string) => {
  const FormPage = () => (
    <ExPage>
      <ExampleForm slug={slug} />
    </ExPage>
  );
  return FormPage;
};

/** `EX_NAV_TOP` */
const NAV_TOP: NavItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'mi:space-dashboard', page: DashboardExample, crumb: 'Accueil' },
  { id: 'monitoring', label: 'Supervision', icon: 'mi:monitor-heart', page: MonitoringExample },
  { id: 'modules', label: 'Modules', icon: 'mi:apps', page: ModulesExample },
];

/** `EX_NAV_GROUPS` : libellé, icône, repliable, entrées. */
const NAV_GROUPS: [string, string, boolean, NavItem[]][] = [
  [
    'Pilotage',
    'mi:insights',
    false,
    [
      { id: 'clients', label: 'Clients', icon: 'mi:group', page: ClientsExample, crumb: 'CRM' },
      { id: 'catalog', label: 'Catalogue', icon: 'mi:inventory-2', page: CatalogExample },
      {
        id: 'board',
        label: 'Planning',
        icon: 'mi:view-kanban',
        page: BoardExample,
        title: 'Déploiement Sotra',
        crumb: 'Projets',
      },
    ],
  ],
  [
    'Communication',
    'mi:forum',
    false,
    [
      { id: 'inbox', label: 'Messagerie', icon: 'mi:inbox', page: InboxExample, badge: 2 },
      { id: 'chat', label: 'Messagerie instantanée', icon: 'mi:chat', page: ChatExample, crumb: 'Communication' },
      { id: 'feed', label: 'Fil d’équipe', icon: 'mi:dynamic-feed', page: FeedExample },
    ],
  ],
  [
    'Ressources',
    'mi:local-library',
    false,
    [
      { id: 'blog', label: 'Blog', icon: 'mi:newspaper', page: BlogExample },
      { id: 'docs', label: 'Documentation', icon: 'mi:menu-book', page: DocsExample, crumb: 'Ressources' },
      { id: 'files', label: 'Fichiers', icon: 'mi:folder', page: FilesExample, crumb: 'Ressources' },
    ],
  ],
  [
    'Formulaires',
    'mi:dynamic-form',
    true,
    [
      { id: 'forms/contact', label: 'Contact', icon: 'mi:contact-mail', page: form('contact') },
      { id: 'forms/checkout', label: 'Commande', icon: 'mi:shopping-cart-checkout', page: form('checkout') },
      { id: 'forms/booking', label: 'Réservation', icon: 'mi:event-available', page: form('booking') },
      { id: 'forms/application', label: 'Candidature', icon: 'mi:assignment-ind', page: form('application') },
      { id: 'forms/onboarding', label: 'Assistant d’accueil', icon: 'mi:rocket-launch', page: form('onboarding') },
      { id: 'forms/survey', label: 'Questionnaire', icon: 'mi:quiz', page: form('survey') },
    ],
  ],
  [
    'Compte',
    'mi:manage-accounts',
    false,
    [{ id: 'settings', label: 'Paramètres', icon: 'mi:settings', page: SettingsExample, crumb: 'Compte' }],
  ],
];

/** Pages hors menu mais rendues dans le shell (fiche client, article, colonnes). */
const NAV_EXTRA: NavItem[] = [
  { id: 'clients/:id', label: 'Fiche client', icon: 'mi:person', page: ClientDetailExample, crumb: 'Clients' },
  { id: 'blog/:slug', label: 'Article', icon: 'mi:article', page: ArticleExample, crumb: 'Blog' },
  {
    id: 'files/columns',
    label: 'Fichiers · Colonnes',
    icon: 'mi:view-column',
    page: FilesColumnsExample,
    crumb: 'Ressources',
  },
];

const NAV = [...NAV_TOP, ...NAV_GROUPS.flatMap((g) => g[3])];
const ALL = [...NAV, ...NAV_EXTRA];

const LOGO = require('../../../assets/images/logo.png');

/**
 * Shell des écrans d'exemple (`ExAppShell` Flutter, `ex-app-shell`) : menu latéral (carte flottante)
 * dès 960 dp, tiroir en dessous ; barre supérieure de 68 dp avec fil d'Ariane, recherche, messagerie,
 * notifications et compte. Les entrées du menu changent la page ; les détails s'empilent (retour).
 */
export function ExAppShell({ initial = 'dashboard', initialParam }: { initial?: string; initialParam?: string }) {
  const { kit, colorMode } = useKitTheme();
  const snack = useKitSnack();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const mobile = width < breakpoints.lg;
  const setMode = useThemeStore((s) => s.setMode);
  const [stack, setStack] = useState([{ id: initial, param: initialParam }]);
  const [search, setSearch] = useState('');
  const [formsOpen, setFormsOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [chat, setChat] = useState(false);
  const [account, setAccount] = useState(false);

  const top = stack[stack.length - 1]!;
  const item = ALL.find((n) => n.id === top.id) ?? NAV_TOP[0]!;
  const back = () => setStack((s) => s.slice(0, -1));
  useBackClose(stack.length > 1, back);

  const select = (id: string) => {
    setStack([{ id, param: undefined }]);
    setDrawer(false);
  };
  const go = (id: string, param?: string) => setStack((s) => [...s, { id, param }]);
  const matches = (s: string) => !search || s.toLowerCase().includes(search.toLowerCase());
  const chatUnread = CHAT_CONVERSATIONS.reduce((s, x) => s + x.unread, 0);

  const entry = (n: NavItem, isTop = false) => {
    const on = n.id === top.id || (top.id.startsWith(`${n.id}/`) && !NAV.some((x) => x.id === top.id));
    return (
      <TouchableRipple
        key={n.id}
        onPress={() => select(n.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        style={[styles.entry, on && { backgroundColor: kit.primaryLight }]}
      >
        <View style={[styles.entryRow, { paddingHorizontal: isTop ? space.s4 : space.s3 }]}>
          <Icon source={n.icon} size={isTop ? 18 : 16} color={on ? kit.primary : kit.textSecondary} />
          <Text
            numberOfLines={1}
            style={[
              font(isTop || on ? '600' : '500', isTop ? 13 : 12.5),
              styles.fill,
              { color: on ? kit.textPrimary : kit.textSecondary },
            ]}
          >
            {n.label}
          </Text>
          {n.badge ? (
            <View style={[styles.navBadge, { backgroundColor: kit.hover }]}>
              <Text style={[font('400', 11), { color: kit.textSecondary }]}>{n.badge}</Text>
            </View>
          ) : null}
        </View>
      </TouchableRipple>
    );
  };

  const sidebar = (inDrawer: boolean) => (
    <View style={[styles.sidebar, { backgroundColor: kit.card, borderColor: kit.border }]}>
      <View style={styles.brand}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
        <View style={styles.fill}>
          <Text style={[font('700', 15, 'heading'), { color: kit.textPrimary }]}>SC Storage</Text>
          <Text style={[font('400', 11), { color: kit.textMuted }]}>Espace de travail</Text>
        </View>
        {inDrawer ? (
          <KitIconButton icon="mi:chevron-left" accessibilityLabel="Fermer le menu" onPress={() => setDrawer(false)} />
        ) : null}
      </View>
      <View style={styles.search}>
        <KitTextField
          hint="Rechercher une page…"
          icon="mi:search"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Rechercher une page"
        />
      </View>
      <ScrollView contentContainerStyle={styles.navList}>
        {NAV_TOP.filter((n) => matches(n.label)).map((n) => entry(n, true))}
        {NAV_GROUPS.filter(([label, , , items]) => matches(label) || items.some((n) => matches(n.label))).map(
          ([label, icon, collapsible, items]) => (
            <View key={label} style={styles.group}>
              <TouchableRipple
                onPress={collapsible ? () => setFormsOpen(!formsOpen) : undefined}
                disabled={!collapsible}
                accessibilityRole={collapsible ? 'button' : 'header'}
                accessibilityState={collapsible ? { expanded: formsOpen } : undefined}
                style={styles.groupHead}
              >
                <View style={[styles.entryRow, styles.groupRow]}>
                  <Icon source={icon} size={18} color={kit.textPrimary} />
                  <Text style={[font('600', 13), styles.fill, { color: kit.textPrimary }]}>{label}</Text>
                  {collapsible ? (
                    <View style={formsOpen && styles.flip}>
                      <Icon source="mi:expand-more" size={18} color={kit.textPrimary} />
                    </View>
                  ) : null}
                </View>
              </TouchableRipple>
              {!collapsible || formsOpen || search ? (
                <View style={styles.groupItems}>
                  {items.filter((n) => matches(n.label) || matches(label)).map((n) => entry(n))}
                </View>
              ) : null}
            </View>
          ),
        )}
      </ScrollView>
      <Divider style={{ backgroundColor: kit.border }} />
      <View style={styles.user}>
        <KitAvatar name={CURRENT_USER.fullname} size={36} />
        <View style={styles.fill}>
          <Text numberOfLines={1} style={[font('600', 13), { color: kit.textPrimary }]}>
            {CURRENT_USER.fullname}
          </Text>
          <Text numberOfLines={1} style={[font('400', 11), { color: kit.textMuted }]}>
            {CURRENT_USER.role}
          </Text>
        </View>
        <KitIconButton
          icon="mi:settings"
          size={20}
          accessibilityLabel="Paramètres"
          onPress={() => select('settings')}
        />
      </View>
    </View>
  );

  const title = item.title ?? item.label;
  const Page = item.page;
  const accountAction = (label: string, icon: string, onPress: () => void) => (
    <Menu.Item
      leadingIcon={icon}
      title={label}
      onPress={() => {
        setAccount(false);
        onPress();
      }}
    />
  );

  return (
    <ExNavContext.Provider value={{ go, param: top.param }}>
      <View style={[styles.fill, styles.row, { backgroundColor: kit.bg, paddingTop: insets.top }]}>
        {!mobile && sideOpen ? <View style={styles.sidePane}>{sidebar(false)}</View> : null}
        <View style={styles.fill}>
          <View style={[styles.topBar, { paddingHorizontal: mobile ? space.s2 : space.s4 }]}>
            {stack.length > 1 ? (
              <KitIconButton icon="mi:arrow-back" accessibilityLabel="Retour" onPress={back} />
            ) : mobile ? (
              <KitIconButton icon="mi:menu" accessibilityLabel="Afficher le menu" onPress={() => setDrawer(true)} />
            ) : (
              <KitIconButton
                icon={sideOpen ? 'mi:menu-open' : 'mi:menu'}
                accessibilityLabel={sideOpen ? 'Masquer le menu' : 'Afficher le menu'}
                onPress={() => setSideOpen(!sideOpen)}
              />
            )}
            <View style={[styles.fill, styles.titleRow]}>
              {!mobile && item.crumb ? (
                <>
                  <Text numberOfLines={1} style={[font('700', 18, 'heading'), styles.shrink, { color: kit.textMuted }]}>
                    {item.crumb}
                  </Text>
                  <Icon source="mi:chevron-right" size={20} color={kit.textMuted} />
                </>
              ) : null}
              <Text
                accessibilityRole="header"
                numberOfLines={1}
                style={[font('700', mobile ? 16 : 18, 'heading'), styles.shrink, { color: kit.textPrimary }]}
              >
                {title}
              </Text>
            </View>
            <KitIconButton
              icon="mi:search"
              accessibilityLabel="Rechercher"
              onPress={() => snack.demoAction('Palette de commandes')}
            />
            {mobile ? null : (
              <KitIconButton
                icon={colorMode === 'dark' ? 'mi:light-mode' : 'mi:dark-mode'}
                accessibilityLabel="Changer de thème"
                onPress={() => setMode(colorMode === 'dark' ? 'light' : 'dark')}
              />
            )}
            <TouchableRipple
              borderless
              onPress={() => setChat(true)}
              accessibilityRole="button"
              accessibilityLabel={`Messages, ${chatUnread} non lus`}
              style={styles.action}
            >
              <BadgedIcon icon="mi:chat-bubble-outline" count={chatUnread} badgeColor={kit.error} />
            </TouchableRipple>
            <TouchableRipple
              borderless
              onPress={() => snack.demoAction('Centre de notifications')}
              accessibilityRole="button"
              accessibilityLabel="Notifications, 3 non lues"
              style={styles.action}
            >
              <BadgedIcon icon="mi:notifications-none" count={3} badgeColor={kit.error} />
            </TouchableRipple>
            <Menu
              visible={account}
              onDismiss={() => setAccount(false)}
              anchor={
                <TouchableRipple
                  borderless
                  onPress={() => setAccount(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Mon compte"
                  style={styles.action}
                >
                  <KitAvatar name={CURRENT_USER.fullname} size={40} />
                </TouchableRipple>
              }
            >
              <View style={styles.menuHead}>
                <Text style={[font('600', 14), { color: kit.textPrimary }]}>{CURRENT_USER.fullname}</Text>
                <Text style={[font('400', 12), { color: kit.textMuted }]}>{CURRENT_USER.mail}</Text>
              </View>
              <Divider />
              {accountAction('Mon profil', 'mi:person', () => select('settings'))}
              {accountAction('Paramètres', 'mi:settings', () => select('settings'))}
              <Divider />
              {accountAction('Verrouiller', 'mi:lock', () => snack.demoAction('Verrouiller'))}
              {accountAction('Se déconnecter', 'mi:logout', () => router.back())}
            </Menu>
          </View>
          <View key={`${top.id}-${top.param ?? ''}`} style={[styles.fill, { paddingBottom: insets.bottom }]}>
            <Page />
          </View>
        </View>
      </View>
      <ModalDrawer visible={mobile && drawer} onDismiss={() => setDrawer(false)}>
        {sidebar(true)}
      </ModalDrawer>
      <SidePanel visible={chat} onDismiss={() => setChat(false)} title="Messages" icon="mi:chat">
        <View style={styles.chatPanel}>
          <ChatPanel onClose={() => setChat(false)} />
        </View>
      </SidePanel>
    </ExNavContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  shrink: { flexShrink: 1 },
  row: { flexDirection: 'row' },
  sidePane: { width: 272 + space.s2 * 2, padding: space.s2 },
  sidebar: { flex: 1, borderRadius: radius.xl, borderWidth: 1, overflow: 'hidden' },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    paddingLeft: space.l,
    paddingRight: space.s2,
    paddingTop: space.s4,
    paddingBottom: space.s2,
  },
  logo: { width: 30, height: 30 },
  search: { paddingHorizontal: space.s4, paddingVertical: space.s2 },
  navList: { padding: space.s4 },
  entry: { borderRadius: radius.sm, marginBottom: 2 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: space.s3, minHeight: 44 },
  navBadge: { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 1, marginLeft: space.s2 },
  group: { marginTop: space.s3 },
  groupHead: { borderRadius: radius.md },
  groupRow: { paddingHorizontal: space.s4 },
  groupItems: { paddingLeft: space.s4, paddingTop: space.s1 },
  flip: { transform: [{ rotate: '180deg' }] },
  user: { flexDirection: 'row', alignItems: 'center', gap: space.s3, padding: space.s3 },
  topBar: { height: 68, flexDirection: 'row', alignItems: 'center', gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginLeft: space.s1 },
  action: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  menuHead: { paddingHorizontal: space.s4, paddingVertical: space.s2 },
  chatPanel: { height: 520 },
});
