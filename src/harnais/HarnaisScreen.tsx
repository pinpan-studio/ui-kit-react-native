import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Divider, Icon, Menu, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from 'zustand';

import {
  KitAvatar,
  KitBottomSheet,
  KitCard,
  KitIconButton,
  KitProgressBar,
  KitTextField,
  KitTabs,
  MarkdownView,
  ModalDrawer,
  StatusBadge,
  markdownInline,
} from '../components';
import { number } from '../core/format';
import { useKitSnack } from '../core/snack';
import { useBackClose } from '../mobile';
import { PaletteSheet } from '../shell/PaletteSheet';
import { CodeBlock } from '../showcase/doc/Demo';
import { useThemeStore } from '../store/themeStore';
import { elevation, font, radius, space, useKitTheme } from '../theme';
import {
  HZ_ARTIFACTS,
  HZ_ATTACHABLE,
  HZ_CONTEXT,
  HZ_CONTEXT_LIMIT,
  HZ_MODELS,
  HZ_SUGGESTIONS,
  HZ_TASKS,
} from './catalog';
import { HzActionsProvider, HzAttachmentPreview, HzWidgetView, type HzActions } from './HzWidgets';
import { attachmentIcon, type HzAttachment, type HzBlock, type HzConversation, type HzMessage } from './models';
import { createHarnaisStore, type HarnaisStore } from './store';

/**
 * Harnais : interface conversationnelle façon assistant IA, adaptée au mobile (`harnais_screen.dart`).
 * L'historique passe dans un tiroir, le panneau artefacts / contexte / tâches dans une feuille basse.
 * Toutes les réponses sont simulées localement.
 */
