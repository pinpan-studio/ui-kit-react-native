import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, List, ProgressBar, SegmentedButtons, Text } from 'react-native-paper';

import { Page } from '../shell/Page';
import { radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const videos = [
  ['Trajet CI-4521-AB', '2:14', 'map-marker-path'],
  ['Pose balise FMB920', '5:02', 'cog-outline'],
  ['Dashcam — 10:05', '0:47', 'car'],
  ['Formation exploitants', '12:30', 'account-group-outline'],
  ['Contrôle anti-démarrage', '1:36', 'lock-outline'],
  ['Recette port', '3:21', 'ferry'],
] as const;
const files = [
  ['Facture FAC-2026-0874.pdf', 'PDF · 1,8 Mo', 'file-pdf-box'],
  ['Photo CI-4521-AB.jpg', 'Image · 2,4 Mo', 'image-outline'],
  ['Trajet du 21 octobre.mp4', 'Vidéo · 18,2 Mo', 'video-outline'],
  ['Export interventions.csv', 'CSV · 48 Ko', 'file-delimited-outline'],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" accessibilityRole="header">
        {title}
      </Text>
      <Card mode="outlined">
        <Card.Content style={styles.content}>{children}</Card.Content>
      </Card>
    </View>
  );
}

export function MediaGallery() {
  const theme = useKitTheme();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.38);
  const [selectedFile, setSelectedFile] = useState(0);
  const [slide, setSlide] = useState(0);
  const [cropShape, setCropShape] = useState('circle');
  const [cropZoom, setCropZoom] = useState(1);
  const slides = [
    ['Suivi essentiel', 'Position en temps réel, historique 90 jours, alertes de zone.', 'gps-fixed'],
    ['Poids lourds', 'Sondes carburant, temps de conduite, chronotachygraphe.', 'truck-outline'],
    ['Vidéo embarquée', 'Caméra double face et détection de fatigue.', 'video-outline'],
    ['Anti-démarrage', 'Coupure moteur à distance et badge chauffeur.', 'lock-outline'],
  ] as const;

  return (
    <Page testID="category-media">
      <Text variant="titleLarge" accessibilityRole="header">
        Médias
      </Text>
      <Text variant="bodyLarge">
        Lecteurs et aperçus tactiles alimentés par des exemples locaux. Aucun fichier n’est envoyé.
      </Text>
      <Section title="Lecteur vidéo">
        <MediaFrame
          icon="map-marker-path"
          title="Trajet CI-4521-AB"
          subtitle="Abidjan Plateau → Cocody · 2:14"
          theme={theme}
        />
        <View style={styles.playerControls}>
          <IconButton
            icon="rewind-10"
            accessibilityLabel="Reculer de 10 secondes"
            onPress={() => setProgress(Math.max(0, progress - 0.1))}
          />
          <IconButton
            mode="contained"
            icon={playing ? 'pause' : 'play'}
            accessibilityLabel={playing ? 'Mettre en pause' : 'Lire'}
            onPress={() => setPlaying(!playing)}
          />
          <IconButton
            icon="fast-forward-10"
            accessibilityLabel="Avancer de 10 secondes"
            onPress={() => setProgress(Math.min(1, progress + 0.1))}
          />
          <Text variant="bodySmall">{Math.round(progress * 134)} s / 2:14 · 1×</Text>
        </View>
        <ProgressBar progress={progress} />
        <View style={styles.row}>
          {['Départ', 'Abidjan', 'Arrivée'].map((label, index) => (
            <Chip
              key={label}
              selected={index === (progress < 0.3 ? 0 : progress < 0.8 ? 1 : 2)}
              onPress={() => setProgress([0.05, 0.5, 0.95][index] ?? 0)}
            >
              {label}
            </Chip>
          ))}
        </View>
      </Section>

      <Section title="Lecteur YouTube">
        <MediaFrame
          icon="youtube"
          title="Lookas — suivi de flotte en temps réel"
          subtitle={
            playing ? 'Lecture simulée · aucune connexion au service vidéo' : 'Aperçu local · touchez pour lancer'
          }
          theme={theme}
        />
        <Button mode="contained" icon={playing ? 'pause' : 'play'} onPress={() => setPlaying(!playing)}>
          {playing ? 'Mettre en pause' : 'Lire la présentation'}
        </Button>
      </Section>

      <Section title="Lecteur audio">
        {['Appel client — Transports Yao', 'Message vocal'].map((title, index) => (
          <View key={title} style={styles.audioRow}>
            <IconButton
              icon={playing ? 'pause' : 'play'}
              mode="contained-tonal"
              accessibilityLabel={`${playing ? 'Pause' : 'Lire'} ${title}`}
              onPress={() => setPlaying(!playing)}
            />
            <View style={styles.audioMain}>
              <Text variant="labelLarge">{title}</Text>
              <Text variant="bodySmall">{index ? '15/10/2026 · 23 s' : '15/10/2026 · 09:42 · Marie Yao'}</Text>
              <ProgressBar progress={index ? 0.24 : progress} />
            </View>
            <Text variant="labelSmall">{index ? '0:23' : '3:42'}</Text>
          </View>
        ))}
      </Section>

      <Section title="Lecteur PDF">
        <View style={[styles.pdf, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelMedium">LOOKAS · FACTURE</Text>
          <Text variant="headlineSmall">FAC-2026-0874</Text>
          <Divider />
          <Text variant="bodyMedium">Bolloré Logistics CI</Text>
          <Text variant="bodyMedium">Suivi de flotte · 24 véhicules</Text>
          <View style={styles.pdfTotal}>
            <Text variant="titleMedium">Total TTC</Text>
            <Text variant="titleLarge">1 250 000 FCFA</Text>
          </View>
          <Text variant="bodySmall">Page 1 sur 4</Text>
        </View>
        <View style={styles.row}>
          <IconButton
            icon="magnify-minus-outline"
            accessibilityLabel="Dézoomer"
            onPress={() => setCropZoom(Math.max(0.75, cropZoom - 0.1))}
          />
          <Text>Zoom {Math.round(cropZoom * 100)} %</Text>
          <IconButton
            icon="magnify-plus-outline"
            accessibilityLabel="Zoomer"
            onPress={() => setCropZoom(Math.min(1.5, cropZoom + 0.1))}
          />
          <Button icon="chevron-right" onPress={() => setSelectedFile((selectedFile + 1) % 4)}>
            Page suivante
          </Button>
        </View>
      </Section>

      <Section title="Visionneuse de fichiers">
        {files.map(([name, detail, icon], index) => (
          <List.Item
            key={name}
            title={name}
            description={detail}
            left={(p) => <List.Icon {...p} icon={icon} />}
            right={(p) => (
              <IconButton
                {...p}
                icon="chevron-right"
                accessibilityLabel={`Ouvrir ${name}`}
                onPress={() => setSelectedFile(index)}
              />
            )}
            onPress={() => setSelectedFile(index)}
          />
        ))}
        <Divider />
        <Text variant="labelLarge">Aperçu · {files[selectedFile]?.[0]}</Text>
        <MediaFrame
          icon={files[selectedFile]?.[2] ?? 'file-outline'}
          title={files[selectedFile]?.[0] ?? 'Fichier'}
          subtitle={files[selectedFile]?.[1] ?? ''}
          theme={theme}
        />
      </Section>

      <Section title="Carrousel">
        <MediaFrame
          icon={slides[slide]?.[2] ?? 'image-outline'}
          title={slides[slide]?.[0] ?? ''}
          subtitle={slides[slide]?.[1] ?? ''}
          theme={theme}
        />
        <View style={styles.row}>
          <IconButton
            icon="chevron-left"
            accessibilityLabel="Diapositive précédente"
            onPress={() => setSlide((slide + slides.length - 1) % slides.length)}
          />
          {slides.map(([title], index) => (
            <Chip key={title} selected={slide === index} onPress={() => setSlide(index)}>
              {index + 1}
            </Chip>
          ))}
          <IconButton
            icon="chevron-right"
            accessibilityLabel="Diapositive suivante"
            onPress={() => setSlide((slide + 1) % slides.length)}
          />
        </View>
      </Section>

      <Section title="Galerie d’images">
        <View style={styles.gallery}>
          {['Cabine', 'Boîtier', 'Antenne', 'Relais', 'Faisceau', 'Contrôle'].map((label, index) => (
            <Card
              key={label}
              mode="contained"
              style={[
                styles.thumbnail,
                {
                  backgroundColor: [
                    theme.colors.primaryContainer,
                    theme.colors.secondaryContainer,
                    theme.colors.tertiaryContainer,
                  ][index % 3],
                },
              ]}
              onPress={() => setSelectedFile(index % files.length)}
            >
              <Card.Content style={styles.thumbContent}>
                <Text variant="headlineSmall">{['🚘', '⚙️', '📡', '🔌', '🔋', '✓'][index]}</Text>
                <Text variant="labelSmall">{label}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
        <Text variant="bodySmall">Touchez une vignette pour la sélectionner dans la visionneuse.</Text>
      </Section>

      <Section title="Galerie vidéo">
        <View style={styles.videoGrid}>
          {videos.map(([title, duration, icon], index) => (
            <Card
              key={title}
              mode="outlined"
              style={styles.videoCard}
              onPress={() => {
                setSelectedFile(index % files.length);
                setPlaying(true);
              }}
            >
              <Card.Content
                style={[
                  styles.videoArt,
                  {
                    backgroundColor: [
                      theme.colors.primaryContainer,
                      theme.colors.secondaryContainer,
                      theme.colors.tertiaryContainer,
                    ][index % 3],
                  },
                ]}
              >
                <IconButton
                  icon="play-circle-outline"
                  size={38}
                  accessibilityLabel={`Lire ${title}`}
                  onPress={() => setPlaying(true)}
                />
                <Text variant="labelSmall">{duration}</Text>
              </Card.Content>
              <Card.Content>
                <Text variant="labelMedium" numberOfLines={2}>
                  {title}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Grille masonry">
        <View style={styles.masonry}>
          {Array.from({ length: 8 }, (_, index) => (
            <View
              key={index}
              style={[
                styles.masonryItem,
                {
                  height: 76 + (index % 3) * 28,
                  backgroundColor: [
                    theme.colors.primaryContainer,
                    theme.colors.secondaryContainer,
                    theme.colors.tertiaryContainer,
                  ][index % 3],
                },
              ]}
            >
              <Text variant="titleMedium">{['📍', '🚚', '🛠️', '📡', '🧭', '🧰', '📷', '✓'][index]}</Text>
              <Text variant="labelSmall">Site {index + 1}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Recadrage d’image / avatar">
        <SegmentedButtons
          value={cropShape}
          onValueChange={setCropShape}
          buttons={[
            { value: 'circle', label: 'Rond' },
            { value: 'square', label: 'Carré' },
          ]}
        />
        <View style={styles.cropStage}>
          <View
            style={[
              styles.avatar,
              {
                width: 148 * cropZoom,
                height: 148 * cropZoom,
                borderRadius: cropShape === 'circle' ? 100 : radius.lg,
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
          >
            <Text variant="displaySmall">AK</Text>
          </View>
        </View>
        <View style={styles.row}>
          <IconButton icon="rotate-left" accessibilityLabel="Tourner à gauche" onPress={() => setCropZoom(1)} />
          <Button icon="crop" onPress={() => setCropZoom(cropZoom === 1 ? 1.1 : 1)}>
            Ajuster le recadrage
          </Button>
          <Text variant="bodySmall">Aperçu · 48 · 96 · 144 px</Text>
        </View>
      </Section>
    </Page>
  );
}

function MediaFrame({
  icon,
  title,
  subtitle,
  theme,
}: {
  icon: string;
  title: string;
  subtitle: string;
  theme: ReturnType<typeof useKitTheme>;
}) {
  return (
    <View style={[styles.frame, { backgroundColor: theme.colors.surfaceVariant }]}>
      <IconButton icon={icon} size={48} accessibilityLabel="Illustration du média" />
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodySmall" style={{ textAlign: 'center' }}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s1 },
  playerControls: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  frame: {
    minHeight: 170,
    borderRadius: radius.lg,
    padding: space.s3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s1,
  },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  audioMain: { flex: 1, gap: space.s1 },
  pdf: { minHeight: 260, padding: space.s4, gap: space.s3, borderRadius: radius.md },
  pdfTotal: { marginTop: space.s3, alignItems: 'flex-end' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  thumbnail: { width: '31%', minWidth: 88 },
  thumbContent: { minHeight: 94, alignItems: 'center', justifyContent: 'center', gap: space.s1 },
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  videoCard: { width: '48%', minWidth: 140 },
  videoArt: { minHeight: 104, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  masonry: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  masonryItem: { width: '31%', minWidth: 76, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  cropStage: { minHeight: 190, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
});
