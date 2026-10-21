import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, List, SegmentedButtons, Text } from 'react-native-paper';

import { Page } from '../shell/Page';
import { space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const TASKS = [
  {
    id: 'INT-0418',
    title: 'Relancer Bolloré Logistics',
    owner: 'Mariam K.',
    status: 'À planifier',
    due: 'Aujourd’hui',
  },
  { id: 'DEV-118', title: 'Valider le devis', owner: 'Jean K.', status: 'En cours', due: 'Demain' },
  { id: 'INT-0412', title: 'Contrôle de balise CI-4521-AB', owner: 'Aïcha D.', status: 'Clôturée', due: '21 oct.' },
  { id: 'INT-0420', title: 'Préparer le rapport terrain', owner: 'Yao N.', status: 'En cours', due: '24 oct.' },
];

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

export function PlanningGallery() {
  const theme = useKitTheme();
  const [status, setStatus] = useState<Record<string, string>>(() =>
    Object.fromEntries(TASKS.map((item) => [item.id, item.status])),
  );
  const [ganttMode, setGanttMode] = useState('vehicle');
  const [groupBy, setGroupBy] = useState('technician');
  const [month, setMonth] = useState(10);
  const [day, setDay] = useState(21);
  const [agendaMode, setAgendaMode] = useState('timeline');
  const monthLabel = month === 10 ? 'Octobre 2026' : 'Novembre 2026';
  const completed = Object.values(status).filter((value) => value === 'Clôturée').length;

  const moveTask = (id: string) =>
    setStatus((current) => ({ ...current, [id]: current[id] === 'Clôturée' ? 'En cours' : 'Clôturée' }));
  const taskRows = TASKS.map((task) => ({ ...task, status: status[task.id] ?? task.status }));

  return (
    <Page testID="category-planning">
      <Text variant="titleLarge" accessibilityRole="header">
        Planning
      </Text>
      <Text variant="bodyLarge">
        Vues de planification reliées à un même jeu d’interventions, avec filtres et changements d’état locaux.
      </Text>

      <Section title="Modèle & options">
        <Text variant="bodyMedium">
          PlanningItem regroupe titre, référence, responsable, statut, échéance, progression, tags et champs filtrables.
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text variant="headlineSmall">{TASKS.length}</Text>
            <Text variant="bodySmall">Interventions</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
              1
            </Text>
            <Text variant="bodySmall">En retard</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {completed}
            </Text>
            <Text variant="bodySmall">Terminées</Text>
          </View>
        </View>
      </Section>

      <Section title="Kanban">
        <Text variant="bodySmall">Touchez une intervention pour basculer son statut.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanban}>
          {(['À planifier', 'En cours', 'Clôturée'] as const).map((column) => {
            const items = taskRows.filter((task) => task.status === column);
            return (
              <View key={column} style={[styles.column, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="labelLarge">
                  {column} · {items.length}
                </Text>
                {items.map((task) => (
                  <Card key={task.id} mode="contained" onPress={() => moveTask(task.id)}>
                    <Card.Content style={styles.task}>
                      <Text variant="labelSmall">
                        {task.id} · {task.owner}
                      </Text>
                      <Text variant="bodyMedium">{task.title}</Text>
                      <Text variant="bodySmall">{task.due}</Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </Section>

      <Section title="Timeline / Gantt">
        <SegmentedButtons
          value={ganttMode}
          onValueChange={setGanttMode}
          buttons={[
            { value: 'vehicle', label: 'Par véhicule', icon: 'car-outline' },
            { value: 'phase', label: 'Par phase', icon: 'flag-outline' },
          ]}
        />
        {(ganttMode === 'vehicle'
          ? ['CI-4521-AB · Toyota Hilux', 'CI-2087-CD · Isuzu D-Max', 'CI-7734-EF · Hyundai H1']
          : ['Diagnostic', 'Commande des pièces', 'Intervention', 'Contrôle final']
        ).map((label, index) => (
          <View key={label} style={styles.timelineRow}>
            <Text variant="labelMedium" style={styles.timelineLabel}>
              {label}
            </Text>
            <View style={[styles.timelineTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View
                style={[
                  styles.timelineBar,
                  {
                    left: `${index * 11 + 5}%`,
                    width: `${55 - index * 6}%`,
                    backgroundColor: index === 2 ? theme.colors.errorContainer : theme.colors.primaryContainer,
                  },
                ]}
              />
            </View>
          </View>
        ))}
        <Text variant="bodySmall">21 oct. · Aujourd’hui · 22 oct. · 23 oct. · 24 oct.</Text>
      </Section>

      <Section title="Grille de notes">
        {taskRows.slice(0, 3).map((task) => (
          <List.Item
            key={task.id}
            title={task.title}
            description={`${task.id} · ${task.owner}`}
            left={(p) => (
              <List.Icon
                {...p}
                icon={task.status === 'Clôturée' ? 'check-circle-outline' : 'checkbox-blank-circle-outline'}
              />
            )}
            right={() => (
              <Chip compact onPress={() => moveTask(task.id)}>
                {task.status}
              </Chip>
            )}
          />
        ))}
        <Text variant="bodySmall">Touchez un statut pour marquer l’intervention comme terminée ou la rouvrir.</Text>
      </Section>

      <Section title="Vue groupée">
        <SegmentedButtons
          value={groupBy}
          onValueChange={setGroupBy}
          buttons={[
            { value: 'technician', label: 'Par technicien' },
            { value: 'status', label: 'Par statut' },
          ]}
        />
        {(groupBy === 'technician'
          ? ['Mariam K.', 'Jean K.', 'Aïcha D.']
          : ['À planifier', 'En cours', 'Clôturée']
        ).map((group) => {
          const items = taskRows.filter((task) =>
            groupBy === 'technician' ? task.owner === group : task.status === group,
          );
          return (
            <View key={group}>
              <List.Subheader>
                {group} · {items.length}
              </List.Subheader>
              {items.map((task) => (
                <List.Item key={task.id} title={task.title} description={`${task.id} · ${task.due}`} />
              ))}
            </View>
          );
        })}
      </Section>

      <Section title="Calendrier">
        <View style={styles.monthHeader}>
          <Button
            icon="chevron-left"
            onPress={() => {
              setMonth(month === 10 ? 11 : 10);
              setDay(1);
            }}
          >
            Précédent
          </Button>
          <Text variant="titleSmall">{monthLabel}</Text>
          <Button
            icon="chevron-right"
            onPress={() => {
              setMonth(month === 10 ? 11 : 10);
              setDay(1);
            }}
          >
            Suivant
          </Button>
        </View>
        <View style={styles.calendar}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label, index) => (
            <Text key={`${label}-${index}`} variant="labelSmall" style={styles.calendarCell}>
              {label}
            </Text>
          ))}
          {Array.from({ length: 35 }, (_, index) => index - 2).map((value, index) => {
            const visible = value > 0 && value <= (month === 10 ? 31 : 30);
            const selected = visible && value === day;
            return (
              <Button
                key={index}
                compact
                mode={selected ? 'contained' : 'text'}
                style={styles.calendarCell}
                onPress={() => visible && setDay(value)}
                disabled={!visible}
              >
                {visible ? value : ''}
              </Button>
            );
          })}
        </View>
        <Divider />
        <Text variant="labelLarge">
          {day} {month === 10 ? 'octobre' : 'novembre'} · 2 interventions
        </Text>
        <Text variant="bodyMedium">09:30 · Contrôle de balise CI-4521-AB</Text>
        <Text variant="bodyMedium">14:00 · Revue des interventions terrain</Text>
      </Section>

      <Section title="Agenda">
        <SegmentedButtons
          value={agendaMode}
          onValueChange={setAgendaMode}
          buttons={[
            { value: 'timeline', label: 'Chronologie' },
            { value: 'week', label: 'Semaine' },
          ]}
        />
        <View style={styles.row}>
          {['Lun 19', 'Mar 20', 'Mer 21', 'Jeu 22', 'Ven 23'].map((label, index) => (
            <Chip key={label} selected={index === 2} onPress={() => setDay(19 + index)}>
              {label}
            </Chip>
          ))}
        </View>
        {(agendaMode === 'timeline'
          ? [
              '08:30 · Préparation du matériel',
              '09:30 · Contrôle CI-4521-AB',
              '11:00 · Déplacement vers Cocody',
              '14:00 · Revue de conception',
            ]
          : taskRows.map((task) => `${task.due} · ${task.title}`)
        ).map((item) => (
          <List.Item key={item} title={item} left={(p) => <List.Icon {...p} icon="calendar-clock" />} />
        ))}
      </Section>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s2 },
  stats: { flexDirection: 'row', gap: space.s3 },
  stat: { flex: 1, gap: space.s1 },
  kanban: { gap: space.s2 },
  column: { width: 230, minHeight: 150, padding: space.s2, borderRadius: 12, gap: space.s2 },
  task: { gap: space.s1 },
  timelineRow: { gap: space.s1 },
  timelineLabel: { minHeight: 24 },
  timelineTrack: { height: 16, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  timelineBar: { position: 'absolute', top: 0, bottom: 0, borderRadius: 8 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendar: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.285%', minWidth: 36, textAlign: 'center', marginHorizontal: 0, paddingHorizontal: 0 },
});
