import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  List,
  ProgressBar,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';

import { space } from '../theme/tokens';

export function ExampleForm({ slug }: { slug: string }) {
  if (slug === 'contact') return <ContactForm />;
  if (slug === 'checkout') return <CheckoutForm />;
  if (slug === 'onboarding') return <OnboardingForm />;
  if (slug === 'survey') return <SurveyForm />;
  if (slug === 'booking') return <BookingForm />;
  return <ApplicationForm />;
}

function ContactForm() {
  const [subject, setSubject] = useState('Demande de démo');
  const [sent, setSent] = useState(false);
  return (
    <View style={styles.root}>
      <Text variant="headlineSmall">Parlons de votre projet</Text>
      <Text>Notre équipe vous répond sous 24 h ouvrées.</Text>
      <View style={styles.cards}>
        {(
          [
            ['phone-outline', 'Téléphone', '+225 27 22 40 50 60'],
            ['email-outline', 'E-mail', 'contact@sc-storage.ci'],
            ['map-marker-outline', 'Bureaux', 'Plateau, Abidjan'],
          ] as const
        ).map(([icon, label, value]) => (
          <Card key={label} mode="outlined" style={styles.infoCard}>
            <Card.Content>
              <List.Icon icon={icon} />
              <Text variant="labelMedium">{label}</Text>
              <Text>{value}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
      {sent ? (
        <Card mode="contained">
          <Card.Content style={styles.root}>
            <Text variant="headlineSmall">Message envoyé</Text>
            <Text>Merci ! Nous revenons vers vous très vite.</Text>
            <Button onPress={() => setSent(false)}>Envoyer un autre message</Button>
          </Card.Content>
        </Card>
      ) : (
        <Card mode="outlined">
          <Card.Content style={styles.root}>
            <TextInput label="Nom complet" defaultValue="Jean Kouassi" mode="outlined" />
            <TextInput label="E-mail" defaultValue="nom@entreprise.ci" keyboardType="email-address" mode="outlined" />
            <TextInput label="Téléphone" defaultValue="07 07 12 34 56" keyboardType="phone-pad" mode="outlined" />
            <Text variant="labelMedium">Objet</Text>
            <View style={styles.row}>
              {['Demande de démo', 'Devis', 'Support', 'Partenariat'].map((value) => (
                <Chip key={value} selected={subject === value} onPress={() => setSubject(value)}>
                  {value}
                </Chip>
              ))}
            </View>
            <TextInput
              label="Message"
              placeholder="Contexte, volumes, délais…"
              multiline
              numberOfLines={4}
              mode="outlined"
            />
            <Button mode="contained" icon="send" onPress={() => setSent(true)}>
              Envoyer
            </Button>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

function CheckoutForm() {
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState('standard');
  const [payment, setPayment] = useState('orange');
  const [done, setDone] = useState(false);
  const shippingCost = shipping === 'express' ? 5000 : shipping === 'pickup' ? 0 : 2000;
  const subtotal = 42500 + 3500 * 4 + 12000 * 2;
  if (done)
    return (
      <Card mode="contained">
        <Card.Content style={styles.root}>
          <Text variant="headlineSmall">Commande confirmée</Text>
          <Text>Votre commande sera livrée à Cocody Angré.</Text>
          <Text variant="titleMedium">Total · {(subtotal + shippingCost).toLocaleString('fr-FR')} FCFA</Text>
          <Button
            onPress={() => {
              setDone(false);
              setStep(0);
            }}
          >
            Nouvelle commande
          </Button>
        </Card.Content>
      </Card>
    );
  return (
    <View style={styles.root}>
      <Text variant="headlineSmall">Finaliser la commande</Text>
      <ProgressBar progress={(step + 1) / 3} />
      <SegmentedButtons
        value={String(step)}
        onValueChange={(value) => setStep(Number(value))}
        buttons={[
          { value: '0', label: 'Livraison' },
          { value: '1', label: 'Paiement' },
          { value: '2', label: 'Confirmation' },
        ]}
      />
      {step === 0 ? (
        <Card mode="outlined">
          <Card.Content style={styles.root}>
            <Text variant="titleMedium">Adresse de livraison</Text>
            <TextInput label="Nom complet" defaultValue="Aya Koné" mode="outlined" />
            <TextInput label="Téléphone" defaultValue="+225 07 07 12 34 56" mode="outlined" />
            <TextInput label="Adresse" defaultValue="Cocody Angré, 8e tranche" mode="outlined" />
            <Text variant="labelLarge">Mode de livraison</Text>
            {(
              [
                ['standard', 'Standard · 3 à 5 jours · 2 000 FCFA'],
                ['express', 'Express · 24 h · 5 000 FCFA'],
                ['pickup', 'Retrait en point relais · Gratuit'],
              ] as const
            ).map(([value, label]) => (
              <List.Item
                key={value}
                title={label}
                left={() => (
                  <Checkbox status={shipping === value ? 'checked' : 'unchecked'} onPress={() => setShipping(value)} />
                )}
                onPress={() => setShipping(value)}
              />
            ))}
          </Card.Content>
        </Card>
      ) : step === 1 ? (
        <Card mode="outlined">
          <Card.Content style={styles.root}>
            <Text variant="titleMedium">Moyen de paiement</Text>
            {(
              [
                ['orange', 'Orange Money'],
                ['mtn', 'MTN MoMo'],
                ['wave', 'Wave'],
                ['card', 'Carte bancaire'],
              ] as const
            ).map(([value, label]) => (
              <List.Item
                key={value}
                title={label}
                left={() => (
                  <Checkbox status={payment === value ? 'checked' : 'unchecked'} onPress={() => setPayment(value)} />
                )}
                onPress={() => setPayment(value)}
              />
            ))}
          </Card.Content>
        </Card>
      ) : (
        <Card mode="outlined">
          <Card.Title title="Récapitulatif" />
          <Card.Content style={styles.root}>
            <Text>Carton double cannelure ×50 · 42 500 FCFA</Text>
            <Text>Ruban adhésif 48 mm ×4 · 14 000 FCFA</Text>
            <Text>Étiquettes thermiques ×2 · 24 000 FCFA</Text>
            <Text>Livraison · {shippingCost.toLocaleString('fr-FR')} FCFA</Text>
            <Divider />
            <Text variant="titleMedium">Total · {(subtotal + shippingCost).toLocaleString('fr-FR')} FCFA</Text>
            <Chip>Code promo · AKWABA10</Chip>
            <Text>
              Paiement ·{' '}
              {payment === 'orange'
                ? 'Orange Money'
                : payment === 'mtn'
                  ? 'MTN MoMo'
                  : payment === 'wave'
                    ? 'Wave'
                    : 'Carte bancaire'}
            </Text>
          </Card.Content>
        </Card>
      )}
      <View style={styles.row}>
        <Button disabled={step === 0} onPress={() => setStep(step - 1)}>
          Précédent
        </Button>
        <Button mode="contained" onPress={() => (step === 2 ? setDone(true) : setStep(step + 1))}>
          {step === 2 ? 'Confirmer et payer' : 'Continuer'}
        </Button>
      </View>
    </View>
  );
}

function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const steps = ['Organisation', 'Profil', 'Préférences', 'Invitations'];
  if (done)
    return (
      <Card mode="contained">
        <Card.Content style={styles.root}>
          <Text variant="headlineSmall">Votre espace est prêt</Text>
          <Text>SC Storage peut maintenant suivre ses véhicules et ses interventions.</Text>
          <Button
            onPress={() => {
              setDone(false);
              setStep(0);
            }}
          >
            Recommencer l’installation
          </Button>
        </Card.Content>
      </Card>
    );
  return (
    <View style={styles.root}>
      <Text variant="headlineSmall">Configurez votre espace</Text>
      <ProgressBar progress={(step + 1) / steps.length} />
      <Text>
        Étape {step + 1} sur {steps.length} · {steps[step]}
      </Text>
      <Card mode="outlined">
        <Card.Content style={styles.root}>
          {step === 0 ? (
            <>
              <TextInput label="Nom de l’organisation" defaultValue="SC Storage" mode="outlined" />
              <TextInput label="Secteur d’activité" defaultValue="Transport et logistique" mode="outlined" />
              <TextInput label="Taille de la flotte" defaultValue="11–50 véhicules" mode="outlined" />
            </>
          ) : step === 1 ? (
            <>
              <TextInput label="Votre nom" defaultValue="Jean Kouassi" mode="outlined" />
              <TextInput label="E-mail professionnel" defaultValue="jean.kouassi@scstorage.ci" mode="outlined" />
              <TextInput label="Téléphone" defaultValue="+225 07 07 12 34 56" mode="outlined" />
            </>
          ) : step === 2 ? (
            <>
              <Text variant="titleMedium">Préférences de l’espace</Text>
              <List.Item
                title="Alertes de véhicule"
                description="Notifications pour les sorties de zone"
                right={() => <Switch value={notifications} onValueChange={setNotifications} />}
              />
              <List.Item title="Langue" description="Français · FCFA · UTC" />
            </>
          ) : (
            <>
              <Text variant="titleMedium">Inviter votre équipe</Text>
              <TextInput label="E-mails des collègues" placeholder="nom@entreprise.ci" mode="outlined" />
              <View style={styles.row}>
                <Chip>Amadou K. · Admin</Chip>
                <Chip>Mariam T. · Opérations</Chip>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
      <View style={styles.row}>
        <Button disabled={step === 0} onPress={() => setStep(step - 1)}>
          Précédent
        </Button>
        <Button mode="contained" onPress={() => (step === steps.length - 1 ? setDone(true) : setStep(step + 1))}>
          {step === steps.length - 1 ? 'Créer l’espace' : 'Continuer'}
        </Button>
      </View>
    </View>
  );
}

function SurveyForm() {
  const [question, setQuestion] = useState(0);
  const [nps, setNps] = useState(-1);
  const [frequency, setFrequency] = useState('');
  const [rating, setRating] = useState(4);
  const [features, setFeatures] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const titles = [
    'Recommanderiez-vous SC Storage à un collègue ?',
    'À quelle fréquence utilisez-vous l’application ?',
    'Comment évaluez-vous ces aspects ?',
    'Quelles fonctionnalités aimeriez-vous voir arriver ?',
    'Un dernier mot pour l’équipe ?',
  ] as const;
  const featureOptions = [
    'Mode hors ligne',
    'Signature électronique',
    'Paiement Mobile Money intégré',
    'Rapports personnalisés',
    'API publique',
  ];
  if (sent)
    return (
      <Card mode="contained">
        <Card.Content style={styles.root}>
          <Text variant="headlineSmall">Merci pour votre retour</Text>
          <Text>Vos réponses nous aideront à améliorer le produit.</Text>
          <Button
            onPress={() => {
              setSent(false);
              setQuestion(0);
            }}
          >
            Recommencer
          </Button>
        </Card.Content>
      </Card>
    );
  return (
    <View style={styles.root}>
      <Text>
        Question {question + 1} sur {titles.length}
      </Text>
      <ProgressBar progress={(question + 1) / titles.length} />
      <Text variant="headlineSmall">{titles[question]}</Text>
      {question === 0 ? (
        <View style={styles.row}>
          {Array.from({ length: 11 }, (_, n) => (
            <Chip key={n} selected={nps === n} onPress={() => setNps(n)}>
              {n}
            </Chip>
          ))}
        </View>
      ) : question === 1 ? (
        <View style={styles.root}>
          {['Plusieurs fois par jour', 'Tous les jours', 'Chaque semaine', 'Rarement'].map((item) => (
            <List.Item
              key={item}
              title={item}
              left={() => (
                <Checkbox status={frequency === item ? 'checked' : 'unchecked'} onPress={() => setFrequency(item)} />
              )}
              onPress={() => setFrequency(item)}
            />
          ))}
        </View>
      ) : question === 2 ? (
        <View style={styles.row}>
          {['Facilité d’utilisation', 'Rapidité', 'Support client'].map((label) => (
            <Card key={label} mode="outlined" style={styles.ratingCard}>
              <Card.Content style={styles.root}>
                <Text>{label}</Text>
                <View style={styles.row}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <IconButton
                      key={n}
                      icon={n <= rating ? 'star' : 'star-outline'}
                      accessibilityLabel={`${n} étoiles`}
                      onPress={() => setRating(n)}
                    />
                  ))}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      ) : question === 3 ? (
        <View style={styles.root}>
          {featureOptions.map((item) => (
            <List.Item
              key={item}
              title={item}
              left={() => (
                <Checkbox
                  status={features.includes(item) ? 'checked' : 'unchecked'}
                  onPress={() =>
                    setFeatures((items) => (items.includes(item) ? items.filter((v) => v !== item) : [...items, item]))
                  }
                />
              )}
              onPress={() =>
                setFeatures((items) => (items.includes(item) ? items.filter((v) => v !== item) : [...items, item]))
              }
            />
          ))}
        </View>
      ) : (
        <TextInput
          label="Votre message"
          placeholder="Vos idées, remarques et suggestions…"
          multiline
          numberOfLines={4}
          mode="outlined"
        />
      )}
      <View style={styles.row}>
        <Button disabled={question === 0} onPress={() => setQuestion(question - 1)}>
          Question précédente
        </Button>
        <Button
          mode="contained"
          onPress={() => (question === titles.length - 1 ? setSent(true) : setQuestion(question + 1))}
        >
          {question === titles.length - 1 ? 'Envoyer' : 'Question suivante'}
        </Button>
      </View>
    </View>
  );
}

function BookingForm() {
  const [service, setService] = useState('Formation utilisateurs');
  const [day, setDay] = useState('Mer 21');
  const [slot, setSlot] = useState('');
  const [done, setDone] = useState(false);
  if (done)
    return (
      <Card mode="contained">
        <Card.Content style={styles.root}>
          <Text variant="headlineSmall">Réservation confirmée</Text>
          <Text>
            {service} · {day} octobre à {slot}
          </Text>
          <Button
            onPress={() => {
              setDone(false);
              setSlot('');
            }}
          >
            Réserver un autre créneau
          </Button>
        </Card.Content>
      </Card>
    );
  return (
    <View style={styles.root}>
      <Text variant="headlineSmall">Réservez un créneau</Text>
      <Text>Choisissez une prestation, un jour et une heure.</Text>
      {(
        [
          ['Formation utilisateurs', '2 h', 'school-outline'],
          ['Démonstration produit', '45 min', 'presentation'],
          ['Atelier paramétrage', '3 h', 'tune-variant'],
        ] as const
      ).map(([label, duration, icon]) => (
        <Card key={label} mode={service === label ? 'contained' : 'outlined'} onPress={() => setService(label)}>
          <Card.Title title={label} subtitle={duration} left={(p) => <List.Icon {...p} icon={icon} />} />
        </Card>
      ))}
      <Text variant="titleSmall">Jour</Text>
      <View style={styles.row}>
        {['Lun 19', 'Mar 20', 'Mer 21', 'Jeu 22', 'Ven 23'].map((item) => (
          <Chip
            key={item}
            selected={day === item}
            onPress={() => {
              setDay(item);
              setSlot('');
            }}
          >
            {item}
          </Chip>
        ))}
      </View>
      <Text variant="titleSmall">Matin</Text>
      <View style={styles.row}>
        {['08:30', '09:30', '10:30', '11:30'].map((item) => (
          <Chip key={item} selected={slot === item} onPress={() => setSlot(item)}>
            {item}
          </Chip>
        ))}
      </View>
      <Text variant="titleSmall">Après-midi</Text>
      <View style={styles.row}>
        {['14:00', '15:00', '16:00', '17:00'].map((item) => (
          <Chip key={item} selected={slot === item} onPress={() => setSlot(item)}>
            {item}
          </Chip>
        ))}
      </View>
      <TextInput label="Remarque (facultatif)" multiline numberOfLines={3} mode="outlined" />
      <Button mode="contained" icon="calendar-check" disabled={!slot} onPress={() => setDone(true)}>
        Confirmer la réservation
      </Button>
    </View>
  );
}

function ApplicationForm() {
  const [section, setSection] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState(false);
  const sections = ['Informations personnelles', 'Expérience', 'Documents', 'Vérification'];
  if (done)
    return (
      <Card mode="contained">
        <Card.Content style={styles.root}>
          <Text variant="headlineSmall">Candidature envoyée</Text>
          <Text>Nous vous contacterons après étude de votre dossier.</Text>
          <Button
            onPress={() => {
              setDone(false);
              setSection(0);
            }}
          >
            Nouvelle candidature
          </Button>
        </Card.Content>
      </Card>
    );
  return (
    <View style={styles.root}>
      <Text variant="headlineSmall">Candidature · Responsable des opérations</Text>
      <Text>Enregistrez à tout moment, puis reprenez votre dossier.</Text>
      <ProgressBar progress={(section + 1) / sections.length} />
      <SegmentedButtons
        value={String(section)}
        onValueChange={(value) => setSection(Number(value))}
        buttons={sections.map((label, index) => ({
          value: String(index),
          label: `${index + 1}. ${label.split(' ')[0]}`,
        }))}
      />
      <Card mode="outlined">
        <Card.Content style={styles.root}>
          <Text variant="titleMedium">{sections[section]}</Text>
          {section === 0 ? (
            <>
              <TextInput label="Nom complet" mode="outlined" />
              <TextInput label="Adresse e-mail" keyboardType="email-address" mode="outlined" />
              <TextInput label="Téléphone" keyboardType="phone-pad" mode="outlined" />
            </>
          ) : section === 1 ? (
            <>
              <TextInput label="Poste actuel" mode="outlined" />
              <TextInput label="Années d’expérience" keyboardType="numeric" mode="outlined" />
              <TextInput label="Présentation" multiline numberOfLines={4} mode="outlined" />
            </>
          ) : section === 2 ? (
            <>
              <Button icon="file-upload-outline" mode="outlined">
                Ajouter un CV
              </Button>
              <Button icon="file-upload-outline" mode="outlined">
                Ajouter une lettre de motivation
              </Button>
              <Chip icon="file-check-outline">CV_Jean_Kouassi.pdf · 2,4 Mo</Chip>
            </>
          ) : (
            <>
              <Text>Vérifiez vos coordonnées et les documents avant l’envoi.</Text>
              <List.Item title="Nom" description="Jean Kouassi" />
              <List.Item title="Poste" description="Responsable des opérations" />
              <List.Item title="Documents" description="2 fichiers joints" />
              <List.Item
                title="J’accepte la politique de confidentialité"
                left={() => (
                  <Checkbox status={accepted ? 'checked' : 'unchecked'} onPress={() => setAccepted(!accepted)} />
                )}
                onPress={() => setAccepted(!accepted)}
              />
            </>
          )}
        </Card.Content>
      </Card>
      <View style={styles.row}>
        <Button onPress={() => setSection(Math.max(0, section - 1))} disabled={section === 0}>
          Précédent
        </Button>
        <Button
          mode="contained"
          onPress={() => (section === sections.length - 1 ? setDone(true) : setSection(section + 1))}
          disabled={section === sections.length - 1 && !accepted}
        >
          {section === sections.length - 1 ? 'Envoyer la candidature' : 'Continuer'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s2 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  infoCard: { flex: 1, minWidth: 180 },
  ratingCard: { flex: 1, minWidth: 190 },
});
