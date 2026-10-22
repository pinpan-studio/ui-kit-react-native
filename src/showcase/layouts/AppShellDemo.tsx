import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { FAB, Icon, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BadgedIcon,
  BottomConfirm,
  CommandPalette,
  FormSheet,
  KitAvatar,
  KitCard,
  KitChart,
  KitIconButton,
  KitNavigationBar,
  KitTextField,
  KitTimeline,
  KpiCard,
  ModalDrawer,
  NotificationCenter,
  PasswordField,
  ResponsiveGrid,
  Sidecar,
  SidePanel,
  StatusBadge,
  SwitchTile,
  type NavDestination,
} from '../../components';
import { time, weekday } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import {
  CA_2025,
  CA_2026,
  DEMO_CLIENTS,
  DEMO_MENU,
  MOIS,
  STATUT_LABEL,
  STATUT_TONE,
  TIMELINE_EVENTS,
} from '../../data/showcase';
import { PaletteSheet } from '../../shell/PaletteSheet';
import { useThemeStore } from '../../store/themeStore';
import { PALETTE_META } from '../../theme/generated/palettes';
import {
  breakpoints,
  font,
  kitText,
  radius,
  space,
  toneColor,
  toneLight,
  toneText,
  useKitTheme,
  type KitTone,
} from '../../theme';
import { DemoBar } from './DemoBar';

const TITLES = ['Tableau de bord', 'Clients', 'Interventions', 'Compte'];

const INTERVENTIONS: [string, string, KitTone][] = [
  ['Pose balise — Transports Yao', 'Planifiée · 08:30', 'info'],
  ['Balise hors ligne — SOTRA bus 112', 'En retard · hier', 'error'],
  ['Maintenance capteur carburant', 'En route · 10:15', 'purple'],
  ['Installation flotte Lôh Logistique', 'Sur site · 11:00', 'warning'],
];

function DashboardBody() {
  const { kit } = useKitTheme();
  const [now] = useState(() => new Date());
  return (
    <ScrollView contentContainerStyle={styles.pad16}>
      <Text style={[kitText.h3, { color: kit.textPrimary }]}>Bonjour Jean 👋</Text>
      <Text style={[kitText.bodySm, styles.mb14, { color: kit.textSecondary }]}>{weekday(now)}</Text>
      <ResponsiveGrid minItemWidth={160} spacing={10}>
        <KpiCard icon="mi:local-shipping" value="42" label="Véhicules actifs" tone="primary" />
        <KpiCard icon="mi:warning-amber" value="5" label="Alertes" tone="warning" />
        <KpiCard icon="mi:build" value="4" label="Missions du jour" tone="info" />
        <KpiCard icon="mi:payments" value="55,8 M" label="CA du mois" tone="success" />
      </ResponsiveGrid>
      <View style={styles.mt12}>
        <KitCard title="Chiffre d’affaires" icon="mi:show-chart">
          <KitChart
            kind="area"
            labels={MOIS.slice(0, 10)}
            series={[
              { label: '2026', data: CA_2026.slice(0, 10) },
              { label: '2025', data: CA_2025.slice(0, 10) },
            ]}
            height={170}
            compactValues
          />
        </KitCard>
      </View>
      <View style={styles.mt12}>
        <KitCard title="Activité récente" icon="mi:history">
          <KitTimeline
            dense
            items={TIMELINE_EVENTS.map((e) => ({
              title: e.titre,
              text: e.texte,
              time: time(e.date.getHours(), e.date.getMinutes()),
              icon: e.icon,
              tone: e.tone,
            }))}
          />
        </KitCard>
      </View>
    </ScrollView>
  );
}

function ClientsBody() {
  const { kit } = useKitTheme();
  return (
    <ScrollView contentContainerStyle={[styles.pad12, styles.gap8]}>
      {DEMO_CLIENTS.map((x) => (
        <KitCard
          key={x.id}
          padding={space.s3}
          onPress={() => router.push(`/layouts/detail?client=${x.id}` as never)}
          accessibilityLabel={`${x.raisonSociale}, ${STATUT_LABEL[x.statut]}`}
        >
          <View style={styles.rowGap12}>
            <KitAvatar name={x.raisonSociale} size={40} />
            <View style={styles.fill}>
              <Text numberOfLines={1} style={[font('600', 14), { color: kit.textPrimary }]}>
                {x.raisonSociale}
              </Text>
              <Text style={[font('400', 12), { color: kit.textSecondary }]}>{`${x.code} · ${x.ville}`}</Text>
            </View>
            <StatusBadge label={STATUT_LABEL[x.statut]} tone={STATUT_TONE[x.statut]} />
          </View>
        </KitCard>
      ))}
    </ScrollView>
  );
}

