import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  AddressField,
  ColorPickerField,
  CopyField,
  CurrencyInput,
  DateField,
  FormFieldLabel,
  KitButton,
  KitRangeSlider,
  MarkdownEditor,
  NumberStepper,
  OtpInput,
  PasswordField,
  RatingInput,
  RichTextEditor,
  SearchableSelect,
  SignaturePad,
  StatusBadge,
  TagInput,
  TransferList,
  TreeSelect,
  contrastOn,
} from '../components';
import { decimal1, number } from '../core/format';
import { useKitSnack } from '../core/snack';
import { DEMO_CLIENTS, DEMO_PLACES, ZONES_TREE } from '../data/showcase';
import { font, radius, space, useKitTheme } from '../theme';
import { Demo, DocPage, Gap, type DocSection } from './doc';

const MD_SAMPLE = `## Compte-rendu d’intervention

Balise **FMB920** remplacée sur *CI-4521-AB*.

- Antenne GPS repositionnée
- Firmware mis à jour en \`v03.28.07\`
- [x] Test de coupure moteur
- [ ] Formation du chauffeur

> Le client confirme la reprise du signal.`;

const RICH_SAMPLE =
  'Bonjour Monsieur Kouassi. Notre technicien passera vendredi entre 8 h et 10 h pour remplacer la balise du véhicule CI-4521-AB.';