export function HarnaisScreen({ onExit, initialConversation }: { onExit: () => void; initialConversation?: string }) {
  const { kit } = useKitTheme();
  const insets = useSafeAreaInsets();
  const snack = useKitSnack();
  const [store] = useState(() => createHarnaisStore(initialConversation));
  const conversations = useStore(store, (s) => s.conversations);
  const activeId = useStore(store, (s) => s.activeId);
  const generating = useStore(store, (s) => s.generating);
  const conv = conversations.find((c) => c.id === activeId);
  const [drawer, setDrawer] = useState(false);
  const [panel, setPanel] = useState(false);
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const dark = useThemeStore((s) => s.mode) === 'dark';
  const setMode = useThemeStore((s) => s.setMode);
  const list = useRef<FlatList<HzMessage>>(null);
  useBackClose(true, onExit);

  const actions: HzActions = {
    busy: generating,
    onAnswer: (w, o) => void store.getState().answer(w, o),
    onSubmit: (w, v, s) => void store.getState().submitForm(w, v, s),
  };
  const artifactIds = new Set(
    (conv?.messages ?? []).flatMap((m) => m.blocks.flatMap((b) => (b.block === 'artifact' ? [b.artifact] : []))),
  );
  const artifacts = artifactIds.size ? HZ_ARTIFACTS.filter((a) => artifactIds.has(a.id)) : HZ_ARTIFACTS;

  return (
    <View style={[styles.fill, { backgroundColor: kit.bg, paddingTop: insets.top }]} testID="harnais">
      <View style={[styles.appBar, { backgroundColor: kit.bg }]}>
        <KitIconButton icon="mi:menu" accessibilityLabel="Conversations" onPress={() => setDrawer(true)} />
        <View style={styles.fill}>
          <Text numberOfLines={1} style={[font('600', 16, 'heading'), { color: kit.textPrimary }]}>
            {conv?.title ?? 'Nouvelle conversation'}
          </Text>
          {conv?.project ? (
            <View style={[styles.row, styles.gap3]}>
              <Icon source="mi:folder-open" size={13} color={kit.textMuted} />
              <Text style={[font('500', 11.5), { color: kit.textMuted }]}>{conv.project}</Text>
            </View>
          ) : null}
        </View>
        <KitIconButton
          icon="mi:rate-review"
          accessibilityLabel="Nouvelle conversation"
          disabled={generating}
          onPress={() => store.getState().newConversation()}
        />
        <KitIconButton
          icon="mi:view-sidebar"
          accessibilityLabel="Artefacts, contexte et tâches"
          onPress={() => setPanel(true)}
        />
        <Menu
          visible={menu}
          onDismiss={() => setMenu(false)}
          anchor={
            <KitIconButton icon="mi:more-vert" accessibilityLabel="Plus d’options" onPress={() => setMenu(true)} />
          }
        >
          {conv ? (
            <Menu.Item
              leadingIcon="mi:ios-share"
              title="Partager"
              onPress={() => {
                setMenu(false);
                void snack.copy(`https://harnais.example/c/${conv.id}`, 'Lien de partage copié');
              }}
            />
          ) : null}
          <Menu.Item
            leadingIcon="mi:contrast"
            title="Changer de thème"
            onPress={() => {
              setMenu(false);
              setMode(dark ? 'light' : 'dark');
            }}
          />
          <Menu.Item
            leadingIcon="palette-outline"
            title="Apparence…"
            onPress={() => {
              setMenu(false);
              setPalette(true);
            }}
          />
          <Menu.Item
            leadingIcon="mi:widgets"
            title="Retour au catalogue"
            testID="exit-harnais"
            onPress={() => {
              setMenu(false);
              onExit();
            }}
          />
        </Menu>
      </View>

      <HzActionsProvider value={actions}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {!conv || conv.messages.length === 0 ? (
            <Welcome store={store} />
          ) : (
            <>
              <FlatList
                ref={list}
                style={styles.fill}
                data={conv.messages}
                keyExtractor={(m) => m.id}
                contentContainerStyle={styles.thread}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => {
                  if (store.getState().generating) list.current?.scrollToEnd({ animated: true });
                }}
                renderItem={({ item, index }) => (
                  <MessageView
                    message={item}
                    isLast={item.role === 'assistant' && index === conv.messages.length - 1 && !generating}
                    store={store}
                    onArtifact={() => setPanel(true)}
                  />
                )}
              />
              <Composer store={store} placeholder="Répondre…" />
              <Text
                style={[
                  font('400', 10.5),
                  styles.disclaimer,
                  { color: kit.textMuted, marginBottom: insets.bottom + space.s2 },
                ]}
              >
                Réponses simulées localement — démonstration statique du UI Kit.
              </Text>
            </>
          )}
        </KeyboardAvoidingView>
      </HzActionsProvider>

      <ModalDrawer visible={drawer} onDismiss={() => setDrawer(false)}>
        <ConversationList
          store={store}
          onOpen={(id) => {
            setDrawer(false);
            store.getState().open(id);
          }}
        />
      </ModalDrawer>
      <KitBottomSheet visible={panel} onDismiss={() => setPanel(false)} maxHeightRatio={0.8} testID="harnais-panel">
        <SidePanel artifacts={artifacts} />
      </KitBottomSheet>
      <PaletteSheet visible={palette} onDismiss={() => setPalette(false)} />
    </View>
  );
}

