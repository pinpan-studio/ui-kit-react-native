import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  IconButton,
  List,
  ProgressBar,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';

import { Page } from '../shell/Page';
import { radius, space } from '../theme/tokens';
import { useKitTheme } from '../theme/useKitTheme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" accessibilityRole="header">
        {title}
      </Text>
      <Card mode="outlined">
        <Card.Content style={styles.content}>{children}</Card.Content>
      </Card>
    </View>
  );
}
const names = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo'];

export function FieldsGallery() {
  const theme = useKitTheme();
  const [otp, setOtp] = useState('372');
  const [count, setCount] = useState(2);
  const [amount, setAmount] = useState('125000');
  const [range, setRange] = useState(64);
  const [rating, setRating] = useState(4);
  const [color, setColor] = useState(theme.colors.primary);
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [markdown, setMarkdown] = useState(
    '# Rapport d’intervention\n\n- Véhicule contrôlé\n- Balise remplacée\n\n**Statut : terminé**',
  );
  const [signed, setSigned] = useState(false);
  const [tree, setTree] = useState('Abidjan');
  const [available, setAvailable] = useState(['Sonde carburant SOTRA', 'Caméra Actros', 'FMB920']);
  const [selected, setSelected] = useState<string[]>(['Balise CI-4521-AB']);
  const [tags, setTags] = useState(['Entretien', 'Priorité haute']);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('Aminata Kone');
  const [validated, setValidated] = useState(false);

  return (
    <Page testID="category-fields">
      <Text variant="titleLarge" accessibilityRole="header">
        Champs avancés
      </Text>
      <Text variant="bodyLarge">
        Contrôles de saisie spécialisés en FCFA, adaptés aux écrans tactiles avec validation locale.
      </Text>
      <Section title="Code OTP / PIN">
        <Text variant="bodyMedium">Code de vérification envoyé au +225 07 ** ** 56 78</Text>
        <TextInput
          label="Code à 6 chiffres"
          value={otp}
          onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          mode="outlined"
          secureTextEntry
        />
        <Text variant="bodySmall">{otp.length} / 6 chiffres</Text>
      </Section>
      <Section title="Nombre + / −">
        <View style={styles.row}>
          <IconButton
            icon="minus"
            mode="outlined"
            accessibilityLabel="Diminuer la quantité"
            onPress={() => setCount(Math.max(0, count - 1))}
          />
          <Text variant="headlineMedium">{count}</Text>
          <IconButton
            icon="plus"
            mode="outlined"
            accessibilityLabel="Augmenter la quantité"
            onPress={() => setCount(count + 1)}
          />
          <Text>Unités</Text>
        </View>
      </Section>
      <Section title="Montant / devise">
        <TextInput
          label="Montant"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          left={<TextInput.Affix text="FCFA" />}
        />
        <Text variant="titleMedium">{Number(amount || 0).toLocaleString('fr-FR')} FCFA</Text>
        <View style={styles.row}>
          {['FCFA', 'EUR', 'USD'].map((unit) => (
            <Chip key={unit} selected={unit === 'FCFA'}>
              {unit}
            </Chip>
          ))}
        </View>
      </Section>
      <Section title="Intervalle">
        <Text>Priorité · {range} %</Text>
        <View style={styles.row}>
          <IconButton
            icon="minus"
            accessibilityLabel="Baisser la priorité"
            onPress={() => setRange(Math.max(0, range - 5))}
          />
          <View style={styles.flex}>
            <ProgressBar progress={range / 100} />
            <View style={styles.rangeLabels}>
              <Text>0</Text>
              <Text>50</Text>
              <Text>100</Text>
            </View>
          </View>
          <IconButton
            icon="plus"
            accessibilityLabel="Augmenter la priorité"
            onPress={() => setRange(Math.min(100, range + 5))}
          />
        </View>
        <SegmentedButtons
          value={range < 35 ? 'low' : range < 70 ? 'medium' : 'high'}
          onValueChange={(v) => setRange(v === 'low' ? 20 : v === 'medium' ? 50 : 85)}
          buttons={[
            { value: 'low', label: 'Basse' },
            { value: 'medium', label: 'Moyenne' },
            { value: 'high', label: 'Haute' },
          ]}
        />
      </Section>
      <Section title="Notation">
        <View style={styles.row}>
          {[1, 2, 3, 4, 5].map((value) => (
            <IconButton
              key={value}
              icon={value <= rating ? 'star' : 'star-outline'}
              iconColor={theme.colors.tertiary}
              accessibilityLabel={`${value} étoile(s)`}
              onPress={() => setRating(value)}
            />
          ))}
          <Text>{rating} / 5</Text>
        </View>
        <Text variant="bodySmall">Satisfaction du client après intervention</Text>
      </Section>
      <Section title="Sélecteur de couleur">
        <View style={styles.row}>
          {[
            theme.colors.primary,
            theme.colors.secondary,
            theme.colors.tertiary,
            theme.colors.error,
            '#15803d',
            '#d97706',
          ].map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`Choisir la couleur ${value}`}
              onPress={() => setColor(value)}
              style={[
                styles.swatch,
                { backgroundColor: value, borderColor: color === value ? theme.colors.onSurface : 'transparent' },
              ]}
            />
          ))}
        </View>
        <Text>Couleur sélectionnée · {color}</Text>
        <View style={[styles.colorPreview, { backgroundColor: color }]}>
          <Text style={{ color: '#ffffff' }}>Aperçu du badge</Text>
        </View>
      </Section>
      <Section title="Texte riche">
        <View style={styles.row}>
          <Chip selected={bold} icon="format-bold" onPress={() => setBold(!bold)}>
            Gras
          </Chip>
          <Chip selected={italic} icon="format-italic" onPress={() => setItalic(!italic)}>
            Italique
          </Chip>
          <Chip icon="format-list-bulleted">Liste</Chip>
          <Chip icon="link">Lien</Chip>
        </View>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={4}
          defaultValue="L’intervention est terminée. Le client a confirmé le bon fonctionnement de la balise."
        />
        <Text style={{ fontWeight: bold ? '700' : '400', fontStyle: italic ? 'italic' : 'normal' }}>
          L’intervention est terminée. Le client a confirmé le bon fonctionnement de la balise.
        </Text>
      </Section>
      <Section title="Markdown">
        <TextInput
          label="Contenu Markdown"
          mode="outlined"
          multiline
          value={markdown}
          onChangeText={setMarkdown}
          numberOfLines={5}
        />
        <Card mode="contained">
          <Card.Content style={styles.content}>
            <Text variant="titleMedium">{markdown.match(/^# (.*)$/m)?.[1] ?? 'Aperçu'}</Text>
            {markdown
              .split('\n')
              .filter((line) => line.startsWith('- '))
              .map((line) => (
                <Text key={line}>• {line.slice(2)}</Text>
              ))}
            <Text>{markdown.includes('**') ? markdown.match(/\*\*(.*?)\*\*/)?.[1] : 'Texte de l’aperçu'}</Text>
          </Card.Content>
        </Card>
      </Section>
      <Section title="Signature">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zone de signature"
          onPress={() => setSigned(!signed)}
          style={[styles.signature, { borderColor: theme.colors.outlineVariant }]}
        >
          <Text
            variant="headlineMedium"
            style={{ color: signed ? theme.colors.primary : theme.colors.onSurfaceVariant }}
          >
            {signed ? 'A. Kone' : 'Signez ici'}
          </Text>
        </Pressable>
        <View style={styles.row}>
          <Button icon="undo" onPress={() => setSigned(false)}>
            Effacer
          </Button>
          <Button mode="contained" icon="check" onPress={() => setSigned(true)}>
            Valider la signature
          </Button>
        </View>
      </Section>
      <Section title="Sélection arborescente">
        <Text variant="bodyMedium">Région d’intervention</Text>
        <View style={styles.row}>
          {names.map((city) => (
            <Chip key={city} selected={tree === city} onPress={() => setTree(city)}>
              {city}
            </Chip>
          ))}
        </View>
        <Text>Ville choisie : {tree}</Text>
      </Section>
      <Section title="Liste de transfert">
        <Text variant="labelLarge">Disponibles · sélectionnés</Text>
        <View style={styles.transfer}>
          <View style={styles.transferList}>
            {available.map((item) => (
              <List.Item
                key={item}
                title={item}
                right={() => (
                  <IconButton
                    icon="chevron-right"
                    accessibilityLabel={`Ajouter ${item}`}
                    onPress={() => {
                      setAvailable((items) => items.filter((value) => value !== item));
                      setSelected((items) => [...items, item]);
                    }}
                  />
                )}
              />
            ))}
          </View>
          <View style={styles.transferList}>
            {selected.map((item) => (
              <List.Item
                key={item}
                title={item}
                right={() => (
                  <IconButton
                    icon="chevron-left"
                    accessibilityLabel={`Retirer ${item}`}
                    onPress={() => {
                      setSelected((items) => items.filter((value) => value !== item));
                      setAvailable((items) => [...items, item]);
                    }}
                  />
                )}
              />
            ))}
          </View>
        </View>
      </Section>
      <Section title="Tags">
        <TextInput
          label="Ajouter un tag"
          mode="outlined"
          onSubmitEditing={(event) => {
            const value = event.nativeEvent.text.trim();
            if (value) setTags((items) => [...items, value]);
          }}
        />
        <View style={styles.row}>
          {tags.map((tag) => (
            <Chip key={tag} onClose={() => setTags((items) => items.filter((value) => value !== tag))}>
              {tag}
            </Chip>
          ))}
        </View>
      </Section>
      <Section title="Adresse avec carte">
        <TextInput
          label="Adresse"
          mode="outlined"
          defaultValue="Boulevard de la République, Plateau, Abidjan"
          left={<TextInput.Icon icon="map-marker-outline" />}
        />
        <View style={[styles.addressMap, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={[styles.mapRoad, { backgroundColor: theme.colors.surface }]} />
          <IconButton
            icon="map-marker"
            iconColor={theme.colors.error}
            accessibilityLabel="Position du client"
            style={styles.addressPin}
          />
          <Text variant="labelMedium">Plateau · Abidjan</Text>
        </View>
        <Text variant="bodySmall">5,32° N · 4,02° O</Text>
      </Section>
      <Section title="Mot de passe">
        <TextInput
          label="Mot de passe"
          mode="outlined"
          secureTextEntry={!passwordVisible}
          defaultValue="Lookas-2026!"
          right={
            <TextInput.Icon
              icon={passwordVisible ? 'eye-off' : 'eye'}
              onPress={() => setPasswordVisible(!passwordVisible)}
            />
          }
        />
        <Text>Force · bonne</Text>
        <ProgressBar progress={0.75} />
        <Text variant="bodySmall">8 caractères minimum · une majuscule · un chiffre</Text>
      </Section>
      <Section title="Valeur à copier">
        <Card mode="contained">
          <Card.Content style={styles.copyRow}>
            <Text style={styles.flex}>FAC-2026-0912 · 356307042441013</Text>
            <IconButton
              icon={copied ? 'check' : 'content-copy'}
              accessibilityLabel={copied ? 'Valeur copiée' : 'Copier la valeur'}
              onPress={() => setCopied(true)}
            />
          </Card.Content>
        </Card>
        <Text variant="bodySmall">
          {copied ? 'Référence prête à coller.' : 'Touchez l’icône pour copier la référence de démonstration.'}
        </Text>
      </Section>
      <Section title="Formulaire complet">
        <TextInput
          label="Nom complet"
          mode="outlined"
          value={name}
          onChangeText={setName}
          error={validated && !name.trim()}
        />
        <TextInput
          label="Adresse e-mail"
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          error={validated}
        />
        <TextInput
          label="Montant de l’intervention"
          mode="outlined"
          keyboardType="numeric"
          left={<TextInput.Affix text="FCFA" />}
        />
        <View style={styles.row}>
          <Switch value={signed} onValueChange={setSigned} />
          <Text>Le client a confirmé le rendez-vous</Text>
        </View>
        {validated ? (
          <Text style={{ color: theme.colors.error }}>Vérifiez les champs obligatoires avant l’envoi.</Text>
        ) : null}
        <Button mode="contained" onPress={() => setValidated(true)}>
          Enregistrer
        </Button>
      </Section>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s1 },
  flex: { flex: 1 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  swatch: { width: 38, height: 38, borderWidth: 3, borderRadius: 20 },
  colorPreview: { minHeight: 54, justifyContent: 'center', paddingHorizontal: space.s3, borderRadius: radius.md },
  signature: {
    minHeight: 132,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transfer: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  transferList: { flex: 1, minWidth: 180 },
  addressMap: {
    height: 140,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapRoad: { position: 'absolute', height: 16, width: '120%', transform: [{ rotate: '-15deg' }] },
  addressPin: { marginBottom: space.s3 },
  copyRow: { flexDirection: 'row', alignItems: 'center' },
});
