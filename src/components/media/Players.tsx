import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { Icon, Menu, TouchableRipple } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { mmss } from '../../core/format';
import { font, radius, space, tabular, useKitTheme, withAlpha } from '../../theme';
import { BLACK, PAPER, WHITE, YOUTUBE_RED } from '../../theme/swatches';
import { DemoArt } from '../display/DemoArt';

/**
 * Lecteurs (`players.dart`) : vidéo aux contrôles maison, façade YouTube, audio à forme d'onde.
 * La lecture est simulée par une horloge locale : aucun fichier ni réseau.
 */

const SPEEDS = [0.5, 1, 1.5, 2];
const speedLabel = (s: number) => `×${String(s).replace('.', ',')}`;

/** Horloge de lecture simulée (pas de 100 ms), partagée par les lecteurs. */
function usePlayback(duration: number, autoplay = false) {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPosition((p) => {
        const next = Math.min(duration, p + 100 * speed);
        if (next >= duration) setPlaying(false);
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, speed, duration]);
  return {
    position,
    playing,
    speed,
    setSpeed,
    ratio: duration ? position / duration : 0,
    ended: position >= duration,
    toggle: () => {
      if (!playing && position >= duration) setPosition(0);
      setPlaying(!playing);
    },
    seek: (ms: number) => setPosition(Math.max(0, Math.min(duration, ms))),
  };
}

