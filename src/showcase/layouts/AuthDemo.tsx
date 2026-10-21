import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { KitButton, KitIconButton, KitTextField, LabeledDivider, OtpInput } from '../../components';
import { useKitSnack } from '../../core/snack';
import { PaletteSheet } from '../../shell/PaletteSheet';
import { useThemeStore } from '../../store/themeStore';
import { elevation, kitText, radius, space, useKitTheme } from '../../theme';
import { DemoBar } from './DemoBar';

/** 0 connexion · 1 e-mail de récupération · 2 code · 3 succès. */
type Step = 0 | 1 | 2 | 3;

/** Fond en dégradé vertical (primaire clair vers fond de page). */
function Backdrop() {
  const { kit } = useKitTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  // `primaryLight` est le primaire translucide : son opacité devient celle du haut du dégradé.
  const tint = parseInt(kit.primaryLight.slice(7, 9) || 'ff', 16) / 255;
  return (
    <View
      pointerEvents="none"
      style={styles.backdrop}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {size.w ? (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id="auth" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={kit.primary} stopOpacity={tint} />
              <Stop offset="0.5" stopColor={kit.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width={size.w} height={size.h} fill="url(#auth)" />
        </Svg>
      ) : null}
    </View>
  );
}

/** Écrans d'authentification (`AuthDemo` Flutter) : connexion, mot de passe oublié, code OTP, succès. */
export function AuthDemo() {
  const { kit, colorMode } = useKitTheme();
  const snack = useKitSnack();
  const setMode = useThemeStore((s) => s.setMode);
  const [step, setStep] = useState<Step>(0);
  const [pending, setPending] = useState<Step | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [code, setCode] = useState('');
  const [palette, setPalette] = useState(false);
  const dark = colorMode === 'dark';

  useEffect(() => {
    if (pending === null) return;
    const id = setTimeout(() => {
      setStep(pending);
      setPending(null);
      setCode('');
    }, 700);
    return () => clearTimeout(id);
  }, [pending]);

  const logo = (
    <View style={styles.logoBlock}>
      <View style={[styles.logo, { backgroundColor: kit.primary }, elevation(3, colorMode)]}>
        <Icon source="mi:gps-fixed" size={34} color={kit.onPrimary} />
      </View>
      <Text style={[kitText.brand, styles.brand, { color: kit.textPrimary }]}>Lookas</Text>
    </View>
  );
  const title = (t: string, sub: string) => (
    <>
      <Text accessibilityRole="header" style={[kitText.h2, styles.center, { color: kit.textPrimary }]}>
        {t}
      </Text>
      <Text style={[kitText.bodySm, styles.center, { color: kit.textSecondary }]}>{sub}</Text>
    </>
  );
  const email = (
    <KitTextField label="E-mail" icon="mi:alternate-email" keyboardType="email-address" autoCapitalize="none" />
  );

  const content = [
    <>
      {logo}
      {title('Connexion', 'Suivez votre flotte en temps réel.')}
      <View style={styles.h6} />
      {email}
      <KitTextField
        label="Mot de passe"
        icon="mi:lock-outline"
        obscure={!showPwd}
        suffix={
          <KitIconButton
            icon={showPwd ? 'mi:visibility-off' : 'mi:visibility'}
            accessibilityLabel={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onPress={() => setShowPwd(!showPwd)}
          />
        }
      />
      <View style={styles.end}>
        <KitButton label="Mot de passe oublié ?" variant="ghost" onPress={() => setStep(1)} />
      </View>
      <KitButton
        label="Se connecter"
        loading={pending !== null}
        loadingLabel="Connexion…"
        expand
        size="large"
        onPress={() => setPending(3)}
      />
      <LabeledDivider label="ou" />
      <KitButton
        label="Continuer avec Google"
        icon="google"
        variant="outline"
        expand
        size="large"
        onPress={() => setPending(3)}
      />
      <Text style={[kitText.caption, styles.center, { color: kit.textMuted }]}>
        Démo statique : aucune authentification réelle.
      </Text>
    </>,
    <>
      {logo}
      {title('Mot de passe oublié', 'Saisissez votre e-mail : nous vous enverrons un code à 6 chiffres.')}
      {email}
      <KitButton label="Envoyer le code" loading={pending !== null} expand size="large" onPress={() => setPending(2)} />
    </>,
    <>
      {logo}
      {title('Vérification', 'Code envoyé à j•••@lookas.ci')}
      <View style={styles.otp}>
        <OtpInput
          value={code}
          onChange={setCode}
          onCompleted={() => setPending(3)}
          accessibilityLabel="Code de vérification"
        />
      </View>
      <KitButton label="Renvoyer le code" variant="ghost" onPress={() => snack.show('Nouveau code envoyé (démo)')} />
    </>,
    <>
      <View style={styles.selfCenter}>
        <Icon source="mi:check-circle" size={72} color={kit.success} />
      </View>
      {title('Bienvenue Jean !', 'Vous êtes connecté (démo).')}
      <KitButton label="Ouvrir l’application" expand onPress={() => router.replace('/layouts/shell' as never)} />
      <KitButton label="Revenir à la connexion" variant="ghost" onPress={() => setStep(0)} />
    </>,
  ][step];

  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]}>
      <Backdrop />
      <DemoBar
        transparent
        leading={
          step > 0 && step < 3 ? (
            <KitIconButton icon="mi:arrow-back" accessibilityLabel="Retour à la connexion" onPress={() => setStep(0)} />
          ) : (
            <KitIconButton icon="mi:close" accessibilityLabel="Fermer" onPress={() => router.back()} />
          )
        }
        title=""
        actions={
          <>
            <KitIconButton
              icon={dark ? 'mi:light-mode' : 'mi:dark-mode'}
              accessibilityLabel={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
              onPress={() => setMode(dark ? 'light' : 'dark')}
            />
            <KitIconButton
              icon="mi:palette"
              accessibilityLabel="Apparence : mode et couleur"
              onPress={() => setPalette(true)}
            />
          </>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View key={step} style={styles.form}>
            {content}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <PaletteSheet visible={palette} onDismiss={() => setPalette(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: space.l },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: 14 },
  logoBlock: { alignItems: 'center' },
  logo: { width: 64, height: 64, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 26, marginTop: 12 },
  center: { textAlign: 'center' },
  selfCenter: { alignSelf: 'center' },
  end: { flexDirection: 'row', justifyContent: 'flex-end' },
  otp: { alignItems: 'center' },
  h6: { height: 6 },
});
