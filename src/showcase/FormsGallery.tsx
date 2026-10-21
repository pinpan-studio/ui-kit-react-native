import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HelperText, Icon, Menu, SegmentedButtons, TextInput, TouchableRipple } from 'react-native-paper';

import {
  CheckboxTile,
  DateField,
  DateRangeField,
  DropZone,
  DEMO_FILES,
  EmptyState,
  EntityAutocomplete,
  FieldTrigger,
  FileUploadField,
  FilterDropdown,
  FormFieldLabel,
  FormSheet,
  KitAvatar,
  KitButton,
  KitCalendar,
  KitCard,
  KitChip,
  KitRangeSlider,
  KitSearchBar,
  KitSlider,
  KitTextField,
  MultiSelectField,
  RadioTile,
  SearchableSelect,
  StatusBadge,
  SwitchTile,
  TimeField,
  type DateRange,
  type DemoFile,
  type SelectOption,
  type TimeOfDay,
} from '../components';
import { useKitSnack } from '../core/snack';
import {
  CLIENT_STATUTS,
  DEMO_CLIENTS,
  SECTEURS,
  STATUT_LABEL,
  STATUT_TONE,
  VILLES,
  type ClientStatut,
  type DemoClient,
} from '../data/showcase';
import { font, radius, space, useKitTheme } from '../theme';
import { Demo, DemoWrap, DocPage, Gap, type DocSection } from './doc';

const VILLE_OPTIONS: SelectOption<string>[] = VILLES.map((v) => ({ value: v, label: v, icon: 'mi:location-on' }));
const SECTEUR_OPTIONS: SelectOption<string>[] = SECTEURS.map((s) => ({ value: s, label: s }));
const PRIORITES: SelectOption<string>[] = [
  { value: 'basse', label: 'Basse', tone: 'neutral' },
  { value: 'normale', label: 'Normale', tone: 'info' },
  { value: 'haute', label: 'Haute', tone: 'warning' },
  { value: 'critique', label: 'Critique', tone: 'error' },
];
const TRUCK = require('../../assets/images/camion.png');

type CrudMode = 'create' | 'edit' | 'view';

const required = (v: string) => (v.trim() ? null : 'Champ obligatoire');

