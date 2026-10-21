import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
  type ImageSourcePropType,
} from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { number } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import {
  GT06_CONFIG,
  INVOICE_LINES,
  NOTES_INTERVENTION,
  POSITIONS_CSV,
  type ViewerFile,
  type ViewerKind,
} from '../../data/media';
import { KitIconButton } from '../../mobile/KitIconButton';
import { font, radius, space, toneColor, toneLight, useKitTheme, withAlpha, type KitTone } from '../../theme';
import { BLACK, PAPER, PDF_BACKDROP, WHITE } from '../../theme/swatches';
import { KitButton } from '../core/Button';
import { SegmentedToggle } from '../core/Toggles';
import { DemoArt } from '../display/DemoArt';
import { KitSlider } from '../inputs/Slider';
import { GradientScrim, KitAudioPlayer, KitVideoPlayer } from './Players';

/**
 * Visionneuses (`viewers.dart`) : PDF (pages générées), fichiers, carrousel, galeries, masonry,
 * recadrage d'image. Tout est généré localement.
 */

type ScrollRef = ComponentRef<typeof ScrollView>;

// ── PDF ────────────────────────────────────────────────────────────

const PAGE_W = 300;
const PAGE_H = 424;

/** Page de facture A4 dessinée en vues, mise à l'échelle de la place disponible. */
function InvoicePage({ page, total, scale }: { page: number; total: number; scale: number }) {
  const t = { fontSize: 7.5, lineHeight: 10.5, color: PAPER.ink };
  const sum = INVOICE_LINES.reduce((a, [, q, p]) => a + q * p, 0);
  return (
    <View style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
      <View
        style={[
          styles.paper,
          {
            backgroundColor: PAPER.bg,
            left: (PAGE_W * scale - PAGE_W) / 2,
            top: (PAGE_H * scale - PAGE_H) / 2,
            transform: [{ scale }],
            boxShadow: `0 0 10px ${withAlpha(BLACK, 0.45)}`,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={[styles.paperLogo, { backgroundColor: PAPER.brand }]}>
            <Icon source="mi:gps-fixed" size={12} color={WHITE} />
          </View>
          <Text style={[font('800', 10), styles.fill, { color: PAPER.brand }]}>LOOKAS CI</Text>
          <Text style={[font('800', 10), { color: PAPER.ink }]}>{page === 1 ? 'FACTURE' : `ANNEXE ${page - 1}`}</Text>
        </View>
        <View style={styles.mt10}>
          {page === 1 ? (
            <>
              <Text style={[t, { color: PAPER.muted }]}>FAC-2026-0912 · 15/10/2026</Text>
              <Text style={[t, font('700', 7.5), styles.mt8, { color: PAPER.ink }]}>Facturé à :</Text>
              <Text style={t}>{'Transports Yao & Fils\nZone industrielle de Yopougon\nAbidjan, Côte d’Ivoire'}</Text>
              <View style={[styles.row, styles.mt10, styles.paperHead, { backgroundColor: PAPER.header }]}>
                <Text style={[t, font('700', 7.5), styles.fill, { color: PAPER.ink }]}>Désignation</Text>
                <Text style={[t, font('700', 7.5), { color: PAPER.ink }]}>Qté Montant</Text>
              </View>
              {INVOICE_LINES.map(([l, q, p]) => (
                <View key={l} style={[styles.row, styles.paperLine]}>
                  <Text style={[t, styles.fill]}>{l}</Text>
                  <Text style={t}>{`${q}   ${number(q * p)}`}</Text>
                </View>
              ))}
              <View style={[styles.paperRule, { backgroundColor: PAPER.muted }]} />
              <Text
                style={[font('800', 9), styles.right, { color: PAPER.ink }]}
              >{`Total TTC : ${number(sum)} FCFA`}</Text>
            </>
          ) : (
            Array.from({ length: 14 }, (_, i) => (
              <View key={i} style={[styles.paperBar, { width: 60 + ((i * 37) % 140), backgroundColor: PAPER.line }]} />
            ))
          )}
        </View>
        <View style={styles.fill} />
        <View style={styles.row}>
          <Text style={[{ fontSize: 6, color: PAPER.muted }, styles.fill]}>RCCM CI-ABJ-2019-B-12345</Text>
          <Text style={{ fontSize: 6, color: PAPER.muted }}>{`Page ${page} / ${total}`}</Text>
        </View>
      </View>
    </View>
  );
}

/** Bouton d'outil de la barre du lecteur PDF. */
function PdfTool({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { kit } = useKitTheme();
  return (
    <TouchableRipple
      borderless
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.tool}
    >
      <Icon source={icon} size={20} color={disabled ? kit.disabledContent : kit.textPrimary} />
    </TouchableRipple>
  );
}

/** Lecteur PDF (`<app-pdf-viewer>`) : pages défilant verticalement, zoom, miniatures de navigation. */
export function PdfViewer({
  pages = 3,
  fileName = 'FAC-2026-0912.pdf',
  height = 460,
}: {
  pages?: number;
  fileName?: string;
  height?: number;
}) {
  const { kit, colorMode } = useKitTheme();
  const snack = useKitSnack();
  const scroll = useRef<ScrollRef>(null);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const bodyH = height - 48 - 46;
  const fit = width ? Math.min((width - 32) / PAGE_W, (bodyH - 32) / PAGE_H) : 0;
  const go = (p: number) => {
    scroll.current?.scrollTo({ y: p * bodyH, animated: true });
    setPage(p);
    setZoom(1);
  };
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.pdf, { height, backgroundColor: colorMode === 'dark' ? PDF_BACKDROP.dark : PDF_BACKDROP.light }]}
    >
      <View style={[styles.pdfBar, { backgroundColor: kit.card }]}>
        <Icon source="mi:picture-as-pdf" size={20} color={kit.error} />
        <Text numberOfLines={1} style={[font('600', 13), styles.fill, { color: kit.textPrimary }]}>
          {fileName}
        </Text>
        <PdfTool
          icon="mi:zoom-out"
          label="Zoom arrière"
          onPress={() => setZoom((z) => Math.max(1, z / 1.25))}
          disabled={zoom <= 1}
        />
        <PdfTool
          icon="mi:zoom-in"
          label="Zoom avant"
          onPress={() => setZoom((z) => Math.min(4, z * 1.25))}
          disabled={zoom >= 4}
        />
        <PdfTool icon="mi:download" label="Télécharger" onPress={() => snack.demoAction('Téléchargement')} />
      </View>
      <ScrollView
        ref={scroll}
        pagingEnabled
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.fill}
        onMomentumScrollEnd={(e) => {
          const p = Math.round(e.nativeEvent.contentOffset.y / bodyH);
          if (p !== page) {
            setPage(p);
            setZoom(1);
          }
        }}
      >
        {Array.from({ length: pages }, (_, i) => (
          <ScrollView
            key={i}
            horizontal
            nestedScrollEnabled
            style={{ height: bodyH }}
            contentContainerStyle={[styles.pdfPage, { minWidth: width, minHeight: bodyH }]}
          >
            <ScrollView nestedScrollEnabled contentContainerStyle={[styles.pdfPage, { minHeight: bodyH }]}>
              <InvoicePage page={i + 1} total={pages} scale={fit * (i === page ? zoom : 1)} />
            </ScrollView>
          </ScrollView>
        ))}
      </ScrollView>
      <View style={[styles.pdfFoot, { backgroundColor: kit.card }]}>
        <PdfTool
          icon="mi:keyboard-arrow-up"
          label="Page précédente"
          onPress={() => go(page - 1)}
          disabled={page === 0}
        />
        <View style={styles.thumbs}>
          {Array.from({ length: pages }, (_, i) => (
            <TouchableRipple
              key={i}
              onPress={() => go(i)}
              accessibilityRole="button"
              accessibilityLabel={`Page ${i + 1}`}
              accessibilityState={{ selected: i === page }}
              style={[
                styles.thumb,
                {
                  backgroundColor: PAPER.bg,
                  borderColor: i === page ? kit.primary : kit.border,
                  borderWidth: i === page ? 2 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 10, color: PAPER.ink }}>{i + 1}</Text>
            </TouchableRipple>
          ))}
        </View>
        <PdfTool
          icon="mi:keyboard-arrow-down"
          label="Page suivante"
          onPress={() => go(page + 1)}
          disabled={page === pages - 1}
        />
      </View>
    </View>
  );
}

