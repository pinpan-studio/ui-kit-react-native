import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { Icon } from 'react-native-paper';

import { fontFamily, kitText, radius, space, useKitTheme, type KitColors } from '../../theme';

const INLINE_RE = /(\*\*([^*]+)\*\*|`([^`]+)`|~~([^~]+)~~|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\))/g;

/** Rendu inline Markdown : **gras**, *italique*, `code`, ~~barré~~, [lien](url) (`markdownInline` Flutter). */
export function markdownInline(text: string, base: TextStyle, c: KitColors): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, , bold, code, strike, italic, link] = m;
    if (bold)
      out.push(
        <Text key={k++} style={{ fontFamily: fontFamily('body', '700') }}>
          {bold}
        </Text>,
      );
    else if (code)
      out.push(
        <Text
          key={k++}
          style={{
            fontFamily: fontFamily('mono'),
            fontSize: (base.fontSize ?? 14) * 0.86,
            color: c.primary,
            backgroundColor: c.hover,
          }}
        >
          {` ${code} `}
        </Text>,
      );
    else if (strike)
      out.push(
        <Text key={k++} style={styles.strike}>
          {strike}
        </Text>,
      );
    else if (italic)
      out.push(
        <Text key={k++} style={styles.italic}>
          {italic}
        </Text>,
      );
    else if (link)
      out.push(
        <Text key={k++} style={{ color: c.primary, textDecorationLine: 'underline' }}>
          {link}
        </Text>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const LIST_RE = /^\s*([-*]|\d+\.)\s+(.*)/;
const BLOCK_START = /^(#|>|```|\s*[-*]\s|\s*\d+\.\s)/;

/** Rendu d'un document Markdown : titres, listes (et cases), citations, code, séparateurs (`MarkdownView` Flutter). */
export function MarkdownView({ source, fontSize = 14 }: { source: string; fontSize?: number }) {
  const { kit } = useKitTheme();
  const base: TextStyle = { ...kitText.body, fontSize, lineHeight: fontSize * 1.55, color: kit.textPrimary };
  const para = (t: string, style: TextStyle = base, key?: number) => (
    <Text key={key} style={style}>
      {markdownInline(t, style, kit)}
    </Text>
  );

  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i] ?? '';
    if (l.trim() === '') {
      i++;
      continue;
    }
    if (l.startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i]?.startsWith('```')) buf.push(lines[i++] ?? '');
      i++;
      blocks.push(
        <ScrollView key={i} horizontal style={[styles.code, { backgroundColor: kit.hover }]}>
          <Text style={[kitText.mono, { color: kit.textPrimary, fontSize: 12 }]}>{buf.join('\n')}</Text>
        </ScrollView>,
      );
      continue;
    }
    const h = l.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      const lvl = h[1]?.length ?? 1;
      const style = { ...(lvl === 1 ? kitText.h2 : lvl === 2 ? kitText.h3 : kitText.h4), color: kit.textPrimary };
      blocks.push(
        <Text key={i} style={[style, styles.heading]} accessibilityRole="header">
          {markdownInline(h[2] ?? '', style, kit)}
        </Text>,
      );
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(l.trim())) {
      blocks.push(<View key={i} style={[styles.rule, { backgroundColor: kit.border }]} />);
      i++;
      continue;
    }
    if (l.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i]?.startsWith('>')) buf.push((lines[i++] ?? '').replace(/^>\s?/, ''));
      blocks.push(
        <View key={i} style={[styles.quote, { borderLeftColor: kit.primary, backgroundColor: kit.primaryLight }]}>
          {para(buf.join(' '), { ...base, ...styles.italic, color: kit.textSecondary })}
        </View>,
      );
      continue;
    }
    if (LIST_RE.test(l)) {
      const items: [string, string][] = [];
      while (i < lines.length && LIST_RE.test(lines[i] ?? '')) {
        const m = (lines[i++] ?? '').match(LIST_RE);
        items.push([m?.[1] ?? '-', m?.[2] ?? '']);
      }
      blocks.push(
        <View key={i}>
          {items.map(([mark, t], n) => {
            const task = t.startsWith('[ ] ') || t.startsWith('[x] ');
            const done = t.startsWith('[x]');
            return (
              <View key={n} style={styles.item}>
                <Text style={[base, styles.mark, { color: kit.primary, fontFamily: fontFamily('body', '700') }]}>
                  {mark === '-' || mark === '*' ? '•' : mark}
                </Text>
                {task ? (
                  <View style={styles.task}>
                    <Icon
                      source={done ? 'mi:check-box' : 'mi:check-box-outline-blank'}
                      size={18}
                      color={done ? kit.success : kit.textMuted}
                    />
                    <View style={styles.flex}>{para(t.slice(4))}</View>
                  </View>
                ) : (
                  <View style={styles.flex}>{para(t)}</View>
                )}
              </View>
            );
          })}
        </View>,
      );
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && (lines[i] ?? '').trim() !== '' && !BLOCK_START.test(lines[i] ?? '')) {
      buf.push(lines[i++] ?? '');
    }
    if (buf.length === 0) buf.push(lines[i++] ?? '');
    blocks.push(para(buf.join(' '), base, i));
  }
  return <View style={styles.doc}>{blocks}</View>;
}

const styles = StyleSheet.create({
  doc: { gap: 10 },
  flex: { flex: 1 },
  strike: { textDecorationLine: 'line-through' },
  italic: { fontStyle: 'italic' },
  code: { padding: space.s3, borderRadius: radius.md },
  heading: { paddingTop: space.s1 },
  rule: { height: 1, marginVertical: 3.5 },
  quote: { borderLeftWidth: 3, paddingLeft: space.s3, paddingVertical: space.s2, paddingRight: space.s2 },
  item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.s1 },
  mark: { width: 22 },
  task: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