function InterventionsBody() {
  const { kit } = useKitTheme();
  return (
    <ScrollView contentContainerStyle={[styles.pad12, styles.gap8]}>
      {INTERVENTIONS.map(([t, s, tone], i) => (
        <KitCard key={t} padding={space.s3}>
          <View style={styles.rowGap12}>
            <View style={[styles.stripe, { backgroundColor: toneColor(tone, kit) }]} />
            <View style={styles.fill}>
              <Text
                style={[font('400', 11, 'mono'), { color: kit.textMuted }]}
              >{`INT-${String(412 + i).padStart(4, '0')}`}</Text>
              <Text style={[font('600', 14), { color: kit.textPrimary }]}>{t}</Text>
              <Text style={[font('400', 12), { color: toneText(tone, kit) }]}>{s}</Text>
            </View>
            <Icon source="mi:chevron-right" size={24} color={kit.textMuted} />
          </View>
        </KitCard>
      ))}
    </ScrollView>
  );
}

/** Panneau « Paramètres du compte » : profil, préférences, déconnexion. */
function AccountPanel() {
  const { kit, colorMode } = useKitTheme();
  const paletteId = useThemeStore((s) => s.paletteId);
  const setMode = useThemeStore((s) => s.setMode);
  const [push, setPush] = useState(true);
  const [sheet, setSheet] = useState<'profile' | 'password' | null>(null);
  const [appearance, setAppearance] = useState(false);
  const [logout, setLogout] = useState(false);
  const item = (icon: string, title: string, sub: string, onPress: () => void, tone: KitTone = 'primary') => (
    <TouchableRipple onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`}>
      <View style={styles.item}>
        <View style={[styles.itemDisc, { backgroundColor: toneLight(tone, kit) }]}>
          <Icon source={icon} size={20} color={toneColor(tone, kit)} />
        </View>
        <View style={styles.fill}>
          <Text style={[font('600', 14), { color: tone === 'error' ? kit.error : kit.textPrimary }]}>{title}</Text>
          <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{sub}</Text>
        </View>
        <Icon source="mi:chevron-right" size={24} color={kit.textMuted} />
      </View>
    </TouchableRipple>
  );
  const overline = (t: string) => (
    <Text style={[kitText.overline, styles.overline, { color: kit.textMuted }]}>{t}</Text>
  );
  return (
    <View style={styles.pad16}>
      <View style={styles.profile}>
        <KitAvatar name="Jean Kouassi" size={72} online />
        <Text style={[kitText.h4, styles.mt8, { color: kit.textPrimary }]}>Jean Kouassi</Text>
        <Text style={[kitText.bodySm, { color: kit.textSecondary }]}>Responsable exploitation · Lookas CI</Text>
      </View>
      {overline('GESTION DE PROFIL')}
      {item('mi:person-outline', 'Paramètres personnels', 'Modifiez vos données personnelles', () =>
        setSheet('profile'),
      )}
      {item('mi:lock-outline', 'Mot de passe', 'Changez votre mot de passe', () => setSheet('password'))}
      {overline('PRÉFÉRENCES')}
      <SwitchTile value={colorMode === 'dark'} onChange={(v) => setMode(v ? 'dark' : 'light')} title="Thème sombre" />
      {item(
        'mi:palette',
        'Apparence',
        `Couleur : ${PALETTE_META.find((p) => p.id === paletteId)?.label ?? paletteId}`,
        () => setAppearance(true),
      )}
      <SwitchTile value={push} onChange={setPush} title="Notifications push" />
      {overline('CONNEXION')}
      {item('mi:logout', 'Déconnexion', 'Fermer la session en cours', () => setLogout(true), 'error')}

      <FormSheet
        visible={sheet === 'profile'}
        onDismiss={() => setSheet(null)}
        title="Paramètres personnels"
        icon="mi:person-outline"
        submitLabel="Valider"
        onSubmit={() => setSheet(null)}
      >
        <View style={styles.gap14}>
          <KitTextField label="Nom complet" defaultValue="Jean Kouassi" icon="mi:person-outline" />
          <KitTextField label="Email" defaultValue="jean.kouassi@lookas.ci" icon="mi:alternate-email" />
          <KitTextField label="Téléphone" defaultValue="+225 07 10 20 30 40" icon="mi:phone" />
        </View>
      </FormSheet>
      <FormSheet
        visible={sheet === 'password'}
        onDismiss={() => setSheet(null)}
        title="Mot de passe"
        icon="mi:lock-outline"
        onSubmit={() => setSheet(null)}
      >
        <PasswordField label="Nouveau mot de passe" />
      </FormSheet>
      <PaletteSheet visible={appearance} onDismiss={() => setAppearance(false)} />
      <BottomConfirm
        visible={logout}
        title="Se déconnecter ?"
        message="Vous devrez saisir à nouveau vos identifiants."
        confirm="Déconnexion"
        danger
        icon="mi:logout"
        onResult={(ok) => {
          setLogout(false);
          if (ok) router.back();
        }}
      />
    </View>
  );
}

/**
 * Shell applicatif mobile (`AppShellDemo` Flutter) : barre d'application (recherche, notifications, compte),
 * tiroir Sidecar (permanent sur tablette), barre de navigation basse, FAB contextuel, panneaux en feuilles.
 */
export function AppShellDemo() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.tablet;
  const [tab, setTab] = useState(0);
  const [menu, setMenu] = useState('dashboard');
  const [unread, setUnread] = useState(3);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [panel, setPanel] = useState<'notifications' | 'account' | null>(null);

  const nav: NavDestination[] = [
    { label: 'Accueil', icon: 'mi:dashboard' },
    { label: 'Clients', icon: 'mi:people-outline', selectedIcon: 'mi:people' },
    { label: 'Missions', icon: 'mi:build', badge: 4 },
    { label: 'Compte', icon: 'mi:person-outline', selectedIcon: 'mi:person' },
  ];
  const body = [<DashboardBody key={0} />, <ClientsBody key={1} />, <InterventionsBody key={2} />];

  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]}>
      <DemoBar
        leading={
          wide ? (
            <KitIconButton icon="mi:arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />
          ) : (
            <KitIconButton icon="mi:menu" accessibilityLabel="Ouvrir le menu" onPress={() => setDrawer(true)} />
          )
        }
        title={TITLES[tab]}
        actions={
          <>
            <KitIconButton icon="mi:search" accessibilityLabel="Rechercher" onPress={() => setPalette(true)} />
            <TouchableRipple
              borderless
              onPress={() => setPanel('notifications')}
              accessibilityRole="button"
              accessibilityLabel={`Notifications, ${unread} non lues`}
              style={styles.action}
            >
              <BadgedIcon icon="mi:notifications-none" count={unread || undefined} />
            </TouchableRipple>
            <TouchableRipple
              borderless
              onPress={() => setPanel('account')}
              accessibilityRole="button"
              accessibilityLabel="Paramètres du compte"
              style={styles.action}
            >
              <KitAvatar name="Jean Kouassi" size={32} online />
            </TouchableRipple>
          </>
        }
      />
      <View style={[styles.fill, styles.row]}>
        {wide ? <Sidecar items={DEMO_MENU} selected={menu} onSelect={(m) => setMenu(m.id)} /> : null}
        <View style={styles.fill}>
          {tab === 3 ? (
            <ScrollView>
              <AccountPanel />
            </ScrollView>
          ) : (
            body[tab]
          )}
        </View>
      </View>
      {tab === 2 ? (
        <FAB
          icon="mi:add"
          label="Mission"
          onPress={() => snack.demoAction('Nouvelle intervention')}
          style={[styles.fab, { bottom: 80 + insets.bottom + 16 }]}
        />
      ) : null}
      <View style={{ paddingBottom: insets.bottom, backgroundColor: kit.card }}>
        <KitNavigationBar destinations={nav} selected={tab} onSelect={setTab} />
      </View>

      <ModalDrawer visible={drawer} onDismiss={() => setDrawer(false)}>
        <Sidecar
          items={DEMO_MENU}
          selected={menu}
          onSelect={(m) => {
            setMenu(m.id);
            setDrawer(false);
            snack.show(`Module : ${m.label}`);
          }}
        />
      </ModalDrawer>
      <CommandPalette
        visible={palette}
        onDismiss={() => setPalette(false)}
        commands={DEMO_MENU.map((m) => ({ label: m.label, icon: m.icon, group: 'Modules' }))}
        onRun={(cmd) => {
          setPalette(false);
          snack.show(`Module : ${cmd.label}`);
        }}
      />
      <SidePanel
        visible={panel === 'notifications'}
        onDismiss={() => setPanel(null)}
        title="Notifications"
        icon="mi:notifications"
      >
        <View style={styles.pad16}>
          <NotificationCenter onUnreadChange={setUnread} />
        </View>
      </SidePanel>
      <SidePanel
        visible={panel === 'account'}
        onDismiss={() => setPanel(null)}
        title="Paramètres du compte"
        icon="mi:manage-accounts"
      >
        <AccountPanel />
      </SidePanel>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pad12: { padding: space.s3 },
  pad16: { padding: space.s4 },
  gap8: { gap: 8 },
  gap14: { gap: 14 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mb14: { marginBottom: 14 },
  stripe: { width: 4, height: 40, borderRadius: radius.full },
  action: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 16 },
  profile: { alignItems: 'center', marginBottom: 16 },
  overline: { marginTop: 8, marginBottom: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, paddingVertical: space.s2 },
  itemDisc: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
