import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Icon, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  KitAvatar,
  KitButton,
  KitCard,
  KitCheckbox,
  KitChip,
  KitIconButton,
  KitTextField,
  LabeledDivider,
  OtpInput,
  PasswordField,
  StatusBadge,
} from '../../components';
import { breakpoints, font, mix, radius, space, useKitTheme, withAlpha } from '../../theme';
import { BLACK, SSO_BRANDS, WHITE } from '../../theme/swatches';
import { ExRow } from './ExKit';

/** Disposition : où se trouve le formulaire et ce qui l'entoure. */
type AuthLayout = 'centered' | 'splitRight' | 'splitLeft' | 'image' | 'minimal';
/** Contenu du formulaire. */
type AuthScreen = 'login' | 'register' | 'forgot' | 'otp' | 'lock' | 'social' | 'accounts';
type Provider = keyof typeof SSO_BRANDS;

interface SsoConfig {
  style: 'grid' | 'stack' | 'icons' | 'brand';
  providers: Provider[];
  top?: boolean;
  verb?: string;
}

/** Les 11 variantes de `/examples/auth/:variant` (`kAuthVariants` Flutter). */
export const AUTH_VARIANTS: Record<string, { layout: AuthLayout; screen: AuthScreen; sso?: SsoConfig }> = {
  centered: {
    layout: 'centered',
    screen: 'login',
    sso: { style: 'icons', providers: ['google', 'apple', 'microsoft', 'facebook', 'github', 'linkedin'] },
  },
  'split-right': { layout: 'splitRight', screen: 'login', sso: { style: 'grid', providers: ['google', 'microsoft'] } },
  'split-left': {
    layout: 'splitLeft',
    screen: 'login',
    sso: { style: 'stack', providers: ['google', 'apple', 'microsoft'], top: true, verb: 'Continuer avec' },
  },
  image: {
    layout: 'image',
    screen: 'login',
    sso: { style: 'brand', providers: ['google', 'apple'], verb: 'Continuer avec' },
  },
  minimal: {
    layout: 'minimal',
    screen: 'login',
    sso: { style: 'stack', providers: ['google', 'microsoft', 'github'], top: true, verb: 'Se connecter avec' },
  },
  register: {
    layout: 'splitRight',
    screen: 'register',
    sso: { style: 'grid', providers: ['google', 'linkedin'], top: true },
  },
  social: {
    layout: 'centered',
    screen: 'social',
    sso: {
      style: 'brand',
      providers: ['google', 'apple', 'microsoft', 'facebook', 'github', 'linkedin'],
      verb: 'Continuer avec',
    },
  },
  accounts: { layout: 'minimal', screen: 'accounts' },
  forgot: { layout: 'centered', screen: 'forgot' },
  otp: { layout: 'centered', screen: 'otp' },
  lock: { layout: 'image', screen: 'lock' },
};

const PROVIDERS: Record<Provider, [string, string]> = {
  google: ['Google', 'google'],
  apple: ['Apple', 'apple'],
  microsoft: ['Microsoft', 'microsoft'],
  facebook: ['Facebook', 'facebook'],
  github: ['GitHub', 'github'],
  linkedin: ['LinkedIn', 'linkedin'],
};

const LOGO = require('../../../assets/images/logo.png');
const BG = require('../../../assets/images/bg.jpg');

/** Dégradé diagonal du panneau de marque (primaire → primaire assombri). */
function PanelGradient() {
  const { kit } = useKitTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={styles.abs}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {size.w ? (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={kit.primary} />
              <Stop offset="1" stopColor={mix(BLACK, kit.primary, 0.45)} />
            </LinearGradient>
          </Defs>
          <Rect width={size.w} height={size.h} fill="url(#panel)" />
        </Svg>
      ) : null}
    </View>
  );
}

/**
 * Écran d'authentification (`AuthExample` Flutter) : 5 dispositions (centrée, panneaux de marque, image,
 * minimale) × 7 contenus (connexion, inscription en 3 étapes, mot de passe oublié, code, verrouillage,
 * connexion sociale, choix du compte). Aucune authentification réelle.
 */
