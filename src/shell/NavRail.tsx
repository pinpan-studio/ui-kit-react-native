import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { hapticToggle } from '../mobile';
import { MIN_TOUCH, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';
import { DESTINATIONS } from './destinations';

/** Rail de navigation M3 (600–840 dp). */
export function NavRail({
  index,
  onSelect,
  insetLeft,
}: {
  index: number;
  onSelect: (i: number) => void;
  insetLeft: number;
}) {
  const theme = useKitTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.rail, { paddingLeft: insetLeft, backgroundColor: theme.colors.surface }]}
    >
      {DESTINATIONS.map((d, i) => {
        const active = i === index;
        return (
          <Pressable
            key={d.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={d.label}
            onPress={() => {
              hapticToggle();
              onSelect(i);
            }}
            style={styles.dest}
          >
            <View
              style={[styles.pill, active && { backgroundColor: theme.colors.secondaryContainer }]}
              accessible={false}
            >
              <MaterialCommunityIcons
                name={active ? d.activeIcon : d.icon}
                size={24}
                color={active ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant}
              />
            </View>
            <Text
              variant="labelMedium"
              style={{ color: active ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}
            >
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: 80, paddingTop: space.s3, gap: space.s3, alignItems: 'center' },
  dest: { minHeight: MIN_TOUCH + 8, minWidth: 80, alignItems: 'center', gap: space.s1 },
  pill: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
