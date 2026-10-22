import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, type TextStyle } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { font, fontFamily, kitText, radius, space, useKitTheme, withAlpha } from '../../theme';
import { HIGHLIGHT } from '../../theme/swatches';
import { SegmentedToggle } from '../core/Toggles';
import { MarkdownView } from '../display/MarkdownView';

interface Selection {
  start: number;
  end: number;
}

/** Bouton d'outil de barre d'édition (40 dp, cible de 48 dp), actif en primaire. */
function Tool({
  icon,
  label,
  onPress,
  active = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const { kit } = useKitTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.tool, active && { backgroundColor: kit.primaryLight }]}
    >
      <Icon source={icon} size={20} color={active ? kit.primary : kit.textSecondary} />
    </TouchableRipple>
  );
}

const MD_TOOLS: [string, string, 'wrap' | 'line', string, string?][] = [
  ['mi:title', 'Titre', 'line', '## '],
  ['mi:format-bold', 'Gras', 'wrap', '**'],
  ['mi:format-italic', 'Italique', 'wrap', '*'],
  ['mi:strikethrough-s', 'Barré', 'wrap', '~~'],
  ['mi:code', 'Code', 'wrap', '`'],
  ['mi:format-list-bulleted', 'Liste', 'line', '- '],
  ['mi:format-list-numbered', 'Liste numérotée', 'line', '1. '],
  ['checkbox-marked-outline', 'Tâche', 'line', '- [ ] '],
  ['mi:format-quote', 'Citation', 'line', '> '],
  ['mi:link', 'Lien', 'wrap', '[', '](https://)'],
];

/** Éditeur Markdown : barre qui insère la syntaxe, bascule Écrire / Aperçu, compteur de mots (`MarkdownEditor`). */
export function MarkdownEditor({
  initial,
  onChange,
  minLines = 8,
}: {
  initial: string;
  onChange?: (v: string) => void;
  minLines?: number;
}) {
  const { kit } = useKitTheme();
  const [text, setText] = useState(initial);
  const [sel, setSel] = useState<Selection>({ start: initial.length, end: initial.length });
  const [preview, setPreview] = useState(false);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const set = (t: string, s?: Selection) => {
    setText(t);
    if (s) setSel(s);
    onChange?.(t);
  };
  const wrap = (before: string, after = before) => {
    const chosen = text.slice(sel.start, sel.end) || 'texte';
    const ins = `${before}${chosen}${after}`;
    set(text.slice(0, sel.start) + ins + text.slice(sel.end), {
      start: sel.start + before.length,
      end: sel.start + ins.length - after.length,
    });
  };
  const line = (prefix: string) => {
    const startOfLine = text.lastIndexOf('\n', Math.max(0, sel.start - 1)) + 1;
    set(text.slice(0, startOfLine) + prefix + text.slice(startOfLine), {
      start: sel.start + prefix.length,
      end: sel.start + prefix.length,
    });
  };
  return (
    <View style={[styles.editor, { backgroundColor: kit.card, borderColor: kit.border }]}>
      <View style={[styles.bar, { backgroundColor: withAlpha(kit.hover, 0.5) }]}>
        <View style={styles.fill}>
          <SegmentedToggle
            value={preview ? 'preview' : 'write'}
            onChange={(v) => setPreview(v === 'preview')}
            options={[
              { value: 'write', label: 'Écrire', icon: 'mi:edit' },
              { value: 'preview', label: 'Aperçu', icon: 'mi:visibility' },
            ]}
          />
        </View>
        <Text style={[styles.counter, { color: kit.textMuted }]}>{`${words} mots`}</Text>
      </View>
      {preview ? null : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tools}>
          {MD_TOOLS.map(([icon, label, kind, a, b]) => (
            <Tool key={label} icon={icon} label={label} onPress={() => (kind === 'wrap' ? wrap(a, b) : line(a))} />
          ))}
        </ScrollView>
      )}
      <View style={[styles.divider, { backgroundColor: kit.border }]} />
      {preview ? (
        <View style={styles.preview}>
          <MarkdownView source={text} />
        </View>
      ) : (
        <TextInput
          value={text}
          selection={sel}
          onSelectionChange={(e) => setSel(e.nativeEvent.selection)}
          onChangeText={(t) => set(t)}
          multiline
          textAlignVertical="top"
          autoCapitalize="sentences"
          selectionColor={kit.primary}
          accessibilityLabel="Contenu Markdown"
          style={[styles.mdInput, { color: kit.textPrimary, minHeight: minLines * 19.5 + space.s4 * 2 }]}
        />
      )}
    </View>
  );
}

