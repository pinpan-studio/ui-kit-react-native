import { useState } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { KitButton, KitCard, KitSlider, KitTextField, MarkdownView, SegmentedToggle, StatusBadge } from '../components';
import { ago, compact, date, dateLong, decimal1, fcfa } from '../core/format';
import { frenchTypography, revealSpaces } from '../core/frenchTypography';
import { useKitSnack } from '../core/snack';
import {
  contrast,
  font,
  fontFamily,
  radius,
  space,
  tabular,
  useKitText,
  useKitTheme,
  type FontRole,
  type FontWeight,
  type KitTextVariant,
  type KitTone,
} from '../theme';
import { Demo, DocPage, Gap, type DocSection } from './doc';

const LOREM =
  'La plateforme Lookas suit en temps réel plus de 8 000 véhicules en Côte d’Ivoire. Chaque balise transmet sa position toutes les 30 secondes ; les alertes de zone, de vitesse et de coupure moteur sont envoyées aux exploitants en moins de cinq secondes.';

const FAMILIES: [string, FontRole, string, string][] = [
  ['Outfit', 'heading', 'Titres, chiffres clés', 'Tableau de bord Finance'],
  ['Inter', 'body', 'Texte courant, interface', 'Le client signale une perte de signal.'],
  ['Space Mono', 'mono', 'Codes, références, valeurs techniques', 'FAC-2026-0912 · 356307042441013'],
  ['TT Wellingtons', 'brand', 'Marque', 'Lookas'],
];

const SCALE: [KitTextVariant, string][] = [
  ['display', '40'],
  ['h1', '32'],
  ['h2', '24'],
  ['pageTitle', '22'],
  ['h3', '20'],
  ['h4', '16'],
  ['bodyLg', '16'],
  ['body', '14'],
  ['bodySm', '13'],
  ['label', '12'],
  ['caption', '12'],
  ['overline', '11'],
];

const WEIGHTS: [FontWeight, string][] = [
  ['300', 'Light 300'],
  ['400', 'Regular 400'],
  ['500', 'Medium 500'],
  ['600', 'Semibold 600'],
  ['700', 'Bold 700'],
  ['800', 'Extrabold 800'],
];

const PROSE = `## Installer une balise GPS

Avant de commencer, vérifiez que le véhicule est **à l’arrêt** et le contact coupé.

1. Repérez l’alimentation 12 V permanente
2. Fixez le boîtier sous le tableau de bord
3. Orientez l’antenne vers le ciel

- Durée moyenne : \`45 min\`
- Outils : multimètre, colliers, gaine

> Une antenne mal orientée réduit la précision de 5 à 15 mètres.`;

const DEFAULT_PLAY = 'Votre flotte, en temps réel';
const comma = (v: number, digits: number) => v.toFixed(digits).replace('.', ',');

