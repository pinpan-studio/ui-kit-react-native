import { createStore } from 'zustand/vanilla';

import { time } from '../core/format';
import {
  answerFollowUp,
  buildConversations,
  detectIntent,
  formFollowUp,
  scenarioFor,
  tool,
  type HzScenario,
} from './catalog';
import type { HzAttachment, HzBlock, HzConversation, HzMessage, HzOption, HzValues, HzW } from './models';

/**
 * État du Harnais (`HarnaisStore`) : conversations, génération simulée en flux (réflexion → outils → texte mot à
 * mot → widgets), arrêt, relance, retours. Les objets sont remplacés, jamais modifiés. Un store par écran,
 * comme le `HarnaisStore` créé par `HarnaisScreen`.
 */
export interface HarnaisState {
  conversations: HzConversation[];
  activeId: string | null;
  modelId: string;
  generating: boolean;
  open: (id: string | null) => void;
  newConversation: () => void;
  setModel: (id: string) => void;
  togglePin: (id: string) => void;
  remove: (id: string) => void;
  feedback: (messageId: string, value: 'up' | 'down') => void;
  stop: () => void;
  send: (text: string, attachments?: HzAttachment[]) => Promise<void>;
  retry: () => Promise<void>;
  submitForm: (form: HzW, values: HzValues, summary: string) => Promise<void>;
  answer: (widget: HzW, option: HzOption) => Promise<void>;
}

/** Durées de la génération simulée (ms). */
export const HZ_TIMING = { thinking: 700, tool: 500, word: 28, widget: 260 };

let seq = 0;
const gid = () => `g${Date.now()}_${seq++}`;
const now = () => {
  const d = new Date();
  return time(d.getHours(), d.getMinutes());
};
const textOf = (m: HzMessage) =>
  m.blocks
    .map((b) => (b.block === 'text' ? b.text : ''))
    .filter(Boolean)
    .join(' ');

