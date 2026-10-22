import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CheckboxTile,
  InputChip,
  KitButton,
  KitCard,
  KitChip,
  KitIconButton,
  KitProgressBar,
  KitTextField,
  RadioTile,
  RatingInput,
  ResponsiveGrid,
  SearchableSelect,
  StatusBadge,
} from '../../components';
import { number } from '../../core/format';
import { useKitSnack } from '../../core/snack';
import { breakpoints, font, radius, space, useKitTheme, type KitTone } from '../../theme';
import { ExActionBar, ExGap, ExHeading, ExPage, ExRow, ExSuccess, useFieldChain } from './ExKit';

const francs = (v: number) => `${number(v)} F CFA`;

/** Pastilles d'étapes « 1. Libellé » : courante en primaire, faites en succès. */
function StepBadges({ labels, step }: { labels: string[]; step: number }) {
  return (
    <View style={styles.wrap}>
      {labels.map((l, i) => {
        const tone: KitTone = i === step ? 'primary' : i < step ? 'success' : 'neutral';
        return <StatusBadge key={l} label={`${i + 1}. ${l}`} uppercase={false} tone={tone} />;
      })}
    </View>
  );
}

// ── Contact ─────────────────────────────────────────────────────────

/** Contact (`ContactFormExample` Flutter) : coordonnées, formulaire, confirmation. */
export function ContactFormExample() {
  const { kit } = useKitTheme();
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState<string | null>('Demande de démo');
  const field = useFieldChain(3);
  const infos: [string, string, string][] = [
    ['mi:phone', 'Téléphone', '+225 27 22 40 50 60'],
    ['mi:alternate-email', 'E-mail', 'contact@sc-storage.ci'],
    ['mi:location-on', 'Bureaux', 'Plateau, Abidjan'],
  ];
  return (
    <ExPage maxWidth={960}>
      <ExHeading title="Parlons de votre projet" subtitle="Notre équipe vous répond sous 24 h ouvrées." />
      <ResponsiveGrid minItemWidth={220} maxColumns={3}>
        {infos.map(([icon, k, v]) => (
          <KitCard key={k}>
            <View style={styles.rowGap12}>
              <Icon source={icon} size={24} color={kit.primary} />
              <View style={styles.fill}>
                <Text style={[font('400', 12), { color: kit.textMuted }]}>{k}</Text>
                <Text style={[font('600', 14), { color: kit.textPrimary }]}>{v}</Text>
              </View>
            </View>
          </KitCard>
        ))}
      </ResponsiveGrid>
      <View style={styles.h24} />
      <KitCard padding={space.l}>
        {sent ? (
          <ExSuccess
            title="Message envoyé"
            message="Merci ! Nous revenons vers vous très vite."
            onReset={() => setSent(false)}
          />
        ) : (
          <ExGap>
            <ExRow>
              <KitTextField label="Nom complet" hint="Jean Kouassi" icon="mi:person-outline" required {...field(0)} />
              <KitTextField
                label="E-mail"
                hint="nom@entreprise.ci"
                icon="mi:alternate-email"
                required
                keyboardType="email-address"
                autoCapitalize="none"
                {...field(1)}
              />
            </ExRow>
            <KitTextField
              label="Téléphone"
              hint="07 07 12 34 56"
              icon="mi:phone"
              keyboardType="phone-pad"
              {...field(2)}
            />
            <SearchableSelect
              label="Objet"
              value={subject}
              onChange={setSubject}
              options={['Demande de démo', 'Devis', 'Support', 'Partenariat'].map((s) => ({ value: s, label: s }))}
            />
            <KitTextField label="Message" hint="Décrivez votre besoin : contexte, volumes, délais…" lines={5} />
            <View style={styles.end}>
              <KitButton label="Envoyer" icon="mi:send" onPress={() => setSent(true)} />
            </View>
          </ExGap>
        )}
      </KitCard>
    </ExPage>
  );
}

// ── Réservation ─────────────────────────────────────────────────────

