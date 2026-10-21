import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from 'react-native-paper';

import { KitAvatar, KitCard, KitChip, KitIconButton, ResponsiveGrid, SidePanel, StatusBadge } from '../../components';
import { ARTICLES, BLOG_CATEGORIES, COMMENTS, DOCS_NAV, DOC_PAGE, type Article } from '../../data/examples';
import { breakpoints, font, kitText, space, useKitTheme } from '../../theme';
import { ArticleBlockView, CommentView, ExHeader, ExPage, ExTile, HueCover, useExNav } from './ExKit';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const meta = (a: Article) => `${a.author.name} · ${shortDate(a.date)} · ${a.minutes} min de lecture`;

/** Blog (`BlogExample` Flutter) : article à la une, catégories, grille d'articles. */
export function BlogExample() {
  const { kit } = useKitTheme();
  const nav = useExNav();
  const { width } = useWindowDimensions();
  const [cat, setCat] = useState('Tous');
  const featured = ARTICLES.find((a) => a.featured)!;
  const list = ARTICLES.filter((a) => !a.featured && (cat === 'Tous' || a.category === cat));
  const open = (a: Article) => nav.go('blog/:slug', String(ARTICLES.indexOf(a)));
  const featuredText = (
    <View style={styles.fill}>
      <View style={styles.start}>
        <StatusBadge label={`À la une · ${featured.category}`} tone="primary" uppercase={false} />
      </View>
      <Text style={[font('800', 22, 'heading'), styles.mv8, { color: kit.textPrimary }]}>{featured.title}</Text>
      <Text style={[font('400', 14), { color: kit.textSecondary }]}>{featured.dek}</Text>
      <Text style={[font('400', 12), styles.mt12, { color: kit.textMuted }]}>{meta(featured)}</Text>
    </View>
  );
  return (
    <ExPage maxWidth={1200}>
      <ExHeader
        title="Le blog"
        subtitle="Design, produit et rédaction : ce que nous apprenons en construisant le kit."
      />
      <KitCard onPress={() => open(featured)} accessibilityLabel={featured.title}>
        {width < breakpoints.tablet ? (
          <View style={styles.gap12}>
            <HueCover hue={featured.hue} icon={featured.icon} />
            {featuredText}
          </View>
        ) : (
          <View style={styles.featuredRow}>
            <View style={styles.fill}>
              <HueCover hue={featured.hue} icon={featured.icon} />
            </View>
            {featuredText}
          </View>
        )}
      </KitCard>
      <View style={styles.chips}>
        {BLOG_CATEGORIES.map((c) => (
          <KitChip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </View>
      <ResponsiveGrid minItemWidth={280} maxColumns={3}>
        {list.map((a) => (
          <KitCard key={a.slug} onPress={() => open(a)} accessibilityLabel={a.title}>
            <HueCover hue={a.hue} icon={a.icon} />
            <View style={[styles.start, styles.mt12]}>
              <StatusBadge label={a.category} tone="primary" uppercase={false} />
            </View>
            <Text style={[font('700', 16), styles.mv8, { color: kit.textPrimary }]}>{a.title}</Text>
            <Text numberOfLines={3} style={[font('400', 13), { color: kit.textSecondary }]}>
              {a.dek}
            </Text>
            <Text style={[font('400', 12), styles.mt8, { color: kit.textMuted }]}>{meta(a)}</Text>
          </KitCard>
        ))}
      </ResponsiveGrid>
    </ExPage>
  );
}

/** Article (`ArticleExample` Flutter) : couverture, étiquettes, blocs éditoriaux, auteur, commentaires. */
export function ArticleExample() {
  const { kit } = useKitTheme();
  const nav = useExNav();
  const index = Number(nav.param ?? 0);
  const a = ARTICLES[index] ?? ARTICLES[0]!;
  const count = COMMENTS.reduce((n, k) => n + 1 + (k.replies?.length ?? 0), 0);
  return (
    <ExPage>
      <HueCover hue={a.hue} icon={a.icon} ratio={21 / 9} />
      <View style={[styles.wrap, styles.mt16]}>
        <StatusBadge label={a.category} tone="primary" uppercase={false} />
        {a.tags.map((t) => (
          <StatusBadge key={t} label={t} uppercase={false} />
        ))}
      </View>
      <Text style={[font('800', 28, 'heading'), styles.mt12, { color: kit.textPrimary }]}>{a.title}</Text>
      <Text style={[font('400', 16), styles.mt8, { color: kit.textSecondary }]}>{a.dek}</Text>
      <View style={[styles.rowGap12, styles.mt16, styles.mb24]}>
        <KitAvatar name={a.author.name} />
        <Text style={[font('400', 14), styles.fill, { color: kit.textMuted }]}>
          {`${a.author.name} · ${a.author.role}\n${shortDate(a.date)} · ${a.minutes} min de lecture`}
        </Text>
      </View>
      {a.blocks.map((b, i) => (
        <ArticleBlockView key={i} block={b} />
      ))}
      {a.author.bio ? (
        <KitCard>
          <View style={styles.rowGap12}>
            <KitAvatar name={a.author.name} size={48} />
            <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>{a.author.bio}</Text>
          </View>
        </KitCard>
      ) : null}
      {index === 0 ? (
        <View style={styles.mt24}>
          <Text style={[kitText.h3, styles.mb16, { color: kit.textPrimary }]}>{`${count} commentaires`}</Text>
          {COMMENTS.map((k) => (
            <View key={k.id}>
              <CommentView comment={k} />
              {k.replies?.map((r) => (
                <CommentView key={r.id} comment={r} reply />
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </ExPage>
  );
}

/** Documentation (`DocsExample` Flutter) : sommaire groupé (latéral ou en feuille), contenu d'exemple. */
export function DocsExample() {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  const wide = width >= breakpoints.xl;
  const [slug, setSlug] = useState('commentaires');
  const [toc, setToc] = useState(false);
  const group = DOCS_NAV.find((g) => g.children?.some((n) => n.slug === slug))!;
  const node = group.children!.find((n) => n.slug === slug)!;

  const navList = (after?: () => void) => (
    <View style={styles.pad8}>
      {DOCS_NAV.map((g) => (
        <View key={g.label}>
          <View style={styles.navGroup}>
            <Icon source={g.icon} size={16} color={kit.textMuted} />
            <Text style={[kitText.overline, { color: kit.textMuted }]}>{g.label.toUpperCase()}</Text>
          </View>
          {g.children?.map((n) => (
            <ExTile
              key={n.slug}
              title={n.label}
              selected={slug === n.slug}
              trailing={n.badge ? <StatusBadge label={n.badge} tone="primary" uppercase={false} /> : undefined}
              onPress={() => {
                setSlug(n.slug!);
                after?.();
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );

  const content = (
    <ScrollView contentContainerStyle={styles.docBody}>
      <View style={styles.docInner}>
        <View style={styles.rowGap8}>
          <Text
            style={[font('400', 14), styles.fill, { color: kit.textMuted }]}
          >{`${group.label} › ${node.label}`}</Text>
          {wide ? null : (
            <KitIconButton icon="mi:menu-book" accessibilityLabel="Sommaire" onPress={() => setToc(true)} />
          )}
        </View>
        <Text style={[font('800', 28, 'heading'), styles.mv8, { color: kit.textPrimary }]}>{node.label}</Text>
        {DOC_PAGE.map((b, i) => (
          <ArticleBlockView key={i} block={b} />
        ))}
      </View>
    </ScrollView>
  );

  return wide ? (
    <View style={[styles.fill, styles.row]}>
      <ScrollView style={[styles.navPane, { borderRightColor: kit.border }]}>{navList()}</ScrollView>
      <View style={styles.fill}>{content}</View>
    </View>
  ) : (
    <View style={styles.fill}>
      {content}
      <SidePanel visible={toc} onDismiss={() => setToc(false)} title="Sommaire" icon="mi:menu-book">
        {navList(() => setToc(false))}
      </SidePanel>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  start: { alignSelf: 'flex-start' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  rowGap8: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  gap12: { gap: space.s3 },
  pad8: { padding: space.s2 },
  mt8: { marginTop: space.s2 },
  mt12: { marginTop: space.s3 },
  mt16: { marginTop: space.s4 },
  mt24: { marginTop: space.l },
  mb16: { marginBottom: space.s4 },
  mb24: { marginBottom: space.l },
  mv8: { marginVertical: space.s2 },
  featuredRow: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, marginVertical: space.s4 },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingHorizontal: space.s3,
    paddingTop: space.s4,
    paddingBottom: space.s1,
  },
  navPane: { width: 260, flexGrow: 0, borderRightWidth: 1 },
  docBody: { padding: space.l },
  docInner: { width: '100%', maxWidth: 760, alignSelf: 'center' },
});
