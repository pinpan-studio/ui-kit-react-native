import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { initials } from '../../core/format';
import { font, sizes, toneColor, toneLight, toneText, useKitTheme, type KitTone } from '../../theme';

const AVATAR_TONES: readonly KitTone[] = ['primary', 'info', 'purple', 'warning', 'success', 'cyan', 'tertiary'];

/** Teinte stable d'un nom (somme des codes de caractères, comme Flutter). */
const toneFor = (name: string): KitTone => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_TONES[sum % AVATAR_TONES.length] ?? 'primary';
};

/** Avatar à initiales coloré (`KitAvatar` Flutter), image et indicateur de présence optionnels. */
export function KitAvatar({
  name,
  size = sizes.avatar,
  tone,
  image,
  online,
}: {
  name: string;
  size?: number;
  tone?: KitTone;
  image?: ImageSourcePropType;
  /** `true` en ligne, `false` hors ligne, absent : pas d'indicateur. */
  online?: boolean;
}) {
  const { kit } = useKitTheme();
  const t = tone ?? toneFor(name);
  const label = online === undefined ? name : `${name}, ${online ? 'en ligne' : 'hors ligne'}`;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width: size, height: size }}>
      <View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: toneLight(t, kit) },
        ]}
      >
        {image ? (
          <Image source={image} style={{ width: size, height: size }} />
        ) : (
          <Text style={[styles.initials, { color: toneText(t, kit), fontSize: size * 0.36 }]}>{initials(name)}</Text>
        )}
      </View>
      {online === undefined ? null : (
        <View
          style={[
            styles.presence,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              backgroundColor: online ? kit.success : toneColor('neutral', kit),
              borderColor: kit.card,
            },
          ]}
        />
      )}
    </View>
  );
}

/** Pile d'avatars qui se chevauchent, « +n » au-delà de `max` (`AvatarStack` Flutter). */
export function AvatarStack({ names, size = 32, max = 4 }: { names: string[]; size?: number; max?: number }) {
  const { kit } = useKitTheme();
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const step = size * 0.65;
  const count = shown.length + (rest > 0 ? 1 : 0);
  return (
    <View
      accessible
      accessibilityLabel={names.join(', ')}
      style={{ height: size, width: size + Math.max(0, count - 1) * step }}
    >
      {shown.map((n, i) => (
        <View
          key={`${n}-${i}`}
          style={[styles.ring, { left: i * step, borderRadius: size / 2, borderColor: kit.card }]}
        >
          <KitAvatar name={n} size={size - 4} />
        </View>
      ))}
      {rest > 0 ? (
        <View
          style={[
            styles.ring,
            styles.more,
            {
              left: shown.length * step,
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: kit.card,
              backgroundColor: kit.hover,
            },
          ]}
        >
          <Text style={[styles.moreText, { color: kit.textSecondary }]}>{`+${rest}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: font('700', 13),
  presence: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2 },
  ring: { position: 'absolute', top: 0, borderWidth: 2 },
  more: { alignItems: 'center', justifyContent: 'center' },
  moreText: font('700', 11),
});