const TYPES: [string, string, string][] = [
  ['Formation utilisateurs', '2 h', 'mi:school'],
  ['Démonstration produit', '45 min', 'mi:slideshow'],
  ['Atelier paramétrage', '3 h', 'mi:tune'],
];
const DAYS = ['Lun 19', 'Mar 20', 'Mer 21', 'Jeu 22', 'Ven 23'];
const MORNING = ['08:30', '09:30', '10:30', '11:30'];
const AFTERNOON = ['14:00', '15:00', '16:00', '17:00'];

/** Réservation (`BookingFormExample` Flutter) : prestation, jour, créneau, confirmation. */
export function BookingFormExample() {
  const { kit } = useKitTheme();
  const [type, setType] = useState(0);
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState(-1);
  const [done, setDone] = useState(false);
  const slots = (label: string, list: string[], offset: number) => (
    <View>
      <Text style={[font('600', 14), styles.mb8, { color: kit.textSecondary }]}>{label}</Text>
      <View style={styles.wrap}>
        {list.map((s, i) => (
          <KitChip key={s} label={s} selected={slot === offset + i} onPress={() => setSlot(offset + i)} />
        ))}
      </View>
    </View>
  );
  if (done)
    return (
      <ExPage>
        <KitCard>
          <ExSuccess
            title="Réservation confirmée"
            message={`${TYPES[type]![0]} · ${DAYS[day]} octobre à ${[...MORNING, ...AFTERNOON][slot]}`}
            onReset={() => {
              setDone(false);
              setSlot(-1);
            }}
          />
        </KitCard>
      </ExPage>
    );
  return (
    <ExPage
      footer={
        <ExActionBar>
          <View style={styles.fill}>
            <KitButton
              label="Confirmer la réservation"
              icon="mi:event-available"
              expand
              onPress={slot < 0 ? undefined : () => setDone(true)}
            />
          </View>
        </ExActionBar>
      }
    >
      <ExHeading title="Réservez un créneau" subtitle="Choisissez une prestation, un jour et une heure." />
      {TYPES.map(([label, duration, icon], i) => (
        <View key={label} style={styles.mb8}>
          <KitCard
            onPress={() => setType(i)}
            borderColor={type === i ? kit.primary : undefined}
            accessibilityLabel={`${label}, ${duration}`}
          >
            <View style={styles.rowGap12}>
              <Icon source={icon} size={24} color={type === i ? kit.primary : kit.textSecondary} />
              <Text style={[font('600', 14), styles.fill, { color: kit.textPrimary }]}>{label}</Text>
              <StatusBadge label={duration} uppercase={false} />
            </View>
          </KitCard>
        </View>
      ))}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, styles.mv16]}>
        {DAYS.map((d, i) => (
          <KitChip
            key={d}
            label={d}
            selected={day === i}
            onPress={() => {
              setDay(i);
              setSlot(-1);
            }}
          />
        ))}
      </ScrollView>
      <ExRow>
        {slots('Matin', MORNING, 0)}
        {slots('Après-midi', AFTERNOON, 4)}
      </ExRow>
      <View style={styles.mv16}>
        <KitTextField label="Remarque (facultatif)" lines={3} />
      </View>
    </ExPage>
  );
}

// ── Questionnaire ───────────────────────────────────────────────────

const FREQS = ['Plusieurs fois par jour', 'Tous les jours', 'Chaque semaine', 'Rarement'];
const FEATURES = [
  'Mode hors ligne',
  'Signature électronique',
  'Paiement Mobile Money intégré',
  'Rapports personnalisés',
  'API publique',
];
const QUESTIONS = [
  'Recommanderiez-vous SC Storage à un collègue ?',
  'À quelle fréquence utilisez-vous l’application ?',
  'Comment évaluez-vous ces aspects ?',
  'Quelles fonctionnalités aimeriez-vous voir arriver ?',
  'Un dernier mot pour l’équipe ?',
];

