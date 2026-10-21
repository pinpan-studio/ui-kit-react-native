import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';

import { fileSize } from '../../core/format';
import { font, radius, space, useKitTheme, withAlpha } from '../../theme';
import { KitCard } from '../core/Card';
import { FieldTrigger, SelectSheet } from './Selects';
import { FormFieldLabel } from './TextField';

/** Fichier « local » de démonstration (aucun accès au stockage, aucun envoi réseau). */
export interface DemoFile {
  name: string;
  bytes: number;
  icon: string;
}

export const DEMO_FILES: DemoFile[] = [
  { name: 'contrat-cadre-2026.pdf', bytes: 1258000, icon: 'mi:picture-as-pdf' },
  { name: 'carte-grise-CI-4521-AB.jpg', bytes: 845000, icon: 'mi:image' },
  { name: 'releve-kilometrique-T3.xlsx', bytes: 86000, icon: 'mi:table-view' },
  { name: 'photo-installation.png', bytes: 2410000, icon: 'mi:image' },
  { name: 'attestation-assurance.pdf', bytes: 412000, icon: 'mi:picture-as-pdf' },
];

/** Sélecteur de fichier simulé, en feuille (`pickDemoFile` Flutter). */
export function DemoFilePicker({
  visible,
  onDismiss,
  onPick,
  title = 'Choisir un fichier',
}: {
  visible: boolean;
  onDismiss: () => void;
  onPick: (file: DemoFile) => void;
  title?: string;
}) {
  return (
    <SelectSheet<DemoFile>
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      searchable={false}
      options={DEMO_FILES.map((f) => ({ value: f, label: f.name, icon: f.icon, subtitle: fileSize(f.bytes) }))}
      onSelect={(f) => {
        onDismiss();
        if (f) onPick(f);
      }}
    />
  );
}

/** `<app-file-upload>` : champ avec fichier joint, aperçu et suppression (`FileUploadField` Flutter). */
export function FileUploadField({
  file,
  onChange,
  label,
  placeholder = 'Joindre un document',
  enabled = true,
  icon = 'mi:attach-file',
}: {
  file: DemoFile | null;
  onChange: (file: DemoFile | null) => void;
  label?: string;
  placeholder?: string;
  enabled?: boolean;
  icon?: string;
}) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(false);
  const trigger = (
    <FieldTrigger
      enabled={enabled}
      icon={file?.icon ?? icon}
      text={file ? `${file.name} · ${fileSize(file.bytes)}` : null}
      placeholder={placeholder}
      accessibilityLabel={label ?? placeholder}
      onPress={() => setOpen(true)}
      trailing={
        file ? (
          <TouchableRipple
            onPress={() => onChange(null)}
            borderless
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Retirer"
          >
            <Icon source="mi:delete-outline" size={20} color={kit.error} />
          </TouchableRipple>
        ) : (
          <Icon source="mi:upload-file" size={24} color={kit.primary} />
        )
      }
    />
  );
  return (
    <>
      {label ? <FormFieldLabel label={label}>{trigger}</FormFieldLabel> : trigger}
      <DemoFilePicker visible={open} onDismiss={() => setOpen(false)} onPick={onChange} />
    </>
  );
}

/** Zone de dépôt : bordure pointillée, liste des fichiers ajoutés (`DropZone` Flutter). */
export function DropZone({
  files,
  onChange,
  hint = 'PDF, JPG ou PNG · 10 Mo max.',
}: {
  files: DemoFile[];
  onChange: (files: DemoFile[]) => void;
  hint?: string;
}) {
  const { kit } = useKitTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.zone}>
      <TouchableRipple
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Choisir des fichiers"
        accessibilityHint={hint}
        style={[styles.drop, { backgroundColor: kit.primaryLight, borderColor: withAlpha(kit.primary, 0.5) }]}
      >
        <View style={styles.dropInner}>
          <Icon source="cloud-upload-outline" size={40} color={kit.primary} />
          <Text style={[styles.dropTitle, { color: kit.textPrimary }]}>Touchez pour choisir des fichiers</Text>
          <Text style={[styles.dropHint, { color: kit.textMuted }]}>{hint}</Text>
        </View>
      </TouchableRipple>
      {files.map((f, i) => (
        <KitCard key={`${f.name}-${i}`} radius={radius.md} padding={0}>
          <View style={styles.fileRow}>
            <Icon source={f.icon} size={24} color={kit.primary} />
            <View style={styles.fill}>
              <Text numberOfLines={1} style={[styles.fileName, { color: kit.textPrimary }]}>
                {f.name}
              </Text>
              <Text style={[styles.fileSize, { color: kit.textMuted }]}>{fileSize(f.bytes)}</Text>
            </View>
            <TouchableRipple
              onPress={() => onChange(files.filter((_, j) => j !== i))}
              borderless
              accessibilityRole="button"
              accessibilityLabel={`Retirer ${f.name}`}
              style={styles.remove}
            >
              <Icon source="mi:close" size={18} color={kit.textSecondary} />
            </TouchableRipple>
          </View>
        </KitCard>
      ))}
      <DemoFilePicker
        visible={open}
        onDismiss={() => setOpen(false)}
        title="Ajouter des fichiers"
        onPick={(f) => onChange([...files, f])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  zone: { gap: space.s2 },
  drop: { borderRadius: radius.x2l, borderWidth: 1.5, borderStyle: 'dashed' },
  dropInner: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: space.s4 },
  dropTitle: { ...font('600', 14), marginTop: space.s2 },
  dropHint: { ...font('400', 12), marginTop: 2 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: space.s3,
    paddingRight: space.s1,
    paddingVertical: space.s2,
  },
  fileName: font('600', 13),
  fileSize: font('400', 11.5),
  remove: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