export function AuthExample({ variant }: { variant: string }) {
  const { kit } = useKitTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const v = AUTH_VARIANTS[variant] ?? AUTH_VARIANTS.centered!;
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('jean.kouassi@example.com');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState(-1);
  const [size, setSize] = useState('11-50');

  useEffect(() => {
    if (!busy) return;
    const id = setTimeout(() => {
      setBusy(false);
      setDone(true);
    }, 900);
    return () => clearTimeout(id);
  }, [busy]);

  const submit = (err = '') => {
    setError(err);
    if (!err) setBusy(true);
  };
  const reset = () => {
    setDone(false);
    setPassword('');
    setOtp('');
    setStep(0);
    setError('');
    setAccount(-1);
  };

  // ── Briques ──────────────────────────────────────────────────────
  const brand = (light = false) => (
    <View style={styles.brand}>
      <Image source={LOGO} resizeMode="contain" style={[styles.logo, light && { tintColor: WHITE }]} />
      <Text style={[font('800', 18), { color: light ? WHITE : kit.textPrimary }]}>SC Storage</Text>
    </View>
  );
  const title = (t: string, sub: string, center = false, icon?: string) => (
    <View style={[styles.title, center && styles.centerItems]}>
      {icon ? (
        <View style={[styles.titleIcon, { backgroundColor: kit.primaryLight }]}>
          <Icon source={icon} size={28} color={kit.primary} />
        </View>
      ) : null}
      <Text
        accessibilityRole="header"
        style={[font('800', 28, 'heading'), center && styles.centerText, { color: kit.textPrimary }]}
      >
        {t}
      </Text>
      <Text style={[font('400', 14), styles.mt8, center && styles.centerText, { color: kit.textSecondary }]}>
        {sub}
      </Text>
    </View>
  );
  const errorBox = error ? (
    <View accessibilityRole="alert" style={[styles.error, { backgroundColor: kit.errorLight }]}>
      <Icon source="mi:error-outline" size={24} color={kit.errorText} />
      <Text style={[font('400', 14), styles.fill, { color: kit.errorText }]}>{error}</Text>
    </View>
  ) : null;
  const or = (
    <View style={styles.or}>
      <LabeledDivider label="ou" />
    </View>
  );

  const ssoButton = (s: SsoConfig, id: Provider) => {
    const [name, icon] = PROVIDERS[id];
    const label = s.verb ? `${s.verb} ${name}` : name;
    const [bg, fg] = SSO_BRANDS[id];
    if (s.style === 'brand')
      return (
        <TouchableRipple
          key={id}
          onPress={() => submit()}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[styles.ssoBtn, { backgroundColor: bg }, bg === WHITE && { borderWidth: 1, borderColor: kit.border }]}
        >
          <View style={styles.ssoInner}>
            <Icon source={icon} size={20} color={fg} />
            <Text numberOfLines={1} style={[font('600', 14), { color: fg }]}>
              {label}
            </Text>
          </View>
        </TouchableRipple>
      );
    return (
      <TouchableRipple
        key={id}
        onPress={() => submit()}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.ssoBtn, { borderWidth: 1, borderColor: kit.border }]}
      >
        <View style={styles.ssoInner}>
          <Icon source={icon} size={20} color={kit.primary} />
          <Text numberOfLines={1} style={[font('600', 14), { color: kit.primary }]}>
            {label}
          </Text>
        </View>
      </TouchableRipple>
    );
  };
  const sso = (s: SsoConfig) => {
    if (s.style === 'icons')
      return (
        <View style={styles.ssoIcons}>
          {s.providers.map((id) => (
            <KitIconButton
              key={id}
              icon={PROVIDERS[id][1]}
              mode="outlined"
              size={22}
              accessibilityLabel={PROVIDERS[id][0]}
              onPress={() => submit()}
            />
          ))}
        </View>
      );
    if (s.style === 'grid')
      return (
        <View style={styles.ssoGrid}>
          {s.providers.map((id) => (
            <View key={id} style={styles.ssoCell}>
              {ssoButton(s, id)}
            </View>
          ))}
        </View>
      );
    return <View style={styles.gap12}>{s.providers.map((id) => ssoButton(s, id))}</View>;
  };
  const link = (before: string, label: string) => (
    <View style={styles.link}>
      <Text style={[font('400', 14), { color: kit.textPrimary }]}>{before}</Text>
      <KitButton label={label} variant="ghost" onPress={() => undefined} />
    </View>
  );
  const success = (t: string, msg: string) => (
    <View style={styles.centerItems}>
      <Icon source="mi:check-circle" size={64} color={kit.success} />
      <Text style={[font('700', 22, 'heading'), styles.centerText, styles.mt16, { color: kit.textPrimary }]}>{t}</Text>
      <Text style={[font('400', 14), styles.centerText, styles.mt8, { color: kit.textSecondary }]}>{msg}</Text>
      <View style={styles.mt24}>
        <KitButton label="Recommencer la démo" icon="mi:refresh" variant="outline" onPress={reset} />
      </View>
    </View>
  );
  const passwordField = (forgotLink = true) => (
    <View>
      {forgotLink ? (
        <View style={styles.end}>
          <KitButton label="Mot de passe oublié ?" variant="ghost" onPress={() => undefined} />
        </View>
      ) : null}
      <KitTextField
        label="Mot de passe"
        hint="Essayez « demo »"
        icon="mi:lock"
        obscure={!showPwd}
        value={password}
        onChangeText={setPassword}
        suffix={
          <KitIconButton
            icon={showPwd ? 'mi:visibility-off' : 'mi:visibility'}
            accessibilityLabel={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            onPress={() => setShowPwd(!showPwd)}
          />
        }
      />
    </View>
  );
  const check = (value: boolean, onChange: (v: boolean) => void, label: string) => (
    <TouchableRipple
      onPress={() => onChange(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      style={styles.check}
    >
      <View style={styles.checkRow}>
        <KitCheckbox value={value} onChange={onChange} accessibilityLabel={label} />
        <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>{label}</Text>
      </View>
    </TouchableRipple>
  );
  const emailField = (
    <KitTextField
      label="Adresse e-mail"
      icon="mi:email"
      keyboardType="email-address"
      autoCapitalize="none"
      value={email}
      onChangeText={setEmail}
    />
  );

  // ── Écrans ───────────────────────────────────────────────────────
  const screens: Record<AuthScreen, () => ReactNode> = {
    login: () => {
      if (done) return success('Connexion réussie', 'Bienvenue, Jean. Redirection vers votre espace…');
      const s = v.sso;
      return (
        <View>
          {title('Bon retour !', 'Connectez-vous pour accéder à votre espace.')}
          {s?.top ? (
            <>
              {sso(s)}
              {or}
            </>
          ) : null}
          {errorBox}
          {emailField}
          {passwordField()}
          {check(remember, setRemember, 'Rester connecté')}
          <KitButton
            label="Se connecter"
            expand
            size="large"
            loading={busy}
            onPress={() =>
              submit(
                !email.includes('@')
                  ? 'Adresse e-mail invalide.'
                  : password.length < 4
                    ? 'Mot de passe incorrect. Essayez « demo ».'
                    : '',
              )
            }
          />
          {s && !s.top ? (
            <>
              {or}
              {sso(s)}
            </>
          ) : null}
          <View style={styles.mt16}>{link('Pas encore de compte ? ', 'Créer un compte')}</View>
        </View>
      );
    },
    register: () => {
      if (done) return success('Compte créé', 'Votre essai gratuit de 30 jours commence maintenant.');
      const steps = ['Compte', 'Sécurité', 'Organisation'];
      const body = [
        <View key={0}>
          {v.sso ? (
            <>
              {sso(v.sso)}
              {or}
            </>
          ) : null}
          <ExRow minWidth={360}>
            <KitTextField label="Prénom" defaultValue="Jean" />
            <KitTextField label="Nom" defaultValue="Kouassi" />
          </ExRow>
          <View style={styles.mt16}>
            <KitTextField
              label="E-mail professionnel"
              defaultValue="jean.kouassi@scstorage.ci"
              icon="mi:alternate-email"
            />
          </View>
        </View>,
        <View key={1}>
          <PasswordField />
          {check(terms, setTerms, 'J’accepte les conditions d’utilisation et la politique de confidentialité.')}
        </View>,
        <View key={2}>
          <KitTextField label="Organisation" defaultValue="SC Storage" icon="mi:business" />
          <Text style={[font('600', 14), styles.mt16, styles.mb8, { color: kit.textSecondary }]}>
            Taille de l’équipe
          </Text>
          <View style={styles.wrap}>
            {['1-10', '11-50', '51-200', '200+'].map((s) => (
              <KitChip key={s} label={s} selected={size === s} onPress={() => setSize(s)} />
            ))}
          </View>
        </View>,
      ][step];
      return (
        <View>
          {title('Créer votre compte', 'Essai gratuit de 30 jours, sans carte bancaire.')}
          <View style={[styles.wrap, styles.mb24]}>
            {steps.map((s, i) => (
              <StatusBadge
                key={s}
                label={`${i + 1}. ${s}`}
                uppercase={false}
                tone={i === step ? 'primary' : i < step ? 'success' : 'neutral'}
                icon={i < step ? 'mi:check' : undefined}
              />
            ))}
          </View>
          {errorBox}
          {body}
          <View style={[styles.actions, styles.mt24]}>
            {step > 0 ? <KitButton label="Retour" variant="ghost" onPress={() => setStep(step - 1)} /> : null}
            <View style={styles.fill}>
              <KitButton
                label={step === 2 ? 'Créer un compte' : 'Continuer'}
                expand
                loading={busy}
                onPress={() => {
                  if (step === 1 && !terms) return setError('Acceptez les conditions pour continuer.');
                  setError('');
                  if (step === 2) submit();
                  else setStep(step + 1);
                }}
              />
            </View>
          </View>
          <View style={styles.mt16}>{link('Déjà inscrit ? ', 'Se connecter')}</View>
        </View>
      );
    },
    forgot: () =>
      done ? (
        <View>
          {title(
            'Vérifiez votre boîte mail',
            `Un lien de réinitialisation a été envoyé à ${email}. Il expire dans 30 minutes.`,
            true,
            'mi:mark-email-read',
          )}
          <KitButton label="Retour à la connexion" icon="mi:arrow-back" variant="outline" onPress={reset} />
        </View>
      ) : (
        <View>
          {title(
            'Mot de passe oublié ?',
            'Saisissez l’adresse e-mail de votre compte : nous vous enverrons un lien de réinitialisation.',
            true,
            'mi:lock-reset',
          )}
          {errorBox}
          {emailField}
          <View style={styles.mt24}>
            <KitButton
              label="Envoyer le lien"
              expand
              size="large"
              loading={busy}
              onPress={() => submit(!email.includes('@') ? 'Saisissez l’adresse e-mail de votre compte.' : '')}
            />
          </View>
          <View style={styles.mt8}>
            <KitButton
              label="Retour à la connexion"
              icon="mi:arrow-back"
              variant="ghost"
              expand
              onPress={() => undefined}
            />
          </View>
        </View>
      ),
    otp: () =>
      done ? (
        success('Connexion réussie', 'Votre identité est vérifiée.')
      ) : (
        <View>
          {title(
            'Vérification en deux étapes',
            'Saisissez le code à 6 chiffres envoyé au +225 07 •• •• 56. (Code de démo : 123456)',
            true,
            'mi:sms',
          )}
          <View style={styles.centerItems}>
            <OtpInput value={otp} onChange={setOtp} error={!!error} accessibilityLabel="Code de vérification" />
          </View>
          {error ? (
            <Text style={[font('400', 14), styles.centerText, styles.mt8, { color: kit.errorText }]}>{error}</Text>
          ) : null}
          <View style={styles.mt24}>
            <KitButton
              label="Vérifier"
              expand
              size="large"
              loading={busy}
              onPress={() => submit(otp === '123456' ? '' : 'Code incorrect, réessayez.')}
            />
          </View>
          <Text style={[font('400', 14), styles.centerText, styles.mt16, { color: kit.textSecondary }]}>
            Renvoyer le code dans 29 s
          </Text>
        </View>
      ),
    lock: () =>
      done ? (
        success('Session déverrouillée', 'Vous reprenez là où vous en étiez.')
      ) : (
        <View>
          <View style={[styles.centerItems, styles.mb16]}>
            <KitAvatar name="Jean Kouassi" size={72} />
          </View>
          {title('Session verrouillée', 'Jean Kouassi · saisissez votre mot de passe pour continuer.', true)}
          {errorBox}
          {passwordField(false)}
          <View style={styles.mt24}>
            <KitButton
              label="Déverrouiller"
              icon="mi:lock-open"
              expand
              size="large"
              loading={busy}
              onPress={() => submit(password.length < 4 ? 'Mot de passe incorrect.' : '')}
            />
          </View>
          <View style={styles.mt8}>{link('Pas vous ? ', 'Changer de compte')}</View>
        </View>
      ),
    social: () =>
      done ? (
        success('Connexion réussie', 'Bienvenue, Jean.')
      ) : (
        <View>
          {title('Bienvenue', 'Connectez-vous en un clic avec un compte que vous utilisez déjà.', true)}
          {sso(v.sso!)}
          {or}
          <KitButton
            label="Continuer avec une adresse e-mail"
            icon="mi:email"
            variant="outline"
            expand
            onPress={() => undefined}
          />
          <Text style={[font('400', 12), styles.centerText, styles.mt16, { color: kit.textMuted }]}>
            En continuant, vous acceptez les conditions d’utilisation et la politique de confidentialité.
          </Text>
        </View>
      ),
    accounts: () => {
      const accounts: [string, string, boolean][] = [
        ['Jean Kouassi', 'jean.kouassi@gmail.com', false],
        ['Jean Kouassi', 'j.kouassi@scstorage.ci', true],
      ];
      if (done) return success('Connexion réussie', `Connecté en tant que ${accounts[account === 1 ? 1 : 0]![1]}.`);
      return (
        <View>
          {title('Choisissez un compte', 'pour continuer vers SC Storage', true)}
          {accounts.map(([n, mail, pro], i) => (
            <View key={mail} style={styles.mb8}>
              <KitCard
                onPress={() => {
                  setAccount(i);
                  submit();
                }}
                accessibilityLabel={`${n}, ${mail}`}
              >
                <View style={styles.checkRow}>
                  <KitAvatar name={n} tone={i === 0 ? 'info' : 'purple'} />
                  <View style={styles.fill}>
                    <View style={styles.wrap}>
                      <Text style={[font('600', 14), { color: kit.textPrimary }]}>{n}</Text>
                      {pro ? <StatusBadge label="Pro" tone="purple" uppercase={false} /> : null}
                    </View>
                    <Text numberOfLines={1} style={[font('400', 13), { color: kit.textMuted }]}>
                      {mail}
                    </Text>
                  </View>
                  {busy && account === i ? (
                    <ActivityIndicator size={20} color={kit.primary} />
                  ) : (
                    <Icon source="mi:chevron-right" size={24} color={kit.textMuted} />
                  )}
                </View>
              </KitCard>
            </View>
          ))}
          <KitButton
            label="Utiliser un autre compte"
            icon="mi:person-add-alt"
            variant="ghost"
            expand
            onPress={() => undefined}
          />
        </View>
      );
    },
  };

  const content = (
    <View>
      {screens[v.screen]()}
      <Text style={[font('400', 12), styles.centerText, styles.mt24, { color: kit.textMuted }]}>
        © 2026 SC Storage · Confidentialité · Conditions
      </Text>
    </View>
  );
  const scroll = (child: ReactNode, maxWidth = 440, pad: number = width < breakpoints.tablet ? space.s5 : space.s8) => (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { padding: pad, paddingTop: insets.top + space.s12, paddingBottom: insets.bottom + pad },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.limit, { maxWidth }]}>{child}</View>
    </ScrollView>
  );

  const panel = (
    <View style={[styles.fill, styles.panel]}>
      <PanelGradient />
      {brand(true)}
      <View style={styles.fill} />
      <Text style={[font('800', 30), { color: WHITE }]}>Pilotez toute votre activité depuis un seul espace.</Text>
      {(
        [
          ['mi:bolt', 'Mise en route en 5 minutes'],
          ['mi:devices', 'Accessible partout, même hors ligne'],
          ['mi:lock', 'Données chiffrées et sauvegardées'],
        ] as const
      ).map(([i, t]) => (
        <View key={t} style={[styles.checkRow, styles.mt12]}>
          <Icon source={i} size={24} color={withAlpha(WHITE, 0.7)} />
          <Text style={[font('400', 14), { color: WHITE }]}>{t}</Text>
        </View>
      ))}
      <View style={[styles.wrap, styles.mt24]}>
        {(
          [
            ['2 400+', 'entreprises'],
            ['98 %', 'de satisfaction'],
            ['24/7', 'support'],
          ] as const
        ).map(([n, l]) => (
          <View key={l} style={styles.stat}>
            <Text style={[font('800', 24), { color: WHITE }]}>{n}</Text>
            <Text style={[font('400', 14), { color: withAlpha(WHITE, 0.7) }]}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={styles.fill} />
      <Text style={[font('400', 14), styles.italic, { color: WHITE }]}>
        « Nous avons divisé par deux le temps de clôture mensuelle. »
      </Text>
      <Text style={[font('400', 13), styles.mt8, { color: withAlpha(WHITE, 0.7) }]}>
        Aya Koné · Directrice des opérations, Sotra Logistique
      </Text>
    </View>
  );

  let body: ReactNode;
  if (v.layout === 'centered')
    body = (
      <View style={[styles.fill, { backgroundColor: kit.bg }]}>
        {scroll(
          <View>
            <View style={styles.centerItems}>{brand()}</View>
            <View style={styles.mt24}>
              {width < breakpoints.sm ? (
                content
              ) : (
                <KitCard padding={space.s8} shadow>
                  {content}
                </KitCard>
              )}
            </View>
          </View>,
        )}
      </View>
    );
  else if (v.layout === 'minimal')
    body = (
      <View style={[styles.fill, { backgroundColor: kit.card }]}>
        {scroll(
          <View>
            <View style={styles.centerItems}>{brand()}</View>
            <View style={styles.mt32}>{content}</View>
          </View>,
          380,
        )}
      </View>
    );
  else if (v.layout === 'image') {
    const wide = width >= breakpoints.xl;
    body = (
      <ImageBackground source={BG} resizeMode="cover" style={styles.fill}>
        <View style={[styles.abs, { backgroundColor: withAlpha(BLACK, 0.38) }]} />
        <View style={[styles.fill, styles.row]}>
          {wide ? (
            <View style={[styles.fill, styles.imageCaption]}>
              {brand(true)}
              <Text style={[font('400', 14), styles.mt8, { color: withAlpha(WHITE, 0.7) }]}>
                Entrepôt de Vridi · Abidjan
              </Text>
            </View>
          ) : null}
          <View style={styles.fill}>
            {scroll(
              <KitCard padding={width < breakpoints.sm ? space.s5 : space.s8} shadow>
                {content}
              </KitCard>,
              440,
              width < breakpoints.sm ? space.s3 : space.s8,
            )}
          </View>
        </View>
      </ImageBackground>
    );
  } else {
    const form = (
      <View style={[styles.fill, { backgroundColor: kit.bg }]}>
        {scroll(
          <View>
            {brand()}
            <View style={styles.mt32}>{content}</View>
          </View>,
        )}
      </View>
    );
    body =
      width < breakpoints.xl ? (
        form
      ) : (
        <View style={[styles.fill, styles.row]}>
          {v.layout === 'splitRight' ? panel : form}
          {v.layout === 'splitRight' ? form : panel}
        </View>
      );
  }

  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]}>
      {body}
      <View style={[styles.back, { top: insets.top + space.s2 }]}>
        <KitIconButton
          icon="mi:arrow-back"
          mode="contained-tonal"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  abs: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  centerItems: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  italic: { fontStyle: 'italic' },
  end: { flexDirection: 'row', justifyContent: 'flex-end' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  gap12: { gap: space.s3 },
  mt8: { marginTop: space.s2 },
  mt12: { marginTop: space.s3 },
  mt16: { marginTop: space.s4 },
  mt24: { marginTop: space.l },
  mt32: { marginTop: space.s8 },
  mb8: { marginBottom: space.s2 },
  mb16: { marginBottom: space.s4 },
  mb24: { marginBottom: space.l },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  limit: { width: '100%', alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  logo: { width: 40, height: 28 },
  title: { marginBottom: space.l },
  titleIcon: { padding: space.s3, borderRadius: radius.lg, marginBottom: space.s4 },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    padding: space.s3,
    borderRadius: radius.md,
    marginBottom: space.s4,
  },
  or: { paddingVertical: space.s4 },
  ssoBtn: { height: 48, borderRadius: radius.full, justifyContent: 'center', paddingHorizontal: space.s4 },
  ssoInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s2 },
  ssoIcons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.s3 },
  ssoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s3 },
  ssoCell: { flexGrow: 1, flexBasis: 140 },
  link: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
  check: { borderRadius: radius.sm, marginVertical: space.s2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  panel: { padding: space.s10, overflow: 'hidden' },
  stat: { marginRight: space.s8 },
  imageCaption: { justifyContent: 'flex-end', padding: space.s10 },
  back: { position: 'absolute', left: space.s2 },
});