/** Questionnaire (`SurveyFormExample` Flutter) : NPS, fréquence, notes, fonctionnalités, message. */
export function SurveyFormExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState(0);
  const [nps, setNps] = useState(-1);
  const [freq, setFreq] = useState('');
  const [ratings, setRatings] = useState<[string, number][]>([
    ['Facilité d’utilisation', 4],
    ['Rapidité', 3],
    ['Support client', 5],
  ]);
  const [features, setFeatures] = useState<string[]>([]);
  const last = q === QUESTIONS.length - 1;
  const npsW = Math.max(24, Math.min(48, (Math.min(width, 720) - space.s4 * 2 - 10 * space.s1) / 11));

  const body: ReactNode[] = [
    <View key="nps">
      <View style={[styles.wrap, styles.center, { gap: space.s1 }]}>
        {Array.from({ length: 11 }, (_, i) => (
          <TouchableRipple
            key={i}
            onPress={() => setNps(i)}
            accessibilityRole="radio"
            accessibilityState={{ selected: nps === i }}
            accessibilityLabel={`Note ${i} sur 10`}
            style={[styles.nps, { width: npsW, backgroundColor: nps === i ? kit.primary : kit.hover }]}
          >
            <Text style={[font('700', 14), { color: nps === i ? kit.onPrimary : kit.textPrimary }]}>{i}</Text>
          </TouchableRipple>
        ))}
      </View>
      <View style={[styles.between, styles.mt8]}>
        <Text style={[font('400', 12), { color: kit.textMuted }]}>Pas du tout</Text>
        <Text style={[font('400', 12), { color: kit.textMuted }]}>Absolument</Text>
      </View>
    </View>,
    <View key="freq" accessibilityRole="radiogroup">
      {FREQS.map((f) => (
        <RadioTile key={f} value={f} selected={freq} onSelect={setFreq} title={f} />
      ))}
    </View>,
    <View key="rate">
      {ratings.map(([k, v], i) => (
        <View key={k} style={[styles.rating, styles.mb12]}>
          <Text style={[font('500', 14), styles.fill, { color: kit.textPrimary }]}>{k}</Text>
          <RatingInput
            value={v}
            size={28}
            accessibilityLabel={k}
            onChange={(n) => setRatings((r) => r.map((x, j) => (j === i ? [x[0], n] : x)))}
          />
        </View>
      ))}
    </View>,
    <View key="feat">
      {FEATURES.map((f) => (
        <CheckboxTile
          key={f}
          title={f}
          value={features.includes(f)}
          onChange={(on) => setFeatures((s) => (on ? [...s, f] : s.filter((x) => x !== f)))}
        />
      ))}
    </View>,
    <KitTextField key="msg" label="Votre message" hint="Ce qui vous plaît, ce qui vous agace, vos idées…" lines={5} />,
  ];

  return (
    <ExPage>
      <Text
        style={[font('400', 14), styles.mb8, { color: kit.textMuted }]}
      >{`Question ${q + 1} sur ${QUESTIONS.length}`}</Text>
      <KitProgressBar value={(q + 1) / QUESTIONS.length} />
      <View style={styles.h24} />
      <ExHeading title={QUESTIONS[q]!} />
      {body[q]}
      <View style={[styles.between, styles.wrap, styles.mt24]}>
        <KitButton
          label="Question précédente"
          icon="mi:arrow-back"
          variant="ghost"
          onPress={q === 0 ? undefined : () => setQ(q - 1)}
        />
        <KitButton
          label={last ? 'Envoyer' : 'Question suivante'}
          iconEnd={last ? 'mi:send' : 'mi:arrow-forward'}
          onPress={() => (last ? snack.show('Réponses envoyées (démo)') : setQ(q + 1))}
        />
      </View>
    </ExPage>
  );
}

// ── Commande ────────────────────────────────────────────────────────

