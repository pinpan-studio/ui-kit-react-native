import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Card, Chip, Divider, List, SegmentedButtons, Text } from 'react-native-paper';

import { Page } from '../shell/Page';
import { radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" accessibilityRole="header">
        {title}
      </Text>
      <Card mode="outlined">
        <Card.Content style={styles.content}>{children}</Card.Content>
      </Card>
    </View>
  );
}
function Block({ color, height = 58, label }: { color: string; height?: number; label?: string }) {
  return (
    <View style={[styles.block, { backgroundColor: color, minHeight: height }]}>
      {label ? <Text variant="labelSmall">{label}</Text> : null}
    </View>
  );
}

export function LayoutGallery() {
  const theme = useKitTheme();
  const { width: deviceWidth } = useWindowDimensions();
  const [frame, setFrame] = useState('phone');
  const frameWidth = frame === 'phone' ? 375 : 820;
  const columns = frameWidth < 600 ? 1 : frameWidth < 960 ? 2 : 3;
  const [layout, setLayout] = useState('comfortable');
  const palette = [theme.colors.primaryContainer, theme.colors.secondaryContainer, theme.colors.tertiaryContainer];

  return (
    <Page testID="category-layout">
      <Text variant="titleLarge" accessibilityRole="header">
        Layout
      </Text>
      <Text variant="bodyLarge">
        Structures de page adaptatives : conteneurs, grilles, panneaux et points de rupture.
      </Text>
      <SegmentedButtons
        value={frame}
        onValueChange={setFrame}
        buttons={[
          { value: 'phone', label: 'Téléphone · 375 dp', icon: 'cellphone' },
          { value: 'tablet', label: 'Tablette · 820 dp', icon: 'tablet' },
        ]}
      />
      <Text variant="bodySmall">
        Aperçu simulé · fenêtre courante : {Math.round(deviceWidth)} dp · largeur d’essai : {frameWidth} dp
      </Text>

      <Section title="Page layout">
        <View style={[styles.appFrame, { borderColor: theme.colors.outlineVariant }]}>
          <View style={[styles.appBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleMedium">☰　Clients</Text>
            <Text>⌕　♧</Text>
          </View>
          <View style={styles.pageContent}>
            <Text variant="labelMedium">REGISTRE</Text>
            <Text variant="headlineSmall">Clients</Text>
            <Text variant="bodySmall">40 clients · 31 actifs</Text>
            <View style={styles.row}>
              <Button mode="outlined">Filtrer</Button>
              {frame === 'tablet' ? (
                <Button mode="contained" icon="plus">
                  Nouveau client
                </Button>
              ) : null}
            </View>
            {['Transports Yao & Fils', 'Bolloré Logistics CI', 'SOTRA'].map((name, index) => (
              <List.Item
                key={name}
                title={name}
                description={`${24 - index * 5} véhicules · ${index ? 'Actif' : 'À jour'}`}
                left={(p) => <List.Icon {...p} icon="domain" />}
                right={() => <Chip compact>{index ? 'Actif' : 'Premium'}</Chip>}
              />
            ))}
          </View>
          {frame === 'phone' ? (
            <View style={[styles.bottomNav, { borderTopColor: theme.colors.outlineVariant }]}>
              <Text>⌂　Accueil　　 ♙　Clients　　 ⚒　Missions</Text>
            </View>
          ) : null}
        </View>
      </Section>

      <Section title="Dashboard layout">
        <Text variant="titleMedium">Tableau de bord</Text>
        <View style={styles.grid}>
          {[
            ['1 284', 'Clients'],
            ['8 432', 'Véhicules'],
            ['55,8 M', 'CA'],
            ['17', 'Alertes'],
          ].map(([value, label], index) => (
            <View key={label} style={[styles.gridItem, { width: `${100 / Math.min(columns, 2) - 2}%` }]}>
              <Card mode="contained" style={{ backgroundColor: palette[index % 3] }}>
                <Card.Content style={styles.kpi}>
                  <Text variant="headlineSmall">{value}</Text>
                  <Text variant="bodySmall">{label}</Text>
                </Card.Content>
              </Card>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <Card mode="outlined" style={styles.chart}>
            <Card.Content>
              <Text variant="labelLarge">Chiffre d’affaires</Text>
              <ChartBars theme={theme} />
            </Card.Content>
          </Card>
          {frame === 'tablet' ? (
            <Card mode="outlined" style={styles.chart}>
              <Card.Content>
                <Text variant="labelLarge">Répartition</Text>
                <View style={styles.donut}>
                  <Text>60 %</Text>
                </View>
              </Card.Content>
            </Card>
          ) : null}
        </View>
      </Section>

      <Section title="Two columns">
        <View style={[styles.columns, frame === 'tablet' && styles.tabletColumns]}>
          <Card mode="outlined" style={styles.mainColumn}>
            <Card.Title title="Informations" left={(p) => <List.Icon {...p} icon="information-outline" />} />
            <Card.Content>
              <InfoLine label="Raison sociale" value="Transports Yao & Fils" />
              <InfoLine label="Contact" value="Jean Kouassi" />
              <InfoLine label="Ville" value="Abidjan" />
              <InfoLine label="Véhicules" value="24" />
            </Card.Content>
          </Card>
          <Card mode="outlined" style={styles.sideColumn}>
            <Card.Title title="Activité" left={(p) => <List.Icon {...p} icon="history" />} />
            <Card.Content>
              <Text>Contrat renouvelé · Aujourd’hui</Text>
              <Divider style={styles.divider} />
              <Text>Intervention clôturée · Hier</Text>
              <Divider style={styles.divider} />
              <Text>Nouvelle facture · 18 oct.</Text>
            </Card.Content>
          </Card>
        </View>
      </Section>

      <Section title="Three columns">
        <View style={styles.grid}>
          {[
            ['Essentiel', '9 900 F', 'gps-fixed'],
            ['Standard', '14 500 F', 'verified'],
            ['Premium', '24 000 F', 'workspace-premium'],
          ].map(([label, price, icon], index) => (
            <View key={label} style={[styles.gridItem, { width: `${100 / columns - 2}%`, minWidth: 120 }]}>
              <Card mode="outlined">
                <Card.Content style={styles.content}>
                  <Text variant="headlineSmall">{icon === 'gps-fixed' ? '⌖' : icon === 'verified' ? '✓' : '★'}</Text>
                  <Text variant="titleMedium">{label}</Text>
                  <Text>{price} / mois</Text>
                  <Button mode="text">Choisir</Button>
                </Card.Content>
              </Card>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Sidebar layout">
        <View
          style={[
            styles.appFrame,
            {
              minHeight: 220,
              flexDirection: frame === 'tablet' ? 'row' : 'column',
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          {frame === 'tablet' ? (
            <View style={[styles.rail, { backgroundColor: theme.colors.surfaceVariant }]}>
              {['Accueil', 'Clients', 'Missions'].map((item, index) => (
                <Chip
                  key={item}
                  selected={index === 1}
                  icon={['view-dashboard-outline', 'account-group-outline', 'wrench-outline'][index]}
                >
                  {item}
                </Chip>
              ))}
            </View>
          ) : (
            <View style={[styles.appBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text>☰　Clients</Text>
            </View>
          )}
          <View style={[styles.pageContent, { flex: 1, justifyContent: 'center' }]}>
            <Text variant="titleMedium">Contenu principal</Text>
            <Text>La navigation change avec la largeur disponible.</Text>
            {frame === 'phone' ? (
              <View style={styles.row}>
                <Chip>⌂ Accueil</Chip>
                <Chip selected>Clients</Chip>
                <Chip>⚒ Missions</Chip>
              </View>
            ) : null}
          </View>
        </View>
      </Section>

      <Section title="Pleine largeur">
        <Text variant="bodyMedium">
          Le contenu de lecture garde une largeur maximale; les tableaux et cartes peuvent s’étendre sur tout l’écran.
        </Text>
        <View style={[styles.contentWidth, { backgroundColor: theme.colors.surfaceVariant, alignSelf: 'center' }]}>
          <Text variant="titleSmall">Contenu éditorial · largeur 680 dp max</Text>
          <Text>Informations présentées dans une mesure confortable, même sur un écran large.</Text>
        </View>
        <Block color={theme.colors.primaryContainer} height={44} label="Tableau plein écran · 100 % de la largeur" />
      </Section>

      <Section title="Card sections">
        <Card mode="outlined">
          <Card.Title title="Informations client" subtitle="Données générales" />
          <Card.Content>
            <InfoLine label="Société" value="Transports Yao & Fils" />
            <InfoLine label="Ville" value="Abidjan" />
          </Card.Content>
          <Card.Actions>
            <Button>Modifier</Button>
            <Button mode="contained-tonal">Voir la fiche</Button>
          </Card.Actions>
        </Card>
        <Card mode="contained">
          <Card.Content style={styles.content}>
            <Text variant="titleMedium">Contrat Premium</Text>
            <Text>24 véhicules · renouvellement le 28/02/2027</Text>
            <Block color={theme.colors.primaryContainer} height={8} />
            <Text variant="bodySmall">62 % de la période écoulée</Text>
          </Card.Content>
        </Card>
      </Section>

      <Section title="Conteneurs responsive">
        <SegmentedButtons
          value={layout}
          onValueChange={setLayout}
          buttons={[
            { value: 'comfortable', label: 'Confortable' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
        <View style={styles.grid}>
          {Array.from({ length: 6 }, (_, index) => (
            <View key={index} style={[styles.gridItem, { width: `${100 / columns - 2}%`, minWidth: 100 }]}>
              <Block
                color={palette[index % 3] ?? theme.colors.primaryContainer}
                height={layout === 'compact' ? 44 : 78}
                label={`Carte ${index + 1}`}
              />
            </View>
          ))}
        </View>
        <Text variant="bodySmall">
          Grille active : {columns} colonne(s) ·{' '}
          {layout === 'comfortable' ? 'espacements confortables' : 'espacements compacts'}.
        </Text>
      </Section>

      <Section title="Breakpoints">
        <View style={styles.breakpointRow}>
          {[
            ['compact', '< 600 dp'],
            ['medium', '600–959 dp'],
            ['expanded', '≥ 960 dp'],
          ].map(([name, range], index) => (
            <Card
              key={name}
              mode="outlined"
              style={[
                styles.breakpointCard,
                {
                  borderColor: (frameWidth < 600 ? index === 0 : frameWidth < 960 ? index === 1 : index === 2)
                    ? theme.colors.primary
                    : theme.colors.outlineVariant,
                },
              ]}
            >
              <Card.Content>
                <Text variant="titleSmall">{name}</Text>
                <Text variant="bodySmall">{range}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
        <Text variant="bodySmall">
          Largeur d’essai {frameWidth} dp · changement de layout aux points de rupture du kit.
        </Text>
      </Section>
    </Page>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text variant="bodySmall">{label}</Text>
      <Text variant="bodyMedium">{value}</Text>
    </View>
  );
}
function ChartBars({ theme }: { theme: ReturnType<typeof useKitTheme> }) {
  return (
    <View style={styles.bars}>
      {[42, 58, 48, 76, 64, 90, 69, 100, 83, 110, 94, 125].map((height, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            { height, backgroundColor: index === 11 ? theme.colors.primary : theme.colors.primaryContainer },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s2 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s2 },
  block: { width: '100%', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', padding: space.s2 },
  appFrame: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
  appBar: {
    height: 52,
    paddingHorizontal: space.s3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageContent: { padding: space.s3, gap: space.s2 },
  bottomNav: { minHeight: 50, borderTopWidth: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  gridItem: { minWidth: 118 },
  kpi: { gap: space.s1 },
  chart: { flex: 1, minWidth: 200 },
  bars: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: space.s2,
  },
  bar: { width: 10, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  donut: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 16,
    borderColor: '#91b4f4',
    borderRadius: 60,
    marginTop: space.s2,
  },
  columns: { gap: space.s2 },
  tabletColumns: { flexDirection: 'row' },
  mainColumn: { flex: 2, minWidth: 210 },
  sideColumn: { flex: 1, minWidth: 190 },
  infoLine: {
    paddingVertical: space.s2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#aab2c0',
    gap: space.s1,
  },
  divider: { marginVertical: space.s1 },
  rail: { minWidth: 150, padding: space.s2, gap: space.s1 },
  contentWidth: { width: '100%', maxWidth: 680, padding: space.s3, borderRadius: radius.md, gap: space.s1 },
  breakpointRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  breakpointCard: { flex: 1, minWidth: 115 },
});
