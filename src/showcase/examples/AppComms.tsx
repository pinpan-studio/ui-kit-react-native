import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import {
  CountDot,
  EmptyState,
  KitAvatar,
  KitButton,
  KitCard,
  KitIconButton,
  KitProgressBar,
  KitTextField,
  ModalDrawer,
  SegmentedToggle,
  StatusBadge,
} from '../../components';
import { useKitSnack } from '../../core/snack';
import {
  CHAT_CONVERSATIONS,
  CURRENT_USER,
  EX_MESSAGES,
  FEED_POSTS,
  chatPerson,
  chatTitle,
  type ChatConv,
  type ExMessage,
  type FeedPost,
} from '../../data/examples';
import { breakpoints, font, kitText, radius, space, toneText, useKitTheme, type KitTone } from '../../theme';
import { CommentView, ExInline, ExPage, ExTile, FilePicker } from './ExKit';

const FOLDERS: [string, string, string][] = [
  ['inbox', 'Boîte de réception', 'mi:inbox'],
  ['starred', 'Suivis', 'mi:star-border'],
  ['sent', 'Envoyés', 'mi:send'],
  ['drafts', 'Brouillons', 'mi:drafts'],
  ['archive', 'Archives', 'mi:archive'],
];

const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

/** Champ de saisie + bouton d'envoi plein (réponse, message, publication). */
function Composer({
  hint,
  onSend,
  leading,
  sendLabel = 'Envoyer',
}: {
  hint: string;
  onSend: (text: string) => void;
  leading?: ReactNode;
  sendLabel?: string;
}) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };
  return (
    <View style={styles.composer}>
      {leading}
      <View style={styles.fill}>
        <KitTextField
          hint={hint}
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          accessibilityLabel={hint}
        />
      </View>
      <KitIconButton icon="mi:send" mode="contained" accessibilityLabel={sendLabel} onPress={send} />
    </View>
  );
}

// ── Messagerie (boîte de réception) ─────────────────────────────────

