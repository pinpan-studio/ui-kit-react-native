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
  RadioButton,
  Searchbar,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';

import { Page } from '../shell/Page';

const CITIES = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro'];
const SECTIONS = [
  ['input', 'Input'],
  ['input-material', 'Input Material'],
  ['textarea', 'Textarea'],
  ['mask', 'Masque de saisie'],
  ['select', 'Select'],
  ['multi-select', 'Multi-select'],
  ['autocomplete', 'Autocomplete'],
  ['date', 'Date picker'],
  ['date-range', 'Date range'],
  ['time', 'Time picker'],
  ['checkbox', 'Checkbox'],
  ['radio', 'Radio'],
  ['toggle', 'Toggle'],
  ['slider', 'Slider'],
  ['upload', 'File upload'],
  ['search', 'Search'],
  ['validation', 'Form validation'],
  ['crud-dialog', 'Formulaire en modale'],
] as const;

function Demo({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <View nativeID={`forms-${id}`}>
      <Text variant="titleMedium">{title}</Text>
      <Card mode="outlined">
        <Card.Content style={styles.content}>{children}</Card.Content>
      </Card>
    </View>
  );
}

export function FormsGallery() {
  const [name, setName] = useState('Aminata Kone');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState(
    'Balise hors ligne depuis lundi. Le client demande un passage avant vendredi.',
  );
  const [phone, setPhone] = useState('+225 07 12 34 56 78');
  const [city, setCity] = useState('Abidjan');
  const [cities, setCities] = useState(['Abidjan', 'Bouaké']);
  const [query, setQuery] = useState('');
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('haute');
  const [enabled, setEnabled] = useState(true);
  const [amount, setAmount] = useState(65);
  const [attachment, setAttachment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const options = CITIES.filter((item) => item.toLowerCase().includes(query.toLowerCase()));

  return (
    <Page testID="category-forms">
      <Text variant="titleLarge" accessibilityRole="header">
        Formulaires
      </Text>
      <Text variant="bodyLarge">
        {SECTIONS.length} contrôles interactifs avec validation locale, sélection, saisie masquée et retours adaptés au
        mobile.
      </Text>
      <Demo id="input" title="Input">
        <TextInput label="Nom complet" value={name} onChangeText={setName} mode="outlined" autoCapitalize="words" />
        <TextInput
          label="Adresse e-mail"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Demo>
      <Demo id="input-material" title="Input Material">
        <TextInput
          label="Référence client"
          value="CLI-2026-0148"
          mode="outlined"
          left={<TextInput.Icon icon="account-outline" />}
          right={<TextInput.Icon icon="check-circle" />}
        />
        <TextInput label="Recherche rapide" mode="flat" placeholder="Saisir une référence" />
      </Demo>
      <Demo id="textarea" title="Textarea">
        <TextInput
          label="Description de l’intervention"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
        />
        <Text variant="labelMedium">{description.length} caractères</Text>
      </Demo>
      <Demo id="mask" title="Masque de saisie">
        <TextInput
          label="Téléphone (Côte d’Ivoire)"
          value={phone}
          onChangeText={(v) => setPhone(v.slice(0, 17))}
          mode="outlined"
          keyboardType="phone-pad"
          left={<TextInput.Affix text="🇨🇮" />}
        />
        <Text variant="bodySmall">Format attendu : +225 suivi de 10 chiffres.</Text>
      </Demo>
      <Demo id="select" title="Select">
        <Text variant="bodyMedium">Ville d’intervention</Text>
        <View style={styles.row}>
          {CITIES.map((item) => (
            <Chip key={item} selected={city === item} onPress={() => setCity(item)}>
              {item}
            </Chip>
          ))}
        </View>
        <Text>Ville choisie : {city}</Text>
      </Demo>
      <Demo id="multi-select" title="Multi-select">
        <Text variant="bodyMedium">Zones couvertes</Text>
        <View style={styles.row}>
          {CITIES.map((item) => (
            <Chip
              key={item}
              selected={cities.includes(item)}
              onPress={() => setCities(cities.includes(item) ? cities.filter((v) => v !== item) : [...cities, item])}
            >
              {item}
            </Chip>
          ))}
        </View>
        <Text>{cities.length} zone(s) sélectionnée(s)</Text>
      </Demo>
      <Demo id="autocomplete" title="Autocomplete">
        <Searchbar placeholder="Rechercher une ville" value={query} onChangeText={setQuery} />
        <View>
          {options.map((item) => (
            <List.Item
              key={item}
              title={item}
              left={(p) => <List.Icon {...p} icon="map-marker-outline" />}
              onPress={() => {
                setCity(item);
                setQuery(item);
              }}
            />
          ))}
        </View>
      </Demo>
      <Demo id="date" title="Date picker">
        <Text variant="bodyMedium">Date d’intervention</Text>
        <View style={styles.row}>
          <Button icon="calendar" mode="outlined" onPress={() => setQuery('24 octobre 2026')}>
            {query.includes('octobre') ? query : '24 octobre 2026'}
          </Button>
          <Button onPress={() => setQuery('25 octobre 2026')}>Demain</Button>
        </View>
      </Demo>
      <Demo id="date-range" title="Date range">
        <Text variant="bodyMedium">Période du rapport</Text>
        <View style={styles.row}>
          <Button icon="calendar-start" mode="outlined" onPress={() => setQuery('01 oct. 2026')}>
            01 oct. 2026
          </Button>
          <Button icon="calendar-end" mode="outlined" onPress={() => setQuery('31 oct. 2026')}>
            31 oct. 2026
          </Button>
        </View>
        <Text>Du 01 au 31 octobre 2026</Text>
      </Demo>
      <Demo id="time" title="Time picker">
        <Text variant="bodyMedium">Heure de passage</Text>
        <View style={styles.row}>
          <Button icon="clock-outline" mode="outlined" onPress={() => setQuery('09:00')}>
            {query.match(/^\d\d:\d\d$/) ? query : '08:30'}
          </Button>
          <Button onPress={() => setQuery('10:30')}>Choisir 10:30</Button>
        </View>
      </Demo>
      <Demo id="checkbox" title="Checkbox">
        <View style={styles.row}>
          <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked(!checked)} />
          <Text onPress={() => setChecked(!checked)}>Le client a confirmé le rendez-vous</Text>
        </View>
        <View style={styles.row}>
          <Checkbox status={!checked ? 'checked' : 'unchecked'} onPress={() => setChecked(!checked)} />
          <Text onPress={() => setChecked(!checked)}>Envoyer une notification</Text>
        </View>
      </Demo>
      <Demo id="radio" title="Radio">
        <Text variant="bodyMedium">Priorité de l’intervention</Text>
        <RadioButton.Group value={radio} onValueChange={setRadio}>
          {(
            [
              ['basse', 'Basse'],
              ['normale', 'Normale'],
              ['haute', 'Haute'],
            ] as const
          ).map(([v, label]) => (
            <View key={v} style={styles.row}>
              <RadioButton value={v} />
              <Text onPress={() => setRadio(v)}>{label}</Text>
            </View>
          ))}
        </RadioButton.Group>
      </Demo>
      <Demo id="toggle" title="Toggle">
        <View style={styles.row}>
          <Switch value={enabled} onValueChange={setEnabled} />
          <Text>Notifications {enabled ? 'activées' : 'désactivées'}</Text>
        </View>
        <Divider />
        <View style={styles.row}>
          <Switch value={!enabled} onValueChange={(v) => setEnabled(!v)} />
          <Text>Mode silencieux</Text>
        </View>
      </Demo>
      <Demo id="slider" title="Slider">
        <Text>Priorité : {amount} %</Text>
        <View style={styles.row}>
          <IconButton
            icon="minus"
            accessibilityLabel="Baisser la priorité"
            onPress={() => setAmount(Math.max(0, amount - 5))}
          />
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${amount}%` }]} />
          </View>
          <IconButton
            icon="plus"
            accessibilityLabel="Augmenter la priorité"
            onPress={() => setAmount(Math.min(100, amount + 5))}
          />
        </View>
        <SegmentedButtons
          value={String(Math.round(amount / 25))}
          onValueChange={(v) => setAmount(Number(v) * 25)}
          buttons={[
            { value: '1', label: 'Basse' },
            { value: '2', label: 'Moyenne' },
            { value: '4', label: 'Haute' },
          ]}
        />
      </Demo>
      <Demo id="upload" title="File upload">
        <Button
          icon="paperclip"
          mode="outlined"
          onPress={() => setAttachment(attachment ? '' : 'photo-balise.jpg · 2,4 Mo')}
        >
          {attachment ? 'Retirer la pièce jointe' : 'Ajouter un fichier'}
        </Button>
        {attachment ? (
          <List.Item
            title={attachment}
            left={(p) => <List.Icon {...p} icon="image-outline" />}
            right={(p) => (
              <IconButton
                {...p}
                icon="close"
                accessibilityLabel="Retirer le fichier"
                onPress={() => setAttachment('')}
              />
            )}
          />
        ) : (
          <Text variant="bodySmall">Images ou PDF · 10 Mo maximum</Text>
        )}
      </Demo>
      <Demo id="search" title="Search">
        <Searchbar placeholder="Client, véhicule ou ville" value={query} onChangeText={setQuery} />
        <View style={styles.row}>
          <Chip icon="filter-variant">Filtres</Chip>
          <Chip onPress={() => setQuery('')}>Effacer</Chip>
        </View>
        <Text>{query ? `Résultats pour « ${query} »` : '8 interventions récentes'}</Text>
      </Demo>
      <Demo id="validation" title="Form validation">
        <TextInput
          label="Adresse e-mail requise"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          error={submitted && !email.includes('@')}
        />
        <TextInput
          label="Nom du client"
          value={name}
          onChangeText={setName}
          mode="outlined"
          error={submitted && !name.trim()}
        />
        {submitted ? (
          <Text variant="bodySmall">
            {email.includes('@') && name.trim()
              ? 'Formulaire valide.'
              : 'Renseignez un nom et une adresse e-mail valide.'}
          </Text>
        ) : null}
        <Button mode="contained" onPress={() => setSubmitted(true)}>
          Valider
        </Button>
      </Demo>
      <Demo id="crud-dialog" title="Formulaire en modale">
        <Text>Créer une intervention sans quitter la page.</Text>
        <Button icon="plus" mode="contained" onPress={() => setSubmitted(!submitted)}>
          {submitted ? 'Fermer le formulaire' : 'Nouvelle intervention'}
        </Button>
        {submitted ? (
          <>
            <TextInput label="Objet" mode="outlined" defaultValue="Contrôle de balise" />
            <Button mode="outlined" onPress={() => setSubmitted(false)}>
              Annuler
            </Button>
          </>
        ) : null}
      </Demo>
    </Page>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  track: { flex: 1, height: 8, backgroundColor: '#d7dbe4', borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#3157c8' },
});