// ── Visionneuse de fichiers ────────────────────────────────────────

const KIND: Record<ViewerKind, { icon: string; tone: KitTone }> = {
  image: { icon: 'mi:image', tone: 'purple' },
  pdf: { icon: 'mi:picture-as-pdf', tone: 'error' },
  video: { icon: 'mi:movie', tone: 'info' },
  audio: { icon: 'mi:audiotrack', tone: 'warning' },
  csv: { icon: 'mi:table-view', tone: 'success' },
  code: { icon: 'mi:code', tone: 'primary' },
  text: { icon: 'mi:description', tone: 'neutral' },
  bin: { icon: 'mi:insert-drive-file', tone: 'neutral' },
};

/** Pastille d'icône du type de fichier. */
export function FileTypeIcon({ kind }: { kind: ViewerKind }) {
  const { kit } = useKitTheme();
  const k = KIND[kind];
  return (
    <View style={[styles.fileIcon, { backgroundColor: toneLight(k.tone, kit) }]}>
      <Icon source={k.icon} size={24} color={toneColor(k.tone, kit)} />
    </View>
  );
}

/** Aperçu d'un fichier selon son type (image, PDF, vidéo, audio, CSV, code, texte, non pris en charge). */
export function FilePreview({ file }: { file: ViewerFile }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  switch (file.kind) {
    case 'image':
      return (
        <ScrollView maximumZoomScale={5} centerContent contentContainerStyle={styles.grow}>
          <View style={styles.imageBox}>
            <DemoArt seed={file.seed ?? 0} label={file.name} />
          </View>
        </ScrollView>
      );
    case 'pdf':
      return <PdfViewer height={560} />;
    case 'video':
      return <KitVideoPlayer title={file.name} seed={file.seed} duration={47000} />;
    case 'audio':
      return <KitAudioPlayer title={file.name} subtitle="Appel entrant · +225 07 10 20 30 40" />;
    case 'csv':
      return (
        <ScrollView horizontal>
          <View style={[styles.csv, { borderColor: kit.border }]}>
            {POSITIONS_CSV.map((r, i) => (
              <View
                key={r[0]}
                style={[styles.csvRow, { borderColor: kit.divider }, i === 0 && { backgroundColor: kit.tableHeader }]}
              >
                {r.map((v, j) => (
                  <Text key={j} style={[font(i === 0 ? '700' : '400', 13), styles.csvCell, { color: kit.textPrimary }]}>
                    {v}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    case 'code':
    case 'text':
      return (
        <View style={[styles.textFile, { backgroundColor: kit.hover }]}>
          <Text selectable style={[font('400', 12.5, 'mono'), styles.textLines, { color: kit.textPrimary }]}>
            {file.kind === 'code' ? GT06_CONFIG : NOTES_INTERVENTION}
          </Text>
        </View>
      );
    default:
      return (
        <View style={styles.unsupported}>
          <Icon source="mi:visibility-off" size={54} color={kit.textMuted} />
          <Text style={[font('700', 18, 'heading'), styles.mt12, { color: kit.textPrimary }]}>Aperçu indisponible</Text>
          <Text style={[font('400', 14), styles.centerText, { color: kit.textSecondary }]}>
            {`Ce type de fichier (.${file.name.split('.').pop()}) ne peut pas être prévisualisé.`}
          </Text>
          <View style={styles.mt16}>
            <KitButton
              label={`Télécharger (${file.size})`}
              icon="mi:download"
              onPress={() => snack.demoAction('Téléchargement')}
            />
          </View>
        </View>
      );
  }
}

/** Visionneuse plein écran : aperçu selon le type, balayage horizontal d'un fichier à l'autre. */
export function FileViewer({
  files,
  index,
  onClose,
}: {
  files: ViewerFile[];
  /** Fichier ouvert ; `null` : visionneuse fermée. */
  index: number | null;
  onClose: () => void;
}) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [current, setCurrent] = useState(index ?? 0);
  const [opened, setOpened] = useState(index);
  if (index !== opened) {
    setOpened(index);
    if (index !== null) setCurrent(index);
  }
  const f = files[current];
  return (
    <Modal visible={index !== null} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.fill, { backgroundColor: kit.bg, paddingTop: insets.top }]}>
        <View style={styles.viewerBar}>
          <KitIconButton icon="mi:close" accessibilityLabel="Fermer" onPress={onClose} />
          <View style={styles.fill}>
            <Text numberOfLines={1} style={[font('500', 15), { color: kit.textPrimary }]}>
              {f?.name}
            </Text>
            <Text style={[font('400', 11.5), { color: kit.textMuted }]}>
              {`${f?.size} · ${current + 1} / ${files.length}`}
            </Text>
          </View>
          <KitIconButton icon="mi:share" accessibilityLabel="Partager" onPress={() => snack.demoAction('Partage')} />
          <KitIconButton
            icon="mi:download"
            accessibilityLabel="Télécharger"
            onPress={() => snack.demoAction('Téléchargement')}
          />
        </View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: (index ?? 0) * width, y: 0 }}
          onMomentumScrollEnd={(e) => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {files.map((file) => (
            <View key={file.name} style={[styles.viewerPage, { width, paddingBottom: insets.bottom + space.s4 }]}>
              <FilePreview file={file} />
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Carrousel ──────────────────────────────────────────────────────

export interface CarouselSlide {
  title: string;
  subtitle: string;
  seed: number;
  icon?: string;
}

/** Carrousel (`<app-carousel>`) : aperçu de la diapositive suivante, indicateurs, défilement automatique. */
export function KitCarousel({
  slides,
  height = 200,
  autoplay = true,
}: {
  slides: CarouselSlide[];
  height?: number;
  autoplay?: boolean;
}) {
  const { kit } = useKitTheme();
  const scroll = useRef<ScrollRef>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [touching, setTouching] = useState(false);
  const item = width * 0.88;
  useEffect(() => {
    if (!autoplay || touching || !item) return;
    const id = setTimeout(
      () => scroll.current?.scrollTo({ x: ((index + 1) % slides.length) * item, animated: true }),
      4000,
    );
    return () => clearTimeout(id);
  }, [autoplay, touching, item, index, slides.length]);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scroll}
        horizontal
        decelerationRate="fast"
        snapToInterval={item || undefined}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: width - item }}
        onTouchStart={() => setTouching(true)}
        onTouchEnd={() => setTouching(false)}
        onScroll={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / (item || 1));
          if (i !== index) setIndex(i);
        }}
        scrollEventThrottle={32}
        style={{ height }}
      >
        {slides.map((s, i) => (
          <View
            key={s.title}
            accessible
            accessibilityLabel={`${s.title}. ${s.subtitle}. Diapositive ${i + 1} sur ${slides.length}`}
            style={[styles.slide, { width: item, paddingVertical: i === index ? 0 : space.s3 }]}
          >
            <View style={styles.slideInner}>
              <DemoArt seed={s.seed} icon={s.icon} />
              <GradientScrim
                stops={[
                  [0.5, 0],
                  [1, 0.8],
                ]}
              />
              <View style={styles.slideText}>
                <Text style={[font('700', 18, 'heading'), { color: WHITE }]}>{s.title}</Text>
                <Text numberOfLines={2} style={[font('400', 12.5), { color: withAlpha(WHITE, 0.7) }]}>
                  {s.subtitle}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {slides.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              { width: i === index ? 22 : 8, backgroundColor: i === index ? kit.primary : kit.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Galeries ───────────────────────────────────────────────────────

/** Visionneuse plein écran d'images : balayage, zoom par pincement (iOS), légende. */
export function Lightbox({
  seeds,
  captions,
  index,
  onClose,
}: {
  seeds: number[];
  captions?: string[];
  index: number | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [current, setCurrent] = useState(index ?? 0);
  const [opened, setOpened] = useState(index);
  if (index !== opened) {
    setOpened(index);
    if (index !== null) setCurrent(index);
  }
  return (
    <Modal visible={index !== null} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.fill, { backgroundColor: BLACK }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: (index ?? 0) * width, y: 0 }}
          onMomentumScrollEnd={(e) => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {seeds.map((s, i) => (
            <ScrollView
              key={`${s}-${i}`}
              maximumZoomScale={5}
              centerContent
              style={{ width }}
              contentContainerStyle={styles.lightboxPage}
            >
              <View style={[styles.lightboxImage, { width }]}>
                <DemoArt seed={s} />
              </View>
            </ScrollView>
          ))}
        </ScrollView>
        <View style={[styles.lightboxBar, { top: insets.top }]}>
          <TouchableRipple
            borderless
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            style={styles.lightboxClose}
          >
            <Icon source="mi:close" size={24} color={WHITE} />
          </TouchableRipple>
          <Text style={[font('600', 14), { color: WHITE }]}>{`${current + 1} / ${seeds.length}`}</Text>
        </View>
        {captions?.[current] ? (
          <Text style={[font('400', 14), styles.caption, { bottom: insets.bottom + 32, color: WHITE }]}>
            {captions[current]}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

/** Grille d'images carrées ; une vignette ouvre la visionneuse plein écran. */
export function ImageGallery({
  seeds,
  captions,
  columns = 3,
}: {
  seeds: number[];
  captions?: string[];
  columns?: number;
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View style={styles.gallery}>
      {seeds.map((s, i) => (
        <TouchableRipple
          key={`${s}-${i}`}
          onPress={() => setOpen(i)}
          accessibilityRole="imagebutton"
          accessibilityLabel={captions?.[i] ?? `Image ${i + 1}`}
          style={[styles.galleryCell, { width: `${100 / columns}%` }]}
        >
          <View style={styles.galleryInner}>
            <DemoArt seed={s} />
            {i === seeds.length - 1 && seeds.length > 5 ? (
              <View style={[styles.more, { backgroundColor: withAlpha(BLACK, 0.45) }]}>
                <Icon source="mi:collections" size={24} color={WHITE} />
              </View>
            ) : null}
          </View>
        </TouchableRipple>
      ))}
      <Lightbox seeds={seeds} captions={captions} index={open} onClose={() => setOpen(null)} />
    </View>
  );
}

/** Grille masonry (colonnes à hauteurs variables, placement dans la colonne la plus courte). */
export function MasonryGrid({ count, columns = 2 }: { count: number; columns?: number }) {
  const { kit } = useKitTheme();
  const cols: { i: number; h: number }[][] = Array.from({ length: columns }, () => []);
  const heights: number[] = Array.from({ length: columns }, () => 0);
  for (let i = 0; i < count; i++) {
    const h = 110 + ((i * 53) % 120);
    const c = heights.indexOf(Math.min(...heights));
    heights[c] = (heights[c] ?? 0) + h;
    cols[c]?.push({ i, h });
  }
  return (
    <View style={styles.masonry}>
      {cols.map((col, c) => (
        <View key={c} style={styles.masonryCol}>
          {col.map(({ i, h }) => (
            <View key={i} style={[styles.masonryCell, { height: h }]}>
              <DemoArt seed={i + 7} />
              <View style={[styles.siteTag, { backgroundColor: withAlpha(kit.card, 0.9) }]}>
                <Text style={[font('700', 11), { color: kit.textPrimary }]}>{`Site ${i + 1}`}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Recadrage ──────────────────────────────────────────────────────

const CROP = 240;
const CROP_IMG = CROP * 1.6;
const CROP_MARGIN = 40;
const DEFAULT_CROP_IMAGE: ImageSourcePropType = require('../../../assets/images/bg.jpg');

/**
 * Recadrage d'image / avatar (`<app-image-cropper>`) : glisser et pincer l'image dans un masque rond ou
 * carré, zoom au curseur, rotation, aperçu aux tailles d'avatar.
 */
export function ImageCropper({
  source = DEFAULT_CROP_IMAGE,
  onConfirm,
}: {
  source?: ImageSourcePropType;
  onConfirm: () => void;
}) {
  const { kit } = useKitTheme();
  const [round, setRound] = useState<'round' | 'square'>('round');
  const [quarter, setQuarter] = useState(0);
  const [t, setT] = useState({ x: 0, y: 0, s: 1 });
  const start = useRef({ x: 0, y: 0, s: 1, px: 0, py: 0, dist: 0, touches: 0 });

  const clamp = (x: number, y: number, s: number) => {
    const min = CROP - CROP_IMG * s - CROP_MARGIN;
    return {
      x: Math.max(min, Math.min(CROP_MARGIN, x)),
      y: Math.max(min, Math.min(CROP_MARGIN, y)),
      s,
    };
  };
  const setScale = (s: number) =>
    setT((v) => {
      // Zoom autour du centre du masque.
      const cx = CROP / 2;
      const k = s / v.s;
      return clamp(cx - (cx - v.x) * k, cx - (cx - v.y) * k, s);
    });
  const dist = (e: GestureResponderEvent) => {
    const [a, b] = e.nativeEvent.touches;
    return a && b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0;
  };
  const begin = (e: GestureResponderEvent) => {
    start.current = {
      x: t.x,
      y: t.y,
      s: t.s,
      px: e.nativeEvent.pageX,
      py: e.nativeEvent.pageY,
      dist: dist(e),
      touches: e.nativeEvent.touches.length,
    };
  };

  const image = (k: number) => (
    <Image
      source={source}
      resizeMode="cover"
      style={{
        position: 'absolute',
        width: CROP_IMG * t.s * k,
        height: CROP_IMG * t.s * k,
        left: t.x * k,
        top: t.y * k,
        transform: [{ rotate: `${quarter * 90}deg` }],
      }}
    />
  );
  const inset = 14;
  const r = CROP / 2 - inset;
  const hole =
    round === 'round'
      ? `M${CROP / 2 - r} ${CROP / 2} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`
      : `M${inset + 12} ${inset} H${CROP - inset - 12} Q${CROP - inset} ${inset} ${CROP - inset} ${inset + 12} V${CROP - inset - 12} Q${CROP - inset} ${CROP - inset} ${CROP - inset - 12} ${CROP - inset} H${inset + 12} Q${inset} ${CROP - inset} ${inset} ${CROP - inset - 12} V${inset + 12} Q${inset} ${inset} ${inset + 12} ${inset} Z`;

  return (
    <View style={styles.cropper}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Zone de recadrage"
        accessibilityValue={{ text: `Zoom ${Math.round(t.s * 100)} %` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) =>
          setScale(Math.max(1, Math.min(4, t.s + (e.nativeEvent.actionName === 'increment' ? 0.25 : -0.25))))
        }
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={begin}
        onResponderMove={(e) => {
          if (e.nativeEvent.touches.length !== start.current.touches) begin(e);
          const g = start.current;
          if (g.dist > 0) {
            const s = Math.max(1, Math.min(4, (g.s * dist(e)) / g.dist));
            const cx = CROP / 2;
            setT(clamp(cx - (cx - g.x) * (s / g.s), cx - (cx - g.y) * (s / g.s), s));
          } else setT(clamp(g.x + e.nativeEvent.pageX - g.px, g.y + e.nativeEvent.pageY - g.py, g.s));
        }}
        style={styles.cropBox}
      >
        {image(1)}
        <Svg width={CROP} height={CROP} style={styles.abs} pointerEvents="none">
          <Path d={`M0 0 H${CROP} V${CROP} H0 Z ${hole}`} fill={kit.bg} fillOpacity={0.6} fillRule="evenodd" />
          <Path d={hole} fill="none" stroke={WHITE} strokeWidth={2} />
        </Svg>
      </View>
      <View style={styles.zoomRow}>
        <Icon source="mi:zoom-out" size={18} color={kit.textSecondary} />
        <View style={styles.fill}>
          <KitSlider value={t.s} min={1} max={4} onChange={setScale} accessibilityLabel="Zoom" />
        </View>
        <Icon source="mi:zoom-in" size={18} color={kit.textSecondary} />
      </View>
      <View style={styles.cropTools}>
        <SegmentedToggle
          value={round}
          onChange={setRound}
          options={[
            { value: 'round', label: 'Rond', icon: 'mi:circle' },
            { value: 'square', label: 'Carré', icon: 'mi:crop-square' },
          ]}
        />
        <KitIconButton
          icon="mi:rotate-90-degrees-ccw"
          mode="outlined"
          accessibilityLabel="Pivoter"
          onPress={() => setQuarter((q) => (q + 1) % 4)}
        />
        <KitIconButton
          icon="mi:restart-alt"
          mode="outlined"
          accessibilityLabel="Réinitialiser"
          onPress={() => {
            setT({ x: 0, y: 0, s: 1 });
            setQuarter(0);
          }}
        />
      </View>
      <View style={styles.previewRow}>
        <Text style={[font('400', 12), { color: kit.textSecondary }]}>Aperçu :</Text>
        {[64, 40, 28].map((s) => (
          <View
            key={s}
            accessibilityLabel={`Aperçu ${s} pixels`}
            style={[styles.preview, { width: s, height: s, borderRadius: round === 'round' ? s / 2 : radius.sm }]}
          >
            {image(s / CROP)}
          </View>
        ))}
        <KitButton label="Valider" onPress={onConfirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1, justifyContent: 'center' },
  abs: { position: 'absolute', left: 0, top: 0 },
  row: { flexDirection: 'row', alignItems: 'center' },
  right: { textAlign: 'right' },
  centerText: { textAlign: 'center' },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  paper: { position: 'absolute', width: PAGE_W, height: PAGE_H, padding: 18 },
  paperLogo: { width: 18, height: 18, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  paperHead: { padding: space.s1 },
  paperLine: { paddingHorizontal: space.s1, paddingVertical: 2.5 },
  paperRule: { height: StyleSheet.hairlineWidth, marginVertical: 5 },
  paperBar: { height: 4, marginBottom: space.s1 },
  pdf: { borderRadius: radius.md, overflow: 'hidden' },
  pdfBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: space.s3,
    paddingRight: space.s1,
  },
  tool: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pdfPage: { alignItems: 'center', justifyContent: 'center', padding: space.s4 },
  pdfFoot: { height: 46, flexDirection: 'row', alignItems: 'center' },
  thumbs: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  thumb: {
    width: 22,
    height: 30,
    marginHorizontal: space.s1,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  imageBox: { aspectRatio: 4 / 3, borderRadius: radius.md, overflow: 'hidden' },
  csv: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  csvRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 48, alignItems: 'center' },
  csvCell: { width: 110, paddingHorizontal: space.m },
  textFile: { width: '100%', padding: space.s4, borderRadius: radius.md },
  textLines: { lineHeight: 20 },
  unsupported: { alignItems: 'center', paddingHorizontal: space.l },
  viewerBar: { flexDirection: 'row', alignItems: 'center', gap: space.s1, paddingHorizontal: space.s1, minHeight: 56 },
  viewerPage: { padding: space.s4, justifyContent: 'center' },
  slide: { paddingHorizontal: 5 },
  slideInner: { flex: 1, borderRadius: radius.lg, overflow: 'hidden' },
  slideText: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: space.s1 },
  lightboxPage: { flexGrow: 1, justifyContent: 'center' },
  lightboxImage: { aspectRatio: 4 / 3 },
  lightboxBar: {
    position: 'absolute',
    left: 0,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lightboxClose: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  caption: { position: 'absolute', left: 16, right: 16, textAlign: 'center' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', margin: -3 },
  galleryCell: { aspectRatio: 1, padding: 3 },
  galleryInner: { flex: 1, borderRadius: radius.md, overflow: 'hidden' },
  more: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masonry: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  masonryCol: { flex: 1 },
  masonryCell: { borderRadius: radius.md, overflow: 'hidden', marginBottom: space.s2 },
  siteTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    borderRadius: radius.full,
    paddingHorizontal: space.s2,
    paddingVertical: space.s1,
  },
  cropper: { alignItems: 'center' },
  cropBox: { width: CROP, height: CROP, overflow: 'hidden' },
  zoomRow: { flexDirection: 'row', alignItems: 'center', gap: space.s2, alignSelf: 'stretch', marginTop: 12 },
  cropTools: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s2,
    marginTop: 12,
  },
  preview: { overflow: 'hidden' },
});
