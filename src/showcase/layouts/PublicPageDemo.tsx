import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitBottomSheet, KitButton, KitCard, KitIconButton } from '../../components';
import { fcfa } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import { font, kitText, space, useKitTheme } from '../../theme';
import { PAYMENT_BRANDS, WHITE } from '../../theme/swatches';
import { DemoBar } from './DemoBar';

const LINES: [string, number, number][] = [
  ['Abonnement Suivi Premium', 24, 14500],
  ['Installation balise FMB920', 6, 35000],
  ['Option anti-démarrage', 6, 4500],
];

/** Page publique (`PublicPageDemo` Flutter) : proforma consultable via un lien partagé, paiement simulé. */
export function PublicPageDemo() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const insets = useSafeAreaInsets();
  const [pay, setPay] = useState(false);
  const total = LINES.reduce((a, [, q, p]) => a + q * p, 0);

  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]}>
      <DemoBar
        leading={<KitIconButton icon="mi:arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />}
        title={
          <View style={styles.brandRow}>
            <Icon source="mi:gps-fixed" size={24} color={kit.primary} />
            <Text style={[kitText.brand, { color: kit.textPrimary }]}>Lookas</Text>
          </View>
        }
        actions={
          <KitIconButton
            icon="mi:download"
            accessibilityLabel="Télécharger le PDF"
            onPress={() => snack.demoAction('Téléchargement PDF')}
          />
        }
      />
      <ScrollView contentContainerStyle={[styles.pad16, { paddingBottom: insets.bottom + space.s4 }]}>
        <KitCard>
          <View style={styles.rowGap10}>
            <Icon source="mi:verified-user" size={24} color={kit.textSecondary} />
            <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>
              Lien sécurisé · valable jusqu’au 30/10/2026
            </Text>
          </View>
        </KitCard>
        <Text style={[kitText.overline, styles.mt12, { color: kit.textMuted }]}>PROFORMA</Text>
        <Text style={[kitText.h2, { color: kit.textPrimary }]}>PRO-2026-0318</Text>
        <Text style={[kitText.bodySm, { color: kit.textSecondary }]}>
          Émise le 15/10/2026 pour Transports Yao & Fils
        </Text>
        <View style={styles.mt12}>
          <KitCard padding={0}>
            {LINES.map(([l, q, p]) => (
              <View key={l} style={styles.line}>
                <View style={styles.fill}>
                  <Text style={[font('500', 14), { color: kit.textPrimary }]}>{l}</Text>
                  <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{`${q} × ${fcfa(p)}`}</Text>
                </View>
                <Text style={[font('700', 14), { color: kit.textPrimary }]}>{fcfa(q * p)}</Text>
              </View>
            ))}
            <View style={[styles.rule, { backgroundColor: kit.divider }]} />
            <View style={styles.line}>
              <Text style={[font('800', 14), styles.fill, { color: kit.textPrimary }]}>Total TTC</Text>
              <Text style={[font('800', 18, 'heading'), { color: kit.primary }]}>{fcfa(total)}</Text>
            </View>
          </KitCard>
        </View>
        <View style={styles.buttons}>
          <KitButton
            label={`Payer ${fcfa(total)}`}
            icon="mi:phone-android"
            size="large"
            expand
            onPress={() => setPay(true)}
          />
          <KitButton
            label="Accepter sans payer"
            variant="outline"
            expand
            onPress={() => snack.show('Proforma acceptée (démo)', { kind: 'success' })}
          />
        </View>
      </ScrollView>
      <KitBottomSheet visible={pay} onDismiss={() => setPay(false)}>
        <View style={styles.sheet}>
          {PAYMENT_BRANDS.map(([n, col]) => (
            <TouchableRipple
              key={n}
              onPress={() => {
                setPay(false);
                snack.show(`Paiement ${n} simulé`, { kind: 'success' });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Payer avec ${n}`}
            >
              <View style={styles.payRow}>
                <View style={[styles.payDisc, { backgroundColor: col }]}>
                  <Icon source="mi:payments" size={16} color={WHITE} />
                </View>
                <Text style={[font('500', 14), { color: kit.textPrimary }]}>{n}</Text>
              </View>
            </TouchableRipple>
          ))}
        </View>
      </KitBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad16: { padding: space.s4 },
  mt12: { marginTop: 12 },
  rowGap10: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, paddingHorizontal: space.m },
  rule: { height: 1, marginVertical: space.s2 },
  buttons: { gap: 8, marginTop: 16 },
  sheet: { paddingBottom: space.s2 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, paddingHorizontal: space.l },
  payDisc: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
