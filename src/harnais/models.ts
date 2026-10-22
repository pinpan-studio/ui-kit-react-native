import type { ChartKind, ChartSeries, MapMarkerData, PlanningColumn, PlanningGroup, PlanningItem } from '../components';
import type { KitTone } from '../theme';

/**
 * Modèle du Harnais (`hz_models.dart`) : interface conversationnelle façon assistant IA. Aucune API : les
 * réponses sont simulées localement par le store. Les objets sont immuables ; le store les remplace.
 */

export interface HzOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface HzField {
  key: string;
  label: string;
  kind:
    | 'select'
    | 'text'
    | 'segmented'
    | 'date'
    | 'radio'
    | 'chips'
    | 'slider'
    | 'textarea'
    | 'toggle'
    | 'checkbox'
    | 'rating';
  placeholder?: string;
  icon?: string;
  required?: boolean;
  options?: HzOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  value?: HzValue;
}

export type HzValue = string | number | boolean | string[] | Date | null;
export type HzValues = Record<string, HzValue>;

export interface HzStat {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  tone: KitTone;
  icon?: string;
  hint?: string;
  spark?: number[];
}

export interface HzColumn {
  key: string;
  label: string;
  kind?: 'text' | 'person' | 'number' | 'badge' | 'progress' | 'mono';
  tones?: Record<string, KitTone>;
  unit?: string;
}

export interface HzRecord {
  title: string;
  subtitle?: string;
  meta?: string;
  tone?: KitTone;
  badge?: string;
  badgeTone?: KitTone;
  tags?: string[];
}

export interface HzTimelineItem {
  time: string;
  title: string;
  text?: string;
  tone: KitTone;
  icon: string;
}

export interface HzTreeNode {
  id: string;
  label: string;
  icon: string;
  meta?: string;
  badge?: string;
  badgeTone?: KitTone;
  children?: HzTreeNode[];
}

export const leavesOf = (n: HzTreeNode): HzTreeNode[] => (n.children?.length ? n.children.flatMap(leavesOf) : [n]);

export interface HzSlide {
  title: string;
  text?: string;
  icon?: string;
  tone: KitTone;
  tag?: string;
  stats?: [string, string][];
  /** Visuel embarqué (camion). */
  image?: 'truck';
}

export interface HzStep {
  label: string;
  status: 'done' | 'current' | 'todo' | 'error';
  text?: string;
}

export interface HzPair {
  label: string;
  value: string;
  icon?: string;
  mono?: boolean;
  tone?: KitTone;
  copy?: boolean;
}

export interface HzMeter {
  label: string;
  value: number;
  target: number;
  unit?: string;
  tone?: KitTone;
}

export interface HzCardItem {
  title: string;
  text?: string;
  icon: string;
  tone?: KitTone;
  price?: string;
  meta?: string;
  tags?: string[];
  cta?: string;
}

export interface HzSource {
  title: string;
  site: string;
  snippet?: string;
  date?: string;
}

