import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  AgendaView,
  EMPTY_FILTERS,
  GanttTimeline,
  GroupedBoard,
  KanbanBoard,
  MonthCalendar,
  NoteGrid,
  PlanningToolbar,
  SegmentedToggle,
  applyPlanningFilters,
  isLate,
  type PlanningItem,
} from '../components';
import { useKitSnack } from '../core/snack';
import {
  INTERVENTION_COLUMNS,
  INTERVENTION_FILTERS,
  MOTIF_FILTER,
  RDV_KIND_FILTER,
  TECHNICIENS,
  VEHICULES,
  buildInterventions,
  buildPhases,
  buildRendezVous,
  buildReservations,
} from '../data/planning';
import { font, toneColor, useKitTheme, type KitTone } from '../theme';
import { Demo, DocPage, Gap, type DocSection } from './doc';

const MODEL_CODE = `interface PlanningItem {
  id: string; title: string;
  ref?: string; description?: string; status?: string;
  group?: string; assignee?: string; badge?: string;
  start?: Date; end?: Date; due?: Date; // retard = due dépassée et !done
  done?: boolean;
  progress?: number;                    // 0–100
  tone?: KitTone;                       // couleur sémantique (suit le thème)
  tags?: string[];
  fields?: Record<string, string>;      // valeurs filtrables
}

const filters: PlanningFilter[] = [{ key: 'type', label: 'Type', options: […] }];
applyPlanningFilters(items, filters, state);`;

/** `/components/planning` — vues de planification génériques sur un modèle commun. */
export function PlanningGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [inters, setInters] = useState(buildInterventions);
  const [reservations] = useState(buildReservations);
  const [phases] = useState(buildPhases);
  const [rdvs] = useState(buildRendezVous);
  const [kanbanF, setKanbanF] = useState(EMPTY_FILTERS);
  const [ganttF, setGanttF] = useState(EMPTY_FILTERS);
  const [agendaF, setAgendaF] = useState(EMPTY_FILTERS);
  const [byVehicle, setByVehicle] = useState<'vehicule' | 'projet'>('vehicule');

  const kanbanItems = applyPlanningFilters(inters, INTERVENTION_FILTERS, kanbanF);
  const resa = applyPlanningFilters(reservations, [MOTIF_FILTER], ganttF);
  const rdv = applyPlanningFilters(rdvs, [RDV_KIND_FILTER], agendaF);

  const patch = (id: string, f: (x: PlanningItem) => PlanningItem) =>
    setInters((all) => all.map((x) => (x.id === id ? f(x) : x)));

  const counters: [string, number, KitTone][] = [
    ['Interventions', inters.length, 'primary'],
    ['En retard', inters.filter((i) => isLate(i)).length, 'error'],
    ['Terminées', inters.filter((i) => i.done).length, 'success'],
  ];

  const sections: DocSection[] = [
    {
      id: 'model',
      title: 'Modèle & options',
      source: 'planning/models.ts',
      description:
        'Interventions, réservations, tâches ou rendez-vous se projettent tous sur PlanningItem. Les dates sont relatives à aujourd’hui : retards et ligne « aujourd’hui » restent parlants.',
      children: (
        <Demo label="PlanningItem" code={MODEL_CODE}>
          <View style={styles.row}>
            {counters.map(([label, n, tone]) => (
              <View key={label} style={styles.counter}>
                <Text style={[font('700', 22), { color: toneColor(tone, kit) }]}>{n}</Text>
                <Text style={[font('400', 12), { color: kit.textSecondary }]}>{label}</Text>
              </View>
            ))}
          </View>
        </Demo>
      ),
    },
    {
      id: 'kanban',
      title: 'Kanban',
      source: 'KanbanBoard',
      description:
        'Colonnes défilant horizontalement ; appui long sur une carte pour la glisser dans une autre colonne. Touchez une carte pour sa fiche.',
      children: (
        <Demo label="Interventions terrain">
          <Gap>
            <PlanningToolbar
              state={kanbanF}
              filters={INTERVENTION_FILTERS}
              count={kanbanItems.length}
              onChange={setKanbanF}
            />
            <KanbanBoard
              columns={INTERVENTION_COLUMNS}
              items={kanbanItems}
              onMove={(it, status) => {
                const done = status === 'cloturee';
                patch(it.id, (x) => ({ ...x, status, done, progress: done ? 100 : x.progress }));
                const label = INTERVENTION_COLUMNS.find((c) => c.key === status)?.label ?? status;
                snack.show(`${it.ref ?? it.title} → ${label}`, { kind: 'success' });
              }}
            />
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'timeline',
      title: 'Timeline / Gantt',
      source: 'GanttTimeline',
      description:
        'Libellés fixes, jours défilants, zoom, retour à aujourd’hui ; la progression remplit la barre, les retards sont cerclés de rouge.',
      children: (
        <Demo label="Réservations de véhicules">
          <Gap>
            <PlanningToolbar state={ganttF} filters={[MOTIF_FILTER]} onChange={setGanttF} />
            <SegmentedToggle
              expand
              value={byVehicle}
              onChange={setByVehicle}
              options={[
                { value: 'vehicule', label: 'Par véhicule', icon: 'mi:directions-car' },
                { value: 'projet', label: 'Projet (phases)', icon: 'mi:flag' },
              ]}
            />
            {byVehicle === 'vehicule' ? (
              <GanttTimeline key="g" items={resa} groups={VEHICULES} />
            ) : (
              <GanttTimeline key="p" items={phases} startOffset={-13} days={26} />
            )}
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'notes',
      title: 'Grille de notes',
      source: 'NoteGrid',
      children: (
        <Demo label="Notes">
          <NoteGrid
            items={inters.slice(0, 8)}
            onToggle={(it) => patch(it.id, (x) => ({ ...x, done: !x.done, status: x.done ? 'planifiee' : 'cloturee' }))}
          />
        </Demo>
      ),
    },
    {
      id: 'grouped',
      title: 'Vue groupée',
      source: 'GroupedBoard',
      children: (
        <Demo label="Par technicien">
          <GroupedBoard groups={TECHNICIENS} items={inters} />
        </Demo>
      ),
    },
    {
      id: 'calendar',
      title: 'Calendrier',
      source: 'MonthCalendar',
      description: 'Grille compacte avec pastilles colorées ; la liste du jour sélectionné s’affiche dessous.',
      children: (
        <Demo label="Interventions du mois">
          <MonthCalendar items={inters} />
        </Demo>
      ),
    },
    {
      id: 'agenda',
      title: 'Agenda',
      source: 'AgendaView',
      description:
        'Bande de la semaine + chronologie horaire du jour (chevauchements en colonnes, ligne de l’heure courante) ou liste de la semaine.',
      children: (
        <Demo label="Rendez-vous de la semaine">
          <Gap>
            <PlanningToolbar state={agendaF} filters={[RDV_KIND_FILTER]} lateToggle={false} onChange={setAgendaF} />
            <AgendaView items={rdv} />
          </Gap>
        </Demo>
      ),
    },
  ];

  return (
    <DocPage
      title="Planning"
      icon="mi:view-timeline"
      initialSection={initialSection}
      testID="category-planning"
      subtitle="Vues de planification génériques : kanban, Gantt, notes, vue groupée, calendrier et agenda. Toutes reposent sur le même modèle PlanningItem et partagent une barre d’outils dont chaque bloc est optionnel."
      sections={sections}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  counter: { flex: 1, alignItems: 'center' },
});
