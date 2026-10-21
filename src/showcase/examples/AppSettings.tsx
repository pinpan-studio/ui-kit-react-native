import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from 'react-native-paper';

import {
  KitAvatar,
  KitButton,
  KitCard,
  KitChip,
  KitIconButton,
  KitSwitch,
  KitTextField,
  SegmentedToggle,
  StatusBadge,
  TagInput,
} from '../../components';
import { useKitSnack } from '../../core/snack';
import {
  CURRENT_USER,
  ORGANISATION,
  SETTINGS_NOTIFS,
  SETTINGS_PROFILE_BIO,
  SETTINGS_PROFILE_SKILLS,
  SETTINGS_SECRET,
  SETTINGS_SECTIONS,
  SETTINGS_SECURITY,
  SETTINGS_SESSIONS,
  SETTINGS_SKILL_SUGGESTIONS,
} from '../../data/examples';
import { useThemeStore, type ModePreference } from '../../store/themeStore';
import { breakpoints, font, radius, space, useKitTheme } from '../../theme';
import { ExGap, ExHeader, ExHeading, ExPage, ExRow, ExTile, FilePicker } from './ExKit';

/** Ligne de formulaire : libellé + description à gauche, champ à droite dès 768 dp. */
function Field({ label, desc, children }: { label: string; desc?: string; children: ReactNode }) {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  const head = (
    <View style={width >= breakpoints.tablet ? styles.fieldHead : undefined}>
      <Text style={[font('600', 14), { color: kit.textPrimary }]}>{label}</Text>
      {desc ? <Text style={[font('400', 13), { color: kit.textMuted }]}>{desc}</Text> : null}
    </View>
  );
  return (
    <View style={[styles.field, width >= breakpoints.tablet ? styles.fieldRow : styles.fieldStack]}>
      {head}
      <View style={width >= breakpoints.tablet ? styles.fill : undefined}>{children}</View>
    </View>
  );
}

