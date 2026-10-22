import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, Menu, TouchableRipple } from 'react-native-paper';

import { number } from '../../core/format';
import type { MenuEntry } from '../../data/showcase';
import { KitIconButton } from '../../mobile/KitIconButton';
import { MIN_TOUCH, font, radius, space, tabular, useKitTheme, withAlpha } from '../../theme';
import { KitAvatar } from '../core/Avatars';

// ── Pastille d'icône (Badge M3) ────────────────────────────────────

/** Icône avec pastille M3 (`Badge` Flutter) : chiffre (16 dp) ou simple point (`dot`). */
export function BadgedIcon({
  icon,
  count,
  dot = false,
  color,
  badgeColor,
  size = 24,
}: {
  icon: string;
  count?: number | string;
  dot?: boolean;
  color?: string;
  badgeColor?: string;
  size?: number;
}) {
  const { kit, roles } = useKitTheme();
  const bg = badgeColor ?? kit.error;
  return (
    <View>
      <Icon source={icon} size={size} color={color ?? kit.textSecondary} />
      {dot ? (
        <View style={[styles.dot, { backgroundColor: bg }]} />
      ) : count !== undefined ? (
        <View style={[styles.badge, { backgroundColor: bg }]}>
          <Text style={[styles.badgeText, { color: badgeColor ? kit.onPrimary : roles.onError }]}>{count}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Barre d'application ────────────────────────────────────────────

/** Barre d'application M3 (`AppBar` Flutter) : bouton de tête, titre Outfit 20/700, actions. */
export function KitAppBar({
  leading,
  title,
  actions,
  background,
  titleColor,
  height = 56,
}: {
  leading?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  background?: string;
  titleColor?: string;
  height?: number;
}) {
  const { kit } = useKitTheme();
  return (
    <View style={[styles.appBar, { height, backgroundColor: background ?? kit.bg }]}>
      {leading ?? <View style={styles.appBarPad} />}
      <View style={styles.fill}>
        {typeof title === 'string' ? (
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            style={[styles.appBarTitle, { color: titleColor ?? kit.textPrimary }]}
          >
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
      {actions ? <View style={styles.row}>{actions}</View> : null}
    </View>
  );
}

// ── Barre de navigation basse ──────────────────────────────────────

export interface NavDestination {
  label: string;
  icon: string;
  selectedIcon?: string;
  badge?: number;
}

/** Barre de navigation M3 (`NavigationBar` Flutter) : indicateur en pilule, libellés 12. */
export function KitNavigationBar({
  destinations,
  selected,
  onSelect,
}: {
  destinations: NavDestination[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const { roles } = useKitTheme();
  return (
    <View accessibilityRole="tablist" style={[styles.navBar, { backgroundColor: roles.surfaceContainer }]}>
      {destinations.map((d, i) => {
        const on = i === selected;
        return (
          <TouchableRipple
            key={d.label}
            onPress={() => onSelect(i)}
            borderless
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={d.badge ? `${d.label}, ${d.badge}` : d.label}
            style={styles.navItem}
          >
            <View style={styles.navInner}>
              <View style={[styles.navIndicator, on && { backgroundColor: roles.secondaryContainer }]}>
                <BadgedIcon
                  icon={on ? (d.selectedIcon ?? d.icon) : d.icon}
                  count={on ? undefined : d.badge}
                  color={on ? roles.onSecondaryContainer : roles.onSurfaceVariant}
                />
              </View>
              <Text
                style={[
                  on ? styles.navLabelOn : styles.navLabel,
                  { color: on ? roles.onSurface : roles.onSurfaceVariant },
                ]}
              >
                {d.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

/** Rail de navigation M3 (`NavigationRail` Flutter, tablette) : 80 dp, indicateur en pilule, libellés. */
export function KitNavigationRail({
  destinations,
  selected,
  onSelect,
  leading,
}: {
  destinations: NavDestination[];
  selected: number;
  onSelect: (i: number) => void;
  leading?: ReactNode;
}) {
  const { kit, roles } = useKitTheme();
  return (
    <View accessibilityRole="tablist" style={[styles.rail, { backgroundColor: kit.card }]}>
      {leading ? <View style={styles.railLeading}>{leading}</View> : null}
      {destinations.map((d, i) => {
        const on = i === selected;
        return (
          <TouchableRipple
            key={d.label}
            onPress={() => onSelect(i)}
            borderless
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={d.label}
            style={styles.railItem}
          >
            <View style={styles.navInner}>
              <View style={[styles.railIndicator, on && { backgroundColor: roles.secondaryContainer }]}>
                <Icon
                  source={on ? (d.selectedIcon ?? d.icon) : d.icon}
                  size={24}
                  color={on ? roles.onSecondaryContainer : roles.onSurfaceVariant}
                />
              </View>
              <Text
                style={[
                  on ? styles.navLabelOn : styles.navLabel,
                  { color: on ? roles.onSurface : roles.onSurfaceVariant },
                ]}
              >
                {d.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

/** Contenu de tiroir de navigation M3 (`NavigationDrawer` Flutter) : destinations de 56 dp en pilule. */
export function NavigationDrawerContent({
  header,
  destinations,
  selected,
  onSelect,
  footer,
}: {
  header?: ReactNode;
  destinations: NavDestination[];
  selected: number;
  onSelect: (i: number) => void;
  footer?: ReactNode;
}) {
  const { roles } = useKitTheme();
  return (
    <ScrollView contentContainerStyle={styles.drawer} accessibilityRole="menu">
      {header}
      {destinations.map((d, i) => {
        const on = i === selected;
        return (
          <TouchableRipple
            key={d.label}
            onPress={() => onSelect(i)}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: on }}
            style={[styles.drawerItem, on && { backgroundColor: roles.secondaryContainer }]}
          >
            <View style={styles.drawerRow}>
              <Icon source={d.icon} size={24} color={on ? roles.onSecondaryContainer : roles.onSurfaceVariant} />
              <Text style={[styles.drawerLabel, { color: on ? roles.onSecondaryContainer : roles.onSurfaceVariant }]}>
                {d.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
      {footer}
    </ScrollView>
  );
}

// ── Sidecar ────────────────────────────────────────────────────────

/**
 * Sidecar (`Sidecar` Flutter) : rail d'icônes ; toucher un module à sous-menus ouvre une seconde colonne
 * de 220 dp.
 */
export function Sidecar({
  items,
  selected,
  onSelect,
  style,
}: {
  items: MenuEntry[];
  selected: string;
  onSelect: (m: MenuEntry) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState<string | null>(null);
  const current = items.find((m) => m.id === open);
  const activeIn = (m: MenuEntry) => m.id === selected || !!m.children?.some((c) => c.id === selected);
  const toggle = (id: string | null) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(240, 'easeOut', 'opacity'));
    setOpen(id);
  };
  return (
    <View style={[styles.row, styles.stretch, style]}>
      <View style={[styles.sideRail, { backgroundColor: kit.card, borderRightColor: kit.border }]}>
        <View style={[styles.sideLogo, { backgroundColor: kit.primary }]}>
          <Icon source="mi:widgets" size={22} color={kit.onPrimary} />
        </View>
        <ScrollView style={styles.fill} contentContainerStyle={styles.sideList}>
          {items.map((m) => {
            const on = activeIn(m) || open === m.id;
            const group = !!m.children?.length;
            return (
              <TouchableRipple
                key={m.id}
                onPress={() => {
                  if (group) toggle(open === m.id ? null : m.id);
                  else {
                    toggle(null);
                    onSelect(m);
                  }
                }}
                borderless
                accessibilityRole="button"
                accessibilityLabel={m.label}
                accessibilityState={group ? { expanded: open === m.id, selected: activeIn(m) } : { selected: on }}
                style={[styles.sideItem, on && { backgroundColor: kit.primaryLight }]}
              >
                <View style={styles.sideIcon}>
                  <Icon source={m.icon} size={22} color={on ? kit.primary : kit.textSecondary} />
                  {group ? (
                    <View style={styles.sideChevron}>
                      <Icon source="mi:chevron-right" size={11} color={kit.textMuted} />
                    </View>
                  ) : null}
                </View>
              </TouchableRipple>
            );
          })}
        </ScrollView>
        <View style={styles.sideAvatar}>
          <KitAvatar name="Jean Kouassi" size={34} online />
        </View>
      </View>
      {current ? (
        <View style={[styles.sidePanel, { backgroundColor: kit.card, borderRightColor: kit.border }]}>
          <View style={styles.sidePanelHead}>
            <Text accessibilityRole="header" style={[styles.sidePanelTitle, { color: kit.textPrimary }]}>
              {current.label}
            </Text>
            <KitIconButton
              icon="mi:chevron-left"
              accessibilityLabel="Fermer le sous-menu"
              iconColor={kit.textSecondary}
              onPress={() => toggle(null)}
            />
          </View>
          <ScrollView contentContainerStyle={styles.sidePanelList}>
            {(current.children ?? []).map((c) => {
              const on = c.id === selected;
              return (
                <TouchableRipple
                  key={c.id}
                  onPress={() => onSelect(c)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={[styles.sideSub, on && { backgroundColor: kit.primaryLight }]}
                >
                  <View style={styles.drawerRow}>
                    <Icon source={c.icon} size={20} color={on ? kit.primary : kit.textSecondary} />
                    <Text style={[font('500', 13), styles.fill, { color: on ? kit.primary : kit.textPrimary }]}>
                      {c.label}
                    </Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

// ── Fil d'Ariane ───────────────────────────────────────────────────

/** Fil d'Ariane défilant, calé sur la page courante (`Breadcrumb` Flutter). */
export function Breadcrumb({
  items,
  onPress,
  icon = 'mi:home',
  separator = 'mi:chevron-right',
}: {
  items: string[];
  onPress?: (i: number) => void;
  icon?: string | null;
  separator?: string;
}) {
  const { kit } = useKitTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
      accessibilityRole="list"
      accessibilityLabel="Fil d’Ariane"
    >
      <View style={styles.row}>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <View key={`${it}-${i}`} style={styles.row}>
              {i > 0 ? <Icon source={separator} size={16} color={kit.textMuted} /> : null}
              <TouchableRipple
                onPress={!last && onPress ? () => onPress(i) : undefined}
                disabled={last || !onPress}
                borderless
                accessibilityRole={last ? 'text' : 'link'}
                accessibilityState={last ? { selected: true } : undefined}
                style={styles.crumb}
              >
                <View style={styles.crumbRow}>
                  {i === 0 && icon ? <Icon source={icon} size={16} color={kit.textSecondary} /> : null}
                  <Text
                    style={[
                      last ? styles.crumbLast : styles.crumbText,
                      { color: last ? kit.textPrimary : kit.primary },
                    ]}
                  >
                    {it}
                  </Text>
                </View>
              </TouchableRipple>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Étapes ─────────────────────────────────────────────────────────

/** Indicateur d'étapes horizontal compact d'un assistant (`StepsIndicator` Flutter). */
export function StepsIndicator({
  steps,
  current,
  onPress,
  errorAt,
}: {
  steps: string[];
  current: number;
  onPress?: (i: number) => void;
  errorAt?: number;
}) {
  const { kit } = useKitTheme();
  return (
    <View>
      <View style={styles.row}>
        {steps.map((s, i) => {
          const err = errorAt === i;
          return (
            <View key={s} style={[styles.row, i > 0 && styles.fill]}>
              {i > 0 ? (
                <View style={[styles.stepLine, { backgroundColor: i <= current ? kit.primary : kit.border }]} />
              ) : null}
              <TouchableRipple
                onPress={onPress && i <= current ? () => onPress(i) : undefined}
                disabled={!onPress || i > current}
                borderless
                hitSlop={9}
                accessibilityRole="button"
                accessibilityLabel={`Étape ${i + 1} : ${s}${i < current ? ', terminée' : i === current ? ', en cours' : ''}`}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: err
                      ? kit.error
                      : i < current
                        ? kit.primary
                        : i === current
                          ? kit.primaryLight
                          : kit.fieldBg,
                    borderColor: err ? kit.error : i <= current ? kit.primary : kit.border,
                  },
                ]}
              >
                {err ? (
                  <Icon source="mi:priority-high" size={16} color={kit.onTone} />
                ) : i < current ? (
                  <Icon source="mi:check" size={16} color={kit.onPrimary} />
                ) : (
                  <Text style={[font('700', 12.5), { color: i === current ? kit.primary : kit.textMuted }]}>
                    {i + 1}
                  </Text>
                )}
              </TouchableRipple>
            </View>
          );
        })}
      </View>
      <Text accessibilityLiveRegion="polite" style={[font('600', 12.5), styles.mt8, { color: kit.textSecondary }]}>
        {`Étape ${current + 1} sur ${steps.length} · ${steps[current] ?? ''}`}
      </Text>
    </View>
  );
}

export interface StepSpec {
  label: string;
  subtitle?: string;
  content: ReactNode;
}

/**
 * Stepper Material (`Stepper` Flutter) : horizontal (en-têtes en ligne, contenu dessous) ou vertical
 * (contenu sous l'étape courante, trait de liaison) ; commandes « Continuer » / « Retour ».
 */
export function KitStepper({
  steps,
  current,
  onChange,
  horizontal = false,
}: {
  steps: StepSpec[];
  current: number;
  onChange: (i: number) => void;
  horizontal?: boolean;
}) {
  const { kit, roles } = useKitTheme();
  const disabledGrey = withAlpha(roles.onSurface, 0.38);
  const circle = (i: number) => {
    const active = i <= current;
    return (
      <View style={[styles.stepCircle, { backgroundColor: active ? kit.primary : disabledGrey }]}>
        {i < current ? (
          <Icon source="mi:check" size={16} color={kit.onPrimary} />
        ) : horizontal || i !== current || i !== steps.length - 1 ? (
          <Text style={[font('400', 12), { color: kit.onPrimary }]}>{i + 1}</Text>
        ) : (
          <Icon source="mi:edit" size={14} color={kit.onPrimary} />
        )}
      </View>
    );
  };
  const controls = (
    <View style={styles.stepControls}>
      <TouchableRipple
        onPress={() => onChange(Math.min(steps.length - 1, current + 1))}
        accessibilityRole="button"
        style={[styles.stepBtn, { backgroundColor: kit.primary }]}
      >
        <Text style={[font('600', 14), { color: kit.onPrimary }]}>Continuer</Text>
      </TouchableRipple>
      {current > 0 ? (
        <TouchableRipple onPress={() => onChange(current - 1)} accessibilityRole="button" style={styles.stepBtn}>
          <Text style={[font('600', 14), { color: kit.primary }]}>Retour</Text>
        </TouchableRipple>
      ) : null}
    </View>
  );
  if (horizontal) {
    return (
      <View>
        <View style={[styles.stepHead, { borderBottomColor: kit.border }]}>
          {steps.map((s, i) => (
            <View key={s.label} style={[styles.row, i > 0 && styles.fill]}>
              {i > 0 ? <View style={[styles.stepHLine, { backgroundColor: withAlpha(kit.primary, 0.6) }]} /> : null}
              <TouchableRipple
                onPress={() => onChange(i)}
                borderless
                accessibilityRole="tab"
                accessibilityState={{ selected: i === current }}
                accessibilityLabel={s.label}
                style={styles.stepHItem}
              >
                <View style={styles.navInner}>
                  {circle(i)}
                  <Text style={[font('400', 16), { color: kit.textPrimary }]}>{s.label}</Text>
                </View>
              </TouchableRipple>
            </View>
          ))}
        </View>
        <View style={styles.stepBody}>
          {steps[current]?.content}
          {controls}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.stepV}>
      {steps.map((s, i) => (
        <View key={s.label}>
          <TouchableRipple
            onPress={() => onChange(i)}
            accessibilityRole="button"
            accessibilityState={{ selected: i === current }}
            style={styles.stepVHead}
          >
            <View style={styles.drawerRow}>
              {circle(i)}
              <View>
                <Text style={[font('400', 16), { color: kit.textPrimary }]}>{s.label}</Text>
                {s.subtitle ? <Text style={[font('400', 12), { color: kit.textSecondary }]}>{s.subtitle}</Text> : null}
              </View>
            </View>
          </TouchableRipple>
          <View
            style={[
              styles.stepVBody,
              i < steps.length - 1 && { borderLeftColor: withAlpha(kit.primary, 0.6), borderLeftWidth: 1 },
            ]}
          >
            {i === current ? (
              <View>
                {s.content}
                {controls}
              </View>
            ) : (
              <View style={styles.stepVGap} />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Onglets ────────────────────────────────────────────────────────

export interface TabSpec {
  label: string;
  icon?: string;
  count?: number;
}

/** Barre d'onglets M3 (`TabBar` Flutter) : libellés primaires, indicateur de 3 dp sous le libellé, défilable. */
export function KitTabs({
  tabs,
  selected,
  onSelect,
  scrollable = true,
}: {
  tabs: TabSpec[];
  selected: number;
  onSelect: (i: number) => void;
  scrollable?: boolean;
}) {
  const { kit } = useKitTheme();
  const items = tabs.map((t, i) => {
    const on = i === selected;
    const color = on ? kit.primary : kit.textSecondary;
    return (
      <TouchableRipple
        key={t.label}
        onPress={() => onSelect(i)}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        accessibilityLabel={t.count !== undefined ? `${t.label}, ${t.count}` : t.label}
        style={[styles.tab, { minHeight: t.icon ? 72 : 48 }, !scrollable && styles.fill]}
      >
        <View style={styles.tabInner}>
          {t.icon ? <Icon source={t.icon} size={20} color={color} /> : null}
          <View style={styles.tabLabelRow}>
            <Text style={[on ? styles.tabOn : styles.tabOff, { color }]}>{t.label}</Text>
            {t.count !== undefined ? (
              <View style={[styles.tabCount, { backgroundColor: kit.primary }]}>
                <Text style={[font('700', 10.5), { color: kit.onTone }]}>{t.count}</Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.tabIndicator, on && { backgroundColor: kit.primary }]} />
        </View>
      </TouchableRipple>
    );
  });
  return (
    <View style={[styles.tabs, { borderBottomColor: kit.border }]} accessibilityRole="tablist">
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {items}
        </ScrollView>
      ) : (
        <View style={styles.row}>{items}</View>
      )}
    </View>
  );
}

// ── Pagination ─────────────────────────────────────────────────────

function visiblePages(page: number, pages: number): (number | null)[] {
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 4, null, pages];
  if (page >= pages - 2) return [1, null, pages - 3, pages - 2, pages - 1, pages];
  return [1, null, page - 1, page, page + 1, null, pages];
}

/** `<app-paginator>` mobile : taille de page, plage, pages visibles ou « n / N » (`KitPaginator` Flutter). */
export function KitPaginator({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
  pageSizes = [5, 10, 25, 50],
  compact = false,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize?: (s: number) => void;
  pageSizes?: number[];
  compact?: boolean;
}) {
  const { kit, roles } = useKitTheme();
  const [menu, setMenu] = useState(false);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <View style={styles.pager}>
      <View style={styles.pagerInfo}>
        {onPageSize ? (
          <>
            <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>Par page</Text>
            <Menu
              visible={menu}
              onDismiss={() => setMenu(false)}
              contentStyle={{ backgroundColor: roles.surfaceContainer }}
              anchor={
                <TouchableRipple
                  onPress={() => setMenu(true)}
                  borderless
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`${pageSize} éléments par page`}
                  style={[styles.pageSize, { backgroundColor: kit.fieldBg }]}
                >
                  <View style={styles.row}>
                    <Text style={[font('600', 14), { color: kit.textPrimary }]}>{pageSize}</Text>
                    <Icon source="mi:arrow-drop-down" size={18} color={kit.textSecondary} />
                  </View>
                </TouchableRipple>
              }
            >
              {pageSizes.map((s) => (
                <Menu.Item
                  key={s}
                  title={String(s)}
                  onPress={() => {
                    setMenu(false);
                    onPageSize(s);
                  }}
                />
              ))}
            </Menu>
          </>
        ) : null}
        <Text
          style={[font('400', 12.5), tabular, { color: kit.textSecondary }]}
        >{`${number(start)}–${number(end)} sur ${number(total)}`}</Text>
      </View>
      <View style={styles.row}>
        <KitIconButton
          icon="mi:chevron-left"
          accessibilityLabel="Précédent"
          disabled={page <= 1}
          iconColor={kit.textSecondary}
          onPress={() => onPage(page - 1)}
        />
        {compact ? (
          <Text style={[font('600', 14), styles.pageOf, { color: kit.textSecondary }]}>{`${page} / ${pages}`}</Text>
        ) : (
          visiblePages(page, pages).map((p, i) =>
            p === null ? (
              <Text key={`gap-${i}`} style={[font('400', 14), { color: kit.textMuted }]}>
                …
              </Text>
            ) : (
              <TouchableRipple
                key={p}
                onPress={() => onPage(p)}
                borderless
                hitSlop={7}
                accessibilityRole="button"
                accessibilityLabel={`Page ${p}`}
                accessibilityState={{ selected: p === page }}
                style={[styles.pageNum, p === page && { backgroundColor: kit.primary }]}
              >
                <Text style={[font('600', 13), { color: p === page ? kit.onPrimary : kit.textSecondary }]}>{p}</Text>
              </TouchableRipple>
            ),
          )
        )}
        <KitIconButton
          icon="mi:chevron-right"
          accessibilityLabel="Suivant"
          disabled={page >= pages}
          iconColor={kit.textSecondary}
          onPress={() => onPage(page + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  stretch: { alignItems: 'stretch' },
  mt8: { marginTop: space.s2 },
  dot: { position: 'absolute', top: 0, right: -2, width: 9, height: 9, borderRadius: 4.5 },
  badge: {
    position: 'absolute',
    top: -6,
    left: 12,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: font('500', 11),
  appBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.s1 },
  appBarPad: { width: space.s3 },
  appBarTitle: { ...font('700', 20, 'heading'), marginLeft: space.s1 },
  navBar: { flexDirection: 'row', height: 80, paddingTop: 12, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  navInner: { alignItems: 'center', gap: 4 },
  navIndicator: { width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navLabel: font('500', 12),
  navLabelOn: font('700', 12),
  rail: { width: 80, alignItems: 'center', paddingTop: space.s2, gap: 12 },
  railLeading: { marginBottom: space.s2 },
  railItem: { minHeight: 56, width: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  railIndicator: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  drawer: { paddingHorizontal: 12, paddingBottom: space.s4 },
  drawerItem: { height: 56, borderRadius: 28, justifyContent: 'center', paddingHorizontal: space.s4 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawerLabel: font('600', 14),
  sideRail: { width: 68, borderRightWidth: 1, alignItems: 'center' },
  sideLogo: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  sideList: { paddingVertical: space.s1 },
  sideItem: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    marginVertical: space.s1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sideChevron: { position: 'absolute', right: 3, bottom: 3 },
  sideAvatar: { paddingBottom: space.s3, paddingTop: space.s1 },
  sidePanel: { width: 220, borderRightWidth: 1 },
  sidePanelHead: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.s4, paddingTop: space.s2 },
  sidePanelTitle: { ...font('700', 16, 'heading'), flex: 1 },
  sidePanelList: { paddingHorizontal: space.s2 },
  sideSub: { minHeight: MIN_TOUCH, borderRadius: radius.md, justifyContent: 'center', paddingHorizontal: space.s3 },
  crumb: { borderRadius: radius.xs, paddingHorizontal: space.s1, paddingVertical: space.s3 },
  crumbRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  crumbText: font('500', 13),
  crumbLast: font('700', 13),
  stepLine: { flex: 1, height: 2 },
  stepDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepControls: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, marginTop: space.s3 },
  stepBtn: { minHeight: 40, borderRadius: 20, paddingHorizontal: space.s5, justifyContent: 'center' },
  stepHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s4,
    paddingVertical: space.s3,
    borderBottomWidth: 1,
  },
  stepHLine: { flex: 1, height: 1, marginHorizontal: space.s2 },
  stepHItem: { borderRadius: radius.md, padding: space.s1 },
  stepBody: { padding: space.l },
  stepV: { paddingVertical: space.s2 },
  stepVHead: { paddingHorizontal: space.l, paddingVertical: space.s2, minHeight: MIN_TOUCH, justifyContent: 'center' },
  stepVBody: {
    marginLeft: 36,
    paddingLeft: space.l,
    paddingRight: space.l,
    borderLeftColor: 'transparent',
    borderLeftWidth: 1,
  },
  stepVGap: { height: space.s4 },
  tabs: { borderBottomWidth: 1 },
  tabsScroll: { paddingHorizontal: space.s2 },
  tab: { paddingHorizontal: space.s4, justifyContent: 'flex-end' },
  tabInner: { alignItems: 'center', gap: 4 },
  tabLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: space.s3 },
  tabOn: font('600', 14),
  tabOff: font('500', 14),
  tabCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicator: { height: 3, alignSelf: 'stretch', borderTopLeftRadius: 3, borderTopRightRadius: 3, marginTop: 9 },
  pager: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 12,
    rowGap: 4,
  },
  pagerInfo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  pageSize: {
    borderRadius: radius.sm,
    paddingLeft: space.s2,
    paddingRight: 2,
    paddingVertical: space.s1,
    marginRight: 6,
  },
  pageOf: { paddingHorizontal: space.s2 },
  pageNum: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
});
