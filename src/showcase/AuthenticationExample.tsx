import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  List,
  ProgressBar,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';

import { space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

const providerLabels = ['Google', 'Apple', 'Microsoft', 'GitHub', 'LinkedIn', 'Facebook'];

export function AuthenticationExample({ slug }: { slug: string }) {
  const theme = useKitTheme();
  const { width } = useWindowDimensions();
  const split = ['auth-split-right', 'auth-split-left', 'auth-register'].includes(slug);
  const image = slug === 'auth-image' || slug === 'auth-lock';
  const minimal = slug === 'auth-minimal' || slug === 'auth-accounts';
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(true);
  const [terms, setTerms] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState('jean.kouassi@example.com');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [size, setSize] = useState('11–50');
  const compact = width < 760;
  const title =
    slug === 'auth-forgot'
      ? 'Réinitialiser le mot de passe'
      : slug === 'auth-otp'
        ? 'Vérifiez votre identité'
        : slug === 'auth-lock'
          ? 'Session verrouillée'
          : slug === 'auth-register'
            ? 'Créer votre compte'
            : slug === 'auth-social'
              ? 'Continuer avec un compte'
              : slug === 'auth-accounts'
                ? 'Choisir un compte'
                : 'Bon retour !';
  const subtitle =
    slug === 'auth-forgot'
      ? 'Nous vous enverrons un lien sécurisé.'
      : slug === 'auth-otp'
        ? 'Saisissez le code à 6 chiffres envoyé à votre adresse e-mail.'
        : slug === 'auth-register'
          ? 'Créez votre espace SC Storage en quelques étapes.'
          : 'Connectez-vous pour accéder à votre espace.';
  const showProviders = ['auth-centered', 'auth-split-right', 'auth-split-left', 'auth-image', 'auth-minimal'].includes(
    slug,
  );
  const providers =
    slug === 'auth-centered' || slug === 'auth-social'
      ? providerLabels
      : slug === 'auth-split-left'
        ? ['Google', 'Apple', 'Microsoft']
        : slug === 'auth-image'
          ? ['Google', 'Apple']
          : slug === 'auth-minimal'
            ? ['Google', 'Microsoft', 'GitHub']
            : ['Google', 'Microsoft'];

  const form = (
    <Card mode="outlined">
      <Card.Content style={styles.form}>
        <View style={styles.brand}>
          <Avatar.Text size={36} label="SC" />
          <Text variant="titleMedium">SC Storage</Text>
        </View>
        {done ? (
          <View style={styles.success}>
            <Text variant="headlineSmall">
              {slug === 'auth-register'
                ? 'Compte créé'
                : slug === 'auth-forgot'
                  ? 'Consultez votre messagerie'
                  : 'Connexion réussie'}
            </Text>
            <Text>
              {slug === 'auth-register'
                ? 'Votre essai gratuit de 30 jours commence maintenant.'
                : 'Bienvenue, Jean. Votre espace de démonstration est prêt.'}
            </Text>
            <Button
              mode="outlined"
              onPress={() => {
                setDone(false);
                setStep(0);
                setMessage('');
              }}
            >
              Recommencer la démo
            </Button>
          </View>
        ) : (
          <>
            <Text variant="headlineSmall">{title}</Text>
            <Text variant="bodyMedium">{subtitle}</Text>
            {slug === 'auth-social' ? (
              <View style={styles.form}>
                {providers.map((provider) => (
                  <Button
                    key={provider}
                    mode="outlined"
                    icon="account-outline"
                    onPress={() => setMessage(`Connexion ${provider} simulée.`)}
                  >
                    Continuer avec {provider}
                  </Button>
                ))}
              </View>
            ) : slug === 'auth-accounts' ? (
              <View style={styles.form}>
                {(
                  [
                    ['Jean Kouassi', 'jean.kouassi@example.com', 'JK'],
                    ['Aïcha Koné', 'aicha.kone@example.com', 'AK'],
                  ] as const
                ).map(([name, email, initials]) => (
                  <List.Item
                    key={email}
                    title={name}
                    description={email}
                    left={() => <Avatar.Text size={38} label={initials} />}
                    style={selectedAccount === email ? { backgroundColor: theme.colors.secondaryContainer } : undefined}
                    onPress={() => setSelectedAccount(email)}
                  />
                ))}
                <Button
                  mode="outlined"
                  icon="account-plus-outline"
                  onPress={() => setMessage('Ajoutez une adresse e-mail pour continuer.')}
                >
                  Utiliser un autre compte
                </Button>
                <Button mode="contained" onPress={() => setDone(true)}>
                  Continuer avec {selectedAccount.split('@')[0]}
                </Button>
              </View>
            ) : slug === 'auth-forgot' ? (
              <>
                <TextInput
                  label="Adresse e-mail"
                  defaultValue="jean.kouassi@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                />
                <Button mode="contained" icon="email-send-outline" onPress={() => setDone(true)}>
                  Envoyer le lien
                </Button>
                <Button onPress={() => setMessage('Retour à la connexion.')}>Retour à la connexion</Button>
              </>
            ) : slug === 'auth-otp' ? (
              <>
                <TextInput label="Code de vérification" keyboardType="number-pad" maxLength={6} mode="outlined" />
                <Button mode="contained" onPress={() => setDone(true)}>
                  Vérifier le code
                </Button>
                <Button onPress={() => setMessage('Un nouveau code a été envoyé.')}>Renvoyer le code</Button>
              </>
            ) : slug === 'auth-register' ? (
              <>
                <ProgressBar progress={(step + 1) / 3} />
                <Text>
                  Étape {step + 1} sur 3 · {(['Compte', 'Sécurité', 'Organisation'] as const)[step]}
                </Text>
                {step === 0 ? (
                  <>
                    <View style={styles.row}>
                      <TextInput style={styles.flex} label="Prénom" defaultValue="Jean" mode="outlined" />
                      <TextInput style={styles.flex} label="Nom" defaultValue="Kouassi" mode="outlined" />
                    </View>
                    <TextInput
                      label="E-mail professionnel"
                      defaultValue="jean.kouassi@scstorage.ci"
                      keyboardType="email-address"
                      mode="outlined"
                    />
                  </>
                ) : step === 1 ? (
                  <>
                    <TextInput
                      label="Mot de passe"
                      secureTextEntry={!passwordVisible}
                      mode="outlined"
                      right={
                        <TextInput.Icon
                          icon={passwordVisible ? 'eye-off' : 'eye'}
                          onPress={() => setPasswordVisible(!passwordVisible)}
                        />
                      }
                    />
                    <List.Item
                      title="J’accepte les conditions d’utilisation et la politique de confidentialité"
                      left={() => (
                        <Checkbox status={terms ? 'checked' : 'unchecked'} onPress={() => setTerms(!terms)} />
                      )}
                      onPress={() => setTerms(!terms)}
                    />
                  </>
                ) : (
                  <>
                    <TextInput label="Organisation" defaultValue="SC Storage" mode="outlined" />
                    <Text variant="labelMedium">Taille de la flotte</Text>
                    <SegmentedButtons
                      value={size}
                      onValueChange={setSize}
                      buttons={['1–10', '11–50', '51–200'].map((value) => ({ value, label: value }))}
                    />
                  </>
                )}
                <View style={styles.row}>
                  <Button disabled={step === 0} onPress={() => setStep(step - 1)}>
                    Précédent
                  </Button>
                  <Button
                    mode="contained"
                    disabled={step === 1 && !terms}
                    onPress={() => (step === 2 ? setDone(true) : setStep(step + 1))}
                  >
                    {step === 2 ? 'Créer le compte' : 'Continuer'}
                  </Button>
                </View>
              </>
            ) : slug === 'auth-lock' ? (
              <>
                <Avatar.Text size={68} label="JK" />
                <Text variant="titleMedium">Jean Kouassi</Text>
                <TextInput
                  label="Mot de passe"
                  secureTextEntry={!passwordVisible}
                  mode="outlined"
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? 'eye-off' : 'eye'}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                />
                <Button mode="contained" onPress={() => setDone(true)}>
                  Déverrouiller la session
                </Button>
                <Button onPress={() => setMessage('Un code de récupération a été envoyé.')}>
                  Utiliser une autre méthode
                </Button>
              </>
            ) : (
              <>
                <TextInput
                  label="Adresse e-mail"
                  defaultValue="jean.kouassi@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                />
                <TextInput
                  label="Mot de passe"
                  placeholder="Essayez « demo »"
                  secureTextEntry={!passwordVisible}
                  mode="outlined"
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? 'eye-off' : 'eye'}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                />
                {slug !== 'auth-minimal' ? (
                  <View style={styles.row}>
                    <Checkbox status={remember ? 'checked' : 'unchecked'} onPress={() => setRemember(!remember)} />
                    <Text style={styles.flex} onPress={() => setRemember(!remember)}>
                      Rester connecté
                    </Text>
                    <Button compact onPress={() => setMessage('Un lien de réinitialisation sera envoyé.')}>
                      Mot de passe oublié ?
                    </Button>
                  </View>
                ) : null}
                <Button mode="contained" onPress={() => setDone(true)}>
                  Se connecter
                </Button>
                {showProviders ? (
                  <>
                    <Divider />
                    <Text style={styles.center}>ou continuer avec</Text>
                    <View style={styles.providerGrid}>
                      {providers.map((provider) => (
                        <Button
                          key={provider}
                          mode="outlined"
                          onPress={() => setMessage(`Connexion ${provider} simulée.`)}
                        >
                          {provider}
                        </Button>
                      ))}
                    </View>
                  </>
                ) : null}
                <Text style={styles.center}>
                  Pas encore de compte ? <Text style={{ color: theme.colors.primary }}>Créer un compte</Text>
                </Text>
              </>
            )}
            {message ? (
              <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                {message}
              </Text>
            ) : null}
          </>
        )}
      </Card.Content>
    </Card>
  );

  const promo = (
    <View style={[styles.promo, { backgroundColor: image ? theme.colors.primary : theme.colors.primaryContainer }]}>
      <Text variant="headlineMedium" style={{ color: image ? '#fff' : theme.colors.onPrimaryContainer }}>
        Le suivi de flotte, simplement.
      </Text>
      <Text style={{ color: image ? '#fff' : theme.colors.onPrimaryContainer }}>
        Visualisez vos véhicules, interventions et résultats dans un seul espace.
      </Text>
      <View style={styles.promoStats}>
        <Text style={{ color: image ? '#fff' : theme.colors.onPrimaryContainer }}>
          8 000+ véhicules suivis · 99,8 % disponibilité
        </Text>
      </View>
    </View>
  );
  return (
    <View
      style={[
        styles.layout,
        split && !compact && styles.split,
        slug === 'auth-split-left' && !compact && styles.reverse,
      ]}
    >
      {split ? promo : null}
      <View style={[styles.formWrap, minimal && styles.minimal, image && styles.imageForm]}>
        {image ? promo : null}
        {form}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { gap: space.s3 },
  split: { flexDirection: 'row', alignItems: 'stretch' },
  reverse: { flexDirection: 'row-reverse' },
  formWrap: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: 560 },
  minimal: { maxWidth: 440 },
  imageForm: { gap: space.s3 },
  form: { gap: space.s3 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  success: { alignItems: 'center', gap: space.s3, paddingVertical: space.s4 },
  promo: { flex: 1, minHeight: 220, padding: space.s5, borderRadius: 18, justifyContent: 'center', gap: space.s3 },
  promoStats: { marginTop: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
});