const greeting = (h: number) => (h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir');

// ── Accueil ─────────────────────────────────────────────────────────

function Welcome({ store }: { store: HarnaisStore }) {
  const { kit } = useKitTheme();
  const [hour] = useState(() => new Date().getHours());
  return (
    <ScrollView contentContainerStyle={styles.welcome} keyboardShouldPersistTaps="handled">
      <View style={styles.welcomeInner}>
        <View style={[styles.row, styles.center, styles.gap10]}>
          <Icon source="mi:auto-awesome" size={28} color={kit.tertiary} />
          <Text
            style={[font('700', 26, 'heading'), styles.shrink, { color: kit.textPrimary }]}
          >{`${greeting(hour)}, Jean`}</Text>
        </View>
        <View style={styles.mt20}>
          <Composer store={store} placeholder="Comment puis-je vous aider aujourd’hui ?" elevated />
        </View>
        <View style={[styles.wrap, styles.center, styles.chipGap, styles.mt8]}>
          {HZ_SUGGESTIONS.map(([icon, label, prompt]) => (
            <TouchableRipple
              key={label}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => void store.getState().send(prompt)}
              style={[styles.suggestion, { backgroundColor: kit.fieldBg }]}
            >
              <View style={[styles.row, styles.gap6]}>
                <Icon source={icon} size={16} color={kit.textSecondary} />
                <Text style={[font('500', 14), { color: kit.textPrimary }]}>{label}</Text>
              </View>
            </TouchableRipple>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ── Historique ──────────────────────────────────────────────────────

function ConversationList({ store, onOpen }: { store: HarnaisStore; onOpen: (id: string | null) => void }) {
  const { kit } = useKitTheme();
  const conversations = useStore(store, (s) => s.conversations);
  const activeId = useStore(store, (s) => s.activeId);
  const [q, setQ] = useState('');
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const shown = conversations.filter((x) => !q || x.title.toLowerCase().includes(q.toLowerCase()));
  const groups: [string, HzConversation[]][] = [];
  const pinned = shown.filter((x) => x.pinned);
  if (pinned.length) groups.push(['Épinglées', pinned]);
  for (const x of shown.filter((c) => !c.pinned)) {
    const g = groups.find(([k]) => k === x.group);
    if (g) g[1].push(x);
    else groups.push([x.group, [x]]);
  }

  const tile = (x: HzConversation) => {
    const on = x.id === activeId;
    return (
      <TouchableRipple
        key={x.id}
        accessibilityRole="button"
        accessibilityLabel={x.title}
        accessibilityState={{ selected: on }}
        onPress={() => onOpen(x.id)}
        style={[styles.convTile, on && { backgroundColor: kit.primaryLight }]}
      >
        <View style={[styles.row, styles.gap8]}>
          {x.pinned ? <Icon source="mi:push-pin" size={16} color={kit.tertiary} /> : null}
          <View style={styles.fill}>
            <Text numberOfLines={1} style={[font('500', 14), { color: on ? kit.primary : kit.textPrimary }]}>
              {x.title}
            </Text>
            {x.project ? <Text style={[font('400', 12), { color: kit.textSecondary }]}>{x.project}</Text> : null}
          </View>
          <Menu
            visible={menuFor === x.id}
            onDismiss={() => setMenuFor(null)}
            anchor={
              <KitIconButton
                icon="mi:more-horiz"
                size={18}
                accessibilityLabel={`Options de ${x.title}`}
                onPress={() => setMenuFor(x.id)}
              />
            }
          >
            <Menu.Item
              title={x.pinned ? 'Désépingler' : 'Épingler'}
              onPress={() => {
                setMenuFor(null);
                store.getState().togglePin(x.id);
              }}
            />
            <Menu.Item
              title="Supprimer"
              titleStyle={{ color: kit.error }}
              onPress={() => {
                setMenuFor(null);
                store.getState().remove(x.id);
              }}
            />
          </Menu>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View style={styles.fill}>
      <View style={[styles.row, styles.drawerHead]}>
        <Icon source="mi:auto-awesome" size={24} color={kit.tertiary} />
        <Text style={[font('700', 18, 'brand'), styles.fill, { color: kit.textPrimary }]}>Harnais</Text>
        <TouchableRipple
          borderless
          accessibilityRole="button"
          accessibilityLabel="Nouvelle conversation"
          onPress={() => onOpen(null)}
          style={[styles.tonalBtn, { backgroundColor: kit.primaryLight }]}
        >
          <Icon source="mi:add" size={22} color={kit.primary} />
        </TouchableRipple>
      </View>
      <View style={styles.drawerSearch}>
        <KitTextField
          value={q}
          onChangeText={setQ}
          hint="Rechercher…"
          icon="mi:search"
          accessibilityLabel="Rechercher"
        />
      </View>
      <ScrollView style={styles.fill} contentContainerStyle={styles.drawerList}>
        {groups.map(([g, items]) => (
          <View key={g}>
            <Text style={[font('700', 10.5), styles.groupHead, { color: kit.textMuted }]}>{g.toUpperCase()}</Text>
            {items.map(tile)}
          </View>
        ))}
        {shown.length === 0 ? (
          <Text style={[font('400', 14), styles.noConv, { color: kit.textMuted }]}>Aucune conversation</Text>
        ) : null}
      </ScrollView>
      <Divider />
      <View style={[styles.row, styles.gap10, styles.me]}>
        <KitAvatar name="Jean Kouassi" size={32} />
        <View>
          <Text style={[font('500', 14), { color: kit.textPrimary }]}>Jean Kouassi</Text>
          <Text style={[font('400', 12), { color: kit.textSecondary }]}>Forfait Pro</Text>
        </View>
      </View>
    </View>
  );
}

// ── Saisie ──────────────────────────────────────────────────────────

function Composer({
  store,
  placeholder,
  elevated = false,
}: {
  store: HarnaisStore;
  placeholder: string;
  elevated?: boolean;
}) {
  const { kit, colorMode } = useKitTheme();
  const modelId = useStore(store, (s) => s.modelId);
  const generating = useStore(store, (s) => s.generating);
  const [text, setText] = useState('');
  const [att, setAtt] = useState<HzAttachment[]>([]);
  const [attach, setAttach] = useState(false);
  const [models, setModels] = useState(false);
  const model = HZ_MODELS.find((m) => m.id === modelId) ?? HZ_MODELS[0]!;
  const canSend = text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    void store.getState().send(text, att);
    setText('');
    setAtt([]);
  };

  return (
    <View
      style={[
        styles.composer,
        { backgroundColor: kit.card, borderColor: kit.border },
        !elevated && styles.composerDocked,
        elevation(3, colorMode),
      ]}
    >
      {att.length ? (
        <View style={[styles.wrap, styles.gap6, styles.composerAtt]}>
          {att.map((a) => (
            <HzAttachmentPreview key={a.name} a={a} onRemove={() => setAtt((l) => l.filter((x) => x !== a))} />
          ))}
        </View>
      ) : null}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={kit.textMuted}
        multiline
        accessibilityLabel="Message"
        style={[font('400', 15), styles.input, { color: kit.textPrimary }]}
      />
      <View style={[styles.row, styles.composerBar]}>
        <KitIconButton icon="mi:add-circle-outline" accessibilityLabel="Joindre" onPress={() => setAttach(true)} />
        <Menu
          visible={models}
          onDismiss={() => setModels(false)}
          anchor={
            <TouchableRipple
              accessibilityRole="button"
              accessibilityLabel={`Modèle : ${model.label}`}
              onPress={() => setModels(true)}
              style={styles.modelBtn}
            >
              <View style={styles.row}>
                <Text style={[font('600', 12.5), { color: kit.textSecondary }]}>{model.label}</Text>
                <Icon source="mi:expand-more" size={18} color={kit.textSecondary} />
              </View>
            </TouchableRipple>
          }
        >
          {HZ_MODELS.map((m) => (
            <TouchableRipple
              key={m.id}
              accessibilityRole="menuitem"
              accessibilityLabel={m.label}
              onPress={() => {
                setModels(false);
                store.getState().setModel(m.id);
              }}
              style={styles.modelItem}
            >
              <View style={[styles.row, styles.gap10]}>
                <View style={styles.fill}>
                  <View style={[styles.row, styles.gap6]}>
                    <Text style={[font('500', 15), { color: kit.textPrimary }]}>{m.label}</Text>
                    {m.badge ? <StatusBadge label={m.badge} tone="tertiary" uppercase={false} /> : null}
                  </View>
                  <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{m.description}</Text>
                </View>
                {m.id === modelId ? <Icon source="mi:check" size={20} color={kit.primary} /> : null}
              </View>
            </TouchableRipple>
          ))}
        </Menu>
        <View style={styles.fill} />
        {generating ? (
          <RoundAction icon="mi:stop" label="Arrêter" color={kit.primary} onPress={() => store.getState().stop()} />
        ) : (
          <RoundAction
            icon="mi:arrow-upward"
            label="Envoyer"
            color={kit.tertiary}
            onPress={canSend ? send : undefined}
          />
        )}
      </View>
      <KitBottomSheet visible={attach} onDismiss={() => setAttach(false)}>
        {HZ_ATTACHABLE.map((a) => (
          <TouchableRipple
            key={a.name}
            accessibilityRole="button"
            accessibilityLabel={a.name}
            onPress={() => {
              setAttach(false);
              setAtt((l) => (l.some((x) => x.name === a.name) ? l : [...l, a]));
            }}
            style={styles.attachRow}
          >
            <View style={[styles.row, styles.gap16]}>
              <Icon source={attachmentIcon(a)} size={24} color={kit.textSecondary} />
              <View>
                <Text style={[font('400', 16), { color: kit.textPrimary }]}>{a.name}</Text>
                <Text style={[font('400', 13), { color: kit.textSecondary }]}>{a.size}</Text>
              </View>
            </View>
          </TouchableRipple>
        ))}
      </KitBottomSheet>
    </View>
  );
}

function RoundAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress?: () => void;
}) {
  const { kit } = useKitTheme();
  return (
    <TouchableRipple
      borderless
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.round, { backgroundColor: onPress ? color : kit.disabledContainer }]}
    >
      <Icon source={icon} size={22} color={onPress ? kit.onPrimary : kit.disabledContent} />
    </TouchableRipple>
  );
}

// ── Message ─────────────────────────────────────────────────────────

const textOf = (m: HzMessage, sep: string) => m.blocks.flatMap((b) => (b.block === 'text' ? [b.text] : [])).join(sep);

function MessageView({
  message: m,
  isLast,
  store,
  onArtifact,
}: {
  message: HzMessage;
  isLast: boolean;
  store: HarnaisStore;
  onArtifact: () => void;
}) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  if (m.role === 'user') {
    return (
      <View style={styles.userMsg}>
        {m.attachments?.length ? (
          <View style={[styles.wrap, styles.gap6, styles.userAtt]}>
            {m.attachments.map((a) => (
              <HzAttachmentPreview key={a.name} a={a} />
            ))}
          </View>
        ) : null}
        <View style={[styles.bubble, { backgroundColor: kit.hover }]}>
          <Text style={[font('400', 14), { color: kit.textPrimary, lineHeight: 20 }]}>{textOf(m, '\n')}</Text>
        </View>
        <Text style={[font('400', 10.5), styles.mt2, { color: kit.textMuted }]}>{m.time}</Text>
      </View>
    );
  }
  const act = (icon: string, label: string, onPress: () => void, color?: string) => (
    <KitIconButton
      icon={icon}
      size={17}
      accessibilityLabel={label}
      iconColor={color ?? kit.textSecondary}
      onPress={onPress}
    />
  );
  return (
    <View style={styles.assistantMsg}>
      <View style={[styles.row, styles.gap6]}>
        <Icon source="mi:auto-awesome" size={18} color={kit.tertiary} />
        <Text style={[font('700', 13), { color: kit.textPrimary }]}>Harnais</Text>
        <Text style={[font('400', 10.5), { color: kit.textMuted }]}>{m.time}</Text>
        {m.streaming ? <ActivityIndicator size={12} color={kit.tertiary} /> : null}
      </View>
      <View style={styles.blocks}>
        {m.blocks.map((b) => (
          <BlockView key={b.id} b={b} onArtifact={onArtifact} />
        ))}
      </View>
      {m.stopped ? (
        <View style={[styles.row, styles.gap6]}>
          <Icon source="mi:stop-circle" size={16} color={kit.textMuted} />
          <Text style={[font('400', 12), styles.italic, { color: kit.textMuted }]}>Génération interrompue</Text>
        </View>
      ) : null}
      {!m.streaming ? (
        <View style={styles.row}>
          {act('mi:content-copy', 'Copier', () => void snack.copy(textOf(m, '\n\n'), 'Réponse copiée'))}
          {act(
            m.feedback === 'up' ? 'mi:thumb-up' : 'mi:thumb-up-off-alt',
            'Bonne réponse',
            () => store.getState().feedback(m.id, 'up'),
            m.feedback === 'up' ? kit.primary : undefined,
          )}
          {act(
            m.feedback === 'down' ? 'mi:thumb-down' : 'mi:thumb-down-off-alt',
            'Mauvaise réponse',
            () => store.getState().feedback(m.id, 'down'),
            m.feedback === 'down' ? kit.error : undefined,
          )}
          {isLast ? act('mi:refresh', 'Régénérer', () => void store.getState().retry()) : null}
        </View>
      ) : null}
    </View>
  );
}