export interface HzFile {
  name: string;
  ext: string;
  size: string;
  date?: string;
  by?: string;
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

/** Propriétés d'un widget de réponse selon son type (`HarnaisWidget`). */
export type HzWidgetData =
  | { type: 'stats'; items: HzStat[] }
  | { type: 'chart'; kind: ChartKind; unit?: string; labels: string[]; series: ChartSeries[] }
  | {
      type: 'table';
      columns: HzColumn[];
      rows: Record<string, string | number>[];
      searchable?: boolean;
      pageSize?: number;
    }
  | { type: 'map'; markers: MapMarkerData[]; legend?: [string, KitTone][] }
  | { type: 'form'; formId: string; description?: string; submitLabel?: string; fields: HzField[] }
  | { type: 'choices'; question?: string; options: HzOption[] }
  | { type: 'records'; items: HzRecord[] }
  | { type: 'timeline'; items: HzTimelineItem[] }
  | { type: 'callout'; tone: KitTone; icon: string; title: string; text: string }
  | { type: 'calendar'; items: PlanningItem[] }
  | { type: 'kanban'; columns: PlanningColumn[]; items: PlanningItem[] }
  | { type: 'gantt'; groups: PlanningGroup[]; items: PlanningItem[] }
  | { type: 'agenda'; items: PlanningItem[] }
  | { type: 'tree'; submitLabel?: string; nodes: HzTreeNode[] }
  | { type: 'carousel'; slides: HzSlide[] }
  | { type: 'modal'; summary: string; button?: string; dialogTitle: string; dialogSubtitle?: string; blocks: HzW[] }
  | { type: 'tabs'; tabs: [string, string, string | null, HzW[]][] }
  | { type: 'accordion'; items: [string, string, boolean, HzW[]][] }
  | { type: 'steps'; steps: HzStep[] }
  | { type: 'keyvalue'; items: HzPair[] }
  | { type: 'checklist'; items: [string, boolean, string | null][] }
  | { type: 'progress'; items: HzMeter[] }
  | { type: 'diff'; file: string; before: string; after: string }
  | { type: 'json'; data: JsonValue }
  | { type: 'sources'; items: HzSource[] }
  | { type: 'tags'; items: [string, number | null, KitTone | null][] }
  | { type: 'heatmap'; rows: string[]; cols: string[]; values: number[][]; unit?: string }
  | { type: 'files'; items: HzFile[] }
  | { type: 'cards'; items: HzCardItem[] }
  | { type: 'compare'; plans: [string, string, string | null, boolean][]; features: [string, (string | boolean)[]][] }
  | { type: 'approval'; risk?: KitTone; title: string; text: string; command?: string }
  | { type: 'upload'; hint?: string }
  | { type: 'paragraph'; text: string };

export type HzWidgetType = HzWidgetData['type'];

/** Widget affiché dans une réponse : cadre (titre, sous-titre, icône) + données + réponse mémorisée. */
export type HzW = HzWidgetData & {
  block: 'widget';
  id: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  /** Réponse mémorisée (choix, autorisation, fichier, arbre). */
  selected?: string;
  /** Valeurs d'un formulaire soumis (le formulaire passe alors en lecture seule). */
  submitted?: HzValues;
};

export type HzToolKind = 'read' | 'search' | 'bash' | 'edit' | 'web';

/** Bloc d'un message. */
export type HzBlock =
  | { block: 'thinking'; id: string; text: string; duration?: string; running?: boolean }
  | { block: 'text'; id: string; text: string }
  | { block: 'list'; id: string; items: string[] }
  | { block: 'code'; id: string; code: string; lang: string; file?: string }
  | {
      block: 'tool';
      id: string;
      tool: HzToolKind;
      label: string;
      target: string;
      status: 'running' | 'done' | 'error';
      output?: string;
    }
  | { block: 'artifact'; id: string; artifact: string }
  | HzW;

export interface HzAttachment {
  name: string;
  kind: 'code' | 'image' | 'pdf' | 'sheet';
  size: string;
}

export const attachmentIcon = (a: HzAttachment) =>
  a.kind === 'code'
    ? 'mi:code'
    : a.kind === 'image'
      ? 'mi:image'
      : a.kind === 'pdf'
        ? 'mi:picture-as-pdf'
        : 'mi:table-view';

export interface HzMessage {
  id: string;
  role: 'user' | 'assistant';
  blocks: HzBlock[];
  time: string;
  attachments?: HzAttachment[];
  streaming?: boolean;
  stopped?: boolean;
  feedback?: 'up' | 'down';
}

export interface HzConversation {
  id: string;
  title: string;
  group: string;
  model: string;
  pinned?: boolean;
  project?: string;
  messages: HzMessage[];
}

export interface HzModel {
  id: string;
  label: string;
  description: string;
  badge?: string;
}

export interface HzArtifact {
  id: string;
  title: string;
  kind: 'code' | 'document';
  lang: string;
  version: number;
  content: string;
}
