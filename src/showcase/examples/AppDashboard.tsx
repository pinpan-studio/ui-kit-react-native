import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import {
  KitAvatar,
  KitButton,
  KitCard,
  KitChart,
  KitIconButton,
  KitProgressBar,
  ResponsiveGrid,
  SegmentedToggle,
  StatusBadge,
  TrendChip,
} from '../../components';
import { decimal1 } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import {
  CLIENT_STATUS,
  CLIENT_STATUSES,
  DASH_GOALS,
  DASH_KPIS,
  DASH_PERIODS,
  DASH_TABS,
  EX_ACTIVITY,
  EX_CLIENTS,
  type ClientStatus,
  type DashPeriod,
} from '../../data/examples';
import { breakpoints, font, space, toneColor, toneText, useKitTheme } from '../../theme';
import { ExGap, ExHeader, ExPage, ExTile, KitDonut, exCompact, useExNav } from './ExKit';

const trendLabel = (t: number) => `${t >= 0 ? '+' : ''}${decimal1(t)} %`;
const statusCounts = () => CLIENT_STATUSES.map((s) => [s, EX_CLIENTS.filter((x) => x.status === s).length] as const);

/** Onglets du tableau de bord : icône + libellé, soulignement primaire. */
function DashTabs({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  const { kit } = useKitTheme();
  return (
    <View style={[styles.tabsBar, { borderBottomColor: kit.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist">
        {DASH_TABS.map(([label, icon], i) => {
          const on = index === i;
          return (
            <TouchableRipple
              key={label}
              onPress={() => onChange(i)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[styles.tab, { borderBottomColor: on ? kit.primary : 'transparent' }]}
            >
              <View style={styles.tabInner}>
                <Icon source={icon} size={18} color={on ? kit.primary : kit.textMuted} />
                <Text style={[font(on ? '700' : '500', 14), { color: on ? kit.textPrimary : kit.textSecondary }]}>
                  {label}
                </Text>
              </View>
            </TouchableRipple>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Carte KPI du tableau de bord : icône + libellé, valeur, variation. */
function DashKpi({
  icon,
  label,
  value,
  unit,
  trend,
  compare,
  up,
  goodWhenUp,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  trend: string;
  compare: string;
  up: boolean;
  goodWhenUp: boolean;
}) {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  const narrow = width <= breakpoints.sm;
  return (
    <KitCard padding={narrow ? space.s3 : space.s5}>
      <View style={styles.kpiHead}>
        <Icon source={icon} size={18} color={kit.textMuted} />
        <Text numberOfLines={1} style={[font('500', 13), styles.fill, { color: kit.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[font('600', narrow ? 24 : 28, 'heading'), styles.kpiValue, { color: kit.textPrimary }]}
      >
        {value}
        {unit ? <Text style={[font('400', 12), { color: kit.textMuted }]}>{` ${unit}`}</Text> : null}
      </Text>
      <View style={styles.kpiTrend}>
        <TrendChip text={trend} up={up} goodWhenUp={goodWhenUp} />
        <Text style={[font('400', 12), { color: kit.textMuted }]}>{compare}</Text>
      </View>
    </KitCard>
  );
}

/** Donut du portefeuille clients par statut, avec légende. */
function ClientDonut() {
  const { kit } = useKitTheme();
  const counts = statusCounts();
  const total = counts.reduce((a, [, n]) => a + n, 0);
  const color = (s: ClientStatus) => (s === 'inactif' ? kit.textMuted : toneColor(CLIENT_STATUS[s].tone, kit));
  return (
    <View style={styles.donutBox}>
      <KitDonut
        values={counts.map(([, n]) => n)}
        colors={counts.map(([s]) => color(s))}
        center={
          <View style={styles.donutCenter}>
            <Text style={[font('800', 24, 'heading'), { color: kit.textPrimary }]}>{total}</Text>
            <Text style={[font('400', 12), { color: kit.textMuted }]}>comptes</Text>
          </View>
        }
      />
      <View style={styles.legend}>
        {counts.map(([s, n]) => (
          <View key={s} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: color(s) }]} />
            <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>{CLIENT_STATUS[s].label}</Text>
            <Text style={[font('700', 14), { color: kit.textPrimary }]}>{n}</Text>
            <Text
              style={[font('400', 14), styles.pct, { color: kit.textMuted }]}
            >{`${Math.round((n * 100) / total)} %`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TopClients() {
  const { kit } = useKitTheme();
  const nav = useExNav();
  const top = [...EX_CLIENTS].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  return (
    <KitCard title="Meilleurs clients" icon="mi:emoji-events">
      {top.map((x, i) => (
        <ExTile
          key={x.id}
          onPress={() => nav.go('clients/:id', x.id)}
          leading={<Text style={[font('700', 14), styles.rank, { color: kit.textMuted }]}>{i + 1}</Text>}
          title={x.name}
          subtitle={`${x.city} · ${x.sector}`}
          trailing={
            <Text style={[font('600', 14), { color: kit.textPrimary }]}>{`${decimal1(x.revenue / 1e6)} M`}</Text>
          }
        />
      ))}
    </KitCard>
  );
}

function Goals({ title }: { title: string }) {
  const { kit } = useKitTheme();
  return (
    <KitCard title={title} icon="mi:flag">
      <ExGap gap={space.s3}>
        {DASH_GOALS.map(([l, v, sub]) => (
          <View key={l}>
            <View style={styles.goalHead}>
              <Text style={[font('600', 14), styles.fill, { color: kit.textPrimary }]}>{l}</Text>
              <Text style={[font('400', 14), { color: kit.textPrimary }]}>{`${v} %`}</Text>
            </View>
            <KitProgressBar value={v / 100} />
            <Text style={[font('400', 12), styles.mt4, { color: kit.textMuted }]}>{sub}</Text>
          </View>
        ))}
      </ExGap>
    </KitCard>
  );
}

function Activity() {
  const { kit } = useKitTheme();
  return (
    <KitCard title="Activité récente" icon="mi:history">
      {EX_ACTIVITY.map((a) => (
        <ExTile
          key={a.text}
          leading={<Icon source={a.icon} size={24} color={toneText(a.tone, kit)} />}
          title={a.text}
          subtitle={`${a.at} · ${a.who}`}
        />
      ))}
    </KitCard>
  );
}

/** Onglets Ventes / Clients / Opérations. */
function DashAnalytics({ tab, period: p }: { tab: number; period: DashPeriod }) {
  const { kit } = useKitTheme();
  const sectors = [...new Set(EX_CLIENTS.map((x) => x.sector))].slice(0, 8);
  if (tab === 1)
    return (
      <ExGap>
        <KitCard title="Facturé par période" icon="mi:bar-chart">
          <KitChart
            kind="bar"
            labels={p.labels}
            series={[
              { label: 'Facturé', data: p.a },
              { label: 'Encaissé', data: p.b },
            ]}
            height={240}
            compactValues
          />
        </KitCard>
        <TopClients />
      </ExGap>
    );
  if (tab === 2)
    return (
      <ExGap>
        <KitCard title="Portefeuille clients" icon="mi:pie-chart-outline">
          <ClientDonut />
        </KitCard>
        <KitCard title="Par secteur" icon="mi:category">
          {sectors.map((s) => (
            <ExTile
              key={s}
              title={s}
              trailing={
                <Text style={[font('400', 14), { color: kit.textPrimary }]}>
                  {EX_CLIENTS.filter((x) => x.sector === s).length}
                </Text>
              }
            />
          ))}
        </KitCard>
      </ExGap>
    );
  return (
    <ExGap>
      <Goals title="Objectifs du trimestre" />
      <Activity />
    </ExGap>
  );
}

/** Tableau de bord (`DashboardExample` Flutter) : périodes, onglets, alerte, KPI, graphiques, listes. */
export function DashboardExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const nav = useExNav();
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState(2);
  const [tab, setTab] = useState(0);
  const [banner, setBanner] = useState(true);
  const p = DASH_PERIODS[period]!;
  const watch = EX_CLIENTS.filter((x) => x.status === 'suspendu' || x.status === 'inactif').slice(0, 5);
  const cols = width <= breakpoints.xl ? 2 : 4;

  return (
    <ExPage maxWidth={1280}>
      <ExHeader
        eyebrow="Vendredi 17 octobre 2026"
        title="Tableau de bord"
        subtitle="Activité commerciale et encaissements de SC Storage."
        actions={
          <>
            <SegmentedToggle
              value={period}
              onChange={setPeriod}
              options={DASH_PERIODS.map((d, i) => ({ value: i, label: d.label }))}
            />
            <KitButton
              label="Exporter"
              icon="mi:download"
              variant="outline"
              onPress={() => snack.demoAction('Export')}
            />
            <KitButton label="Nouvelle facture" icon="mi:add" onPress={() => snack.demoAction('Nouvelle facture')} />
          </>
        }
      />
      <DashTabs index={tab} onChange={setTab} />
      <View style={styles.h16} />
      {tab !== 0 ? (
        <DashAnalytics tab={tab} period={p} />
      ) : (
        <ExGap>
          {banner ? (
            <View style={[styles.banner, { backgroundColor: kit.warningLight }]}>
              <Icon source="mi:warning-amber" size={24} color={kit.warningText} />
              <View style={styles.fill}>
                <Text style={[font('700', 14), { color: kit.warningText }]}>3 factures en retard</Text>
                <Text style={[font('400', 14), { color: kit.warningText }]}>
                  7,3 M FCFA d’encours dépassent l’échéance de plus de 30 jours.
                </Text>
                <View style={styles.start}>
                  <KitButton label="Voir les relances" variant="ghost" onPress={() => snack.demoAction('Relances')} />
                </View>
              </View>
              <KitIconButton
                icon="mi:close"
                iconColor={kit.warningText}
                accessibilityLabel="Fermer l’alerte"
                onPress={() => setBanner(false)}
              />
            </View>
          ) : null}
          <ResponsiveGrid minItemWidth={0} maxColumns={cols} spacing={width <= breakpoints.sm ? space.s3 : space.s4}>
            {DASH_KPIS.map(([label, icon, unit, goodWhenUp], i) => (
              <DashKpi
                key={label}
                icon={icon}
                label={label}
                value={i === 2 ? String(Math.round(p.kpi[i]!)) : exCompact(p.kpi[i]!)}
                unit={unit}
                trend={trendLabel(p.trend[i]!)}
                compare={p.compare}
                up={p.trend[i]! >= 0}
                goodWhenUp={goodWhenUp}
              />
            ))}
          </ResponsiveGrid>
          <KitCard title="Facturé et encaissé" icon="mi:show-chart">
            <KitChart
              kind="area"
              labels={p.labels}
              series={[
                { label: 'Facturé', data: p.a },
                { label: 'Encaissé', data: p.b },
              ]}
              height={220}
              compactValues
            />
          </KitCard>
          <Goals title="Objectifs" />
          <KitCard title="Portefeuille clients" icon="mi:pie-chart-outline">
            <ClientDonut />
          </KitCard>
          <TopClients />
          <Activity />
          <KitCard title="Comptes à surveiller" icon="mi:visibility">
            {watch.map((x) => (
              <ExTile
                key={x.id}
                onPress={() => nav.go('clients/:id', x.id)}
                leading={<KitAvatar name={x.name} />}
                title={x.name}
                subtitle={`${x.owner} · ${x.city} · ${x.invoices} factures`}
                trailing={<StatusBadge label={CLIENT_STATUS[x.status].label} tone={CLIENT_STATUS[x.status].tone} />}
              />
            ))}
          </KitCard>
        </ExGap>
      )}
    </ExPage>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  start: { alignSelf: 'flex-start', marginLeft: -space.s3 },
  mt4: { marginTop: 4 },
  h16: { height: space.s4 },
  tabsBar: { borderBottomWidth: 1 },
  tab: { minHeight: 44, paddingHorizontal: space.s3, borderBottomWidth: 2, justifyContent: 'center' },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.s3,
    borderRadius: 12,
    paddingLeft: space.s3,
    paddingTop: space.s3,
  },
  kpiHead: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  kpiValue: { marginTop: space.s2, letterSpacing: -0.5 },
  kpiTrend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2, marginTop: space.s2 },
  donutBox: { alignItems: 'center' },
  donutCenter: { alignItems: 'center' },
  legend: { alignSelf: 'stretch', marginTop: space.s4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: space.s2, paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pct: { width: 56, textAlign: 'right' },
  rank: { width: 24, textAlign: 'center' },
  goalHead: { flexDirection: 'row', marginBottom: 4 },
});
