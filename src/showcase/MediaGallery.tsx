import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import {
  DemoArt,
  FileTypeIcon,
  FileViewer,
  ImageCropper,
  ImageGallery,
  KitAudioPlayer,
  KitBottomSheet,
  KitCard,
  KitCarousel,
  KitVideoPlayer,
  MasonryGrid,
  PdfViewer,
  YoutubeFacade,
} from '../components';
import { useKitSnack } from '../core/snack';
import { OFFRES, PHOTOS_INSTALLATION, VIDEOS, VIEWER_FILES } from '../data/media';
import { breakpoints, font, radius, space, useKitTheme, withAlpha } from '../theme';
import { BLACK, WHITE } from '../theme/swatches';
import { Demo, DocPage, type DocSection } from './doc';

/** `/components/media` — lecteurs et visionneuses sans dépendance externe ni réseau. */
export function MediaGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const { width } = useWindowDimensions();
  const [file, setFile] = useState<number | null>(null);
  const [video, setVideo] = useState<[string, string, number] | null>(null);
  const cols = width >= breakpoints.tablet ? 3 : 2;

  const sections: DocSection[] = [
    {
      id: 'video',
      title: 'Lecteur vidéo',
      source: 'KitVideoPlayer',
      description:
        'Toucher : lecture / pause · double-toucher à gauche ou à droite : −10 s / +10 s · repères de chapitres · vitesse · plein écran en paysage.',
      children: (
        <Demo label="Trajet CI-4521-AB">
          <KitVideoPlayer />
        </Demo>
      ),
    },
    {
      id: 'youtube',
      title: 'Lecteur YouTube',
      source: 'YoutubeFacade',
      description:
        'Mode façade : seule une vignette est affichée ; aucun script ni requête vers YouTube tant que l’utilisateur n’a pas lancé la lecture (simulée ici).',
      children: (
        <Demo label="Vidéo de présentation">
          <YoutubeFacade title="Lookas — suivi de flotte en temps réel" />
        </Demo>
      ),
    },
    {
      id: 'audio',
      title: 'Lecteur audio',
      source: 'KitAudioPlayer',
      cols: 2,
      children: [
        <Demo key="call" label="Enregistrement d’appel">
          <KitAudioPlayer
            title="Appel client — Transports Yao"
            subtitle="15/10/2026 · 09:42 · Marie Yao"
            onDownload={() => snack.demoAction('Téléchargement')}
          />
        </Demo>,
        <Demo key="voice" label="Message vocal (compact)">
          <KitAudioPlayer title="Message vocal" compact duration={23000} seed={8} />
        </Demo>,
      ],
    },
    {
      id: 'pdf',
      title: 'Lecteur PDF',
      source: 'PdfViewer',
      description: 'Pages défilant verticalement, zoom, miniatures de navigation.',
      children: (
        <Demo label="Facture" flush>
          <PdfViewer />
        </Demo>
      ),
    },
    {
      id: 'viewer',
      title: 'Visionneuse de fichiers',
      source: 'FileViewer · FilePreview',
      description:
        'Aperçu adapté au type (image, PDF, vidéo, audio, CSV, code, texte, non pris en charge) ; balayez pour passer au fichier suivant.',
      children: (
        <Demo label="Pièces du dossier" flush>
          {VIEWER_FILES.map((f, i) => (
            <TouchableRipple
              key={f.name}
              onPress={() => setFile(i)}
              accessibilityRole="button"
              accessibilityLabel={`${f.name}, ${f.size}`}
            >
              <View style={styles.fileRow}>
                <FileTypeIcon kind={f.kind} />
                <View style={styles.fill}>
                  <Text numberOfLines={1} style={[font('500', 14), { color: kit.textPrimary }]}>
                    {f.name}
                  </Text>
                  <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{f.size}</Text>
                </View>
                <Icon source="mi:chevron-right" size={24} color={kit.textMuted} />
              </View>
            </TouchableRipple>
          ))}
        </Demo>
      ),
    },
    {
      id: 'carousel',
      title: 'Carrousel',
      source: 'KitCarousel',
      description: 'Aperçu de la diapositive suivante, défilement automatique suspendu pendant le toucher.',
      children: (
        <Demo label="Offres">
          <KitCarousel slides={OFFRES} />
        </Demo>
      ),
    },
    {
      id: 'image-gallery',
      title: 'Galerie d’images',
      source: 'ImageGallery · Lightbox',
      description: 'Touchez une vignette : visionneuse plein écran avec balayage et zoom par pincement.',
      children: (
        <Demo label="Photos d’installation">
          <ImageGallery seeds={PHOTOS_INSTALLATION.seeds} captions={PHOTOS_INSTALLATION.captions} />
        </Demo>
      ),
    },
    {
      id: 'video-gallery',
      title: 'Galerie vidéo',
      source: 'grille de vignettes + lecteur',
      children: (
        <Demo label="Vidéos">
          <View style={styles.videoGrid}>
            {VIDEOS.map((v) => {
              const [t, d, s] = v;
              return (
                <TouchableRipple
                  key={t}
                  borderless
                  onPress={() => setVideo(v)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t}, ${d}`}
                  style={[styles.videoCell, { width: `${100 / cols}%` }]}
                >
                  <View>
                    <View style={styles.videoThumb}>
                      <DemoArt seed={s} />
                      <View style={styles.center} pointerEvents="none">
                        <View style={[styles.playDisc, { backgroundColor: withAlpha(BLACK, 0.45) }]}>
                          <Icon source="mi:play-arrow" size={24} color={WHITE} />
                        </View>
                      </View>
                      <View style={[styles.duration, { backgroundColor: withAlpha(BLACK, 0.87) }]}>
                        <Text style={[font('400', 11), { color: WHITE }]}>{d}</Text>
                      </View>
                    </View>
                    <Text numberOfLines={2} style={[font('600', 12.5), styles.videoTitle, { color: kit.textPrimary }]}>
                      {t}
                    </Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
        </Demo>
      ),
    },
    {
      id: 'masonry',
      title: 'Grille masonry',
      source: 'MasonryGrid',
      children: (
        <Demo label="Photos de sites">
          <MasonryGrid count={8} />
        </Demo>
      ),
    },
    {
      id: 'cropper',
      title: 'Recadrage d’image / avatar',
      source: 'ImageCropper',
      description:
        'Faites glisser et pincez l’image dans le masque ; masque rond ou carré, rotation, aperçu aux tailles d’avatar.',
      children: [
        <Demo key="crop" label="Photo de profil">
          <ImageCropper onConfirm={() => snack.show('Avatar mis à jour (démo statique)', { kind: 'success' })} />
        </Demo>,
        <KitCard key="note">
          <View style={styles.note}>
            <Icon source="mi:info-outline" size={24} color={kit.info} />
            <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>
              Pour de vrais fichiers, branchez expo-video, expo-audio ou un lecteur PDF sur ces mêmes contrôles :
              l’interface reste identique.
            </Text>
          </View>
        </KitCard>,
      ],
    },
  ];

  return (
    <View style={styles.fill}>
      <DocPage
        title="Médias"
        icon="mi:perm-media"
        initialSection={initialSection}
        testID="category-media"
        subtitle="Lecture et aperçu de fichiers sans dépendance : vidéo aux contrôles tactiles, YouTube en mode façade, audio à forme d’onde, PDF, visionneuse universelle, carrousel, galeries et recadrage. Tous les médias de démonstration sont générés localement."
        sections={sections}
      />
      <FileViewer files={VIEWER_FILES} index={file} onClose={() => setFile(null)} />
      <KitBottomSheet visible={video !== null} onDismiss={() => setVideo(null)}>
        {video ? (
          <View style={styles.sheetPlayer}>
            <KitVideoPlayer title={video[0]} seed={video[2]} autoplay />
          </View>
        ) : null}
      </KitBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, paddingHorizontal: space.m },
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: -5 },
  videoCell: { padding: 5, borderRadius: radius.md },
  videoThumb: { aspectRatio: 16 / 10, borderRadius: radius.md, overflow: 'hidden' },
  playDisc: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  duration: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  videoTitle: { marginTop: 6 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetPlayer: { paddingHorizontal: space.s4, paddingBottom: space.s4 },
});