const ITEMS: [string, number, number][] = [
  ['Carton double cannelure ×50', 42500, 1],
  ['Ruban adhésif 48 mm', 3500, 4],
  ['Étiquettes thermiques', 12000, 2],
];
const SHIPS: [string, string, number][] = [
  ['Standard', '3 à 5 jours', 2000],
  ['Express', '24 h', 5000],
  ['Retrait en point relais', '2 jours', 0],
];
const PAYS: [string, string][] = [
  ['Orange Money', 'mi:phone-android'],
  ['MTN MoMo', 'mi:phone-android'],
  ['Wave', 'mi:waves'],
  ['Carte bancaire', 'mi:credit-card'],
];

/** Commande (`CheckoutFormExample` Flutter) : livraison, paiement, validation, récapitulatif. */
export function CheckoutFormExample() {
  const { kit } = useKitTheme();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [ship, setShip] = useState('0');
  const [pay, setPay] = useState(0);
  const [done, setDone] = useState(false);
  const subtotal = ITEMS.reduce((s, [, p, q]) => s + p * q, 0);
  const shipping = SHIPS[Number(ship)]!;
  const total = subtotal + shipping[2];
  const ship1 = useFieldChain(4);
  const pay1 = useFieldChain(3);

  if (done)
    return (
      <ExPage>
        <KitCard>
          <ExSuccess
            title="Commande confirmée"
            message={`Commande n° CMD-2026-0412 · ${francs(total)}`}
            onReset={() => {
              setDone(false);
              setStep(0);
            }}
          />
        </KitCard>
      </ExPage>
    );

  const line = (label: string, value: string, bold = false) => (
    <View style={styles.rowGap8}>
      <Text style={[font(bold ? '700' : '400', 14), styles.fill, { color: kit.textPrimary }]}>{label}</Text>
      <Text style={[font(bold ? '700' : '400', 14), { color: kit.textPrimary }]}>{value}</Text>
    </View>
  );
  const summary = (
    <KitCard title="Récapitulatif" icon="mi:receipt-long">
      <ExGap gap={space.s2}>
        {ITEMS.map(([n, p, q]) => (
          <View key={n}>{line(`${n} · ${q}`, francs(p * q))}</View>
        ))}
        <View style={[styles.rule, { backgroundColor: kit.divider }]} />
        {line('Livraison', francs(shipping[2]))}
        {line('Total', francs(total), true)}
        <KitTextField hint="Code promo (AKWABA10)" icon="mi:local-offer" />
      </ExGap>
    </KitCard>
  );
  const bodies = [
    <ExGap key={0}>
      <ExRow>
        <KitTextField label="Nom complet" defaultValue="Aya Koné" {...ship1(0)} />
        <KitTextField label="Téléphone" defaultValue="+225 07 07 12 34 56" keyboardType="phone-pad" {...ship1(1)} />
      </ExRow>
      <KitTextField label="Adresse" defaultValue="Cocody Angré, 8e tranche" {...ship1(2)} />
      <KitTextField label="Indications" hint="Portail bleu, à côté de la pharmacie…" {...ship1(3)} />
      <View accessibilityRole="radiogroup">
        {SHIPS.map(([n, d, p], i) => (
          <RadioTile
            key={n}
            value={String(i)}
            selected={ship}
            onSelect={setShip}
            title={n}
            subtitle={`${d} · ${p === 0 ? 'Gratuit' : francs(p)}`}
          />
        ))}
      </View>
    </ExGap>,
    <ExGap key={1}>
      <View style={styles.wrap}>
        {PAYS.map(([n, icon], i) => (
          <KitChip key={n} label={n} icon={icon} selected={pay === i} onPress={() => setPay(i)} />
        ))}
      </View>
      {pay === 3 ? (
        <>
          <KitTextField
            label="Numéro de carte"
            hint="4242 4242 4242 4242"
            icon="mi:credit-card"
            keyboardType="number-pad"
            {...pay1(0)}
          />
          <ExRow>
            <KitTextField label="Expiration" hint="MM / AA" keyboardType="number-pad" {...pay1(1)} />
            <KitTextField label="CVC" hint="123" keyboardType="number-pad" {...pay1(2)} />
          </ExRow>
        </>
      ) : (
        <KitTextField
          label="Numéro Mobile Money"
          defaultValue="07 07 12 34 56"
          icon="mi:phone-android"
          keyboardType="phone-pad"
        />
      )}
    </ExGap>,
    <Text key={2} style={[font('400', 14), { color: kit.textPrimary }]}>
      {`Vérifiez votre commande puis confirmez. Paiement : ${PAYS[pay]![0]}, livraison : ${shipping[0]}.`}
    </Text>,
  ];
  const form = (
    <KitCard>
      <ExGap>
        <StepBadges labels={['Livraison', 'Paiement', 'Validation']} step={step} />
        {bodies[step]}
      </ExGap>
    </KitCard>
  );
  return (
    <ExPage
      maxWidth={1080}
      footer={
        <ExActionBar>
          <KitButton label="Retour" variant="ghost" onPress={step === 0 ? undefined : () => setStep(step - 1)} />
          <KitButton
            label={step === 2 ? 'Payer' : 'Continuer'}
            onPress={() => (step === 2 ? setDone(true) : setStep(step + 1))}
          />
        </ExActionBar>
      }
    >
      {width < breakpoints.lg ? (
        <ExGap>
          {form}
          {summary}
        </ExGap>
      ) : (
        <View style={styles.split}>
          <View style={styles.flex3}>{form}</View>
          <View style={styles.flex2}>{summary}</View>
        </View>
      )}
    </ExPage>
  );
}