/** `/components/forms` — champs, sélecteurs, dates, choix, upload, recherche, validation (`FormsGallery` Flutter). */
export function FormsGallery({ initialSection }: { initialSection?: string }) {
  const { kit } = useKitTheme();
  const snack = useKitSnack();
  const [showPwd, setShowPwd] = useState(false);
  const [desc, setDesc] = useState('Balise hors ligne depuis lundi. Le client demande un passage avant vendredi.');
  const [ville, setVille] = useState<string | null>('Abidjan');
  const [priorite, setPriorite] = useState<string | null>('haute');
  const [secteur, setSecteur] = useState<string | null>(null);
  const [errorSelect, setErrorSelect] = useState<string | null>(null);
  const [statutMenu, setStatutMenu] = useState(false);
  const [statut, setStatut] = useState<ClientStatut>('actif');
  const [multi, setMulti] = useState(['Abidjan', 'Bouaké']);
  const [chips, setChips] = useState(['Transport', 'Logistique']);
  const [client, setClient] = useState<DemoClient | null>(null);
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 24));
  const [date2, setDate2] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange | null>(null);
  const [shortcut, setShortcut] = useState('');
  const [time, setTime] = useState<TimeOfDay | null>({ hour: 8, minute: 30 });
  const [slot, setSlot] = useState(1);
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [cguTouched, setCguTouched] = useState(false);
  const [perms, setPerms] = useState<Record<string, boolean>>({ Lecture: true, Écriture: true, Suppression: false });
  const [radio, setRadio] = useState('mensuel');
  const [plan, setPlan] = useState('standard');
  const [notif, setNotif] = useState(true);
  const [sms, setSms] = useState(false);
  const [toggle, setToggle] = useState('semaine');
  const [slider, setSlider] = useState(60);
  const [sliderRange, setSliderRange] = useState<[number, number]>([150000, 2500000]);
  const [file, setFile] = useState<DemoFile | null>(null);
  const [file2, setFile2] = useState<DemoFile | null>(DEMO_FILES[0] ?? null);
  const [photo, setPhoto] = useState<DemoFile | null>(null);
  const [drop, setDrop] = useState<DemoFile[]>(DEMO_FILES[2] ? [DEMO_FILES[2]] : []);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('all');
  const [villeFilter, setVilleFilter] = useState('');
  const [form, setForm] = useState({ raison: '', email: '', tel: '', vehicules: '' });
  const [formSecteur, setFormSecteur] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [crud, setCrud] = useState<CrudMode | null>(null);
  const [crudRaison, setCrudRaison] = useState('');
  const [crudVille, setCrudVille] = useState<string | null>(null);

  const allPerms = Object.values(perms).every(Boolean);
  const nonePerms = Object.values(perms).every((v) => !v);

  const q = search.toLowerCase();
  const results = DEMO_CLIENTS.filter(
    (x) =>
      (!q || x.raisonSociale.toLowerCase().includes(q) || x.code.toLowerCase().includes(q)) &&
      (statutFilter === 'all' || x.statut === statutFilter) &&
      (!villeFilter || x.ville === villeFilter),
  );

  const errors = {
    raison: required(form.raison),
    email:
      required(form.email) ??
      (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(form.email.trim()) ? null : 'Adresse e-mail invalide'),
    tel: !form.tel || form.tel.length === 19 ? null : 'Numéro incomplet',
    secteur: formSecteur ? null : 'Sélection obligatoire',
    vehicules: (() => {
      const n = Number(form.vehicules);
      if (!form.vehicules || Number.isNaN(n)) return 'Champ obligatoire';
      return n < 1 || n > 500 ? 'Entre 1 et 500' : null;
    })(),
  };
  const shown = (e: string | null) => (submitted ? (e ?? undefined) : undefined);

  const preset = (key: string, days: number) => {
    const now = new Date();
    setShortcut(key);
    setRange({ start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - days), end: now });
  };

  const openCrud = (mode: CrudMode) => {
    const c = DEMO_CLIENTS[0];
    setCrudRaison(mode === 'create' ? '' : (c?.raisonSociale ?? ''));
    setCrudVille(mode === 'create' ? null : (c?.ville ?? null));
    setCrud(mode);
  };
  const first = DEMO_CLIENTS[0];
  const ro = crud === 'view';

  const sections: DocSection[] = [
    {
      id: 'input',
      title: 'Input',
      source: 'KitTextField · FormFieldLabel (.form-field > .field-box)',
      description: 'Motif maison : libellé au-dessus, champ sur fond surface-high, bordure primaire au focus.',
      cols: 3,
      children: [
        <Demo
          key="default"
          label="Default"
          code={`<KitTextField label="Raison sociale" hint="Ex : Transports Yao & Fils" />`}
        >
          <KitTextField label="Raison sociale" hint="Ex : Transports Yao & Fils" />
        </Demo>,
        <Demo key="filled" label="Filled">
          <KitTextField label="Code client" defaultValue="CLI-1043" icon="mi:tag" />
        </Demo>,
        <Demo key="disabled" label="Disabled">
          <KitTextField label="Créé par" defaultValue="Système" enabled={false} />
        </Demo>,
        <Demo key="readonly" label="Readonly">
          <KitTextField label="Référence" defaultValue="CLI-1043" readOnly icon="mi:lock-outline" />
        </Demo>,
        <Demo key="error" label="Error">
          <KitTextField
            label="E-mail"
            defaultValue="jean.kouassi@"
            icon="mi:alternate-email"
            errorText="Adresse e-mail invalide"
            suffix={<Icon source="mi:error" size={24} color={kit.error} />}
          />
        </Demo>,
        <Demo key="success" label="Success">
          <KitTextField
            label="Identifiant"
            defaultValue="transports.yao"
            helper="Disponible ✓"
            success
            suffix={<Icon source="mi:check-circle" size={24} color={kit.success} />}
          />
        </Demo>,
        <Demo key="required" label="Required">
          <KitTextField
            label="Téléphone"
            required
            hint="+225 07 00 00 00 00"
            keyboardType="phone-pad"
            icon="mi:phone"
          />
        </Demo>,
        <Demo key="action" label="With icon / action">
          <KitTextField
            label="Site web"
            defaultValue="transports-yao.ci"
            icon="mi:language"
            suffix={
              <TouchableRipple
                onPress={() => snack.copy('transports-yao.ci')}
                borderless
                accessibilityRole="button"
                accessibilityLabel="Copier"
                style={styles.suffixBtn}
              >
                <Icon source="mi:content-copy" size={18} color={kit.textSecondary} />
              </TouchableRipple>
            }
          />
        </Demo>,
        <Demo key="helper" label="With helper text">
          <KitTextField
            label="IMEI"
            hint="15 chiffres"
            helper="Inscrit au dos du boîtier GPS."
            keyboardType="number-pad"
          />
        </Demo>,
        <Demo key="loading" label="Loading">
          <KitTextField
            label="Vérification du compte"
            defaultValue="CI-4521-AB"
            suffix={<ActivityIndicator size={16} color={kit.primary} accessibilityLabel="Vérification en cours" />}
          />
        </Demo>,
        <Demo key="password" label="Password">
          <KitTextField
            label="Mot de passe"
            defaultValue="Abidjan2026!"
            obscure={!showPwd}
            icon="mi:lock-outline"
            suffix={
              <TouchableRipple
                onPress={() => setShowPwd(!showPwd)}
                borderless
                accessibilityRole="button"
                accessibilityLabel={showPwd ? 'Masquer' : 'Afficher'}
                style={styles.suffixBtn}
              >
                <Icon source={showPwd ? 'mi:visibility-off' : 'mi:visibility'} size={20} color={kit.textSecondary} />
              </TouchableRipple>
            }
          />
        </Demo>,
      ],
    },
    {
      id: 'input-material',
      title: 'Input Material (outline / fill)',
      source: 'TextInput mode="outlined" | "flat"',
      description: 'Champs à libellé flottant des écrans de compte (connexion, profil).',
      cols: 3,
      children: [
        <Demo key="outline" label="Outline">
          <TextInput
            mode="outlined"
            label="Nom complet"
            placeholder="Prénom(s) Nom"
            left={<TextInput.Icon icon="mi:person-outline" />}
            outlineStyle={styles.outline}
          />
        </Demo>,
        <Demo key="outline-error" label="Outline — erreur">
          <TextInput mode="outlined" label="Email" error outlineStyle={styles.outline} />
          <HelperText type="error" padding="none">
            Ce champ est obligatoire
          </HelperText>
        </Demo>,
        <Demo key="fill" label="Fill — disabled">
          <TextInput mode="flat" label="E-mail" disabled value="jean.kouassi@transports-yao.ci" />
        </Demo>,
      ],
    },
    {
      id: 'textarea',
      title: 'Textarea',
      source: 'KitTextField lines={…}',
      cols: 3,
      children: [
        <Demo key="default" label="Default">
          <KitTextField label="Description" hint="Décrivez la demande…" lines={3} />
        </Demo>,
        <Demo key="counter" label="Filled + compteur">
          <KitTextField label="Commentaire" value={desc} onChangeText={setDesc} lines={3} maxLength={200} counter />
        </Demo>,
        <Demo key="disabled" label="Disabled">
          <KitTextField
            label="Note interne"
            defaultValue="Client prioritaire — contrat cadre 2026."
            lines={3}
            enabled={false}
          />
        </Demo>,
      ],
    },
    {
      id: 'mask',
      title: 'Masque de saisie',
      source: 'KitTextField mask="…" (# chiffre · A lettre · * alphanumérique)',
      description: 'Le clavier adapté s’ouvre automatiquement (numérique pour téléphone et dates).',
      cols: 2,
      children: [
        <Demo
          key="phone"
          label="Téléphone"
          code={`<KitTextField keyboardType="phone-pad"\n  mask="+225 ## ## ## ## ##" />`}
        >
          <KitTextField
            label="Téléphone"
            hint="+225 07 00 00 00 00"
            keyboardType="phone-pad"
            icon="mi:phone"
            mask="+225 ## ## ## ## ##"
          />
        </Demo>,
        <Demo key="plate" label="Immatriculation">
          <KitTextField
            label="Immatriculation"
            hint="1234 AB 01"
            icon="mi:directions-car"
            mask="#### AA ##"
            autoCapitalize="characters"
          />
        </Demo>,
        <Demo key="birth" label="Date saisie au clavier">
          <KitTextField
            label="Date de naissance"
            hint="JJ/MM/AAAA"
            keyboardType="number-pad"
            icon="mi:cake"
            mask="##/##/####"
          />
        </Demo>,
        <Demo key="prefix" label="Code avec préfixe">
          <KitTextField label="Code client" hint="CLI-00000" icon="mi:tag" mask="CLI-#####" keyboardType="number-pad" />
        </Demo>,
      ],
    },
    {
      id: 'select',
      title: 'Select',
      source: 'SearchableSelect · Menu',
      description: 'Sur mobile, la liste s’ouvre en feuille basse avec recherche dès 7 options.',
      cols: 3,
      children: [
        <Demo
          key="sheet"
          label="Sélecteur (feuille)"
          code={`<SearchableSelect
  label="Ville"
  options={villes}
  value={ville}
  onChange={setVille}
/>`}
        >
          <SearchableSelect label="Ville" options={VILLE_OPTIONS} value={ville} onChange={setVille} />
        </Demo>,
        <Demo key="tones" label="Avec pastilles de couleur">
          <SearchableSelect
            label="Priorité"
            placeholder="Priorité…"
            options={PRIORITES}
            value={priorite}
            onChange={setPriorite}
          />
        </Demo>,
        <Demo key="null" label="Vide + allowNull">
          <SearchableSelect
            label="Secteur"
            placeholder="Sélectionner un secteur…"
            allowNull
            options={SECTEUR_OPTIONS}
            value={secteur}
            onChange={setSecteur}
          />
        </Demo>,
        <Demo key="disabled" label="Disabled">
          <SearchableSelect
            label="Pays"
            enabled={false}
            options={[{ value: 'ci', label: 'Côte d’Ivoire' }]}
            value="ci"
            onChange={() => undefined}
          />
        </Demo>,
        <Demo key="menu" label="Natif (menu)">
          <FormFieldLabel label="Statut">
            <Menu
              visible={statutMenu}
              onDismiss={() => setStatutMenu(false)}
              anchor={
                <FieldTrigger
                  text={STATUT_LABEL[statut]}
                  accessibilityLabel="Statut"
                  onPress={() => setStatutMenu(true)}
                  trailing={<Icon source="mi:arrow-drop-down" size={24} color={kit.textSecondary} />}
                />
              }
            >
              {CLIENT_STATUTS.map((s) => (
                <Menu.Item
                  key={s}
                  title={STATUT_LABEL[s]}
                  onPress={() => {
                    setStatut(s);
                    setStatutMenu(false);
                  }}
                />
              ))}
            </Menu>
          </FormFieldLabel>
        </Demo>,
        <Demo key="error" label="Erreur">
          <SearchableSelect
            label="Type d’intervention"
            placeholder="Choisir…"
            error={errorSelect ? undefined : 'Sélection obligatoire'}
            options={[
              { value: 'inst', label: 'Installation' },
              { value: 'maint', label: 'Maintenance' },
              { value: 'diag', label: 'Diagnostic' },
            ]}
            value={errorSelect}
            onChange={setErrorSelect}
          />
        </Demo>,
      ],
    },
    {
      id: 'multi-select',
      title: 'Multi-select',
      source: 'MultiSelectField · InputChip',
      cols: 2,
      children: [
        <Demo key="multi" label="Sélection multiple">
          <MultiSelectField
            label="Villes couvertes"
            placeholder="Choisir des villes"
            options={VILLE_OPTIONS}
            values={multi}
            onChange={setMulti}
          />
        </Demo>,
        <Demo key="chips" label="Chips">
          <FormFieldLabel label="Secteurs">
            <DemoWrap spacing={space.s2}>
              {SECTEURS.map((s) => (
                <KitChip
                  key={s}
                  label={s}
                  icon={chips.includes(s) ? 'mi:check' : undefined}
                  selected={chips.includes(s)}
                  onPress={() => setChips(chips.includes(s) ? chips.filter((x) => x !== s) : [...chips, s])}
                />
              ))}
            </DemoWrap>
          </FormFieldLabel>
        </Demo>,
      ],
    },
    {
      id: 'autocomplete',
      title: 'Autocomplete',
      source: 'EntityAutocomplete',
      description: 'Recherche filtrée en mémoire dans 40 clients (raison sociale ou code).',
      cols: 2,
      children: [
        <Demo
          key="entity"
          label="Entité (client)"
          code={`<EntityAutocomplete
  items={clients}
  display={(c) => c.raisonSociale}
  subtitle={(c) => \`\${c.code} · \${c.ville}\`}
  onSelect={select}
/>`}
        >
          <Gap>
            <EntityAutocomplete
              items={DEMO_CLIENTS}
              hint="Rechercher un client…"
              display={(x) => x.raisonSociale}
              subtitle={(x) => `${x.code} · ${x.ville}`}
              onSelect={setClient}
            />
            {client ? (
              <View style={styles.row}>
                <StatusBadge label={STATUT_LABEL[client.statut]} tone={STATUT_TONE[client.statut]} />
                <Text style={[font('400', 12), styles.fill, { color: kit.textSecondary }]}>
                  {`${client.contact} · ${client.telephone}`}
                </Text>
              </View>
            ) : null}
          </Gap>
        </Demo>,
        <Demo key="simple" label="Suggestions simples">
          <EntityAutocomplete
            items={VILLES}
            display={(v) => v}
            hint="Commencez à taper…"
            icon="mi:location-on"
            avatar={false}
            startsWith
          />
        </Demo>,
      ],
    },
    {
      id: 'date',
      title: 'Date picker',
      source: 'DateField · KitCalendar (fr-FR)',
      cols: 3,
      children: [
        <Demo key="field" label="field-box">
          <DateField label="Date d’installation" value={date} onChange={setDate} />
        </Demo>,
        <Demo key="bounds" label="Bornes (2026)">
          <DateField
            label="Échéance"
            value={date2}
            first={new Date(2026, 0, 1)}
            last={new Date(2026, 11, 31)}
            onChange={setDate2}
          />
        </Demo>,
        <Demo key="inline" label="Calendrier inline" flush>
          <KitCalendar
            value={date ?? new Date(2026, 9, 24)}
            first={new Date(2024, 0, 1)}
            last={new Date(2028, 11, 31)}
            onSelect={setDate}
          />
        </Demo>,
      ],
    },
    {
      id: 'date-range',
      title: 'Date range',
      source: 'DateRangeField',
      cols: 2,
      children: [
        <Demo key="range" label="Période">
          <DateRangeField
            label="Période"
            value={range}
            onChange={(r) => {
              setRange(r);
              setShortcut('');
            }}
          />
        </Demo>,
        <Demo key="shortcuts" label="Raccourcis de période">
          <Gap>
            <DemoWrap spacing={space.s2}>
              {(
                [
                  ['7', '7 jours', 7],
                  ['30', '30 jours', 30],
                  ['90', '3 mois', 90],
                  ['365', '12 mois', 365],
                ] as const
              ).map(([k, l, d]) => (
                <KitChip key={k} label={l} selected={shortcut === k} onPress={() => preset(k, d)} />
              ))}
            </DemoWrap>
            <DateRangeField value={range} onChange={setRange} />
          </Gap>
        </Demo>,
      ],
    },
    {
      id: 'time',
      title: 'Time picker',
      source: 'TimeField (24 h)',
      cols: 2,
      children: [
        <Demo key="time" label="Heure">
          <TimeField label="Heure de passage" value={time} onChange={setTime} />
        </Demo>,
        <Demo key="slots" label="Créneau (puces)">
          <FormFieldLabel label="Créneau">
            <DemoWrap spacing={space.s2}>
              {['08:00 – 10:00', '10:00 – 12:00', '14:00 – 16:00', '16:00 – 18:00'].map((s, i) => (
                <KitChip key={s} label={s} selected={slot === i} onPress={() => setSlot(i)} />
              ))}
            </DemoWrap>
          </FormFieldLabel>
        </Demo>,
      ],
    },
    {
      id: 'checkbox',
      title: 'Checkbox',
      source: 'KitCheckbox · CheckboxTile',
      cols: 3,
      children: [
        <Demo key="states" label="États">
          <CheckboxTile value={c1} onChange={setC1} title="Coché" />
          <CheckboxTile value={c2} onChange={setC2} title="Non coché" />
          <CheckboxTile value title="Désactivé" disabled />
        </Demo>,
        <Demo key="tristate" label="Indéterminé (tout sélectionner)">
          <CheckboxTile
            value={allPerms ? true : nonePerms ? false : null}
            bold
            title="Toutes les permissions"
            onChange={() =>
              setPerms(Object.fromEntries(Object.keys(perms).map((k) => [k, !allPerms])) as Record<string, boolean>)
            }
          />
          {Object.keys(perms).map((k) => (
            <CheckboxTile
              key={k}
              value={perms[k] ?? false}
              dense
              indent={28}
              title={k}
              onChange={(v) => setPerms({ ...perms, [k]: v })}
            />
          ))}
        </Demo>,
        <Demo key="error" label="Erreur (CGU)">
          <Gap>
            <CheckboxTile
              value={cgu}
              onChange={setCgu}
              error={cguTouched && !cgu}
              title="J’accepte les conditions générales"
              subtitle={cguTouched && !cgu ? 'Obligatoire pour continuer' : undefined}
            />
            <KitButton label="Continuer" onPress={() => setCguTouched(true)} />
          </Gap>
        </Demo>,
      ],
    },
    {
      id: 'radio',
      title: 'Radio',
      source: 'RadioTile · cartes de choix',
      cols: 2,
      children: [
        <Demo key="vertical" label="Vertical">
          <View accessibilityRole="radiogroup">
            <RadioTile value="mensuel" selected={radio} onSelect={setRadio} title="Facturation mensuelle" />
            <RadioTile value="trimestriel" selected={radio} onSelect={setRadio} title="Trimestrielle" subtitle="−5 %" />
            <RadioTile value="annuel" selected={radio} onSelect={setRadio} title="Annuelle" subtitle="−12 %" />
          </View>
        </Demo>,
        <Demo key="cards" label="Cartes de choix">
          <View accessibilityRole="radiogroup" style={styles.gap8}>
            {(
              [
                ['essentiel', 'Essentiel', '9 900 F / mois', 'mi:gps-fixed'],
                ['standard', 'Standard', '14 500 F / mois', 'mi:verified'],
                ['premium', 'Premium', '24 000 F / mois', 'mi:workspace-premium'],
              ] as const
            ).map(([k, t, p, ic]) => (
              <ChoiceCard key={k} icon={ic} title={t} subtitle={p} selected={plan === k} onPress={() => setPlan(k)} />
            ))}
          </View>
        </Demo>,
      ],
    },
    {
      id: 'toggle',
      title: 'Toggle',
      source: 'SwitchTile · SegmentedButtons',
      cols: 2,
      children: [
        <Demo key="switch" label="Switch">
          <SwitchTile
            value={notif}
            onChange={setNotif}
            title="Notifications push"
            subtitle="Alertes de zone et de vitesse"
          />
          <SwitchTile value={sms} onChange={setSms} title="Rappel SMS au client" />
          <SwitchTile value={false} title="Désactivé" disabled />
        </Demo>,
        <Demo key="segmented" label="Button toggle">
          <SegmentedButtons
            value={toggle}
            onValueChange={setToggle}
            buttons={[
              { value: 'jour', label: 'Jour', icon: 'mi:today', showSelectedCheck: true },
              { value: 'semaine', label: 'Semaine', icon: 'mi:view-week', showSelectedCheck: true },
              { value: 'mois', label: 'Mois', icon: 'mi:calendar-month', showSelectedCheck: true },
            ]}
          />
        </Demo>,
      ],
    },
    {
      id: 'slider',
      title: 'Slider',
      source: 'KitSlider · KitRangeSlider',
      cols: 2,
      children: [
        <Demo key="simple" label="Valeur simple">
          <FormFieldLabel label={`Seuil d’alerte vitesse : ${Math.round(slider)} km/h`}>
            <KitSlider
              value={slider}
              min={30}
              max={130}
              divisions={20}
              onChange={setSlider}
              accessibilityLabel="Seuil d’alerte vitesse"
              valueText={`${Math.round(slider)} km/h`}
            />
          </FormFieldLabel>
        </Demo>,
        <Demo key="range" label="Intervalle">
          <FormFieldLabel
            label={`CA mensuel : ${Math.round(sliderRange[0] / 1000)} k – ${Math.round(sliderRange[1] / 1000)} k FCFA`}
          >
            <KitRangeSlider
              start={sliderRange[0]}
              end={sliderRange[1]}
              min={0}
              max={5000000}
              divisions={50}
              accessibilityLabel="CA mensuel"
              format={(v) => `${Math.round(v / 1000)} k FCFA`}
              onChange={(a, b) => setSliderRange([a, b])}
            />
          </FormFieldLabel>
        </Demo>,
      ],
    },
    {
      id: 'upload',
      title: 'File upload',
      source: 'FileUploadField · DropZone (local, sans envoi)',
      description:
        'Le choix de fichier est simulé (fichiers de démonstration) : aucun accès au stockage ni envoi réseau.',
      cols: 2,
      children: [
        <Demo key="empty" label="Champ — vide">
          <FileUploadField label="Pièce jointe" file={file} onChange={setFile} />
        </Demo>,
        <Demo key="filled" label="Champ — fichier joint">
          <FileUploadField label="Document" file={file2} onChange={setFile2} />
        </Demo>,
        <Demo key="photo" label="Photo">
          <View style={styles.photoRow}>
            <View style={[styles.photo, { backgroundColor: kit.fieldBg }]}>
              {photo ? (
                <Image source={TRUCK} style={styles.photoImg} accessibilityLabel="Photo du véhicule" />
              ) : (
                <Icon source="mi:add-a-photo" size={24} color={kit.textMuted} />
              )}
            </View>
            <View style={styles.fill}>
              <FileUploadField placeholder="Photo" icon="mi:photo-camera" file={photo} onChange={setPhoto} />
            </View>
          </View>
        </Demo>,
        <Demo key="drop" label="Zone de dépôt">
          <DropZone files={drop} onChange={setDrop} />
        </Demo>,
        <Demo key="disabled" label="Disabled">
          <FileUploadField label="Pièce justificative" enabled={false} file={null} onChange={() => undefined} />
        </Demo>,
      ],
    },
    {
      id: 'search',
      title: 'Search',
      source: 'KitSearchBar · FilterDropdown',
      description: 'Recherche unifiée avec filtres en puces ; le résultat se met à jour en direct.',
      children: [
        <Demo key="unified" label="Recherche unifiée + filtres">
          <Gap>
            <KitSearchBar hint="Rechercher par code, raison sociale…" value={search} onChangeText={setSearch} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              <FilterDropdown
                label="Statut"
                value={statutFilter}
                allValue="all"
                options={[
                  { value: 'all', label: 'Tous' },
                  ...CLIENT_STATUTS.map((s) => ({ value: s, label: STATUT_LABEL[s], tone: STATUT_TONE[s] })),
                ]}
                onChange={setStatutFilter}
              />
              <FilterDropdown
                label="Ville"
                icon="mi:public"
                value={villeFilter}
                allValue=""
                options={[{ value: '', label: 'Toutes', icon: 'mi:public' }, ...VILLE_OPTIONS]}
                onChange={setVilleFilter}
              />
            </ScrollView>
            <Text accessibilityLiveRegion="polite" style={[font('400', 12), { color: kit.textMuted }]}>
              {`${results.length} résultat(s)`}
            </Text>
            {results.length === 0 ? (
              <EmptyState
                compact
                icon="mi:search-off"
                title="Aucun résultat"
                subtitle="Ajustez votre recherche ou vos filtres."
              />
            ) : (
              results.slice(0, 4).map((x) => (
                <View key={x.id} style={styles.result}>
                  <KitAvatar name={x.raisonSociale} />
                  <View style={styles.fill}>
                    <Text style={[font('500', 14), { color: kit.textPrimary }]}>{x.raisonSociale}</Text>
                    <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{`${x.code} · ${x.ville}`}</Text>
                  </View>
                  <StatusBadge label={STATUT_LABEL[x.statut]} tone={STATUT_TONE[x.statut]} />
                </View>
              ))
            )}
          </Gap>
        </Demo>,
        <Demo key="compact" label="Barre compacte (.m3-search-bar)">
          <KitSearchBar
            trailing={
              <TouchableRipple
                borderless
                onPress={() => undefined}
                accessibilityRole="button"
                accessibilityLabel="Filtres"
                style={styles.suffixBtn}
              >
                <Icon source="mi:tune" size={20} color={kit.textSecondary} />
              </TouchableRipple>
            }
          />
        </Demo>,
      ],
    },
    {
      id: 'validation',
      title: 'Form validation',
      source: 'état soumis + validateurs par champ',
      description: 'Validation à la soumission puis en direct ; les erreurs apparaissent sous chaque champ.',
      children: (
        <Demo
          label="Formulaire client"
          code={`const errors = { raison: required(form.raison), … };
<KitTextField label="Raison sociale" required
  errorText={submitted ? errors.raison : undefined} />`}
        >
          <View key={formKey} style={styles.gap14}>
            <KitTextField
              label="Raison sociale"
              required
              hint="Ex : Bolloré Logistics CI"
              errorText={shown(errors.raison)}
              onChangeText={(v) => setForm({ ...form, raison: v })}
            />
            <KitTextField
              label="E-mail"
              required
              hint="contact@societe.ci"
              keyboardType="email-address"
              autoCapitalize="none"
              errorText={shown(errors.email)}
              onChangeText={(v) => setForm({ ...form, email: v })}
            />
            <KitTextField
              label="Téléphone"
              hint="+225 07 00 00 00 00"
              keyboardType="phone-pad"
              mask="+225 ## ## ## ## ##"
              errorText={shown(errors.tel)}
              onChangeText={(v) => setForm({ ...form, tel: v })}
            />
            <SearchableSelect
              label="Secteur *"
              placeholder="Choisir…"
              options={SECTEUR_OPTIONS}
              value={formSecteur}
              error={shown(errors.secteur)}
              onChange={setFormSecteur}
            />
            <KitTextField
              label="Nombre de véhicules"
              hint="1 – 500"
              keyboardType="number-pad"
              errorText={shown(errors.vehicules)}
              onChangeText={(v) => setForm({ ...form, vehicules: v.replace(/\D/g, '') })}
            />
            <View style={styles.actions}>
              <KitButton
                label="Réinitialiser"
                variant="outline"
                expand
                style={styles.fill}
                onPress={() => {
                  setForm({ raison: '', email: '', tel: '', vehicules: '' });
                  setFormSecteur(null);
                  setSubmitted(false);
                  setFormKey((k) => k + 1);
                }}
              />
              <KitButton
                label="Enregistrer"
                expand
                style={styles.fill}
                onPress={() => {
                  setSubmitted(true);
                  const ok = Object.values(errors).every((e) => e === null);
                  snack.show(ok ? 'Client enregistré (démo statique)' : 'Corrigez les champs en erreur', {
                    kind: ok ? 'success' : 'error',
                  });
                }}
              />
            </View>
          </View>
        </Demo>
      ),
    },
    {
      id: 'crud-dialog',
      title: 'Formulaire en modale',
      source: 'FormSheet (CrudDialog)',
      description:
        'Sur mobile, la modale de formulaire devient une feuille quasi plein écran, actions collées en bas, clavier pris en compte.',
      children: (
        <Demo
          label="Modes create / edit / view"
          code={`<FormSheet visible={open} title="Nouveau client"
  onSubmit={save} onDismiss={close}>
  …
</FormSheet>`}
        >
          <DemoWrap>
            <KitButton label="Créer" icon="mi:add" onPress={() => openCrud('create')} />
            <KitButton label="Modifier" icon="mi:edit" variant="secondary" onPress={() => openCrud('edit')} />
            <KitButton label="Consulter" icon="mi:visibility" variant="ghost" onPress={() => openCrud('view')} />
          </DemoWrap>
          <FormSheet
            visible={crud !== null}
            onDismiss={() => setCrud(null)}
            title={
              crud === 'create'
                ? 'Nouveau client'
                : crud === 'edit'
                  ? 'Modifier le client'
                  : (first?.raisonSociale ?? '')
            }
            subtitle={crud === 'create' ? undefined : first?.code}
            icon={crud === 'create' ? 'mi:person-add' : crud === 'edit' ? 'mi:edit' : 'mi:visibility'}
            readOnly={ro}
            submitLabel={crud === 'create' ? 'Créer' : 'Enregistrer'}
            onSubmit={() => {
              if (!crudRaison.trim()) return;
              setCrud(null);
              snack.show(`« ${crudRaison} » enregistré (démo statique)`, { kind: 'success' });
            }}
          >
            <KitTextField
              label="Raison sociale"
              required={!ro}
              value={crudRaison}
              readOnly={ro}
              onChangeText={setCrudRaison}
            />
            <SearchableSelect
              label="Ville"
              options={VILLE_OPTIONS}
              value={crudVille}
              enabled={!ro}
              onChange={setCrudVille}
            />
            <KitTextField
              label="Contact"
              defaultValue={crud === 'create' ? undefined : first?.contact}
              readOnly={ro}
              icon="mi:person-outline"
            />
            <KitTextField
              label="Téléphone"
              defaultValue={crud === 'create' ? undefined : first?.telephone}
              readOnly={ro}
              icon="mi:phone"
              keyboardType="phone-pad"
            />
            <KitTextField
              label="Notes"
              lines={3}
              readOnly={ro}
              defaultValue={crud === 'create' ? undefined : 'Contrat cadre 2026 — 24 balises.'}
            />
          </FormSheet>
        </Demo>
      ),
    },
  ];

  return (
    <DocPage
      title="Formulaires"
      icon="mi:edit-note"
      initialSection={initialSection}
      testID="category-forms"
      subtitle="Champs de saisie du projet : motif « field-box » (libellé 12/600 + champ arrondi 12), champs Material outline, sélecteurs en feuille basse, dates, choix et validation — dimensionnés pour le doigt."
      sections={sections}
    />
  );
}