function SwitchRow({
  title,
  sub,
  value,
  onChange,
}: {
  title: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { kit } = useKitTheme();
  return (
    <View style={styles.switchRow}>
      <View style={styles.fill}>
        <Text style={[font('600', 14), { color: kit.textPrimary }]}>{title}</Text>
        <Text style={[font('400', 13), { color: kit.textMuted }]}>{sub}</Text>
      </View>
      <KitSwitch value={value} onChange={onChange} accessibilityLabel={title} />
    </View>
  );
}

/** Paramètres (`SettingsExample` Flutter) : profil, sécurité, API, notifications, apparence, zone sensible. */
export function SettingsExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const { width } = useWindowDimensions();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const [sec, setSec] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [security, setSecurity] = useState(SETTINGS_SECURITY.map(([, , v]) => v));
  const [notifs, setNotifs] = useState(SETTINGS_NOTIFS.map(([, , e, p, s]) => [e, p, s]));
  const [skills, setSkills] = useState(SETTINGS_PROFILE_SKILLS);
  const [photo, setPhoto] = useState(true);
  const [picker, setPicker] = useState(false);
  const [first = '', ...rest] = CURRENT_USER.fullname.split(' ');
  const [id, title] = SETTINGS_SECTIONS[sec]!;

  const body: Record<string, ReactNode> = {
    profile: (
      <View>
        <Field label="Photo" desc="JPG ou PNG, 2 Mo maximum.">
          <View style={styles.wrap}>
            <KitAvatar name={photo ? CURRENT_USER.fullname : '?'} size={56} />
            <KitButton label="Changer" icon="mi:upload" variant="outline" onPress={() => setPicker(true)} />
            <KitButton label="Retirer" variant="ghost" onPress={photo ? () => setPhoto(false) : undefined} />
          </View>
        </Field>
        <Field label="Nom">
          <ExRow>
            <KitTextField label="Prénoms" defaultValue={first} />
            <KitTextField label="Nom" defaultValue={rest.join(' ')} />
          </ExRow>
        </Field>
        <Field label="Coordonnées" desc="L’e-mail sert à la connexion.">
          <ExGap gap={space.s3}>
            <KitTextField label="E-mail" defaultValue={CURRENT_USER.mail} icon="mi:mail-outline" />
            <KitTextField label="Téléphone" defaultValue={CURRENT_USER.phone} icon="mi:phone" />
          </ExGap>
        </Field>
        <Field label="Compétences" desc="Aide vos collègues à vous mentionner.">
          <TagInput tags={skills} onChange={setSkills} suggestions={SETTINGS_SKILL_SUGGESTIONS} hint="Ajouter…" />
        </Field>
        <Field label="Bio">
          <KitTextField label="Bio" defaultValue={SETTINGS_PROFILE_BIO} lines={3} />
        </Field>
      </View>
    ),
    security: (
      <View>
        {SETTINGS_SECURITY.map(([t, s], i) => (
          <SwitchRow
            key={t}
            title={t}
            sub={s}
            value={security[i]!}
            onChange={(v) => setSecurity((a) => a.map((x, j) => (j === i ? v : x)))}
          />
        ))}
        <View style={[styles.rule, { backgroundColor: kit.divider }]} />
        <ExHeading title="Sessions actives" />
        {SETTINGS_SESSIONS.map(([t, s, icon, current]) => (
          <ExTile
            key={t}
            leading={<Icon source={icon} size={24} color={kit.textSecondary} />}
            title={t}
            subtitle={s}
            trailing={
              current ? (
                <StatusBadge label="Cet appareil" tone="success" uppercase={false} />
              ) : (
                <KitButton label="Révoquer" variant="ghost" onPress={() => snack.demoAction('Session révoquée')} />
              )
            }
          />
        ))}
        <View style={[styles.start, styles.mt8]}>
          <KitButton
            label="Changer le mot de passe"
            variant="outline"
            onPress={() => snack.demoAction('Mot de passe')}
          />
        </View>
      </View>
    ),
    api: (
      <View>
        <Text style={[font('400', 14), styles.mb8, { color: kit.textPrimary }]}>Clé secrète</Text>
        <View style={[styles.secret, { backgroundColor: kit.tableHeader, borderColor: kit.border }]}>
          <Text numberOfLines={1} style={[font('400', 14, 'mono'), styles.fill, { color: kit.textPrimary }]}>
            {reveal ? SETTINGS_SECRET : `${SETTINGS_SECRET.slice(0, 8)}${'•'.repeat(16)}`}
          </Text>
          <KitIconButton
            icon={reveal ? 'mi:visibility-off' : 'mi:visibility'}
            accessibilityLabel={reveal ? 'Masquer la clé' : 'Afficher la clé'}
            onPress={() => setReveal(!reveal)}
          />
          <KitIconButton
            icon="mi:content-copy"
            accessibilityLabel="Copier la clé"
            onPress={() => snack.copy(SETTINGS_SECRET, 'Clé copiée')}
          />
        </View>
        <View style={[styles.start, styles.mt12]}>
          <KitButton
            label="Régénérer la clé"
            icon="mi:refresh"
            variant="outline"
            onPress={() => snack.demoAction('Clé régénérée')}
          />
        </View>
      </View>
    ),
    notifications: (
      <View>
        {SETTINGS_NOTIFS.map(([t, s], i) => (
          <View key={t} style={styles.notif}>
            <Text style={[font('600', 14), { color: kit.textPrimary }]}>{t}</Text>
            <Text style={[font('400', 13), { color: kit.textMuted }]}>{s}</Text>
            <View style={[styles.wrap, styles.mt4]}>
              {['E-mail', 'Push', 'SMS'].map((ch, j) => (
                <KitChip
                  key={ch}
                  label={ch}
                  selected={notifs[i]![j]}
                  onPress={() =>
                    setNotifs((n) => n.map((row, a) => (a === i ? row.map((v, b) => (b === j ? !v : v)) : row)))
                  }
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    ),
    appearance: (
      <SegmentedToggle
        value={mode}
        onChange={(m: ModePreference) => setMode(m)}
        options={[
          { value: 'light', label: 'Clair', icon: 'mi:light-mode' },
          { value: 'dark', label: 'Sombre', icon: 'mi:dark-mode' },
          { value: 'system', label: 'Système', icon: 'mi:brightness-auto' },
        ]}
      />
    ),
    danger: (
      <View>
        <Text style={[font('400', 14), styles.mb12, { color: kit.textSecondary }]}>
          {`La suppression du compte ${ORGANISATION.nom} est définitive.`}
        </Text>
        <View style={styles.start}>
          <KitButton
            label="Supprimer le compte"
            icon="mi:delete-forever"
            variant="danger"
            onPress={() => snack.demoAction('Suppression')}
          />
        </View>
      </View>
    ),
  };

  const card = (
    <KitCard padding={0}>
      <View style={styles.cardBody}>
        <Text style={[font('700', 16), { color: kit.textPrimary }]}>{title}</Text>
        {sec === 0 ? (
          <Text style={[font('400', 13), { color: kit.textMuted }]}>
            Visible par les membres de votre organisation.
          </Text>
        ) : null}
        <View style={styles.mt8}>{body[id]}</View>
      </View>
      <View style={[styles.cardFoot, { backgroundColor: kit.hover }]}>
        <KitButton label="Annuler" variant="ghost" onPress={() => snack.demoAction('Modifications annulées')} />
        <KitButton label="Enregistrer" onPress={() => snack.demoAction('Paramètres enregistrés')} />
      </View>
    </KitCard>
  );

  return (
    <ExPage maxWidth={1100}>
      <ExHeader
        eyebrow="COMPTE"
        title="Paramètres"
        subtitle="Profil, sécurité et préférences de l’espace de travail."
      />
      {width < breakpoints.tablet ? (
        <ExGap>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {SETTINGS_SECTIONS.map(([sid, label, icon], i) => (
              <KitChip key={sid} label={label} icon={icon} selected={sec === i} onPress={() => setSec(i)} />
            ))}
          </ScrollView>
          {card}
        </ExGap>
      ) : (
        <View style={styles.split}>
          <View style={styles.nav}>
            {SETTINGS_SECTIONS.map(([sid, label, icon], i) => (
              <ExTile
                key={sid}
                leading={<Icon source={icon} size={24} color={kit.textSecondary} />}
                title={label}
                selected={sec === i}
                onPress={() => setSec(i)}
              />
            ))}
          </View>
          <View style={styles.fill}>{card}</View>
        </View>
      )}
      <FilePicker visible={picker} onClose={() => setPicker(false)} />
    </ExPage>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  start: { alignSelf: 'flex-start' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: space.s2 },
  mt12: { marginTop: space.s3 },
  mb8: { marginBottom: space.s2 },
  mb12: { marginBottom: space.s3 },
  field: { paddingVertical: space.s3 },
  fieldRow: { flexDirection: 'row', gap: space.s4 },
  fieldStack: { gap: space.s2 },
  fieldHead: { width: '36%' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.s3, paddingVertical: space.s2 },
  rule: { height: 1, marginVertical: space.s3 },
  secret: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingLeft: space.s3,
  },
  notif: { paddingVertical: space.s2 },
  cardBody: { padding: space.s4 },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: space.s2,
    paddingHorizontal: space.s4,
    paddingVertical: space.s3,
  },
  chips: { gap: space.s2 },
  split: { flexDirection: 'row', alignItems: 'flex-start', gap: space.s4 },
  nav: { width: 240 },
});