function BlockView({ b, onArtifact }: { b: HzBlock; onArtifact: () => void }) {
  const { kit } = useKitTheme();
  const body = { ...font('400', 14), lineHeight: 21.7, color: kit.textPrimary };
  switch (b.block) {
    case 'thinking':
      return <ThinkingView text={b.text} running={!!b.running} duration={b.duration} />;
    case 'text':
      return <Text style={body}>{markdownInline(b.text, body, kit)}</Text>;
    case 'list':
      return (
        <View>
          {b.items.map((it) => (
            <View key={it} style={styles.bullet}>
              <View style={[styles.dot, { backgroundColor: kit.textSecondary }]} />
              <Text style={[body, styles.fill]}>{markdownInline(it, body, kit)}</Text>
            </View>
          ))}
        </View>
      );
    case 'code':
      return <CodeBlock code={b.code} file={b.file ?? b.lang} rounded />;
    case 'tool':
      return <ToolView t={b} />;
    case 'artifact': {
      const a = HZ_ARTIFACTS.find((x) => x.id === b.artifact);
      if (!a) return null;
      return (
        <KitCard radius={radius.md} padding={space.s3} onPress={onArtifact} accessibilityLabel={`Ouvrir ${a.title}`}>
          <View style={[styles.row, styles.gap10]}>
            <View style={[styles.artIcon, { backgroundColor: kit.tertiaryLight }]}>
              <Icon source={a.kind === 'code' ? 'mi:code' : 'mi:article'} size={22} color={kit.tertiary} />
            </View>
            <View style={styles.fill}>
              <Text style={[font('600', 14), { color: kit.textPrimary }]}>{a.title}</Text>
              <Text style={[font('400', 11.5), { color: kit.textMuted }]}>
                {`${a.kind === 'code' ? 'Code' : 'Document'} · v${a.version} · ${a.content.split('\n').length} lignes`}
              </Text>
            </View>
            <Icon source="mi:open-in-new" size={18} color={kit.textMuted} />
          </View>
        </KitCard>
      );
    }
    case 'widget':
      return <HzWidgetView w={b} />;
  }
}