/** `/components/fields` — champs complémentaires aux formulaires de base (`FieldsGallery` Flutter). */
export function FieldsGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [pin, setPin] = useState('');
  const [qty, setQty] = useState(3);
  const [duree, setDuree] = useState(12);
  const [temp, setTemp] = useState(4.5);
  const [amount, setAmount] = useState<[number | null, string]>([1250000, 'FCFA']);
  const [range, setRange] = useState<[number, number]>([20, 70]);
  const [rating, setRating] = useState(4);
  const [sat, setSat] = useState(0);
  const [color, setColor] = useState('#006a6a');
  const [zones, setZones] = useState(() => new Set(['marc', 'treich', 'yakro']));
  const [avail, setAvail] = useState([
    'Tableau de bord',
    'Alertes',
    'Rapports carburant',
    'Historique',
    'Géofences',
    'Maintenance',
    'Chauffeurs',
  ]);
  const [chosen, setChosen] = useState(['Position temps réel', 'Trajets']);
  const [tags, setTags] = useState(['urgent', 'abidjan-sud']);
  const [tags2, setTags2] = useState(['FMB920']);
  const [signed, setSigned] = useState(false);
  const [fType, setFType] = useState<string | null>(null);
  const [fDate, setFDate] = useState<Date | null>(null);
  const [fVeh, setFVeh] = useState(1);
  const [fPrio, setFPrio] = useState(2);
  const [fSubmitted, setFSubmitted] = useState(false);

  const sections: DocSection[] = [
    {
      id: 'otp',
      title: 'Code OTP / PIN',
      source: 'OtpInput',
      description:
        'Clavier numérique, remplissage automatique du code SMS (autofill), avance automatique et effacement arrière.',
      cols: 2,
      children: [
        <Demo
          key="otp"
          label="Code à 6 chiffres"
          hint="essayez 123456"
          code={`<OtpInput length={6} value={code} onChange={setCode} onCompleted={verify} />`}
        >
          <Gap>
            <OtpInput
              value={otp}
              error={otpError}
              onChange={(v) => {
                setOtp(v);
                setOtpError(false);
              }}
              onCompleted={(v) => {
                const ok = v === '123456';
                setOtpError(!ok);
                snack.show(ok ? 'Code vérifié' : 'Code incorrect', { kind: ok ? 'success' : 'error' });
              }}
            />
            <Text style={[styles.center, font('400', 12), { color: otpError ? kit.errorText : kit.textMuted }]}>
              {otpError ? 'Code incorrect, réessayez.' : `Saisi : ${otp || '—'}`}
            </Text>
            <KitButton
              label="Renvoyer le code"
              icon="mi:refresh"
              variant="ghost"
              style={styles.selfCenter}
              onPress={() => {
                setOtp('');
                setOtpError(false);
              }}
            />
          </Gap>
        </Demo>,
        <Demo key="pin" label="PIN masqué (4)">
          <OtpInput length={4} obscure value={pin} onChange={setPin} accessibilityLabel="Code PIN" />
        </Demo>,
      ],
    },
    {
      id: 'stepper',
      title: 'Nombre avec + / −',
      source: 'NumberStepper',
      cols: 3,
      children: [
        <Demo key="qty" label="Quantité">
          <View style={styles.centerItems}>
            <NumberStepper value={qty} min={1} max={20} onChange={setQty} accessibilityLabel="Quantité" />
          </View>
        </Demo>,
        <Demo key="unit" label="Avec unité et pas">
          <View style={styles.centerItems}>
            <NumberStepper
              value={duree}
              min={1}
              max={60}
              step={6}
              unit="mois"
              onChange={setDuree}
              accessibilityLabel="Durée"
            />
          </View>
        </Demo>,
        <Demo key="dec" label="Décimal">
          <View style={styles.centerItems}>
            <NumberStepper
              value={temp}
              min={-20}
              max={20}
              step={0.5}
              unit="°C"
              onChange={setTemp}
              accessibilityLabel="Température"
            />
          </View>
        </Demo>,
      ],
    },
    {
      id: 'currency',
      title: 'Montant / devise',
      source: 'CurrencyInput',
      description: 'Séparateur de milliers à la saisie, devise au choix, raccourcis de montant.',
      cols: 2,
      children: [
        <Demo key="fcfa" label="Montant FCFA">
          <Gap>
            <CurrencyInput
              initial={1250000}
              presets={[50000, 250000, 1000000, 5000000]}
              onChange={(a, c) => setAmount([a, c])}
            />
            <Text style={[font('400', 12), { color: kit.textMuted }]}>
              {`Valeur : ${amount[0] === null ? '—' : number(amount[0])} ${amount[1]}`}
            </Text>
          </Gap>
        </Demo>,
        <Demo key="single" label="Devise unique">
          <CurrencyInput currencies={['FCFA']} onChange={() => undefined} />
        </Demo>,
      ],
    },
    {
      id: 'range',
      title: 'Intervalle à double curseur',
      source: 'KitRangeSlider',
      children: (
        <Demo label="Plage de vitesse autorisée">
          <Gap>
            <View style={styles.row12}>
              <MiniBox label="Min" value={`${Math.round(range[0])} km/h`} />
              <MiniBox label="Max" value={`${Math.round(range[1])} km/h`} />
            </View>
            <KitRangeSlider
              start={range[0]}
              end={range[1]}
              min={0}
              max={130}
              divisions={26}
              accessibilityLabel="Vitesse autorisée"
              format={(v) => `${Math.round(v)} km/h`}
              onChange={(a, b) => setRange([a, b])}
            />
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'rating',
      title: 'Notation',
      source: 'RatingInput',
      cols: 3,
      children: [
        <Demo key="labels" label="Étoiles + libellé">
          <RatingInput
            value={rating}
            labels={['Mauvais', 'Passable', 'Correct', 'Très bien', 'Excellent']}
            onChange={setRating}
          />
        </Demo>,
        <Demo key="readonly" label="Lecture seule (demi-étoile)">
          <View style={styles.wrap8}>
            <RatingInput value={3.5} size={22} />
            <Text style={[font('400', 12), { color: kit.textSecondary }]}>{`${decimal1(3.5)} / 5 · 128 avis`}</Text>
          </View>
        </Demo>,
        <Demo key="custom" label="Icône personnalisée">
          <RatingInput
            value={sat}
            icon="mi:favorite"
            emptyIcon="mi:favorite-border"
            halfIcon="mi:favorite"
            color={kit.error}
            onChange={setSat}
            accessibilityLabel="Satisfaction"
          />
        </Demo>,
      ],
    },
    {
      id: 'color',
      title: 'Sélecteur de couleur',
      source: 'ColorPickerField',
      cols: 2,
      children: [
        <Demo key="picker" label="Couleur de la catégorie">
          <ColorPickerField value={color} onChange={setColor} />
        </Demo>,
        <Demo key="result" label="Résultat">
          <Gap>
            <View style={styles.row6}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={[font('400', 12, 'mono'), { color: kit.textPrimary }]}>{color.toUpperCase()}</Text>
              <StatusBadge label="Aperçu" tone="neutral" icon="palette-outline" uppercase={false} />
            </View>
            <View style={[styles.preview, { backgroundColor: color }]}>
              <Text style={[font('700', 14), { color: contrastOn(color) }]}>Catégorie « Poids lourds »</Text>
            </View>
          </Gap>
        </Demo>,
      ],
    },
    {
      id: 'rich-text',
      title: 'Éditeur de texte riche',
      source: 'RichTextEditor (remplace CKEditor / Quill)',
      description:
        'Sélectionnez du texte puis appliquez gras, italique, souligné, barré ou surlignage ; sans sélection, le style s’applique à la frappe suivante.',
      children: (
        <Demo label="Message au client" padding={space.s3}>
          <RichTextEditor initialText={RICH_SAMPLE} />
        </Demo>
      ),
    },
    {
      id: 'markdown',
      title: 'Éditeur Markdown',
      source: 'MarkdownEditor · MarkdownView',
      description: 'Barre d’outils qui insère la syntaxe, bascule Écrire / Aperçu, compteur de mots.',
      children: (
        <Demo label="Compte-rendu">
          <MarkdownEditor initial={MD_SAMPLE} />
        </Demo>
      ),
    },
    {
      id: 'signature',
      title: 'Signature',
      source: 'SignaturePad',
      description: 'Tracé lissé au doigt, couleur d’encre, épaisseur, annulation du dernier trait.',
      children: (
        <Demo label="Signature du client" hint={signed ? 'signé' : 'vide'}>
          <SignaturePad onChange={setSigned} />
        </Demo>
      ),
    },
    {
      id: 'tree-select',
      title: 'Sélection arborescente',
      source: 'TreeSelect',
      description: 'Cases en cascade avec état indéterminé, dépliage et filtre.',
      children: (
        <Demo label="Zones d’intervention">
          <TreeSelect nodes={ZONES_TREE} selected={zones} onChange={setZones} />
        </Demo>
      ),
    },
    {
      id: 'transfer',
      title: 'Liste de transfert',
      source: 'TransferList',
      description: 'Sur téléphone, les deux listes s’empilent avec les commandes de transfert entre elles.',
      children: (
        <Demo label="Modules de l’abonnement">
          <TransferList
            available={avail}
            chosen={chosen}
            leftTitle="Modules disponibles"
            rightTitle="Inclus"
            onChange={(a, b) => {
              setAvail(a);
              setChosen(b);
            }}
          />
        </Demo>
      ),
    },
    {
      id: 'tags',
      title: 'Tags libres avec suggestions',
      source: 'TagInput',
      cols: 2,
      children: [
        <Demo key="tags" label="Tags (Entrée ou virgule)">
          <TagInput
            tags={tags}
            suggestions={['urgent', 'vip', 'abidjan-sud', 'abidjan-nord', 'relance', 'contentieux', 'nouveau']}
            onChange={setTags}
          />
        </Demo>,
        <Demo key="limit" label="Limite (3 max)">
          <TagInput
            tags={tags2}
            max={3}
            hint="Modèle de balise…"
            suggestions={['FMB920', 'FMC130', 'GT06', 'TK103']}
            onChange={setTags2}
          />
        </Demo>,
      ],
    },
    {
      id: 'address',
      title: 'Adresse avec carte',
      source: 'AddressField (répertoire local, sans géocodeur)',
      description: 'Recherche insensible aux accents dans 16 adresses ivoiriennes.',
      children: (
        <Demo label="Adresse d’installation">
          <AddressField initial={DEMO_PLACES[3]} />
        </Demo>
      ),
    },
    {
      id: 'password',
      title: 'Mot de passe avec jauge',
      source: 'PasswordField',
      children: (
        <Demo label="Nouveau mot de passe">
          <PasswordField />
        </Demo>
      ),
    },
    {
      id: 'copy',
      title: 'Valeur à copier',
      source: 'CopyField',
      cols: 2,
      children: [
        <Demo key="id" label="Identifiant">
          <CopyField label="IMEI" value="356307042441013" icon="mi:memory" />
        </Demo>,
        <Demo key="secret" label="Secret masqué">
          <CopyField label="Clé d’API" value="lk_live_9f2c4e1a7b3d8e6f5a0c" secret icon="mi:key" />
        </Demo>,
      ],
    },
    {
      id: 'form',
      title: 'Formulaire complet (réactif)',
      source: 'champs avancés + validation',
      children: (
        <Demo label="Demande d’intervention">
          <View style={styles.gap14}>
            <SearchableSelect
              label="Type *"
              error={fSubmitted && !fType ? 'Sélection obligatoire' : undefined}
              options={[
                { value: 'installation', label: 'Installation' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'diagnostic', label: 'Diagnostic' },
              ]}
              value={fType}
              onChange={setFType}
            />
            <SearchableSelect
              label="Client"
              options={DEMO_CLIENTS.slice(0, 12).map((x) => ({
                value: x.id,
                label: x.raisonSociale,
                subtitle: x.ville,
              }))}
              value={null}
              onChange={() => undefined}
            />
            <DateField
              label="Date souhaitée *"
              value={fDate}
              error={fSubmitted && !fDate ? 'Date obligatoire' : undefined}
              onChange={setFDate}
            />
            <FormFieldLabel label="Nombre de véhicules">
              <View style={styles.start}>
                <NumberStepper
                  value={fVeh}
                  min={1}
                  max={50}
                  onChange={setFVeh}
                  accessibilityLabel="Nombre de véhicules"
                />
              </View>
            </FormFieldLabel>
            <FormFieldLabel label="Priorité">
              <RatingInput
                value={fPrio}
                icon="mi:local-fire-department"
                emptyIcon="mi:local-fire-department"
                halfIcon="mi:local-fire-department"
                color={kit.tertiary}
                max={4}
                labels={['Basse', 'Normale', 'Haute', 'Critique']}
                onChange={setFPrio}
                accessibilityLabel="Priorité"
              />
            </FormFieldLabel>
            <FormFieldLabel label="Adresse">
              <AddressField mapHeight={160} />
            </FormFieldLabel>
            <KitButton
              label="Envoyer la demande"
              icon="mi:send"
              onPress={() => {
                setFSubmitted(true);
                const ok = !!fType && !!fDate;
                snack.show(ok ? 'Demande envoyée (démo statique)' : 'Complétez les champs obligatoires', {
                  kind: ok ? 'success' : 'error',
                });
              }}
            />
          </View>
        </Demo>
      ),
    },
  ];

  return (
    <DocPage
      title="Champs avancés"
      icon="mi:dynamic-form"
      initialSection={initialSection}
      testID="category-fields"
      subtitle="Types de champs complémentaires, alignés sur le motif « field-box » : codes OTP, nombres, montants FCFA, intervalles, notation, couleur, éditeurs, signature, sélection arborescente, transfert, tags, adresse, mot de passe et valeurs à copier."
      sections={sections}
    />
  );
}

function MiniBox({ label, value }: { label: string; value: string }) {
  const { kit } = useKitTheme();
  return (
    <View style={[styles.mini, { backgroundColor: kit.fieldBg }]}>
      <Text style={[font('400', 11), { color: kit.textMuted }]}>{label}</Text>
      <Text style={[font('700', 14), { color: kit.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  centerItems: { alignItems: 'center' },
  start: { alignItems: 'flex-start' },
  selfCenter: { alignSelf: 'center' },
  row12: { flexDirection: 'row', gap: 12 },
  row6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  wrap8: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 4 },
  gap14: { gap: 14 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  preview: { height: 90, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  mini: { flex: 1, borderRadius: radius.md, paddingHorizontal: space.s3, paddingVertical: space.s2 },
});