/** Messagerie (`InboxExample` Flutter) : dossiers, liste filtrable, lecture, actions, réponse. */
export function InboxExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.tablet;
  const [folder, setFolder] = useState('inbox');
  const [q, setQ] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [current, setCurrent] = useState<string | null>(wide ? EX_MESSAGES[0]!.id : null);
  const [unread, setUnread] = useState(EX_MESSAGES.filter((m) => m.unread).map((m) => m.id));
  const [starred, setStarred] = useState(EX_MESSAGES.filter((m) => m.starred).map((m) => m.id));
  const [archived, setArchived] = useState<string[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);

  const live = (m: ExMessage) => !deleted.includes(m.id) && !archived.includes(m.id);
  const unreadCount = EX_MESSAGES.filter((m) => unread.includes(m.id) && live(m)).length;
  const query = q.trim().toLowerCase();
  const messages = EX_MESSAGES.filter(
    (m) =>
      !deleted.includes(m.id) &&
      (folder === 'archive' ? archived.includes(m.id) : !archived.includes(m.id)) &&
      (folder !== 'starred' || starred.includes(m.id)) &&
      ['inbox', 'starred', 'archive'].includes(folder) &&
      (!unreadOnly || unread.includes(m.id)) &&
      (!query || `${m.from}${m.subject}${m.preview}`.toLowerCase().includes(query)),
  );
  const labels = new Map<string, KitTone>(EX_MESSAGES.flatMap((m) => (m.label ? [m.label] : [])));

  const open = (m: ExMessage) => {
    setCurrent(m.id);
    setUnread((u) => u.filter((x) => x !== m.id));
  };
  const remove = (id: string, into: 'archive' | 'delete') => {
    const i = messages.findIndex((m) => m.id === id);
    const rest = messages.filter((m) => m.id !== id);
    if (into === 'archive') setArchived((a) => [...a, id]);
    else setDeleted((d) => [...d, id]);
    setCurrent(wide && rest.length ? rest[Math.min(i, rest.length - 1)]!.id : null);
    snack.show(into === 'archive' ? 'Message archivé (démo)' : 'Message supprimé (démo)');
  };

  const folderItem = (lead: ReactNode, label: string, on: boolean, count: number, onPress: () => void) => (
    <TouchableRipple
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={[styles.folder, on && { backgroundColor: kit.primaryLight }]}
    >
      <View style={styles.folderRow}>
        {lead}
        <Text numberOfLines={1} style={[font(on ? '700' : '500', 14), styles.fill, { color: kit.textPrimary }]}>
          {label}
        </Text>
        {count > 0 ? <Text style={[font('700', 12), { color: kit.textPrimary }]}>{count}</Text> : null}
      </View>
    </TouchableRipple>
  );
  const folders = (after?: () => void) => (
    <ScrollView contentContainerStyle={styles.pad12}>
      <KitButton label="Nouveau message" icon="mi:edit" expand onPress={() => snack.demoAction('Nouveau message')} />
      <View style={styles.h12} />
      {FOLDERS.map(([id, label, icon]) =>
        folderItem(
          <Icon source={icon} size={20} color={kit.textSecondary} />,
          label,
          folder === id,
          id === 'inbox' ? unreadCount : id === 'drafts' ? 1 : 0,
          () => {
            setFolder(id);
            after?.();
          },
        ),
      )}
      <Text style={[kitText.overline, styles.labelsTitle, { color: kit.textMuted }]}>LIBELLÉS</Text>
      {[...labels].map(([l, tone]) =>
        folderItem(<View style={[styles.labelDot, { backgroundColor: toneText(tone, kit) }]} />, l, false, 0, () => {
          setQ(l);
          after?.();
        }),
      )}
    </ScrollView>
  );

  const list = (
    <View style={styles.fill}>
      <View style={styles.listHead}>
        <View style={styles.rowGap8}>
          {wide ? null : (
            <KitIconButton icon="mi:folder-open" accessibilityLabel="Dossiers" onPress={() => setDrawer(true)} />
          )}
          <Text style={[font('700', 16), { color: kit.textPrimary }]}>{FOLDERS.find((f) => f[0] === folder)?.[1]}</Text>
        </View>
        <KitTextField
          hint="Rechercher"
          icon="mi:search"
          value={q}
          onChangeText={setQ}
          accessibilityLabel="Rechercher un message"
        />
        <SegmentedToggle
          expand
          value={unreadOnly ? 1 : 0}
          onChange={(v) => setUnreadOnly(v === 1)}
          options={[
            { value: 0, label: 'Tous' },
            { value: 1, label: `Non lus · ${unreadCount}` },
          ]}
        />
      </View>
      {messages.length === 0 ? (
        <EmptyState icon="mi:inbox" title="Aucun message" subtitle="Ce dossier est vide." />
      ) : (
        <ScrollView contentContainerStyle={styles.listBody}>
          {messages.map((m) => (
            <ExTile
              key={m.id}
              selected={wide && current === m.id}
              onPress={() => open(m)}
              leading={<KitAvatar name={m.from} />}
              title={m.from}
              subtitle={`${m.subject}\n${m.preview}`}
              trailing={
                <View style={styles.msgMeta}>
                  <Text style={[font(unread.includes(m.id) ? '700' : '400', 12), { color: kit.textPrimary }]}>
                    {m.at}
                  </Text>
                  <View style={styles.rowGap4}>
                    {m.label ? <StatusBadge label={m.label[0]} tone={m.label[1]} /> : null}
                    {m.attachments?.length ? <Icon source="mi:attach-file" size={14} color={kit.textMuted} /> : null}
                    {starred.includes(m.id) ? <Icon source="mi:star" size={16} color={kit.warning} /> : null}
                    {unread.includes(m.id) ? <View style={[styles.unread, { backgroundColor: kit.primary }]} /> : null}
                  </View>
                </View>
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  const m = EX_MESSAGES.find((x) => x.id === current);
  const reader = !m ? (
    <EmptyState
      icon="mi:drafts"
      title="Aucun message sélectionné"
      subtitle="Choisissez une conversation dans la liste."
    />
  ) : (
    <View style={styles.fill}>
      <View style={[styles.readBar, { borderBottomColor: kit.border }]}>
        {wide ? null : (
          <KitIconButton icon="mi:arrow-back" accessibilityLabel="Retour à la liste" onPress={() => setCurrent(null)} />
        )}
        <KitIconButton icon="mi:archive" accessibilityLabel="Archiver" onPress={() => remove(m.id, 'archive')} />
        <KitIconButton icon="mi:delete-outline" accessibilityLabel="Supprimer" onPress={() => remove(m.id, 'delete')} />
        <KitIconButton
          icon="mi:mark-email-unread"
          accessibilityLabel="Marquer comme non lu"
          onPress={() => setUnread((u) => (u.includes(m.id) ? u : [...u, m.id]))}
        />
        <KitIconButton
          icon={starred.includes(m.id) ? 'mi:star' : 'mi:star-border'}
          iconColor={starred.includes(m.id) ? kit.warning : undefined}
          accessibilityLabel={starred.includes(m.id) ? 'Ne plus suivre' : 'Suivre'}
          onPress={() => setStarred((s) => toggleIn(s, m.id))}
        />
      </View>
      <ScrollView contentContainerStyle={styles.readBody}>
        <View style={styles.wrap}>
          <Text style={[kitText.h3, { color: kit.textPrimary }]}>{m.subject}</Text>
          {m.label ? <StatusBadge label={m.label[0]} tone={m.label[1]} /> : null}
        </View>
        <View style={[styles.rowGap12, styles.mv16]}>
          <KitAvatar name={m.from} />
          <View style={styles.fill}>
            <Text style={[font('600', 14), { color: kit.textPrimary }]}>{m.from}</Text>
            <Text numberOfLines={1} style={[font('400', 12), { color: kit.textMuted }]}>{`${m.email} · à moi`}</Text>
          </View>
          <Text style={[font('400', 14), { color: kit.textMuted }]}>{m.at}</Text>
        </View>
        {m.body.map((p) => (
          <Text key={p} style={[font('400', 14), styles.para, { color: kit.textPrimary }]}>
            {p}
          </Text>
        ))}
        {m.attachments?.map((a) => (
          <TouchableRipple
            key={a}
            onPress={() => snack.demoAction(a)}
            accessibilityRole="button"
            accessibilityLabel={`Pièce jointe ${a}`}
            style={[styles.attachment, { backgroundColor: kit.hover }]}
          >
            <View style={styles.rowGap8}>
              <Icon source="mi:picture-as-pdf" size={24} color={kit.error} />
              <View>
                <Text style={[font('600', 14), { color: kit.textPrimary }]}>{a}</Text>
                <Text style={[font('400', 12), { color: kit.textMuted }]}>PDF · 248 Ko</Text>
              </View>
              <Icon source="mi:download" size={18} color={kit.textMuted} />
            </View>
          </TouchableRipple>
        ))}
      </ScrollView>
      <View style={[styles.replyBar, { borderTopColor: kit.border }]}>
        <Composer
          hint={`Répondre à ${m.from.split(' ')[0]}…`}
          leading={<KitAvatar name={CURRENT_USER.fullname} size={32} />}
          onSend={() => snack.show('Réponse envoyée (démo)')}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.fill}>
      {wide ? (
        <View style={[styles.fill, styles.row]}>
          {width >= breakpoints.xl ? (
            <View style={[styles.foldersPane, { borderRightColor: kit.border }]}>{folders()}</View>
          ) : null}
          <View style={[styles.listPane, { borderRightColor: kit.border }]}>{list}</View>
          <View style={styles.fill}>{reader}</View>
        </View>
      ) : current ? (
        reader
      ) : (
        list
      )}
      <ModalDrawer visible={drawer} onDismiss={() => setDrawer(false)}>
        {folders(() => setDrawer(false))}
      </ModalDrawer>
    </View>
  );
}

// ── Messages instantanés ────────────────────────────────────────────

function Bubble({ conv, author, text }: { conv: ChatConv; author: string; text: string }) {
  const { kit } = useKitTheme();
  if (author === 'system')
    return <Text style={[font('400', 12), styles.system, { color: kit.textMuted }]}>{text}</Text>;
  const mine = author === 'me';
  const fg = mine ? kit.onPrimary : kit.textPrimary;
  return (
    <View
      style={[styles.bubble, mine ? styles.mine : styles.theirs, { backgroundColor: mine ? kit.primary : kit.hover }]}
    >
      {!mine && conv.kind !== 'direct' ? (
        <Text style={[font('700', 12), { color: kit.textSecondary }]}>{chatPerson(author).name}</Text>
      ) : null}
      {text ? (
        <Text style={[font('400', 14), { color: fg }]}>{text}</Text>
      ) : (
        <View style={styles.rowGap4}>
          <Icon source="mi:play-arrow" size={24} color={fg} />
          <Icon source="mi:graphic-eq" size={24} color={fg} />
          <Text style={[font('400', 14), { color: fg }]}>Note vocale</Text>
        </View>
      )}
    </View>
  );
}

/** Messages (`ChatExample` Flutter) : conversations épinglées, fil, envoi, pièce jointe. */
export function ChatExample() {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.xl;
  const convs = [...CHAT_CONVERSATIONS.filter((x) => x.pinned), ...CHAT_CONVERSATIONS.filter((x) => !x.pinned)];
  const [index, setIndex] = useState<number | null>(wide ? 0 : null);
  const [extra, setExtra] = useState<Record<string, string[]>>({});
  const [picker, setPicker] = useState(false);

  const list = (
    <ScrollView contentContainerStyle={styles.pad8}>
      {convs.map((conv, i) => {
        const last = conv.messages[conv.messages.length - 1]!;
        return (
          <ExTile
            key={conv.id}
            selected={wide && index === i}
            onPress={() => setIndex(i)}
            leading={
              conv.kind === 'direct' ? (
                <KitAvatar name={chatTitle(conv)} online={chatPerson(conv.members[1]!).online} />
              ) : (
                <View style={[styles.groupDisc, { backgroundColor: kit.primaryLight }]}>
                  <Icon source={conv.kind === 'channel' ? 'mi:tag' : 'mi:groups'} size={20} color={kit.primary} />
                </View>
              )
            }
            title={chatTitle(conv)}
            subtitle={last[1] || 'Note vocale'}
            trailing={
              <View style={styles.rowGap4}>
                {conv.pinned ? <Icon source="mi:push-pin" size={14} color={kit.textMuted} /> : null}
                {conv.muted ? <Icon source="mi:notifications-off" size={14} color={kit.textMuted} /> : null}
                {conv.unread > 0 ? <CountDot count={conv.unread} /> : null}
              </View>
            }
          />
        );
      })}
    </ScrollView>
  );

  const conv = index === null ? null : convs[index];
  const thread = conv ? (
    <View style={styles.fill}>
      <View style={[styles.threadHead, { borderBottomColor: kit.border }]}>
        {wide ? null : (
          <KitIconButton
            icon="mi:arrow-back"
            accessibilityLabel="Retour aux conversations"
            onPress={() => setIndex(null)}
          />
        )}
        <Text style={[font('700', 16), styles.fill, { color: kit.textPrimary }]}>{chatTitle(conv)}</Text>
      </View>
      {conv.description ? (
        <Text style={[font('400', 12), styles.pad12, { color: kit.textMuted }]}>{conv.description}</Text>
      ) : null}
      <ScrollView contentContainerStyle={styles.pad16}>
        {[...conv.messages, ...(extra[conv.id] ?? []).map((t): [string, string] => ['me', t])].map(([a, t], i) => (
          <Bubble key={i} conv={conv} author={a} text={t} />
        ))}
      </ScrollView>
      <View style={styles.chatInput}>
        <KitIconButton icon="mi:attach-file" accessibilityLabel="Joindre un fichier" onPress={() => setPicker(true)} />
        <View style={styles.fill}>
          <Composer
            hint="Écrire un message…"
            onSend={(t) => setExtra((e) => ({ ...e, [conv.id]: [...(e[conv.id] ?? []), t] }))}
          />
        </View>
      </View>
    </View>
  ) : null;

  return (
    <View style={styles.fill}>
      {wide ? (
        <View style={[styles.fill, styles.row]}>
          <View style={[styles.listPane, { borderRightColor: kit.border }]}>{list}</View>
          <View style={styles.fill}>{thread}</View>
        </View>
      ) : (
        (thread ?? list)
      )}
      <FilePicker visible={picker} onClose={() => setPicker(false)} />
    </View>
  );
}

/** Messagerie compacte pour panneau latéral (conversation `c-aya`). */
export function ChatPanel({ onClose }: { onClose: () => void }) {
  const { kit } = useKitTheme();
  const [msgs, setMsgs] = useState<[boolean, string][]>(
    CHAT_CONVERSATIONS[0]!.messages.map(([a, t]) => [a === 'me', t]),
  );
  return (
    <View style={styles.fill}>
      <View style={styles.panelHead}>
        <KitAvatar name="Aya Koné" online />
        <Text style={[font('600', 14), styles.fill, { color: kit.textPrimary }]}>Aya Koné</Text>
        <KitIconButton icon="mi:close" accessibilityLabel="Fermer" onPress={onClose} />
      </View>
      <View style={[styles.rule, { backgroundColor: kit.divider }]} />
      <ScrollView contentContainerStyle={styles.pad12}>
        {msgs.map(([mine, t], i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              styles.panelBubble,
              mine ? styles.mine : styles.theirs,
              { backgroundColor: mine ? kit.primary : kit.hover },
            ]}
          >
            <Text style={[font('400', 14), { color: mine ? kit.onPrimary : kit.textPrimary }]}>{t}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.pad8}>
        <Composer hint="Répondre…" onSend={(t) => setMsgs((m) => [...m, [true, t]])} />
      </View>
    </View>
  );
}

// ── Fil d'équipe ────────────────────────────────────────────────────

const MEDIA_ICON: Record<string, string> = {
  photos: 'mi:photo-library',
  video: 'mi:movie',
  voice: 'mi:mic',
  link: 'mi:link',
  youtube: 'mi:smart-display',
  document: 'mi:picture-as-pdf',
};

function PostMedia({ post: p }: { post: FeedPost }) {
  const { kit } = useKitTheme();
  if (p.poll) {
    const [question, options] = p.poll;
    const total = options.reduce((s, [, n]) => s + n, 0);
    return (
      <View>
        <Text style={[font('600', 14), styles.mb8, { color: kit.textPrimary }]}>{question}</Text>
        {options.map(([o, n]) => (
          <View key={o} style={styles.mb8}>
            <View style={styles.rowGap8}>
              <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>{o}</Text>
              <Text style={[font('400', 14), { color: kit.textPrimary }]}>{`${Math.round((n * 100) / total)} %`}</Text>
            </View>
            <KitProgressBar value={n / total} />
          </View>
        ))}
        <Text style={[font('400', 12), { color: kit.textMuted }]}>{`${total} votes`}</Text>
      </View>
    );
  }
  const [kind = '', ...rest] = p.media.split(' · ');
  return (
    <View style={[styles.media, { backgroundColor: kit.hover }]}>
      <Icon source={MEDIA_ICON[kind] ?? 'mi:attachment'} size={24} color={kit.primary} />
      <Text numberOfLines={1} style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>
        {rest.length ? rest.join(' · ') : 'Photos'}
      </Text>
    </View>
  );
}

/** Fil d'actualité (`FeedExample` Flutter) : publication, médias, sondage, J'aime, commentaires. */
export function FeedExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [liked, setLiked] = useState<string[]>([]);
  const action = (icon: string, label: string, onPress: () => void, a11y: string) => (
    <TouchableRipple onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={styles.postAction}>
      <View style={styles.rowGap4}>
        <Icon source={icon} size={18} color={kit.primary} />
        <Text style={[font('600', 14), { color: kit.primary }]}>{label}</Text>
      </View>
    </TouchableRipple>
  );
  return (
    <ExPage maxWidth={640}>
      <KitCard>
        <Composer
          hint={`Quoi de neuf, ${CURRENT_USER.fullname.split(' ')[0]} ?`}
          sendLabel="Publier"
          leading={<KitAvatar name={CURRENT_USER.fullname} />}
          onSend={() => snack.show('Publication (démo)')}
        />
      </KitCard>
      <View style={styles.h16} />
      {FEED_POSTS.map((p) => {
        const on = liked.includes(p.id);
        return (
          <View key={p.id} style={styles.mb12}>
            <KitCard>
              <View style={styles.rowGap12}>
                <KitAvatar name={p.author.name} />
                <View style={styles.fill}>
                  <Text style={[font('600', 14), { color: kit.textPrimary }]}>{p.author.name}</Text>
                  <Text style={[font('400', 12), { color: kit.textMuted }]}>{`${p.author.role} · ${p.at}`}</Text>
                </View>
              </View>
              <View style={styles.mv12}>
                <ExInline text={p.text} style={{ lineHeight: 21 }} />
              </View>
              <PostMedia post={p} />
              <View style={[styles.wrap, styles.mt8]}>
                {action(
                  on ? 'mi:favorite' : 'mi:favorite-border',
                  String(p.likes + (on ? 1 : 0)),
                  () => setLiked((l) => toggleIn(l, p.id)),
                  on ? 'Je n’aime plus' : 'J’aime',
                )}
                {action('mi:chat-bubble-outline', String(p.comments?.length ?? 0), () => undefined, 'Commentaires')}
                {action('mi:share', 'Partager', () => snack.demoAction('Partage'), 'Partager')}
              </View>
              {p.comments?.map((k) => (
                <CommentView key={k.id} comment={k} />
              ))}
            </KitCard>
          </View>
        );
      })}
    </ExPage>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  rowGap4: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowGap8: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  pad8: { padding: space.s2 },
  pad12: { padding: space.s3 },
  pad16: { padding: space.s4 },
  h12: { height: space.s3 },
  h16: { height: space.s4 },
  mt8: { marginTop: space.s2 },
  mb8: { marginBottom: space.s2 },
  mb12: { marginBottom: space.s3 },
  mv12: { marginVertical: space.s3 },
  mv16: { marginVertical: space.s4 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  folder: { borderRadius: radius.md, marginBottom: 2 },
  folderRow: { flexDirection: 'row', alignItems: 'center', gap: space.s3, minHeight: 44, paddingHorizontal: space.s3 },
  labelsTitle: { marginTop: space.s4, marginBottom: space.s2, marginLeft: space.s3 },
  labelDot: { width: 10, height: 10, borderRadius: 5, margin: 5 },
  foldersPane: { width: 230, borderRightWidth: 1 },
  listPane: { width: 340, borderRightWidth: 1 },
  listHead: { padding: space.s3, gap: space.s2 },
  listBody: { paddingHorizontal: space.s2, paddingBottom: space.s4 },
  msgMeta: { alignItems: 'flex-end', gap: 4 },
  unread: { width: 8, height: 8, borderRadius: 4 },
  readBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s2,
    paddingVertical: space.s1,
    borderBottomWidth: 1,
  },
  readBody: { padding: space.l },
  para: { lineHeight: 21, marginBottom: space.s3 },
  attachment: { alignSelf: 'flex-start', borderRadius: radius.md, padding: space.s3 },
  replyBar: { borderTopWidth: 1, padding: space.s3 },
  system: { textAlign: 'center', marginVertical: space.s2 },
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.lg,
    paddingHorizontal: space.s3,
    paddingVertical: space.s2,
    marginBottom: space.s2,
  },
  panelBubble: { maxWidth: 280 },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  groupDisc: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  threadHead: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: space.s2,
    borderBottomWidth: 1,
  },
  chatInput: { flexDirection: 'row', alignItems: 'center', padding: space.s2 },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: space.s3, padding: space.s3 },
  rule: { height: 1 },
  media: { flexDirection: 'row', alignItems: 'center', gap: space.s3, padding: space.s3, borderRadius: radius.md },
  postAction: { paddingHorizontal: space.s2, paddingVertical: space.s2, borderRadius: radius.full },
});