/** Crée l'état d'un écran Harnais, ouvert sur `initial` s'il existe. */
export const createHarnaisStore = (initial?: string) =>
  createStore<HarnaisState>()((set, get) => {
    let cancel = false;
    const active = () => get().conversations.find((c) => c.id === get().activeId);

    const patchConv = (id: string, fn: (c: HzConversation) => HzConversation) =>
      set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? fn(c) : c)) }));

    const patchMsg = (convId: string, msgId: string, fn: (m: HzMessage) => HzMessage) =>
      patchConv(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) }));

    const pushMsg = (convId: string, m: HzMessage) =>
      patchConv(convId, (c) => ({ ...c, messages: [...c.messages, m] }));

    /** Remplace un widget de premier niveau, où qu'il soit dans la conversation. */
    const patchWidget = (convId: string, widgetId: string, fn: (w: HzW) => HzW) =>
      patchConv(convId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.blocks.some((b) => b.id === widgetId)
            ? { ...m, blocks: m.blocks.map((b) => (b.id === widgetId && b.block === 'widget' ? fn(b) : b)) }
            : m,
        ),
      }));

    const wait = (ms: number) => new Promise<boolean>((r) => setTimeout(() => r(!cancel), ms));

    const respond = async (convId: string, s: HzScenario, thinking?: string) => {
      set({ generating: true });
      cancel = false;
      const msgId = gid();
      pushMsg(convId, { id: msgId, role: 'assistant', time: now(), blocks: [], streaming: true });
      const started = Date.now();
      const add = (b: HzBlock) => patchMsg(convId, msgId, (m) => ({ ...m, blocks: [...m.blocks, b] }));
      const patch = (id: string, fn: (b: HzBlock) => HzBlock) =>
        patchMsg(convId, msgId, (m) => ({ ...m, blocks: m.blocks.map((b) => (b.id === id ? fn(b) : b)) }));

      const finish = (stopped = false) => {
        patchMsg(convId, msgId, (m) => ({
          ...m,
          streaming: false,
          stopped,
          blocks: m.blocks.map((b) =>
            b.block === 'thinking' && b.running
              ? { ...b, running: false }
              : b.block === 'tool' && b.status === 'running'
                ? { ...b, status: 'error' }
                : b,
          ),
        }));
        cancel = false;
        set({ generating: false });
      };

      // 1. Réflexion.
      const thId = gid();
      add({
        block: 'thinking',
        id: thId,
        text: thinking ?? 'Je récupère les données utiles puis je construis la réponse.',
        running: true,
      });
      if (!(await wait(HZ_TIMING.thinking))) return finish(true);
      const secs = Math.min(9, Math.max(1, Math.round((Date.now() - started) / 1000)));
      patch(thId, (b) => ({ ...b, running: false, duration: `${secs} s` }));

      // 2. Outils.
      for (const t of s.tools ?? [tool('search', 'Recherche', s.tool, 'résultats trouvés')]) {
        const id = gid();
        add({ ...t, id, status: 'running', output: undefined });
        if (!(await wait(HZ_TIMING.tool))) return finish(true);
        patch(id, (b) => ({ ...b, status: 'done', output: t.output }));
      }

      // 3. Introduction, mot à mot.
      const introId = gid();
      let intro = '';
      add({ block: 'text', id: introId, text: '' });
      for (const word of s.intro.split(' ')) {
        intro = intro ? `${intro} ${word}` : word;
        const t = intro;
        patch(introId, (b) => ({ ...b, text: t }));
        if (!(await wait(HZ_TIMING.word))) return finish(true);
      }

      // 4. Widgets, un par un.
      for (const b of s.blocks) {
        add(b);
        if (!(await wait(HZ_TIMING.widget))) return finish(true);
      }

      // 5. Conclusion.
      if (s.outro) add({ block: 'text', id: gid(), text: s.outro });
      finish();
    };

    const userMessage = (t: string, attachments?: HzAttachment[]): HzMessage => ({
      id: gid(),
      role: 'user',
      time: now(),
      blocks: [{ block: 'text', id: gid(), text: t }],
      attachments: attachments?.length ? attachments : undefined,
    });

    const conversations = buildConversations();
    const first = conversations.find((c) => c.id === initial);
    return {
      conversations,
      activeId: first?.id ?? null,
      modelId: first?.model ?? 'opus',
      generating: false,

      open: (id) => {
        const c = get().conversations.find((x) => x.id === id);
        set({ activeId: c ? c.id : null, ...(c ? { modelId: c.model } : null) });
      },
      newConversation: () => set({ activeId: null }),
      setModel: (id) => {
        set({ modelId: id });
        const c = active();
        if (c) patchConv(c.id, (x) => ({ ...x, model: id }));
      },
      togglePin: (id) => patchConv(id, (c) => ({ ...c, pinned: !c.pinned })),
      remove: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
      feedback: (messageId, value) => {
        const c = active();
        if (c) patchMsg(c.id, messageId, (m) => ({ ...m, feedback: m.feedback === value ? undefined : value }));
      },
      stop: () => {
        if (get().generating) cancel = true;
      },

      send: async (raw, attachments) => {
        const t = raw.trim();
        if (!t || get().generating) return;
        let c = active();
        if (!c) {
          c = {
            id: gid(),
            title: t.length > 42 ? `${t.slice(0, 40)}…` : t,
            group: 'Aujourd’hui',
            model: get().modelId,
            messages: [],
          };
          const conv = c;
          set((s) => ({ conversations: [conv, ...s.conversations], activeId: conv.id }));
        }
        pushMsg(c.id, userMessage(t, attachments));
        await respond(
          c.id,
          scenarioFor(detectIntent(t)),
          `L’utilisateur demande : « ${t} ». Je choisis la forme la plus lisible pour y répondre.`,
        );
      },

      retry: async () => {
        const c = active();
        if (!c || get().generating) return;
        const lastUser = c.messages.findLast((m) => m.role === 'user');
        if (!lastUser) return;
        if (c.messages.at(-1)?.role === 'assistant')
          patchConv(c.id, (x) => ({ ...x, messages: x.messages.slice(0, -1) }));
        await respond(
          c.id,
          scenarioFor(detectIntent(textOf(lastUser))),
          'Nouvelle tentative avec une présentation différente.',
        );
      },

      submitForm: async (form, values, summary) => {
        const c = active();
        if (!c || get().generating || form.type !== 'form') return;
        patchWidget(c.id, form.id, (w) => ({ ...w, submitted: values }));
        pushMsg(c.id, userMessage(summary));
        await respond(c.id, formFollowUp(form.formId, values));
      },

      answer: async (widget, option) => {
        const c = active();
        if (!c || get().generating) return;
        patchWidget(c.id, widget.id, (w) => ({ ...w, selected: option.value }));
        pushMsg(c.id, userMessage(option.label));
        await respond(c.id, answerFollowUp(widget.type, option));
      },
    };
  });

export type HarnaisStore = ReturnType<typeof createHarnaisStore>;
