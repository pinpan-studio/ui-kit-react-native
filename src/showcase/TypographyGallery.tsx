import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { Page } from '../shell/Page';
import { fontFamily } from '../theme/fonts';
import { space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const LOREM =
  'La plateforme Lookas suit en temps réel plus de 8 000 véhicules en Côte d’Ivoire. Chaque balise transmet sa position toutes les 30 secondes ; les alertes sont envoyées aux exploitants en moins de cinq secondes.';

const SECTIONS = [
  ['families', 'Familles de polices'],
  ['scale', 'Échelle typographique'],
  ['hierarchy', 'Hiérarchie & rythme'],
  ['weights', 'Graisses'],
  ['line-height', 'Interlignage'],
  ['tracking', 'Interlettrage'],
  ['measure', 'Longueur de ligne'],
  ['color', 'Couleur & contraste'],
  ['alignment', 'Alignement & césure'],
  ['numbers', 'Chiffres & formats'],
  ['overflow', 'Troncature'],
  ['inline', 'Styles en ligne'],
  ['prose', 'Contenu éditorial'],
  ['french', 'Typographie française'],
  ['fluid', 'Typographie fluide'],
  ['a11y', 'Accessibilité'],
  ['playground', 'Testeur'],
] as const;

function Demo({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Card mode="outlined">
      <Card.Content style={styles.demo}>
        {title ? <Text variant="labelLarge">{title}</Text> : null}
        {children}
      </Card.Content>
    </Card>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <View nativeID={`typography-${id}`}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function TypographyGallery() {
  const theme = useKitTheme();
  const { width } = useWindowDimensions();
  const [lineHeight, setLineHeight] = useState(1.55);
  const [tracking, setTracking] = useState(0);
  const [measure, setMeasure] = useState(1);
  const [playText, setPlayText] = useState('Votre flotte, en temps réel');
  const [playFamily, setPlayFamily] = useState<'heading' | 'body' | 'mono'>('heading');
  const [playScale, setPlayScale] = useState('24');
  const [largeText, setLargeText] = useState(false);

  return (
    <Page testID="category-typography">
      <Text variant="titleLarge" accessibilityRole="header">
        Typographie
      </Text>
      <Text variant="bodyLarge">
        {SECTIONS.length} notions : familles, échelle et hiérarchie, graisses, interlignage, interlettrage, mesure,
        contraste, chiffres, troncature, typographie française, tailles adaptatives et testeur.
      </Text>

      <Section id="families" title="Familles de polices">
        <View style={styles.grid}>
          {(
            [
              ['Outfit', 'heading', 'Titres, chiffres clés', 'Tableau de bord Finance'],
              ['Inter', 'body', 'Texte courant, interface', 'Le client signale une perte de signal.'],
              ['Space Mono', 'mono', 'Codes, références', 'FAC-2026-0912 · 356307042441013'],
            ] as const
          ).map(([name, role, purpose, sample]) => (
            <Demo key={name} title={name}>
              <Text variant="bodySmall">{purpose}</Text>
              <Text style={{ fontFamily: fontFamily(role), fontSize: 16 }}>{sample}</Text>
              <Text variant="bodySmall">Aa Bb Cc 0123456789 éèàçœ « » € %</Text>
            </Demo>
          ))}
        </View>
      </Section>

      <Section id="scale" title="Échelle typographique">
        <Demo title="Styles Material 3">
          <View style={styles.scaleRow}>
            {(
              [
                ['display', 'displayMedium'],
                ['headline', 'headlineMedium'],
                ['title', 'titleLarge'],
                ['body', 'bodyLarge'],
                ['label', 'labelMedium'],
              ] as const
            ).map(([label, variant]) => (
              <View key={label} style={styles.scaleItem}>
                <Text variant="labelSmall">{label}</Text>
                <Text variant={variant}>Suivi de flotte</Text>
              </View>
            ))}
          </View>
        </Demo>
      </Section>

      <Section id="hierarchy" title="Hiérarchie & rythme">
        <Demo>
          <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
            CONTRAT
          </Text>
          <Text variant="headlineSmall">Contrat en cours</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Premium — Flotte · 24 véhicules
          </Text>
          <Divider />
          <Text variant="titleMedium">Dernière intervention</Text>
          <Text variant="bodyMedium">Remplacement de l’antenne GPS sur CI-4521-AB, le 14 octobre à 09 h 55.</Text>
          <Text variant="labelSmall">Mis à jour il y a 2 h</Text>
        </Demo>
      </Section>

      <Section id="weights" title="Graisses">
        <Demo>
          <View style={styles.grid}>
            {(['300', '400', '500', '600', '700'] as const).map((weight) => (
              <Text
                key={weight}
                style={{
                  fontFamily: fontFamily('heading', weight),
                  fontSize: 18,
                  fontWeight: weight as '300' | '400' | '500' | '600' | '700',
                }}
              >{`Outfit ${weight}`}</Text>
            ))}
          </View>
          <Divider />
          <View style={styles.grid}>
            {(['400', '500', '600', '700'] as const).map((weight) => (
              <Text
                key={weight}
                style={{
                  fontFamily: fontFamily('body', weight),
                  fontSize: 16,
                  fontWeight: weight as '400' | '500' | '600' | '700',
                }}
              >{`Inter ${weight}`}</Text>
            ))}
          </View>
        </Demo>
      </Section>

      <Section id="line-height" title="Interlignage">
        <Demo title={`Interlignage : ${lineHeight.toFixed(2)}`}>
          <View style={styles.inline}>
            <IconButton
              icon="minus"
              accessibilityLabel="Réduire l’interlignage"
              onPress={() => setLineHeight(Math.max(1, lineHeight - 0.1))}
            />
            <IconButton
              icon="plus"
              accessibilityLabel="Augmenter l’interlignage"
              onPress={() => setLineHeight(Math.min(2.2, lineHeight + 0.1))}
            />
          </View>
          <Text style={{ lineHeight: 18 * lineHeight }}>{LOREM}</Text>
        </Demo>
      </Section>

      <Section id="tracking" title="Interlettrage">
        <Demo title={`Interlettrage : ${tracking.toFixed(1)} dp`}>
          <View style={styles.inline}>
            <IconButton
              icon="minus"
              accessibilityLabel="Réduire l’interlettrage"
              onPress={() => setTracking(Math.max(-2, tracking - 0.5))}
            />
            <IconButton
              icon="plus"
              accessibilityLabel="Augmenter l’interlettrage"
              onPress={() => setTracking(Math.min(4, tracking + 0.5))}
            />
          </View>
          <Text variant="headlineSmall" style={{ letterSpacing: tracking }}>
            Tableau de bord
          </Text>
          <Text variant="labelMedium" style={{ letterSpacing: tracking + 0.7 }}>
            VÉHICULES ACTIFS
          </Text>
        </Demo>
      </Section>

      <Section id="measure" title="Longueur de ligne">
        <Demo title="Largeur de lecture">
          <View style={styles.inline}>
            {(['50%', '75%', '100%'] as const).map((v, i) => (
              <Chip key={v} selected={measure === [0.5, 0.75, 1][i]} onPress={() => setMeasure([0.5, 0.75, 1][i] ?? 1)}>
                {v}
              </Chip>
            ))}
          </View>
          <View style={{ width: `${measure * 100}%`, gap: space.s2 }}>
            <Text variant="bodyMedium">{LOREM}</Text>
          </View>
        </Demo>
      </Section>

      <Section id="color" title="Couleur du texte & contraste">
        <Demo>
          <Text variant="titleMedium">Texte principal</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Information secondaire — statut et métadonnées</Text>
          <Text style={{ color: theme.colors.primary }}>Action et lien principal</Text>
          <Text style={{ color: theme.colors.error }}>Erreur : adresse e-mail invalide</Text>
          <Chip icon="contrast-circle">Les rôles viennent du thème actif</Chip>
        </Demo>
      </Section>

      <Section id="alignment" title="Alignement & retour à la ligne">
        <Demo>
          <Text>{LOREM}</Text>
          <Text style={{ textAlign: 'center' }}>Aucun véhicule ne correspond à vos filtres.</Text>
          <Text style={{ textAlign: 'right', fontVariant: ['tabular-nums'] }}>
            1 250 000 FCFA{'\n'}45 000 FCFA{'\n'}2 500 FCFA
          </Text>
        </Demo>
      </Section>

      <Section id="numbers" title="Chiffres & formats">
        <Demo>
          <Text
            variant="headlineMedium"
            style={{ fontFamily: fontFamily('heading', '700'), fontVariant: ['tabular-nums'] }}
          >
            1 250 000 FCFA
          </Text>
          <Text variant="bodyMedium">8 042 véhicules · 99,8 % de disponibilité</Text>
          <Text variant="bodySmall">21 octobre 2026 · 14 h 05 · UTC</Text>
          <Text style={{ fontFamily: fontFamily('mono'), fontSize: 13 }}>FAC-2026-0912</Text>
        </Demo>
      </Section>

      <Section id="overflow" title="Troncature & mots longs">
        <Demo>
          <Text numberOfLines={1} ellipsizeMode="tail">
            Groupe Diallo Négoce — Direction régionale de Korhogo et du Poro
          </Text>
          <Text numberOfLines={2} ellipsizeMode="tail">
            {LOREM}
          </Text>
          <Text style={{ fontFamily: fontFamily('mono'), fontSize: 12 }} numberOfLines={2} ellipsizeMode="middle">
            lk_live_9f2c4e1a7b3d8e6f5a0c2d4e6f8a0b1c3d5e7f9a
          </Text>
        </Demo>
      </Section>

      <Section id="inline" title="Styles en ligne">
        <Demo>
          <Text variant="bodyLarge">
            Le contrat est <Text style={{ fontWeight: '700' }}>actif</Text> et sera renouvelé le{' '}
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>21 octobre 2026</Text>. Le montant restant
            est de <Text style={{ fontWeight: '700' }}>125 000 FCFA</Text>.
          </Text>
        </Demo>
      </Section>

      <Section id="prose" title="Listes, citations & contenu éditorial">
        <Demo>
          <Text variant="titleMedium">Préparer la visite</Text>
          <Text>
            • Vérifier les coordonnées du client{'\n'}• Confirmer la disponibilité du véhicule{'\n'}• Envoyer le compte
            rendu après l’intervention
          </Text>
          <View style={[styles.quote, { borderColor: theme.colors.primary }]}>
            <Text variant="bodyMedium">« Une bonne interface rend l’information claire au premier regard. »</Text>
          </View>
        </Demo>
      </Section>

      <Section id="french" title="Règles de la typographie française">
        <Demo>
          <Text>Il est 14 h 05 ; la température est de 27 °C.</Text>
          <Text>Le total est de 1 250 000 FCFA, soit 1 905,61 €.</Text>
          <Text>« La flotte est à l’arrêt » — a indiqué l’équipe.</Text>
          <Text>Question ? Oui ! Vérifiez l’espace avant les signes doubles.</Text>
        </Demo>
      </Section>

      <Section id="fluid" title="Typographie responsive">
        <Demo title={`Largeur disponible : ${Math.round(width)} dp`}>
          <Text
            style={{ fontSize: Math.max(20, Math.min(36, width * 0.075)), fontFamily: fontFamily('heading', '700') }}
          >
            Une taille adaptée à l’écran
          </Text>
          <Text variant="bodyMedium">
            Le titre suit la largeur de l’appareil tout en conservant des limites lisibles.
          </Text>
        </Demo>
      </Section>

      <Section id="a11y" title="Accessibilité typographique">
        <Demo>
          <View style={styles.inline}>
            <Text variant="bodyMedium">Texte agrandi</Text>
            <Button mode={largeText ? 'contained' : 'outlined'} onPress={() => setLargeText(!largeText)}>
              {largeText ? 'Activé' : 'Activer'}
            </Button>
          </View>
          <Text style={{ fontSize: largeText ? 23 : 16, lineHeight: largeText ? 33 : 24 }}>{LOREM}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Le contenu s’adapte sans être coupé.
          </Text>
        </Demo>
      </Section>

      <Section id="playground" title="Testeur typographique">
        <Demo>
          <TextInput label="Texte d’aperçu" value={playText} onChangeText={setPlayText} mode="outlined" />
          <SegmentedButtons
            value={playFamily}
            onValueChange={(v) => setPlayFamily(v as typeof playFamily)}
            buttons={[
              { value: 'heading', label: 'Outfit' },
              { value: 'body', label: 'Inter' },
              { value: 'mono', label: 'Mono' },
            ]}
          />
          <SegmentedButtons
            value={playScale}
            onValueChange={setPlayScale}
            buttons={[
              { value: '18', label: '18' },
              { value: '24', label: '24' },
              { value: '32', label: '32' },
            ]}
          />
          <Text style={{ fontFamily: fontFamily(playFamily, '600'), fontSize: Number(playScale), fontWeight: '600' }}>
            {playText || 'Aperçu du texte'}
          </Text>
          <Button
            mode="text"
            icon="refresh"
            onPress={() => {
              setPlayText('Votre flotte, en temps réel');
              setPlayFamily('heading');
              setPlayScale('24');
            }}
          >
            Réinitialiser
          </Button>
        </Demo>
      </Section>
    </Page>
  );
}

const styles = StyleSheet.create({
  demo: { gap: space.s3 },
  sectionTitle: { marginBottom: space.s2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s3 },
  scaleRow: { gap: space.s2 },
  scaleItem: { gap: space.s1 },
  inline: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s1 },
  quote: { borderLeftWidth: 3, paddingLeft: space.s3 },
});
