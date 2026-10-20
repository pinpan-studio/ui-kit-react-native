import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

import { Decorative } from '../mobile';
import { Page } from '../shell/Page';
import { KIT_CATEGORIES } from '../showcase/kitNav';
import { PALETTE_META } from '../theme/generated/palettes';
import { MIN_TOUCH, radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const ROLES = ['primary', 'secondary', 'tertiary', 'error'] as const;

/** Accueil (`UiShowcasePage` de Flutter) : identité, aperçu du thème, accès aux catégories. */
export default function ShowcaseHome() {
  const theme = useKitTheme();
  const label = PALETTE_META.find((p) => p.id === theme.paletteId)?.label ?? theme.paletteId;
  return (
    <Page testID="home">
      <Text variant="headlineMedium" accessibilityRole="header">
        UI Kit React Native
      </Text>
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        Material 3, mêmes jetons que ui-kit (Angular) et ui-kit-flutter. Palette : {label}, mode{' '}
        {theme.dark ? 'sombre' : 'clair'}.
      </Text>
      <View style={styles.roles}>
        {ROLES.map((r) => (
          <View key={r} style={styles.role}>
            <Decorative style={[styles.chipColor, { backgroundColor: theme.colors[r] }]} />
            <Text variant="labelMedium">{r}</Text>
          </View>
        ))}
        <View style={styles.role}>
          <Decorative style={[styles.chipColor, { backgroundColor: theme.kit.success }]} />
          <Text variant="labelMedium">success</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Button mode="contained" contentStyle={styles.btn} onPress={() => router.navigate('/components')}>
          Composants
        </Button>
        <Button
          mode="contained"
          buttonColor={theme.kit.success}
          textColor={theme.kit.onSuccess}
          contentStyle={styles.btn}
          onPress={() => router.navigate('/layouts')}
        >
          Layouts
        </Button>
        <Button mode="contained" disabled contentStyle={styles.btn}>
          Désactivé
        </Button>
      </View>
      <Card mode="outlined">
        <Card.Title title="Catégories" titleVariant="titleMedium" />
        <Card.Content style={styles.chips}>
          {KIT_CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              icon={c.icon}
              style={styles.chip}
              onPress={() => router.navigate(`/components/${c.id}`)}
              accessibilityLabel={`Ouvrir ${c.label}`}
            >
              {c.label}
            </Chip>
          ))}
        </Card.Content>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s3 },
  role: { alignItems: 'center', gap: space.s1 },
  chipColor: { width: 48, height: 48, borderRadius: radius.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  btn: { minHeight: MIN_TOUCH },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  chip: { minHeight: MIN_TOUCH, justifyContent: 'center' },
});