/** `/components/typography` — tous les concepts typographiques du kit (`TypographyGallery` Flutter). */
export function TypographyGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const t = useKitText();
  const snack = useKitSnack();
  const [lh, setLh] = useState(1.55);
  const [tracking, setTracking] = useState(0);
  const [measure, setMeasure] = useState(1);
  const [input, setInput] = useState(
    'Le client a dit : "la balise est hors ligne depuis 14h05..." Montant du : 1250000 FCFA ! Equipe d\'intervention - priorite haute ?',
  );
  const [family, setFamily] = useState<FontRole>('heading');
  const [size, setSize] = useState(24);
  const [weight, setWeight] = useState<FontWeight>('700');
  const [pgTracking, setPgTracking] = useState(0);
  const [pgLh, setPgLh] = useState(1.3);
  const [pgText, setPgText] = useState(DEFAULT_PLAY);
  const [scale, setScale] = useState(1);
  const [fluidWidth, setFluidWidth] = useState(0);
  const [openedAt] = useState(() => Date.now());

  const corrected = frenchTypography(input);
  const ratios: [string, string, number][] = [
    ['textPrimary', kit.textPrimary, contrast(kit.textPrimary, kit.card)],
    ['textSecondary', kit.textSecondary, contrast(kit.textSecondary, kit.card)],
    ['textMuted', kit.textMuted, contrast(kit.textMuted, kit.card)],
    ['primary', kit.primary, contrast(kit.primary, kit.card)],
    ['errorText', kit.errorText, contrast(kit.errorText, kit.card)],
  ];
  const fluidSize = Math.min(40, Math.max(22, fluidWidth * 0.075));

  const sections: DocSection[] = [
    {
      id: 'families',
      title: 'Familles de polices',
      source: "fontFamily('heading' | 'body' | 'mono' | 'brand')",
      description: 'Toutes embarquées dans l’application (aucune requête réseau).',
      cols: 2,
      children: FAMILIES.map(([name, role, use, sample]) => (
        <KitCard
          key={name}
          onPress={() => snack.copy(`fontFamily('${role}')`)}
          accessibilityLabel={`${name}, ${use}. Copier`}
        >
          <View style={styles.row}>
            <Text style={[styles.flex, { fontFamily: fontFamily(role, '600'), fontSize: 22, color: kit.textPrimary }]}>
              {name}
            </Text>
            <Icon source="mi:content-copy" size={16} color={kit.textMuted} />
          </View>
          <Text style={t.caption}>{use}</Text>
          <Text style={{ fontFamily: fontFamily(role), fontSize: 15, color: kit.textSecondary, marginTop: 10 }}>
            {sample}
          </Text>
          <Text style={{ fontFamily: fontFamily(role), fontSize: 13, color: kit.textMuted, marginTop: 6 }}>
            Aa Bb Cc 0123456789 éèàçœ « » € %
          </Text>
        </KitCard>
      )),
    },
    {
      id: 'scale',
      title: 'Échelle typographique',
      source: 'kitText (ratio ≈ 1,2 sur la grille de 2 px)',
      children: (
        <KitCard padding={0}>
          {SCALE.map(([name, px]) => (
            <TouchableRipple
              key={name}
              onPress={() => snack.copy(`kitText.${name}`)}
              accessibilityLabel={`${name}, ${px} pixels. Copier`}
              style={[styles.scaleRow, { borderBottomColor: kit.divider }]}
            >
              <View style={styles.row}>
                <View style={styles.scaleName}>
                  <Text style={[styles.mono105, { color: kit.primary }]}>{name}</Text>
                  <Text style={[styles.small105, { color: kit.textMuted }]}>{`${px} px`}</Text>
                </View>
                <Text numberOfLines={1} style={[t[name], styles.flex]}>
                  {name === 'overline' ? 'SUR-TITRE' : 'Suivi de flotte'}
                </Text>
              </View>
            </TouchableRipple>
          ))}
        </KitCard>
      ),
    },
    {
      id: 'hierarchy',
      title: 'Hiérarchie & rythme vertical',
      description: 'Un seul titre fort par écran, sur-titre discret, espacements multiples de 4.',
      children: (
        <Demo label="Fiche">
          <Text style={t.overline}>CONTRAT</Text>
          <Text style={[t.h3, styles.mt4]}>Contrat en cours</Text>
          <Text style={[t.bodySm, styles.mt4]}>Premium — Flotte · 24 véhicules</Text>
          <Text style={[t.h4, styles.mt16]}>Dernière intervention</Text>
          <Text style={[t.body, styles.mt4]}>
            Remplacement de l’antenne GPS sur CI-4521-AB, le 14 octobre à 09 h 55.
          </Text>
          <Text style={[t.caption, styles.mt12]}>Mis à jour il y a 2 h</Text>
        </Demo>
      ),
    },
    {
      id: 'weights',
      title: 'Graisses',
      cols: 2,
      children: (['heading', 'body'] as const).map((role) => (
        <KitCard key={role}>
          {WEIGHTS.map(([w, n]) => (
            <Text
              key={w}
              style={{ fontFamily: fontFamily(role, w), fontSize: 16, color: kit.textPrimary, paddingVertical: 2 }}
            >
              {`${role === 'heading' ? 'Outfit' : 'Inter'} ${n}`}
            </Text>
          ))}
        </KitCard>
      )),
    },
    {
      id: 'line-height',
      title: 'Interlignage',
      description: 'Titres serrés (1,15–1,3), texte 1,55, lecture longue 1,7.',
      children: (
        <Demo label={`lineHeight : ×${comma(lh, 2)}`}>
          <Gap>
            <KitSlider
              value={lh}
              min={1}
              max={2.2}
              divisions={24}
              onChange={setLh}
              accessibilityLabel="Interlignage"
              valueText={comma(lh, 2)}
            />
            <Text style={[t.body, { lineHeight: 14 * lh }]}>{LOREM}</Text>
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'tracking',
      title: 'Interlettrage',
      description: 'Négatif sur les grands titres, positif sur les capitales et sur-titres.',
      children: (
        <Demo label={`letterSpacing : ${comma(tracking, 1)}`}>
          <Gap>
            <KitSlider
              value={tracking}
              min={-2}
              max={4}
              divisions={30}
              onChange={setTracking}
              accessibilityLabel="Interlettrage"
              valueText={comma(tracking, 1)}
            />
            <Text style={[t.h1, { letterSpacing: tracking }]}>Tableau de bord</Text>
            <Text style={[t.overline, { letterSpacing: tracking + 0.66, fontSize: 13 }]}>VÉHICULES ACTIFS</Text>
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'measure',
      title: 'Longueur de ligne (mesure)',
      description:
        'Idéal : 45 à 75 caractères. Sur téléphone, la largeur d’écran suffit ; sur tablette, limitez avec maxWidth (~68 em).',
      children: (
        <Demo label={`Largeur ${Math.round(measure * 100)} %`}>
          <Gap>
            <KitSlider
              value={measure}
              min={0.4}
              max={1}
              onChange={setMeasure}
              accessibilityLabel="Largeur du texte"
              valueText={`${Math.round(measure * 100)} %`}
            />
            <Text style={[t.body, { width: `${measure * 100}%` }]}>{LOREM}</Text>
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'color',
      title: 'Couleur du texte & contraste',
      source: 'textPrimary · textSecondary · textMuted',
      children: (
        <KitCard>
          {ratios.map(([name, color, ratio]) => {
            const [level, tone]: [string, KitTone] =
              ratio >= 7
                ? ['AAA', 'success']
                : ratio >= 4.5
                  ? ['AA', 'success']
                  : ratio >= 3
                    ? ['AA large', 'warning']
                    : ['Échec', 'error'];
            return (
              <View key={name} style={[styles.row, styles.ratioRow]}>
                <Text style={[styles.flex, font('600', 14), { color }]}>{`Texte ${name}`}</Text>
                <Text style={[styles.mono115, { color: kit.textSecondary }]}>{`${comma(ratio, 1)}:1`}</Text>
                <StatusBadge label={level} tone={tone} />
              </View>
            );
          })}
        </KitCard>
      ),
    },
    {
      id: 'alignment',
      title: 'Alignement, césure & retour à la ligne',
      cols: 2,
      children: [
        <Demo key="left" label="Gauche (par défaut)">
          <Text style={t.bodySm}>{LOREM}</Text>
        </Demo>,
        <Demo key="center" label="Centré (titres courts, états vides)">
          <Text style={[t.body, styles.center]}>Aucun véhicule ne correspond à vos filtres.</Text>
        </Demo>,
        <Demo key="justify" label="Justifié (à éviter sur mobile)">
          <Text style={[t.bodySm, styles.justify]}>{LOREM}</Text>
        </Demo>,
        <Demo key="right" label="Droite (montants)">
          <Text style={[t.body, tabular, styles.right]}>{'1 250 000 FCFA\n45 000 FCFA\n2 500 FCFA'}</Text>
        </Demo>,
      ],
    },
    {
      id: 'numbers',
      title: 'Chiffres & formats',
      source: 'core/format (fr-FR) · fontVariant tabular-nums',
      cols: 2,
      children: [
        <Demo key="tabular" label="Chiffres tabulaires vs proportionnels">
          <View style={styles.row}>
            {[true, false].map((tab) => (
              <View key={String(tab)} style={[styles.flex, styles.end]}>
                {['111 111', '888 888', '1 234 567'].map((v) => (
                  <Text key={v} style={[t.body, tab && tabular]}>
                    {v}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </Demo>,
        <Demo key="formats" label="Formats fr-FR">
          {(
            [
              ['Montant', fcfa(1250000)],
              ['Compact', `${compact(55800000)} FCFA`],
              ['Décimal', decimal1(96.4)],
              ['Date', date(new Date(2026, 9, 16))],
              ['Date longue', dateLong(new Date(2026, 9, 16))],
              ['Relative', ago(new Date(openedAt - 12 * 60000), new Date(openedAt))],
            ] as const
          ).map(([l, v]) => (
            <View key={l} style={[styles.row, styles.formatRow]}>
              <Text style={[t.bodySm, styles.flex]}>{l}</Text>
              <Text style={[t.body, font('600', 14)]}>{v}</Text>
            </View>
          ))}
        </Demo>,
      ],
    },
    {
      id: 'overflow',
      title: 'Troncature & mots longs',
      cols: 2,
      children: [
        <Demo key="one" label="Une ligne (ellipsis)">
          <Text numberOfLines={1} style={t.body}>
            Groupe Diallo Négoce — Direction régionale de Korhogo et du Poro
          </Text>
        </Demo>,
        <Demo key="two" label="2 lignes">
          <Text numberOfLines={2} style={t.body}>
            {LOREM}
          </Text>
        </Demo>,
        <Demo key="clip" label="Coupure nette">
          <Text numberOfLines={2} ellipsizeMode="clip" style={t.body}>
            {LOREM}
          </Text>
        </Demo>,
        <Demo key="id" label="Identifiant long (coupure)">
          <Text style={[t.mono, { fontSize: 12 }]}>lk_live_9f2c4e1a7b3d8e6f5a0c2d4e6f8a0b1c3d5e7f9a</Text>
        </Demo>,
      ],
    },
    {
      id: 'inline',
      title: 'Styles en ligne',
      children: (
        <Demo label="Texte imbriqué">
          <Text style={t.body}>
            Le <Text style={font('700', 14)}>GPS</Text> (<Text style={styles.italic}>Global Positioning System</Text>)
            de <Text style={[t.mono, { color: kit.primary, backgroundColor: kit.primaryLight }]}>CI-4521-AB</Text> est{' '}
            <Text style={[font('600', 14), { color: kit.errorText }]}>hors ligne</Text>. Ancien statut :{' '}
            <Text style={styles.strike}>actif</Text>.{' '}
            <Text style={{ color: kit.primary, textDecorationLine: 'underline' }}>Voir la fiche</Text> · H₂O · 10ᵉ étage
          </Text>
        </Demo>
      ),
    },
    {
      id: 'prose',
      title: 'Listes, citations & contenu éditorial',
      source: 'MarkdownView',
      children: (
        <Demo label="Article d’aide">
          <MarkdownView source={PROSE} />
        </Demo>
      ),
    },
    {
      id: 'french',
      title: 'Règles de la typographie française',
      source: 'frenchTypography()',
      description:
        'Espace insécable (◦) avant « : » et « » », espace fine insécable (·) avant ; ! ?, guillemets « », apostrophe ’, points de suspension, heures 14 h 05, milliers.',
      children: (
        <Demo label="Correcteur">
          <Gap>
            <KitTextField value={input} onChangeText={setInput} lines={3} accessibilityLabel="Texte à corriger" />
            <View style={[styles.row, styles.gap6]}>
              <Icon source="mi:arrow-downward" size={18} color={kit.primary} />
              <Text style={t.label}>Corrigé</Text>
            </View>
            <View style={[styles.corrected, { backgroundColor: kit.successLight }]}>
              <Text style={t.body}>
                {revealSpaces(corrected).map(([s, kind], i) =>
                  kind === 'text' ? (
                    s
                  ) : (
                    <Text key={i} style={[font('800', 14), { color: kind === 'nbsp' ? kit.primary : kit.tertiary }]}>
                      {kind === 'nbsp' ? '◦' : '·'}
                    </Text>
                  ),
                )}
              </Text>
            </View>
            <View style={[styles.row, styles.legend]}>
              <Text style={[font('400', 12), { color: kit.primary }]}>◦ insécable</Text>
              <Text style={[font('400', 12), { color: kit.tertiary }]}>· fine insécable</Text>
              <KitButton
                label="Copier"
                icon="mi:content-copy"
                variant="ghost"
                size="compact"
                onPress={() => snack.copy(corrected, 'Texte corrigé copié')}
              />
            </View>
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'fluid',
      title: 'Typographie responsive (adaptative)',
      description:
        'La taille des titres suit la largeur disponible (bornée), et respecte le réglage de taille de texte du système.',
      children: (
        <Demo label="Titre adaptatif">
          <View onLayout={(e) => setFluidWidth(e.nativeEvent.layout.width)}>
            <Text style={[t.display, { fontSize: fluidSize, lineHeight: fluidSize * 1.15 }]}>{DEFAULT_PLAY}</Text>
            <Text style={t.caption}>{`${Math.round(fluidWidth)} px disponibles → ${comma(fluidSize, 1)} px`}</Text>
          </View>
        </Demo>
      ),
    },
    {
      id: 'a11y',
      title: 'Accessibilité typographique',
      description:
        'Corps ≥ 14 px, contraste AA, pas de texte en image, et respect de la taille de texte du système — testez ci-dessous.',
      children: (
        <Demo label={`Taille du texte système ×${comma(scale, 1)}`}>
          <Gap>
            <KitSlider
              value={scale}
              min={0.8}
              max={2}
              divisions={12}
              onChange={setScale}
              accessibilityLabel="Taille du texte"
              valueText={`×${comma(scale, 1)}`}
            />
            <Text style={scaled(t.h4, scale)}>Balise hors ligne</Text>
            <Text style={scaled(t.body, scale)}>{LOREM}</Text>
            <View style={[styles.row, styles.wrap]}>
              <KitButton label="Intervenir" onPress={noop} />
              <KitButton label="Ignorer" variant="secondary" onPress={noop} />
            </View>
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'playground',
      title: 'Testeur typographique',
      children: (
        <Demo
          label="Composez votre style"
          code={`{ fontFamily: fontFamily('${family}', '${weight}'), fontSize: ${size}, letterSpacing: ${pgTracking.toFixed(1)}, lineHeight: ${Math.round(size * pgLh)} }`}
        >
          <Gap>
            <View style={[styles.preview, { backgroundColor: kit.fieldBg }]}>
              <Text
                style={{
                  fontFamily: fontFamily(family, weight),
                  fontSize: size,
                  letterSpacing: pgTracking,
                  lineHeight: size * pgLh,
                  color: kit.textPrimary,
                }}
              >
                {pgText}
              </Text>
            </View>
            <KitTextField hint="Texte d’essai" onChangeText={(v) => setPgText(v || DEFAULT_PLAY)} />
            <SegmentedToggle<FontRole>
              value={family}
              expand
              onChange={setFamily}
              options={[
                { value: 'heading', label: 'Outfit' },
                { value: 'body', label: 'Inter' },
                { value: 'mono', label: 'Mono' },
                { value: 'brand', label: 'Marque' },
              ]}
            />
            <SliderRow label="Taille" value={`${Math.round(size)} px`}>
              <KitSlider
                value={size}
                min={10}
                max={56}
                onChange={(v) => setSize(Math.round(v))}
                accessibilityLabel="Taille"
              />
            </SliderRow>
            <SliderRow label="Graisse" value={weight}>
              <KitSlider
                value={Number(weight) / 100}
                min={3}
                max={8}
                divisions={5}
                onChange={(v) => setWeight(String(Math.round(v) * 100) as FontWeight)}
                accessibilityLabel="Graisse"
              />
            </SliderRow>
            <SliderRow label="Interlettrage" value={pgTracking.toFixed(1)}>
              <KitSlider
                value={pgTracking}
                min={-2}
                max={4}
                onChange={setPgTracking}
                accessibilityLabel="Interlettrage"
              />
            </SliderRow>
            <SliderRow label="Interlignage" value={pgLh.toFixed(2)}>
              <KitSlider value={pgLh} min={1} max={2} onChange={setPgLh} accessibilityLabel="Interlignage" />
            </SliderRow>
          </Gap>
        </Demo>
      ),
    },
  ];

  return (
    <DocPage
      title="Typographie"
      icon="mi:text-fields"
      initialSection={initialSection}
      testID="category-typography"
      subtitle="Familles, échelle et hiérarchie, graisses, interlignage, interlettrage, mesure, contraste, chiffres, troncature, styles en ligne, typographie française, tailles adaptatives, accessibilité, et un testeur."
      sections={sections}
    />
  );
}

/** Simule un réglage de taille de texte système sur un style. */
const scaled = (s: TextStyle, k: number): TextStyle => ({
  ...s,
  fontSize: (s.fontSize ?? 14) * k,
  lineHeight: s.lineHeight ? s.lineHeight * k : undefined,
});

function SliderRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.sliderLabel, { color: kit.textSecondary }]}>{label}</Text>
      <View style={styles.flex}>{children}</View>
      <Text style={[styles.sliderValue, { color: kit.textPrimary }]}>{value}</Text>
    </View>
  );
}

const noop = () => undefined;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexWrap: 'wrap', gap: space.s2 },
  gap6: { gap: 6 },
  end: { alignItems: 'flex-end' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
  justify: { textAlign: 'justify' },
  italic: { fontStyle: 'italic' },
  strike: { textDecorationLine: 'line-through' },
  mt4: { marginTop: 4 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  scaleRow: { paddingHorizontal: space.s4, paddingVertical: space.s3, borderBottomWidth: 1 },
  scaleName: { width: 74 },
  mono105: font('400', 10.5, 'mono'),
  small105: font('400', 10.5),
  mono115: { ...font('400', 11.5, 'mono'), marginRight: space.s2 },
  ratioRow: { paddingVertical: 5 },
  formatRow: { paddingVertical: space.s1 },
  corrected: { padding: space.s3, borderRadius: radius.md },
  legend: { flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 12 },
  preview: { padding: space.s4, borderRadius: radius.md },
  sliderLabel: { ...font('400', 12.5), width: 92 },
  sliderValue: { ...font('400', 11.5, 'mono'), width: 48, textAlign: 'right' },
});