function ThinkingView({ text, running, duration }: { text: string; running: boolean; duration?: string }) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableRipple
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={styles.thinkingHead}
      >
        <View style={[styles.row, styles.gap6]}>
          <Icon source="mi:psychology" size={17} color={kit.textMuted} />
          <Text style={[font('400', 12.5), running && styles.italic, { color: kit.textMuted }]}>
            {running ? 'Réflexion en cours…' : `Réflexion · ${duration ?? '1 s'}`}
          </Text>
          <Icon source={open ? 'mi:expand-less' : 'mi:expand-more'} size={17} color={kit.textMuted} />
        </View>
      </TouchableRipple>
      {open ? (
        <View style={[styles.thinkingBody, { borderLeftColor: kit.border }]}>
          <Text style={[font('400', 12.5), { color: kit.textSecondary, lineHeight: 19 }]}>{text}</Text>
        </View>
      ) : null}
    </View>
  );
}

const TOOL_ICONS = {
  read: 'mi:description',
  search: 'mi:search',
  bash: 'mi:terminal',
  edit: 'mi:edit',
  web: 'mi:language',
};

function ToolView({ t }: { t: Extract<HzBlock, { block: 'tool' }> }) {
  const { kit } = useKitTheme();
  return (
    <View style={[styles.row, styles.tool, { backgroundColor: kit.hover, borderColor: kit.border }]}>
      <Icon source={TOOL_ICONS[t.tool]} size={16} color={kit.textSecondary} />
      <Text style={[font('700', 12), { color: kit.textSecondary }]}>{t.label}</Text>
      <Text numberOfLines={1} style={[font('400', 11.5, 'mono'), styles.fill, { color: kit.textPrimary }]}>
        {t.target}
      </Text>
      {t.status === 'running' ? (
        <ActivityIndicator size={14} color={kit.primary} />
      ) : t.status === 'done' ? (
        <View style={[styles.row, styles.gap4, styles.toolOut]}>
          <Text numberOfLines={1} style={[font('400', 11), styles.shrink, { color: kit.textMuted }]}>
            {t.output ?? ''}
          </Text>
          <Icon source="mi:check-circle" size={15} color={kit.success} />
        </View>
      ) : (
        <Icon source="mi:cancel" size={15} color={kit.error} />
      )}
    </View>
  );
}