/** Carte de choix à la façon d'un bouton radio (`_ChoiceCard` Flutter). */
function ChoiceCard({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { kit } = useKitTheme();
  return (
    <KitCard
      radius={14}
      onPress={onPress}
      accessibilityLabel={`${title}, ${subtitle}`}
      color={selected ? kit.primaryLight : undefined}
      borderColor={selected ? kit.primary : undefined}
      padding={0}
      contentStyle={styles.choice}
    >
      <View style={styles.row} accessibilityRole="radio" accessibilityState={{ checked: selected }}>
        <Icon source={icon} size={24} color={selected ? kit.primary : kit.textSecondary} />
        <View style={styles.fill}>
          <Text style={[font('700', 14), { color: kit.textPrimary }]}>{title}</Text>
          <Text style={[font('400', 12), { color: kit.textSecondary }]}>{subtitle}</Text>
        </View>
        <Icon
          source={selected ? 'mi:radio-button-checked' : 'mi:radio-button-unchecked'}
          size={24}
          color={selected ? kit.primary : kit.textMuted}
        />
      </View>
    </KitCard>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gap8: { gap: space.s2 },
  gap14: { gap: 14 },
  outline: { borderRadius: radius.md },
  suffixBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: space.s2 },
  result: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56 },
  actions: { flexDirection: 'row', gap: 10 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImg: { width: 72, height: 72 },
  choice: { paddingHorizontal: space.s4, paddingVertical: space.s3 },
});