/** Dégradé vertical noir (voile de lisibilité des contrôles et légendes) : `[position, opacité]`. */
export function GradientScrim({ stops }: { stops: [number, number][] }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const id = stops.map((s) => s.join('-')).join('_');
  return (
    <View
      pointerEvents="none"
      style={styles.fillAbs}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {size.w ? (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              {stops.map(([offset, alpha]) => (
                <Stop key={offset} offset={offset} stopColor={BLACK} stopOpacity={alpha} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect width={size.w} height={size.h} fill={`url(#${id})`} />
        </Svg>
      ) : null}
    </View>
  );
}

/** Barre de progression touchable (glisser pour se déplacer), avec repères de chapitres. */
function SeekBar({
  ratio,
  onSeek,
  chapters = [],
  label,
}: {
  ratio: number;
  onSeek: (ratio: number) => void;
  chapters?: number[];
  label: string;
}) {
  const { kit } = useKitTheme();
  const [width, setWidth] = useState(0);
  const at = (e: GestureResponderEvent) => onSeek(Math.max(0, Math.min(1, e.nativeEvent.locationX / (width || 1))));
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onSeek(Math.max(0, Math.min(1, ratio + (e.nativeEvent.actionName === 'increment' ? 0.05 : -0.05))))
      }
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={at}
      onResponderMove={at}
      style={styles.seek}
    >
      <View pointerEvents="none" style={[styles.seekTrack, { backgroundColor: withAlpha(WHITE, 0.3) }]}>
        <View style={[styles.seekFill, { width: `${ratio * 100}%`, backgroundColor: kit.primary }]} />
      </View>
      {chapters.map((c) => (
        <View
          key={c}
          pointerEvents="none"
          style={[styles.chapter, { left: c * width - 1, backgroundColor: withAlpha(BLACK, 0.54) }]}
        />
      ))}
      <View pointerEvents="none" style={[styles.thumb, { left: ratio * width - 6, backgroundColor: WHITE }]} />
    </View>
  );
}

/**
 * Lecteur vidéo (`<app-video-player>`) : toucher pour lecture / pause, double-toucher à gauche ou à droite
 * pour −10 s / +10 s, progression à chapitres, vitesse, son, plein écran (paysage autorisé).
 */
export function KitVideoPlayer({
  title = 'Trajet CI-4521-AB',
  seed = 0,
  duration = 134000,
  chapters = [0.18, 0.46, 0.72],
  autoplay = false,
  fullscreen = false,
}: {
  title?: string;
  seed?: number;
  /** Durée en millisecondes. */
  duration?: number;
  chapters?: number[];
  autoplay?: boolean;
  /** Variante affichée dans la modale plein écran (sans bouton plein écran). */
  fullscreen?: boolean;
}) {
  const pb = usePlayback(duration, autoplay);
  const [controls, setControls] = useState(true);
  const [poke, setPoke] = useState(0);
  const [muted, setMuted] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [full, setFull] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!pb.playing || !controls) return;
    const id = setTimeout(() => setControls(false), 3000);
    return () => clearTimeout(id);
  }, [pb.playing, controls, poke]);
  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(id);
  }, [flash]);

  const shown = controls || !pb.playing;
  const onTap = (e: GestureResponderEvent) => {
    const now = e.nativeEvent.timestamp;
    if (now - lastTap < 280) {
      const s = e.nativeEvent.locationX < width / 2 ? -10 : 10;
      pb.seek(pb.position + s * 1000);
      setFlash(s > 0 ? `+${s}s` : `${s}s`);
      setLastTap(0);
      return;
    }
    setLastTap(now);
    if (controls) pb.toggle();
    else {
      setControls(true);
      setPoke((p) => p + 1);
    }
  };

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.video, fullscreen && styles.videoFull, { backgroundColor: BLACK }]}
    >
      <View
        style={styles.fillAbs}
        onStartShouldSetResponder={() => true}
        onResponderRelease={onTap}
        accessible
        accessibilityRole="button"
        accessibilityLabel={pb.playing ? `Pause, ${title}` : `Lire, ${title}`}
        accessibilityHint="Double-toucher à gauche ou à droite : −10 s / +10 s"
      >
        <DemoArt seed={seed} t={pb.ratio * 6} />
      </View>
      {shown ? (
        <View style={styles.fillAbs} pointerEvents="box-none">
          <GradientScrim
            stops={[
              [0, 0.6],
              [0.3, 0],
              [0.6, 0],
              [1, 0.7],
            ]}
          />
          <View style={styles.videoTop} pointerEvents="box-none">
            <Text numberOfLines={1} style={[font('700', 14), styles.fill, { color: WHITE }]}>
              {title}
            </Text>
            <Menu
              visible={menu}
              onDismiss={() => setMenu(false)}
              anchor={
                <TouchableRipple
                  borderless
                  onPress={() => setMenu(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Vitesse ${speedLabel(pb.speed)}`}
                  style={styles.speed}
                >
                  <Text style={[font('700', 14), { color: WHITE }]}>{speedLabel(pb.speed)}</Text>
                </TouchableRipple>
              }
            >
              {SPEEDS.map((s) => (
                <Menu.Item
                  key={s}
                  title={speedLabel(s)}
                  trailingIcon={s === pb.speed ? 'mi:check' : undefined}
                  onPress={() => {
                    pb.setSpeed(s);
                    setMenu(false);
                  }}
                />
              ))}
            </Menu>
          </View>
          <View style={styles.center} pointerEvents="none">
            <View style={[styles.bigPlay, { backgroundColor: withAlpha(BLACK, 0.45) }]}>
              <Icon
                source={pb.playing ? 'mi:pause' : pb.ended ? 'mi:replay' : 'mi:play-arrow'}
                size={36}
                color={WHITE}
              />
            </View>
          </View>
          <View style={styles.videoBar} pointerEvents="box-none">
            <Text style={[font('400', 12), tabular, styles.time, { color: WHITE }]}>{mmss(pb.position)}</Text>
            <View style={styles.fill}>
              <SeekBar
                ratio={pb.ratio}
                chapters={chapters}
                label="Position de lecture"
                onSeek={(r) => {
                  setControls(true);
                  setPoke((p) => p + 1);
                  pb.seek(r * duration);
                }}
              />
            </View>
            <Text style={[font('400', 12), tabular, styles.time, { color: withAlpha(WHITE, 0.7) }]}>
              {mmss(duration)}
            </Text>
            <TouchableRipple
              borderless
              onPress={() => setMuted(!muted)}
              accessibilityRole="button"
              accessibilityLabel={muted ? 'Activer le son' : 'Couper le son'}
              style={styles.barBtn}
            >
              <Icon source={muted ? 'mi:volume-off' : 'mi:volume-up'} size={20} color={WHITE} />
            </TouchableRipple>
            {fullscreen ? null : (
              <TouchableRipple
                borderless
                onPress={() => {
                  if (pb.playing) pb.toggle();
                  setFull(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Plein écran"
                style={styles.barBtn}
              >
                <Icon source="mi:fullscreen" size={22} color={WHITE} />
              </TouchableRipple>
            )}
          </View>
        </View>
      ) : null}
      {flash ? (
        <View style={styles.center} pointerEvents="none">
          <View style={[styles.flash, { backgroundColor: withAlpha(BLACK, 0.54) }]}>
            <Text style={[font('800', 18), { color: WHITE }]}>{flash}</Text>
          </View>
        </View>
      ) : null}
      {fullscreen ? null : (
        <Modal
          visible={full}
          animationType="fade"
          presentationStyle="fullScreen"
          supportedOrientations={['portrait', 'landscape']}
          onRequestClose={() => setFull(false)}
        >
          <View style={[styles.fullPage, { backgroundColor: BLACK }]}>
            <KitVideoPlayer title={title} seed={seed} duration={duration} chapters={chapters} autoplay fullscreen />
            <TouchableRipple
              borderless
              onPress={() => setFull(false)}
              accessibilityRole="button"
              accessibilityLabel="Quitter le plein écran"
              style={styles.fullClose}
            >
              <Icon source="mi:close" size={24} color={WHITE} />
            </TouchableRipple>
          </View>
        </Modal>
      )}
    </View>
  );
}

/**
 * Façade YouTube (`<app-youtube-player>`) : vignette et bouton uniquement ; le lecteur réel n'est jamais
 * chargé (aucun appel externe) — le toucher bascule sur la lecture simulée.
 */
export function YoutubeFacade({
  title,
  channel = 'Lookas CI',
  duration = '4:32',
  seed = 2,
}: {
  title: string;
  channel?: string;
  duration?: string;
  seed?: number;
}) {
  const [started, setStarted] = useState(false);
  if (started) return <KitVideoPlayer title={title} seed={seed} duration={272000} autoplay />;
  return (
    <TouchableRipple
      onPress={() => setStarted(true)}
      accessibilityRole="button"
      accessibilityLabel={`Lire la vidéo YouTube : ${title}, ${duration}`}
      style={styles.video}
    >
      <View style={styles.fill}>
        <DemoArt seed={seed} />
        <GradientScrim
          stops={[
            [0, 0.7],
            [0.5, 0],
          ]}
        />
        <View style={styles.ytHead}>
          <View style={[styles.ytAvatar, { backgroundColor: WHITE }]}>
            <Icon source="mi:gps-fixed" size={16} color={PAPER.brand} />
          </View>
          <View style={styles.fill}>
            <Text numberOfLines={1} style={[font('700', 14), { color: WHITE }]}>
              {title}
            </Text>
            <Text style={[font('400', 11.5), { color: withAlpha(WHITE, 0.7) }]}>{channel}</Text>
          </View>
        </View>
        <View style={styles.center}>
          <View style={[styles.ytPlay, { backgroundColor: YOUTUBE_RED }]}>
            <Icon source="mi:play-arrow" size={34} color={WHITE} />
          </View>
        </View>
        <View style={[styles.duration, { backgroundColor: withAlpha(BLACK, 0.87) }]}>
          <Text style={[font('600', 11.5), { color: WHITE }]}>{duration}</Text>
        </View>
      </View>
    </TouchableRipple>
  );
}

/** Forme d'onde déterministe (64 barres). */
function waveOf(seed: number) {
  let s = seed * 9301 + 49297;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from(
    { length: 64 },
    (_, i) => 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(i / 3.2 + rnd())) * (0.45 + rnd() * 0.55),
  );
}

/** Forme d'onde touchable : toucher ou glisser pour se déplacer. */
function Wave({
  wave,
  ratio,
  height,
  onSeek,
}: {
  wave: number[];
  ratio: number;
  height: number;
  onSeek: (r: number) => void;
}) {
  const { kit } = useKitTheme();
  const [width, setWidth] = useState(0);
  const at = (e: GestureResponderEvent) => onSeek(Math.max(0, Math.min(1, e.nativeEvent.locationX / (width || 1))));
  const bw = width / wave.length;
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Position de lecture"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onSeek(Math.max(0, Math.min(1, ratio + (e.nativeEvent.actionName === 'increment' ? 0.05 : -0.05))))
      }
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={at}
      onResponderMove={at}
      style={{ height }}
    >
      {width ? (
        <Svg width={width} height={height} pointerEvents="none">
          {wave.map((v, i) => (
            <Rect
              key={i}
              x={i * bw + bw * 0.2}
              y={(height - v * height) / 2}
              width={bw * 0.6}
              height={v * height}
              rx={2}
              fill={(i + 0.5) / wave.length <= ratio ? kit.primary : withAlpha(kit.textMuted, 0.35)}
            />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

/** Lecteur audio à forme d'onde (`<app-audio-player>`) : vitesse, ±15 s, version compacte (message vocal). */
export function KitAudioPlayer({
  title,
  subtitle,
  duration = 108000,
  seed = 3,
  compact = false,
  onDownload,
}: {
  title: string;
  subtitle?: string;
  /** Durée en millisecondes. */
  duration?: number;
  seed?: number;
  compact?: boolean;
  onDownload?: () => void;
}) {
  const { kit } = useKitTheme();
  const pb = usePlayback(duration);
  const [wave] = useState(() => waveOf(seed));
  const size = compact ? 40 : 48;
  const play = (
    <TouchableRipple
      borderless
      onPress={pb.toggle}
      accessibilityRole="button"
      accessibilityLabel={pb.playing ? `Pause, ${title}` : `Lire, ${title}`}
      style={[styles.play, { width: size, height: size, borderRadius: size / 2, backgroundColor: kit.primary }]}
    >
      <Icon source={pb.playing ? 'mi:pause' : 'mi:play-arrow'} size={26} color={kit.onPrimary} />
    </TouchableRipple>
  );
  const seek = (r: number) => pb.seek(r * duration);

  if (compact)
    return (
      <View style={[styles.audioCompact, { backgroundColor: kit.card, borderColor: kit.border }]}>
        {play}
        <View style={styles.fill}>
          <Wave wave={wave} ratio={pb.ratio} height={30} onSeek={seek} />
        </View>
        <Text style={[font('400', 12), tabular, { color: kit.textSecondary }]}>
          {mmss(pb.playing || pb.position > 0 ? pb.position : duration)}
        </Text>
      </View>
    );

  const ghost = (icon: string, label: string, onPress: () => void) => (
    <TouchableRipple
      borderless
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.ghostBtn}
    >
      <Icon source={icon} size={24} color={kit.textSecondary} />
    </TouchableRipple>
  );
  return (
    <View style={[styles.audio, { backgroundColor: kit.card, borderColor: kit.border }]}>
      <View style={styles.audioHead}>
        <View style={[styles.audioIcon, { backgroundColor: kit.primaryLight }]}>
          <Icon source="mi:graphic-eq" size={24} color={kit.primary} />
        </View>
        <View style={styles.fill}>
          <Text numberOfLines={1} style={[font('700', 14), { color: kit.textPrimary }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={[font('400', 12), { color: kit.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Wave wave={wave} ratio={pb.ratio} height={44} onSeek={seek} />
      <View style={styles.audioTimes}>
        <Text style={[font('400', 11.5), tabular, { color: kit.textMuted }]}>{mmss(pb.position)}</Text>
        <Text style={[font('400', 11.5), tabular, { color: kit.textMuted }]}>{mmss(duration)}</Text>
      </View>
      <View style={styles.audioControls}>
        <TouchableRipple
          borderless
          onPress={() => pb.setSpeed(pb.speed >= 2 ? 0.5 : pb.speed + 0.5)}
          accessibilityRole="button"
          accessibilityLabel={`Vitesse ${speedLabel(pb.speed)}`}
          style={styles.speedBtn}
        >
          <Text style={[font('600', 14), { color: kit.primary }]}>{speedLabel(pb.speed)}</Text>
        </TouchableRipple>
        {ghost('mi:replay-10', 'Reculer de 15 secondes', () => pb.seek(pb.position - 15000))}
        {play}
        {ghost('mi:forward-10', 'Avancer de 15 secondes', () => pb.seek(pb.position + 15000))}
        {ghost('mi:download', 'Télécharger', () => onDownload?.())}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  fillAbs: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: { aspectRatio: 16 / 9, borderRadius: radius.md, overflow: 'hidden' },
  videoFull: { width: '100%', borderRadius: 0 },
  videoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: space.s3,
    paddingRight: space.s2,
    paddingTop: space.s1,
  },
  speed: { padding: space.s2, borderRadius: radius.sm },
  bigPlay: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  videoBar: {
    position: 'absolute',
    left: space.s1,
    right: space.s1,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: { paddingHorizontal: space.s2 },
  barBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  seek: { height: 40, justifyContent: 'center', marginHorizontal: space.s1 },
  seekTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  seekFill: { height: 3 },
  chapter: { position: 'absolute', width: 2, height: 6, top: 17 },
  thumb: { position: 'absolute', width: 12, height: 12, borderRadius: 6, top: 14 },
  flash: { paddingHorizontal: space.s4, paddingVertical: space.s2, borderRadius: radius.full },
  fullPage: { flex: 1, justifyContent: 'center' },
  fullClose: {
    position: 'absolute',
    top: 48,
    left: space.s2,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ytHead: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
  },
  ytAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ytPlay: { width: 68, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  duration: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderRadius: radius.xs,
    paddingHorizontal: space.s2,
    paddingVertical: 2,
  },
  play: { alignItems: 'center', justifyContent: 'center' },
  audioCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingLeft: space.s2,
    paddingRight: space.s3,
    paddingVertical: space.s2,
  },
  audio: { borderWidth: 1, borderRadius: radius.lg, padding: space.s4, gap: 0 },
  audioHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  audioIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  audioTimes: { flexDirection: 'row', justifyContent: 'space-between' },
  audioControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  speedBtn: { paddingHorizontal: space.s3, paddingVertical: 10, borderRadius: radius.full },
  ghostBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