// ── Panneau artefacts / contexte / tâches ───────────────────────────

function SidePanel({ artifacts }: { artifacts: typeof HZ_ARTIFACTS }) {
  const { kit } = useKitTheme();
  const [tab, setTab] = useState(0);
  const used = HZ_CONTEXT.reduce((n, f) => n + f[2], 0);
  const pct = ((used / HZ_CONTEXT_LIMIT) * 100).toFixed(1).replace('.', ',');
  return (
    <View style={styles.panel}>
      <KitTabs
        tabs={[{ label: 'Artefacts' }, { label: 'Contexte' }, { label: 'Tâches' }]}
        selected={tab}
        onSelect={setTab}
        scrollable={false}
      />
      <ScrollView contentContainerStyle={styles.panelBody}>
        {tab === 0
          ? artifacts.map((a) => (
              <View key={a.id} style={styles.mb18}>
                <View style={[styles.row, styles.gap8, styles.mb8]}>
                  <Icon source={a.kind === 'code' ? 'mi:code' : 'mi:article'} size={24} color={kit.tertiary} />
                  <Text style={[font('700', 14), styles.fill, { color: kit.textPrimary }]}>{a.title}</Text>
                  <StatusBadge label={`v${a.version}`} uppercase={false} />
                </View>
                {a.kind === 'code' ? (
                  <CodeBlock code={a.content} file={a.lang} rounded />
                ) : (
                  <KitCard>
                    <MarkdownView source={a.content} />
                  </KitCard>
                )}
              </View>
            ))
          : null}
        {tab === 1 ? (
          <View>
            <Text style={[font('600', 18, 'heading'), { color: kit.textPrimary }]}>Fenêtre de contexte</Text>
            <View style={styles.mt6}>
              <KitProgressBar value={used / HZ_CONTEXT_LIMIT} height={8} />
            </View>
            <Text style={[font('400', 12), styles.mt4, { color: kit.textMuted }]}>
              {`${number(used)} / ${number(HZ_CONTEXT_LIMIT)} jetons (${pct} %)`}
            </Text>
            <View style={styles.mt12}>
              {HZ_CONTEXT.map(([name, path, tokens, kind]) => (
                <View key={name} style={[styles.row, styles.gap16, styles.panelRow]}>
                  <Icon source={kind === 'image' ? 'mi:image' : 'mi:code'} size={24} color={kit.textSecondary} />
                  <View style={styles.fill}>
                    <Text style={[font('400', 16), { color: kit.textPrimary }]}>{name}</Text>
                    <Text style={[font('400', 13), { color: kit.textSecondary }]}>{path}</Text>
                  </View>
                  <Text style={[font('400', 12), { color: kit.textMuted }]}>{`${number(tokens)} j.`}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {tab === 2
          ? HZ_TASKS.map(([label, status]) => (
              <View key={label} style={[styles.row, styles.gap16, styles.panelRow]}>
                {status === 'done' ? (
                  <Icon source="mi:check-circle" size={24} color={kit.success} />
                ) : status === 'running' ? (
                  <ActivityIndicator size={20} color={kit.primary} style={styles.taskSpin} />
                ) : (
                  <Icon source="mi:radio-button-unchecked" size={24} color={kit.textMuted} />
                )}
                <Text
                  style={[
                    font('400', 16),
                    styles.fill,
                    status === 'done' && styles.strike,
                    { color: status === 'done' ? kit.textMuted : kit.textPrimary },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))
          : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  shrink: { flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  gap3: { gap: 3 },
  gap4: { gap: 4 },
  gap6: { gap: 6 },
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  gap16: { gap: 16 },
  mt2: { marginTop: 2 },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  chipGap: { columnGap: 8 },
  mt16: { marginTop: 16 },
  mt20: { marginTop: 20 },
  mb8: { marginBottom: 8 },
  mb18: { marginBottom: 18 },
  italic: { fontStyle: 'italic' },
  strike: { textDecorationLine: 'line-through' },
  appBar: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.s1, gap: 2 },
  thread: { paddingHorizontal: space.s4, paddingTop: space.s3, paddingBottom: space.s6 },
  disclaimer: { textAlign: 'center' },
  welcome: { flexGrow: 1, justifyContent: 'center', padding: 18 },
  welcomeInner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  suggestion: { borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 7, marginVertical: 8 },
  drawerHead: { gap: 8, paddingLeft: space.s4, paddingRight: space.s3, paddingTop: space.s4, paddingBottom: space.s2 },
  tonalBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  drawerSearch: { paddingHorizontal: space.s3 },
  drawerList: { paddingHorizontal: space.s2, paddingVertical: space.s2 },
  groupHead: {
    letterSpacing: 0.8,
    paddingHorizontal: space.s3,
    paddingTop: space.s3,
    paddingBottom: space.s1,
  },
  convTile: {
    borderRadius: radius.md,
    paddingLeft: space.s4,
    paddingRight: space.s1,
    minHeight: 48,
    justifyContent: 'center',
  },
  noConv: { padding: space.s6, textAlign: 'center' },
  me: { paddingHorizontal: space.s4, paddingVertical: space.s3 },
  composer: { borderRadius: 22, borderWidth: 1 },
  composerDocked: { marginHorizontal: space.s3, marginBottom: space.s2 },
  composerAtt: { paddingHorizontal: space.s3, paddingTop: space.s3 },
  input: {
    minHeight: 48,
    maxHeight: 140,
    paddingHorizontal: space.s4,
    paddingTop: space.s4,
    paddingBottom: space.s2,
    textAlignVertical: 'top',
  },
  composerBar: { paddingHorizontal: space.s2, paddingBottom: space.s2 },
  modelBtn: { paddingHorizontal: space.s2, paddingVertical: space.s2, borderRadius: radius.sm },
  modelItem: { paddingHorizontal: space.s4, paddingVertical: space.s2, minWidth: 260 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  attachRow: { paddingHorizontal: space.s4, paddingVertical: space.s3 },
  userMsg: { alignItems: 'flex-end', marginBottom: space.s4, marginLeft: space.s10 },
  userAtt: { justifyContent: 'flex-end', marginBottom: space.s2 },
  bubble: {
    paddingHorizontal: space.s4,
    paddingVertical: space.s3,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: radius.sm,
  },
  assistantMsg: { marginBottom: 18 },
  blocks: { marginTop: 8, gap: space.s3, marginBottom: space.s1 },
  bullet: { flexDirection: 'row', marginBottom: space.s1 },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 9, marginLeft: space.s1, marginRight: space.s2 },
  artIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  thinkingHead: { alignSelf: 'flex-start', borderRadius: radius.sm, paddingVertical: 2 },
  thinkingBody: {
    marginTop: space.s2,
    paddingLeft: space.s3,
    paddingVertical: space.s1,
    paddingRight: space.s1,
    borderLeftWidth: 2,
  },
  tool: { gap: 6, paddingHorizontal: space.s3, paddingVertical: space.s2, borderRadius: radius.md, borderWidth: 1 },
  toolOut: { flexShrink: 1, maxWidth: '45%' },
  panel: { minHeight: 360 },
  panelBody: { padding: space.s4 },
  panelRow: { paddingVertical: space.s2 },
  taskSpin: { width: 24 },
});