// ── Onboarding ──────────────────────────────────────────────────────

const STEPS = ['Votre profil', 'Votre organisation', 'Vos modules', 'Votre équipe'];
const SECTORS = ['Transport & logistique', 'Agro-industrie', 'Commerce & distribution', 'Services', 'Santé', 'Autre'];
const MODS: [string, string][] = [
  ['Stocks', 'mi:inventory-2'],
  ['Ventes', 'mi:point-of-sale'],
  ['Achats', 'mi:shopping-cart'],
  ['Comptabilité', 'mi:account-balance'],
  ['RH', 'mi:badge'],
  ['Flotte', 'mi:local-shipping'],
];

/** Assistant d'accueil (`OnboardingFormExample` Flutter) : profil, organisation, modules, invitations. */
export function OnboardingFormExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState('Transport & logistique');
  const [modules, setModules] = useState(['Stocks']);
  const [invites, setInvites] = useState(['awa.diallo@sotra.ci']);
  const field = useFieldChain(3);
  const bodies = [
    <ExGap key={0}>
      <ExHeading title="Faisons connaissance" />
      <ExRow>
        <KitTextField label="Prénom" defaultValue="Koffi" {...field(0)} />
        <KitTextField label="Nom" defaultValue="Yao" {...field(1)} />
      </ExRow>
      <KitTextField label="Fonction" defaultValue="Directeur des opérations" {...field(2)} />
    </ExGap>,
    <ExGap key={1}>
      <ExHeading title="Votre organisation" />
      <KitTextField label="Raison sociale" defaultValue="Sotra Logistique" />
      <View style={styles.wrap}>
        {SECTORS.map((s) => (
          <KitChip key={s} label={s} selected={sector === s} onPress={() => setSector(s)} />
        ))}
      </View>
    </ExGap>,
    <ExGap key={2}>
      <ExHeading title="Que voulez-vous gérer ?" />
      <ResponsiveGrid minItemWidth={150} maxColumns={3} spacing={space.s3}>
        {MODS.map(([m, icon]) => {
          const on = modules.includes(m);
          return (
            <KitCard
              key={m}
              onPress={() => setModules((x) => (on ? x.filter((y) => y !== m) : [...x, m]))}
              borderColor={on ? kit.primary : undefined}
              accessibilityLabel={`${m}${on ? ', sélectionné' : ''}`}
            >
              <View style={styles.rowGap8}>
                <Icon source={icon} size={24} color={kit.textPrimary} />
                <Text style={[font('400', 14), styles.fill, { color: kit.textPrimary }]}>{m}</Text>
                {on ? <Icon source="mi:check-circle" size={20} color={kit.primary} /> : null}
              </View>
            </KitCard>
          );
        })}
      </ResponsiveGrid>
    </ExGap>,
    <ExGap key={3}>
      <ExHeading title="Invitez votre équipe" />
      <View style={styles.rowGap8}>
        <View style={styles.fill}>
          <KitTextField
            hint="collegue@entreprise.ci"
            icon="mi:alternate-email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <KitButton label="Inviter" onPress={() => setInvites((x) => [...x, `nouveau.membre${x.length}@sotra.ci`])} />
      </View>
      <View style={styles.wrap}>
        {invites.map((e) => (
          <InputChip key={e} label={e} onRemove={() => setInvites((x) => x.filter((y) => y !== e))} />
        ))}
      </View>
    </ExGap>,
  ];
  return (
    <ExPage
      footer={
        <ExActionBar>
          <KitButton label="Retour" variant="ghost" onPress={step === 0 ? undefined : () => setStep(step - 1)} />
          <KitButton
            label={step === 3 ? 'Terminer' : 'Continuer'}
            onPress={() => (step === 3 ? snack.show('Espace configuré (démo)') : setStep(step + 1))}
          />
        </ExActionBar>
      }
    >
      <Text
        style={[font('400', 14), styles.mb8, { color: kit.textMuted }]}
      >{`Étape ${step + 1} sur 4 · ${STEPS[step]}`}</Text>
      <KitProgressBar value={(step + 1) / 4} />
      <View style={styles.h24} />
      <KitCard padding={space.l}>{bodies[step]}</KitCard>
    </ExPage>
  );
}

