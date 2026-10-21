import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from 'react-native-paper';

import {
  FilterDropdown,
  KitAvatar,
  KitButton,
  KitCard,
  KitChip,
  KitDataTable,
  KitTabs,
  KpiCard,
  ResponsiveGrid,
  StatusBadge,
  type KitColumn,
} from '../../components';
import { dateLong, decimal1, fcfa, number } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import {
  CLIENT_STATUS,
  CLIENT_STATUSES,
  EX_ACTIVITY,
  EX_CLIENTS,
  EX_INVOICES,
  OWNERS,
  exClientById,
  invoiceTone,
  type ClientStatus,
  type ExClient,
} from '../../data/examples';
import { breakpoints, font, kitText, space, toneText, useKitTheme } from '../../theme';
import { ExHeader, ExPage, ExTile, FilePicker, exCompact, useExNav } from './ExKit';

const CITIES = [...new Set(EX_CLIENTS.map((c) => c.city))];
const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][d.getMonth()]} ${d.getFullYear()}`;
};

/** Clients (`ClientsExample` Flutter) : statuts, filtres, cartes ou tableau triable, sélection, total. */
export function ClientsExample() {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  const snack = useKitSnack();
  const nav = useExNav();
  const [filter, setFilter] = useState<ClientStatus | 'all'>('all');
  const [city, setCity] = useState('all');
  const [owner, setOwner] = useState('all');
  const [picker, setPicker] = useState(false);
  const total = EX_CLIENTS.reduce((s, x) => s + x.revenue, 0);
  const rows = EX_CLIENTS.filter(
    (c) =>
      (filter === 'all' || c.status === filter) &&
      (city === 'all' || c.city === city) &&
      (owner === 'all' || c.owner === owner),
  );

  const columns: KitColumn<ExClient>[] = [
    {
      label: 'Client',
      width: 180,
      sortValue: (x) => x.name,
      cell: (x) => <Text style={[font('700', 14), { color: kit.textPrimary }]}>{x.name}</Text>,
    },
    {
      label: 'Secteur',
      width: 130,
      sortValue: (x) => x.sector,
      cell: (x) => <Text style={{ color: kit.textPrimary }}>{x.sector}</Text>,
    },
    {
      label: 'Contact',
      width: 150,
      sortValue: (x) => x.contact,
      cell: (x) => <Text style={{ color: kit.textPrimary }}>{x.contact}</Text>,
    },
    {
      label: 'Ville',
      width: 120,
      sortValue: (x) => x.city,
      cell: (x) => <Text style={{ color: kit.textPrimary }}>{x.city}</Text>,
    },
    {
      label: 'Statut',
      width: 110,
      sortValue: (x) => CLIENT_STATUSES.indexOf(x.status),
      cell: (x) => (
        <StatusBadge label={CLIENT_STATUS[x.status].label} tone={CLIENT_STATUS[x.status].tone} uppercase={false} />
      ),
    },
    {
      label: 'Factures',
      width: 90,
      numeric: true,
      sortValue: (x) => x.invoices,
      cell: (x) => <Text style={{ color: kit.textPrimary }}>{x.invoices}</Text>,
    },
    {
      label: 'Chiffre d’affaires',
      width: 150,
      numeric: true,
      sortValue: (x) => x.revenue,
      cell: (x) => <Text style={{ color: kit.textPrimary }}>{`${number(x.revenue)} F`}</Text>,
      total: (r) => `${number(r.reduce((s, x) => s + x.revenue, 0))} F`,
    },
  ];

  const card = (x: ExClient, selected: boolean) => (
    <KitCard color={selected ? kit.primaryLight : undefined} borderColor={selected ? kit.primary : undefined}>
      <View style={styles.rowGap12}>
        <KitAvatar name={x.name} />
        <View style={styles.fill}>
          <Text numberOfLines={1} style={[font('600', 14), { color: kit.textPrimary }]}>
            {x.name}
          </Text>
          <Text numberOfLines={1} style={[font('400', 12), { color: kit.textMuted }]}>{`${x.sector} · ${x.city}`}</Text>
        </View>
        <StatusBadge label={CLIENT_STATUS[x.status].label} tone={CLIENT_STATUS[x.status].tone} />
      </View>
      <View style={[styles.stats, styles.mt12]}>
        {(
          [
            ['Contact', x.contact, false],
            ['Factures', String(x.invoices), false],
            ['Chiffre d’affaires', `${decimal1(x.revenue / 1e6)} M FCFA`, true],
          ] as const
        ).map(([k, v, bold]) => (
          <View key={k} style={styles.fill}>
            <Text style={[font('400', 12), { color: kit.textMuted }]}>{k}</Text>
            <Text numberOfLines={1} style={[font(bold ? '700' : '400', 14), { color: kit.textPrimary }]}>
              {v}
            </Text>
          </View>
        ))}
      </View>
    </KitCard>
  );

  return (
    <ExPage maxWidth={1280}>
      <ExHeader
        eyebrow="CRM"
        title="Clients"
        subtitle={`${EX_CLIENTS.length} comptes · ${Math.round(total / 1e6)} M FCFA de chiffre d’affaires cumulé`}
        actions={
          <>
            <KitButton label="Importer" icon="mi:upload" variant="outline" onPress={() => setPicker(true)} />
            <KitButton label="Nouveau client" icon="mi:add" onPress={() => snack.demoAction('Création')} />
          </>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {(['all', ...CLIENT_STATUSES] as const).map((s) => (
          <KitChip
            key={s}
            label={`${s === 'all' ? 'Tous' : CLIENT_STATUS[s].label} · ${s === 'all' ? EX_CLIENTS.length : EX_CLIENTS.filter((c) => c.status === s).length}`}
            selected={filter === s}
            onPress={() => setFilter(s)}
          />
        ))}
      </ScrollView>
      <View style={styles.filters}>
        <FilterDropdown
          label="Ville"
          value={city}
          allValue="all"
          onChange={setCity}
          options={[{ value: 'all', label: 'Tous' }, ...CITIES.map((c) => ({ value: c, label: c }))]}
        />
        <FilterDropdown
          label="Responsable"
          value={owner}
          allValue="all"
          onChange={setOwner}
          options={[{ value: 'all', label: 'Tous' }, ...OWNERS.map((o) => ({ value: o, label: o }))]}
        />
      </View>
      <KitDataTable
        key={`${filter}-${city}-${owner}`}
        rows={rows}
        columns={columns}
        keyOf={(x) => x.id}
        searchText={(x) => `${x.name} ${x.contact} ${x.city}`}
        cardBuilder={card}
        selectable
        pageSize={10}
        onRowPress={(x) => nav.go('clients/:id', x.id)}
        initialMode={width >= breakpoints.xl ? 'list' : 'card'}
        emptyTitle="Aucun client"
      />
      <FilePicker visible={picker} onClose={() => setPicker(false)} />
    </ExPage>
  );
}

const TABS = [{ label: 'Coordonnées' }, { label: 'Factures' }, { label: 'Activité' }];

/** Fiche client (`ClientDetailExample` Flutter) : identité, actions, KPI, onglets. */
export function ClientDetailExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const nav = useExNav();
  const c = exClientById(nav.param ?? 'c-104');
  const [tab, setTab] = useState(0);
  const outstanding = EX_INVOICES.filter((i) => i.status !== 'payée').reduce((s, i) => s + i.amount, 0);
  const infos: [string, string, string][] = [
    ['mi:person-outline', 'Contact', c.contact],
    ['mi:alternate-email', 'E-mail', c.email],
    ['mi:phone', 'Téléphone', c.phone],
    ['mi:location-on', 'Ville', c.city],
    ['mi:category', 'Secteur', c.sector],
    ['mi:badge', 'Responsable', c.owner],
    ['mi:event', 'Client depuis', dateLong(c.since)],
  ];
  return (
    <ExPage maxWidth={1100}>
      <KitCard>
        <View style={styles.identity}>
          <KitAvatar name={c.name} size={56} />
          <View style={styles.fill}>
            <Text style={[kitText.h3, { color: kit.textPrimary }]}>{c.name}</Text>
            <Text style={[font('400', 14), { color: kit.textMuted }]}>{`${c.id} · ${c.sector} · ${c.city}`}</Text>
          </View>
        </View>
        <View style={[styles.wrap, styles.mt12]}>
          <StatusBadge label={CLIENT_STATUS[c.status].label} tone={CLIENT_STATUS[c.status].tone} />
          <KitButton label="Appeler" icon="mi:call" variant="secondary" onPress={() => snack.demoAction('Appel')} />
          <KitButton
            label="Modifier"
            icon="mi:edit"
            variant="outline"
            onPress={() => snack.demoAction('Modification')}
          />
        </View>
      </KitCard>
      <View style={styles.h16} />
      <ResponsiveGrid minItemWidth={200}>
        <KpiCard icon="mi:payments" value={exCompact(c.revenue)} unit="FCFA" label="Chiffre d’affaires" />
        <KpiCard icon="mi:receipt-long" value={String(c.invoices)} label="Factures" tone="info" />
        <KpiCard icon="mi:schedule" value={exCompact(outstanding)} unit="FCFA" label="Encours" tone="warning" />
      </ResponsiveGrid>
      <View style={styles.h16} />
      <KitTabs tabs={TABS} selected={tab} onSelect={setTab} />
      <View style={styles.h16} />
      {tab === 0 ? (
        <ResponsiveGrid minItemWidth={240} spacing={space.s3}>
          {infos.map(([icon, k, v]) => (
            <KitCard key={k}>
              <View style={styles.rowGap12}>
                <Icon source={icon} size={24} color={kit.primary} />
                <View style={styles.fill}>
                  <Text style={[font('400', 12), { color: kit.textMuted }]}>{k}</Text>
                  <Text numberOfLines={1} style={[font('400', 14), { color: kit.textPrimary }]}>
                    {v}
                  </Text>
                </View>
              </View>
            </KitCard>
          ))}
        </ResponsiveGrid>
      ) : tab === 1 ? (
        EX_INVOICES.map((i) => (
          <ExTile
            key={i.ref}
            leading={<Icon source="mi:receipt-long" size={24} color={kit.textSecondary} />}
            title={i.ref}
            subtitle={`${shortDate(i.date)} · ${fcfa(i.amount)}`}
            trailing={<StatusBadge label={i.status} tone={invoiceTone(i.status)} uppercase={false} />}
          />
        ))
      ) : (
        EX_ACTIVITY.map((a) => (
          <ExTile
            key={a.text}
            leading={<Icon source={a.icon} size={24} color={toneText(a.tone, kit)} />}
            title={a.text}
            subtitle={`${a.at} · ${a.who}`}
          />
        ))
      )}
    </ExPage>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  mt12: { marginTop: 12 },
  h16: { height: space.s4 },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  stats: { flexDirection: 'row', gap: space.s2 },
  chips: { gap: space.s2, paddingBottom: space.s2 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, marginBottom: space.s3 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.s4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
});
