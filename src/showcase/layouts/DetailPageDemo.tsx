import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, Menu } from 'react-native-paper';

import {
  DescriptionList,
  KitAvatar,
  KitButton,
  KitCard,
  KitIconButton,
  KitTabs,
  KpiCard,
  ResponsiveGrid,
  StatusBadge,
} from '../../components';
import { compact, date, dateLong, fcfa } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import { STATUT_LABEL, STATUT_TONE, type DemoClient } from '../../data/showcase';
import { font, kitText, space, useKitTheme } from '../../theme';
import { DemoBar } from './DemoBar';

const TABS = [{ label: 'Aperçu' }, { label: 'Véhicules' }, { label: 'Factures' }];

/** Ligne de liste (icône, titre, sous-titre, élément de fin). */
function Row({ icon, title, sub, trailing }: { icon: string; title: string; sub: string; trailing: ReactNode }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.row}>
      <Icon source={icon} size={24} color={kit.primary} />
      <View style={styles.fill}>
        <Text style={[font('500', 14), { color: kit.textPrimary }]}>{title}</Text>
        <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{sub}</Text>
      </View>
      {trailing}
    </View>
  );
}

/**
 * Fiche détail (`DetailPageDemo` Flutter) : en-tête d'identité qui défile, onglets épinglés, KPI,
 * coordonnées, actions principales au pouce, sous-listes véhicules et factures.
 */
export function DetailPageDemo({ client: x }: { client: DemoClient }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [tab, setTab] = useState(0);
  const [menu, setMenu] = useState(false);
  const vehicles = Math.max(1, Math.min(12, x.vehicules));

  const overview = (
    <View style={styles.pad16}>
      <ResponsiveGrid minItemWidth={160} spacing={10}>
        <KpiCard icon="mi:local-shipping" value={String(x.vehicules)} label="Véhicules" tone="primary" />
        <KpiCard icon="mi:payments" value={compact(x.caMensuel)} unit="FCFA" label="CA mensuel" tone="success" />
      </ResponsiveGrid>
      <View style={styles.mt12}>
        <KitCard title="Coordonnées" icon="mi:contact-mail">
          <DescriptionList
            horizontal
            items={[
              { label: 'Contact', value: x.contact },
              { label: 'Téléphone', value: x.telephone, type: 'phone' },
              { label: 'Email', value: x.email, type: 'email', copy: true },
              { label: 'Ville', value: x.ville },
              { label: 'Secteur', value: x.secteur },
              { label: 'Client depuis', value: dateLong(x.createdAt) },
            ]}
          />
        </KitCard>
      </View>
      <View style={[styles.actions, styles.mt12]}>
        <View style={styles.fill}>
          <KitButton
            label="Appeler"
            icon="mi:call"
            variant="secondary"
            expand
            onPress={() => snack.demoAction('Appel')}
          />
        </View>
        <View style={styles.fill}>
          <KitButton
            label="Intervention"
            icon="mi:build"
            expand
            onPress={() => snack.demoAction('Nouvelle intervention')}
          />
        </View>
      </View>
    </View>
  );

  const vehicleList = (
    <View style={styles.pad12}>
      {Array.from({ length: vehicles }, (_, i) => {
        const offline = i % 5 === 3;
        return (
          <Row
            key={i}
            icon={i % 2 === 0 ? 'mi:local-shipping' : 'mi:directions-car'}
            title={`CI-${(1000 + i * 137) % 9999}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(66 + (i % 24))}`}
            sub={offline ? 'Hors ligne depuis 2 j' : `En ligne · il y a ${i + 1} min`}
            trailing={<StatusBadge label={offline ? 'Hors ligne' : 'En ligne'} tone={offline ? 'error' : 'success'} />}
          />
        );
      })}
    </View>
  );

  const invoices = (
    <View style={styles.pad12}>
      {Array.from({ length: 6 }, (_, i) => (
        <Row
          key={i}
          icon="mi:receipt-long"
          title={`FAC-2026-${String(912 - i * 38).padStart(4, '0')}`}
          sub={date(new Date(2026, 9 - i, 15))}
          trailing={
            <View style={styles.amount}>
              <Text style={[font('700', 12.5), { color: kit.textPrimary }]}>{fcfa(x.caMensuel)}</Text>
              <StatusBadge label={i === 0 ? 'Émise' : 'Payée'} tone={i === 0 ? 'warning' : 'success'} />
            </View>
          }
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]}>
      <DemoBar
        leading={<KitIconButton icon="mi:arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />}
        title={x.raisonSociale}
        actions={
          <>
            <KitIconButton
              icon="mi:edit"
              accessibilityLabel="Modifier"
              onPress={() => snack.demoAction('Modification')}
            />
            <Menu
              visible={menu}
              onDismiss={() => setMenu(false)}
              anchor={
                <KitIconButton icon="mi:more-vert" accessibilityLabel="Plus d’actions" onPress={() => setMenu(true)} />
              }
            >
              <Menu.Item
                title="Exporter en PDF"
                onPress={() => {
                  setMenu(false);
                  snack.demoAction('Export PDF');
                }}
              />
              <Menu.Item
                title="Suspendre"
                onPress={() => {
                  setMenu(false);
                  snack.demoAction('Suspension');
                }}
              />
            </Menu>
          </>
        }
      />
      <ScrollView stickyHeaderIndices={[1]}>
        <View style={styles.header}>
          <KitAvatar name={x.raisonSociale} size={60} />
          <View style={styles.fill}>
            <Text numberOfLines={2} style={[kitText.h3, { color: kit.textPrimary }]}>
              {x.raisonSociale}
            </Text>
            <View style={styles.meta}>
              <StatusBadge label={STATUT_LABEL[x.statut]} tone={STATUT_TONE[x.statut]} />
              <Text style={[font('400', 11.5, 'mono'), { color: kit.textMuted }]}>{x.code}</Text>
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: kit.bg }}>
          <KitTabs tabs={TABS} selected={tab} onSelect={setTab} scrollable={false} />
        </View>
        {[overview, vehicleList, invoices][tab]}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad12: { padding: space.s3 },
  pad16: { padding: space.s4 },
  mt12: { marginTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: space.s4,
    paddingVertical: space.s4,
  },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, paddingHorizontal: space.s2 },
  amount: { alignItems: 'flex-end', gap: 2 },
});