// ── Candidature ─────────────────────────────────────────────────────

const SECTIONS = ['Identité', 'Expérience', 'Documents', 'Prétentions', 'Signature'];

/** Candidature (`ApplicationFormExample` Flutter) : long formulaire à sections, barre d'envoi fixe. */
export function ApplicationFormExample() {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);
  const field = useFieldChain(4);
  const [skills, setSkills] = useState(['Angular', 'Flutter', 'TypeScript']);
  const [jobs, setJobs] = useState<[string, string][]>([['Développeur front-end', 'Orange CI · 2020 – 2024']]);
  if (sent)
    return (
      <ExPage>
        <KitCard>
          <ExSuccess
            title="Candidature envoyée"
            message="Nous étudions votre dossier et revenons vers vous sous 10 jours."
            onReset={() => setSent(false)}
          />
        </KitCard>
      </ExPage>
    );
  const section = (title: string, icon: string, child: ReactNode) => (
    <View style={styles.mb16}>
      <KitCard title={title} icon={icon}>
        {child}
      </KitCard>
    </View>
  );
  const narrow = width < breakpoints.md;
  const save = (
    <KitButton
      label="Enregistrer"
      variant="outline"
      expand={narrow}
      onPress={() => snack.show('Brouillon enregistré (démo)')}
    />
  );
  const send = (
    <KitButton label="Envoyer" icon="mi:send" expand={narrow} onPress={consent ? () => setSent(true) : undefined} />
  );
  const status = (
    <Text style={[font('400', 13), { color: kit.textMuted }]}>
      {consent ? 'Prêt à envoyer' : 'Brouillon enregistré · cochez la déclaration'}
    </Text>
  );
  return (
    <View style={styles.fill}>
      <View style={styles.fill}>
        <ExPage>
          <ExHeading title="Développeur·se front-end confirmé·e" subtitle="CDI · Abidjan, Plateau · Hybride" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chips, styles.mb16]}
          >
            {SECTIONS.map((s) => (
              <StatusBadge key={s} label={s} uppercase={false} />
            ))}
          </ScrollView>
          {section(
            'Identité',
            'mi:person-outline',
            <ExGap>
              <ExRow>
                <KitTextField label="Prénom" defaultValue="Mariam" {...field(0)} />
                <KitTextField label="Nom" defaultValue="Touré" {...field(1)} />
              </ExRow>
              <ExRow>
                <KitTextField
                  label="Date de naissance"
                  hint="jj/mm/aaaa"
                  keyboardType="numbers-and-punctuation"
                  {...field(2)}
                />
                <KitTextField label="Téléphone" hint="+225 07 …" keyboardType="phone-pad" {...field(3)} />
              </ExRow>
            </ExGap>,
          )}
          {section(
            'Expérience',
            'mi:work-outline',
            <ExGap>
              {jobs.map(([t, sub]) => (
                <View key={t} style={styles.rowGap8}>
                  <View style={styles.fill}>
                    <Text style={[font('400', 16), { color: kit.textPrimary }]}>{t}</Text>
                    <Text style={[font('400', 14), { color: kit.textSecondary }]}>{sub}</Text>
                  </View>
                  <KitIconButton
                    icon="mi:delete-outline"
                    accessibilityLabel={`Supprimer le poste ${t}`}
                    onPress={() => setJobs((j) => j.filter((x) => x[0] !== t))}
                  />
                </View>
              ))}
              <View style={styles.start}>
                <KitButton
                  label="Ajouter un poste"
                  icon="mi:add"
                  variant="outline"
                  onPress={() => setJobs((j) => [...j, [`Intégrateur web ${j.length}`, 'Freelance · 2018 – 2020']])}
                />
              </View>
              <View style={styles.wrap}>
                {skills.map((s) => (
                  <InputChip key={s} label={s} onRemove={() => setSkills((x) => x.filter((y) => y !== s))} />
                ))}
              </View>
            </ExGap>,
          )}
          {section(
            'Documents',
            'mi:attach-file',
            <ExGap>
              <KitTextField label="CV" defaultValue="cv-mariam-toure.pdf" readOnly icon="mi:picture-as-pdf" />
              <KitTextField label="Lettre de motivation" lines={3} />
            </ExGap>,
          )}
          {section(
            'Prétentions',
            'mi:payments',
            <ExRow>
              <KitTextField label="Salaire brut mensuel" defaultValue="850 000 F CFA" />
              <KitTextField label="Disponibilité" hint="jj/mm/aaaa" />
            </ExRow>,
          )}
          {section(
            'Signature',
            'mi:draw',
            <CheckboxTile
              value={consent}
              onChange={setConsent}
              title="Je certifie l’exactitude des informations fournies."
            />,
          )}
        </ExPage>
      </View>
      <View
        style={[
          styles.bar,
          { backgroundColor: kit.card, borderTopColor: kit.border, paddingBottom: insets.bottom + space.s3 },
        ]}
      >
        {narrow ? (
          <>
            {status}
            <View style={[styles.rowGap8, styles.mt8]}>
              <View style={styles.fill}>{save}</View>
              <View style={styles.fill}>{send}</View>
            </View>
          </>
        ) : (
          <View style={styles.rowGap8}>
            <View style={styles.fill}>{status}</View>
            {save}
            {send}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  start: { alignSelf: 'flex-start' },
  end: { flexDirection: 'row', justifyContent: 'flex-end' },
  center: { justifyContent: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  rowGap8: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  rowGap12: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  chips: { gap: space.s2 },
  h24: { height: space.l },
  mt8: { marginTop: space.s2 },
  mt16: { marginTop: space.s4 },
  mt24: { marginTop: space.l },
  mb8: { marginBottom: space.s2 },
  mb12: { marginBottom: space.s3 },
  mb16: { marginBottom: space.s4 },
  mv16: { marginVertical: space.s4 },
  nps: { height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  rating: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  rule: { height: 1, marginVertical: space.s1 },
  split: { flexDirection: 'row', alignItems: 'flex-start', gap: space.l },
  bar: { borderTopWidth: 1, paddingHorizontal: space.s3, paddingTop: space.s3 },
});
