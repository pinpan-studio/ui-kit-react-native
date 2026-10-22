import { useState, type ReactNode } from 'react';
import { LayoutAnimation, StyleSheet, Text, View } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import type { TreeNodeData } from '../../data/showcase';
import { font, space, useKitTheme } from '../../theme';

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));

/**
 * Ligne dépliable (`ExpansionTile` / `ExpansionPanel` Flutter) : en-tête 56 dp, icône et titre teintés
 * quand le panneau est ouvert, chevron qui pivote. Contrôlée (`expanded` + `onToggle`) ou autonome.
 */
export function ExpansionTile({
  title,
  icon,
  expanded,
  onToggle,
  divider = false,
  children,
}: {
  title: string;
  icon?: string;
  expanded?: boolean;
  onToggle?: (open: boolean) => void;
  /** Filet au-dessus de l'en-tête (panneaux empilés). */
  divider?: boolean;
  children: ReactNode;
}) {
  const { kit } = useKitTheme();
  const [own, setOwn] = useState(false);
  const open = expanded ?? own;
  const tint = open && icon ? kit.primary : kit.textPrimary;
  return (
    <View style={divider && [styles.divider, { borderTopColor: kit.border }]}>
      <TouchableRipple
        onPress={() => {
          animate();
          if (expanded === undefined) setOwn(!open);
          onToggle?.(!open);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
      >
        <View style={styles.header}>
          {icon ? <Icon source={icon} size={24} color={open ? kit.primary : kit.textSecondary} /> : null}
          <Text style={[font('600', 14), styles.fill, { color: tint }]}>{title}</Text>
          <View style={open && styles.flipped}>
            <Icon source="mi:expand-more" size={24} color={open ? kit.primary : kit.textSecondary} />
          </View>
        </View>
      </TouchableRipple>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

/** Arbre déroulant (explorateur de fichiers) : dossiers dépliables, feuilles sélectionnables. */
export function TreeView({
  nodes,
  initiallyOpen = [],
  selected,
  onSelect,
}: {
  nodes: TreeNodeData[];
  initiallyOpen?: string[];
  selected?: string | null;
  onSelect: (node: TreeNodeData) => void;
}) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(initiallyOpen);

  const row = (n: TreeNodeData, depth: number): ReactNode => {
    const leaf = !n.children?.length;
    const isOpen = open.includes(n.id);
    const isSel = leaf && selected === n.id;
    return (
      <View key={n.id}>
        <TouchableRipple
          onPress={() => {
            if (leaf) return onSelect(n);
            animate();
            setOpen((o) => (isOpen ? o.filter((x) => x !== n.id) : [...o, n.id]));
          }}
          accessibilityRole={leaf ? 'button' : 'togglebutton'}
          accessibilityState={leaf ? { selected: isSel } : { expanded: isOpen }}
          accessibilityLabel={n.meta ? `${n.label}, ${n.meta}` : n.label}
          style={[
            styles.node,
            { paddingLeft: space.s2 + depth * space.s5 },
            isSel && { backgroundColor: kit.primaryLight },
          ]}
        >
          <>
            <View style={[styles.chevron, isOpen && styles.rotated]}>
              {leaf ? null : <Icon source="mi:chevron-right" size={18} color={kit.textSecondary} />}
            </View>
            <Icon
              source={leaf ? (n.icon ?? 'mi:insert-drive-file') : isOpen ? 'mi:folder-open' : 'mi:folder'}
              size={19}
              color={leaf ? kit.textSecondary : kit.warning}
            />
            <Text style={[font(leaf ? '400' : '600', 13.5), styles.fill, { color: kit.textPrimary }]}>{n.label}</Text>
            {n.meta ? <Text style={[font('400', 11.5), { color: kit.textMuted }]}>{n.meta}</Text> : null}
          </>
        </TouchableRipple>
        {!leaf && isOpen ? n.children?.map((c) => row(c, depth + 1)) : null}
      </View>
    );
  };

  return <View style={styles.tree}>{nodes.map((n) => row(n, 0))}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, paddingHorizontal: space.m },
  flipped: { transform: [{ rotate: '180deg' }] },
  body: { paddingHorizontal: space.m, paddingBottom: space.m },
  tree: { paddingVertical: space.s2 },
  node: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingRight: space.s3,
    paddingVertical: space.s2,
  },
  chevron: { width: 22, marginRight: -space.s2, alignItems: 'center' },
  rotated: { transform: [{ rotate: '90deg' }] },
});