type Attr = 'bold' | 'italic' | 'underline' | 'strike' | 'highlight';
type Attrs = Set<Attr>;

const same = (a: Attrs, b: Attrs) => a.size === b.size && [...a].every((x) => b.has(x));

/** Style d'un segment de texte riche. */
function attrStyle(a: Attrs, base: TextStyle): TextStyle {
  const deco = [a.has('underline') && 'underline', a.has('strike') && 'line-through'].filter(Boolean).join(' ');
  return {
    ...(a.has('bold') ? { fontFamily: fontFamily('body', '700') } : { fontFamily: base.fontFamily }),
    ...(a.has('italic') ? { fontStyle: 'italic' } : null),
    ...(a.has('highlight') ? { backgroundColor: HIGHLIGHT } : null),
    ...(deco ? { textDecorationLine: deco as TextStyle['textDecorationLine'] } : null),
  };
}

/**
 * Éditeur de texte riche (`RichTextEditor` Flutter, remplace CKEditor / Quill) : un jeu d'attributs par
 * caractère ; avec une sélection, l'outil s'applique à la sélection, sinon à la frappe suivante.
 */
export function RichTextEditor({ initialText = '', minLines = 6 }: { initialText?: string; minLines?: number }) {
  const { kit } = useKitTheme();
  const [text, setText] = useState(initialText);
  const [attrs, setAttrs] = useState<Attrs[]>(() => {
    // Démo : premier segment en gras, « vendredi » surligné (comme Flutter).
    const a = Array.from({ length: initialText.length }, () => new Set<Attr>());
    const stop = initialText.indexOf('.');
    for (let i = 0; i < Math.max(0, stop); i++) a[i]?.add('bold');
    const v = initialText.indexOf('vendredi');
    if (v >= 0) for (let i = v; i < v + 8; i++) a[i]?.add('highlight');
    return a;
  });
  const [pending, setPending] = useState<Attrs>(new Set());
  const [sel, setSel] = useState<Selection>({ start: initialText.length, end: initialText.length });
  const base: TextStyle = { ...kitText.body, fontSize: 14, lineHeight: 21.7 };

  const isActive = (a: Attr) =>
    sel.start === sel.end
      ? pending.has(a) || (sel.start > 0 && !!attrs[sel.start - 1]?.has(a))
      : attrs.slice(sel.start, sel.end).every((x) => x.has(a));
  const toggle = (a: Attr) => {
    if (sel.start === sel.end) {
      const next = new Set(pending);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      setPending(next);
      return;
    }
    const on = !isActive(a);
    setAttrs(
      attrs.map((x, i) => {
        if (i < sel.start || i >= sel.end) return x;
        const n = new Set(x);
        if (on) n.add(a);
        else n.delete(a);
        return n;
      }),
    );
  };
  const clear = () => {
    setAttrs(attrs.map((x, i) => (i >= sel.start && i < sel.end ? new Set<Attr>() : x)));
    setPending(new Set());
  };
  const onChangeText = (next: string) => {
    let pre = 0;
    while (pre < text.length && pre < next.length && text[pre] === next[pre]) pre++;
    let suf = 0;
    while (
      suf < text.length - pre &&
      suf < next.length - pre &&
      text[text.length - 1 - suf] === next[next.length - 1 - suf]
    )
      suf++;
    const inserted = next.length - pre - suf;
    const inherit = pending.size ? pending : (attrs[pre - 1] ?? new Set<Attr>());
    setAttrs([
      ...attrs.slice(0, pre),
      ...Array.from({ length: inserted }, () => new Set(inherit)),
      ...attrs.slice(text.length - suf),
    ]);
    if (inserted > 0) setPending(new Set());
    setText(next);
  };
  const bullet = (mark: string) => {
    const startOfLine = text.lastIndexOf('\n', Math.max(0, sel.start - 1)) + 1;
    onChangeText(text.slice(0, startOfLine) + mark + text.slice(startOfLine));
  };

  const segments: { text: string; attrs: Attrs }[] = [];
  for (let i = 0; i < text.length; i++) {
    const a = attrs[i] ?? new Set<Attr>();
    const last = segments[segments.length - 1];
    if (last && same(last.attrs, a)) last.text += text[i];
    else segments.push({ text: text[i] ?? '', attrs: a });
  }

  return (
    <View style={[styles.editor, { backgroundColor: kit.card, borderColor: kit.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: withAlpha(kit.hover, 0.5) }}
        contentContainerStyle={styles.tools}
      >
        <Tool icon="mi:format-bold" label="Gras" active={isActive('bold')} onPress={() => toggle('bold')} />
        <Tool icon="mi:format-italic" label="Italique" active={isActive('italic')} onPress={() => toggle('italic')} />
        <Tool
          icon="mi:format-underlined"
          label="Souligné"
          active={isActive('underline')}
          onPress={() => toggle('underline')}
        />
        <Tool icon="mi:strikethrough-s" label="Barré" active={isActive('strike')} onPress={() => toggle('strike')} />
        <Tool
          icon="mi:format-color-fill"
          label="Surligner"
          active={isActive('highlight')}
          onPress={() => toggle('highlight')}
        />
        <View style={[styles.vdivider, { backgroundColor: kit.border }]} />
        <Tool icon="mi:format-list-bulleted" label="Liste à puces" onPress={() => bullet('• ')} />
        <Tool icon="mi:format-list-numbered" label="Liste numérotée" onPress={() => bullet('1. ')} />
        <Tool icon="mi:format-clear" label="Effacer la mise en forme" onPress={clear} />
      </ScrollView>
      <View style={[styles.divider, { backgroundColor: kit.border }]} />
      <TextInput
        multiline
        onChangeText={onChangeText}
        onSelectionChange={(e) => setSel(e.nativeEvent.selection)}
        textAlignVertical="top"
        placeholder="Rédigez votre message…"
        placeholderTextColor={kit.textMuted}
        selectionColor={kit.primary}
        accessibilityLabel="Message"
        style={[base, styles.rich, { color: kit.textPrimary, minHeight: minLines * 21.7 + space.s4 * 2 }]}
      >
        {segments.map((s, i) => (
          <Text key={i} style={attrStyle(s.attrs, base)}>
            {s.text}
          </Text>
        ))}
      </TextInput>
      <Text style={[styles.chars, { color: kit.textMuted }]}>{`${text.length} caractère(s)`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  editor: { borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  bar: { flexDirection: 'row', alignItems: 'center', padding: space.s2, gap: space.s2 },
  counter: font('400', 11.5),
  tools: { alignItems: 'center', paddingHorizontal: space.s1, paddingVertical: space.s1, gap: 2 },
  tool: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  vdivider: { width: 1, height: 24, marginHorizontal: 6 },
  divider: { height: 1 },
  preview: { padding: space.s4 },
  mdInput: { ...font('400', 13, 'mono'), lineHeight: 19.5, padding: space.s4 },
  rich: { padding: space.s4 },
  chars: { ...font('400', 11.5), textAlign: 'right', paddingHorizontal: space.s4, paddingBottom: space.s2 },
});
