import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitIconButton } from '../../components';
import { HarnaisScreen } from '../../harnais/HarnaisScreen';
import { ExAppShell } from '../../showcase/examples/ExAppShell';
import { ExampleScreen } from '../../showcase/examples/ExampleScreen';
import { SHOWCASES, type Showcase } from '../../showcase/examples/showcases';
import { AppShellDemo } from '../../showcase/layouts/AppShellDemo';
import { pageExampleBySlug } from '../../showcase/pageExamples';
import { font, space, useKitTheme } from '../../theme';

function ShowcaseContent({ showcase: s }: { showcase: Showcase }) {
  const t = s.target;
  if ('demo' in t) return <AppShellDemo />;
  if ('harnais' in t)
    return <HarnaisScreen onExit={() => router.back()} initialConversation={t.harnais ?? undefined} />;
  const page = pageExampleBySlug(t.slug)!;
  if (page.shell) return <ExAppShell initial={page.shell} initialParam={t.param} initialChat={t.chat} />;
  return <ExampleScreen page={page} />;
}

/**
 * `/showcases/<id>` — visionneuse d'un showcase (`ShowcaseViewer` Flutter) : écran en plein écran, précédent /
 * suivant, rechargement, note d'adaptation. Les écrans suivent la taille réelle de l'appareil.
 */
export default function ShowcaseViewer() {
  const { kit } = useKitTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      SHOWCASES.findIndex((s) => s.id === id),
    ),
  );
  const [reload, setReload] = useState(0);
  const s = SHOWCASES[index]!;
  const go = (d: number) => {
    setIndex((i) => (i + d + SHOWCASES.length) % SHOWCASES.length);
    setReload((r) => r + 1);
  };
  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]}>
      <View style={[styles.bar, { paddingTop: insets.top, backgroundColor: kit.hover }]}>
        <KitIconButton icon="mi:close" accessibilityLabel="Fermer la visionneuse" onPress={() => router.back()} />
        <View style={styles.fill}>
          <Text accessibilityRole="header" numberOfLines={1} style={[font('700', 15), { color: kit.textPrimary }]}>
            {s.label}
          </Text>
          <Text numberOfLines={1} style={[font('400', 11, 'mono'), { color: kit.textMuted }]}>
            {`${index + 1} / ${SHOWCASES.length} · ${s.path}`}
          </Text>
        </View>
        <KitIconButton icon="mi:refresh" accessibilityLabel="Recharger" onPress={() => setReload((r) => r + 1)} />
        <KitIconButton icon="mi:chevron-left" accessibilityLabel="Précédent" onPress={() => go(-1)} />
        <KitIconButton icon="mi:chevron-right" accessibilityLabel="Suivant" onPress={() => go(1)} />
      </View>
      {s.note ? (
        <Text style={[font('400', 12), styles.note, { color: kit.textSecondary, backgroundColor: kit.hover }]}>
          {s.note}
        </Text>
      ) : null}
      <View key={`${s.id}-${reload}`} style={styles.fill}>
        <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
          <ShowcaseContent showcase={s} />
        </SafeAreaInsetsContext.Provider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s1,
    paddingBottom: space.s1,
    gap: space.s1,
  },
  note: { paddingHorizontal: space.s4, paddingBottom: space.s2 },
});
