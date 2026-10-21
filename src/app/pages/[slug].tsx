import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  List,
  ProgressBar,
  Searchbar,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';

import { Page } from '../../shell/Page';
import { pageExampleBySlug } from '../../showcase/pageExamples';
import { ExampleForm } from '../../showcase/ExampleForms';
import { AuthenticationExample } from '../../showcase/AuthenticationExample';
import { space } from '../../theme/tokens';
import { useKitTheme } from '../../theme/useKitTheme';

const SAMPLE_ITEMS = [
  ['Mise à jour du projet', 'Il y a 8 minutes', 'check-circle-outline'],
  ['Nouvelle demande reçue', 'Il y a 32 minutes', 'inbox-arrow-down-outline'],
  ['Rapport mensuel disponible', 'Hier à 16:42', 'file-chart-outline'],
] as const;

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card mode="outlined" style={styles.stat}>
      <Card.Content>
        <Text variant="labelMedium">{title}</Text>
        <Text variant="headlineMedium">{value}</Text>
        <Text variant="labelSmall">+8,2 % ce mois</Text>
      </Card.Content>
    </Card>
  );
}

function ListContent({ slug }: { slug: string }) {
  const [query, setQuery] = useState('');
  const rows: [string, string, string][] =
    slug === 'catalog'
      ? [
          ['Clavier mécanique', 'Accessoires · 45 000 FCFA', 'keyboard-outline'],
          ['Écran 27 pouces', 'Écrans · 189 000 FCFA', 'monitor'],
          ['Casque sans fil', 'Audio · 32 500 FCFA', 'headphones'],
        ]
      : [
          ['Aminata Kouassi', 'aminata@example.com · Client fidèle', 'account-outline'],
          ['Yao Koffi', 'yao@example.com · Nouveau client', 'account-outline'],
          ['Fatou Diallo', 'fatou@example.com · Compte actif', 'account-outline'],
        ];
  const filtered = rows.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <Searchbar placeholder="Rechercher" value={query} onChangeText={setQuery} />
      <Card mode="outlined">
        {filtered.map(([name, detail, icon]) => (
          <List.Item
            key={name}
            title={name}
            description={detail}
            left={(p) => <List.Icon {...p} icon={icon} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => slug === 'clients' && router.push('/pages/client-detail')}
          />
        ))}
      </Card>
    </>
  );
}

function ModulesContent() {
  const [modules, setModules] = useState({
    clients: true,
    fleet: true,
    interventions: true,
    billing: false,
    reports: true,
    api: false,
  });
  const items = [
    ['clients', 'Gestion des clients', 'Contacts, contrats et comptes'],
    ['fleet', 'Flotte automobile', 'Véhicules et positions en temps réel'],
    ['interventions', 'Interventions', 'Planification et suivi terrain'],
    ['billing', 'Facturation', 'Devis, factures et paiements'],
    ['reports', 'Rapports', 'Indicateurs et exports personnalisés'],
    ['api', 'API publique', 'Connecteurs et intégrations'],
  ] as const;
  const enabled = Object.values(modules).filter(Boolean).length;
  return (
    <Card mode="outlined">
      <Card.Title title="Modules de l’espace" subtitle={`${enabled} module(s) actif(s) sur ${items.length}`} />
      <Card.Content>
        {items.map(([id, title, detail]) => (
          <List.Item
            key={id}
            title={title}
            description={detail}
            left={(p) => (
              <List.Icon
                {...p}
                icon={id === 'fleet' ? 'truck-outline' : id === 'api' ? 'api' : 'view-module-outline'}
              />
            )}
            right={() => (
              <Switch
                value={modules[id]}
                onValueChange={(value) => setModules((current) => ({ ...current, [id]: value }))}
              />
            )}
          />
        ))}
      </Card.Content>
    </Card>
  );
}

function BlogContent() {
  const [query, setQuery] = useState('');
  const articles = [
    [
      'Concevoir de meilleures expériences mobiles',
      'Produit · Aïcha Koné · 6 min',
      'Des principes simples pour concevoir des interfaces claires et accessibles.',
    ],
    [
      'Optimiser les trajets de livraison',
      'Logistique · Jean Kouassi · 4 min',
      'Réduire les kilomètres à vide avec une meilleure planification.',
    ],
    [
      'Sécuriser vos véhicules',
      'Conseils · Mariam Traoré · 8 min',
      'Les alertes essentielles pour mieux protéger votre flotte.',
    ],
  ] as const;
  return (
    <View style={styles.form}>
      <Searchbar placeholder="Rechercher un article" value={query} onChangeText={setQuery} />
      <View style={styles.row}>
        {['Tout', 'Produit', 'Logistique', 'Conseils'].map((tag) => (
          <Chip key={tag} selected={query === tag} onPress={() => setQuery(tag === 'Tout' ? '' : tag)}>
            {tag}
          </Chip>
        ))}
      </View>
      {articles
        .filter(([, meta, title]) => `${meta} ${title}`.toLowerCase().includes(query.toLowerCase()))
        .map(([title, meta, summary], index) => (
          <Card key={title} mode="outlined">
            <View style={[styles.articleArt, { backgroundColor: index % 2 ? '#dce9fa' : '#e4f2e8' }]}>
              <Text variant="displaySmall">{['✦', '↗', '◈'][index]}</Text>
              <Text variant="labelMedium">SC STORAGE · JOURNAL</Text>
            </View>
            <Card.Content style={styles.form}>
              <Chip icon="newspaper-variant-outline">{meta}</Chip>
              <Text variant="titleLarge">{title}</Text>
              <Text>{summary}</Text>
              <Button mode="text" icon="arrow-right" onPress={() => router.push('/pages/article')}>
                Lire l’article
              </Button>
            </Card.Content>
          </Card>
        ))}
    </View>
  );
}

function ArticleContent() {
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    'Très utile, merci pour les conseils.',
    'Nous avons appliqué ces principes à notre portail.',
  ]);
  return (
    <View style={styles.form}>
      <Card mode="contained">
        <View style={[styles.articleArt, styles.articleHero]}>
          <Text variant="displayMedium">✦</Text>
          <Text variant="titleMedium">SC STORAGE · JOURNAL</Text>
        </View>
        <Card.Content style={styles.form}>
          <View style={styles.row}>
            <Chip>Produit</Chip>
            <Text variant="bodySmall">6 min de lecture</Text>
          </View>
          <Text variant="headlineMedium">Concevoir de meilleures expériences mobiles</Text>
          <Text variant="bodyMedium">
            Des principes simples pour concevoir des interfaces claires, accessibles et agréables à utiliser au
            quotidien.
          </Text>
          <Text variant="bodySmall">Par Aïcha Koné · 21 octobre 2026</Text>
          <Divider />
          <Text variant="titleMedium">Dans cet article</Text>
          <Text>01 · Partir des usages réels</Text>
          <Text>02 · Clarifier la hiérarchie</Text>
          <Text>03 · Concevoir pour le tactile</Text>
        </Card.Content>
      </Card>
      <Card mode="outlined">
        <Card.Content style={styles.form}>
          <Text variant="headlineSmall">Partir des usages réels</Text>
          <Text>
            Une bonne expérience commence par les tâches que les équipes accomplissent chaque jour. Les informations
            importantes restent accessibles au premier regard et les actions principales sont faciles à atteindre.
          </Text>
          <Text variant="headlineSmall">Clarifier la hiérarchie</Text>
          <Text>
            Des titres explicites, un contraste suffisant et des espaces réguliers rendent les écrans plus faciles à
            parcourir, quel que soit le niveau de familiarité avec l’application.
          </Text>
          <Text variant="headlineSmall">Concevoir pour le tactile</Text>
          <Text>
            Des cibles confortables, des retours visibles et des formulaires qui accompagnent la saisie facilitent
            l’utilisation sur le terrain.
          </Text>
          <View style={styles.row}>
            <Button icon={liked ? 'heart' : 'heart-outline'} onPress={() => setLiked(!liked)}>
              J’aime · {liked ? 9 : 8}
            </Button>
            <Chip icon="share-outline">Partager</Chip>
            <Chip icon="bookmark-outline">Enregistrer</Chip>
          </View>
        </Card.Content>
      </Card>
      <Card mode="outlined">
        <Card.Title title="Commentaires" subtitle={`${comments.length} réponses`} />
        <Card.Content style={styles.form}>
          {comments.map((item, index) => (
            <List.Item
              key={`${index}-${item}`}
              title={['Mariam Traoré', 'Jean-Marc N’Guessan'][index % 2]}
              description={item}
              left={(p) => <Avatar.Text {...p} label={index ? 'JN' : 'MT'} />}
            />
          ))}
          <TextInput label="Ajouter un commentaire" value={comment} onChangeText={setComment} mode="outlined" />
          <Button
            mode="contained-tonal"
            disabled={!comment.trim()}
            onPress={() => {
              setComments((items) => [...items, comment]);
              setComment('');
            }}
          >
            Publier
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

function InboxContent() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('Aminata Kouassi');
  const threads = [
    ['Aminata Kouassi', 'Bonjour, j’ai une question sur la facture…', '09:42', 'AK'],
    ['Équipe produit', 'Le prototype est prêt pour la revue.', '09:18', 'EP'],
    ['Support', 'Votre demande a été mise à jour.', 'Hier', 'SU'],
  ] as const;
  const active = threads.find(([name]) => name === selected) ?? threads[0];
  return (
    <View style={styles.form}>
      <Searchbar placeholder="Rechercher une conversation" value={query} onChangeText={setQuery} />
      <Card mode="outlined">
        {threads
          .filter(([name]) => name.toLowerCase().includes(query.toLowerCase()))
          .map(([name, message, time, initials]) => (
            <List.Item
              key={name}
              title={name}
              description={message}
              left={() => <Avatar.Text size={42} label={initials} />}
              right={() => <Text variant="labelSmall">{time}</Text>}
              onPress={() => setSelected(name)}
              style={selected === name ? { backgroundColor: '#e9eef8' } : undefined}
            />
          ))}
      </Card>
      {active ? (
        <Card mode="outlined">
          <Card.Title
            title={active[0]}
            subtitle="En ligne · conversation"
            left={() => <Avatar.Text size={40} label={active[3]} />}
          />
          <Card.Content style={styles.form}>
            <Text>Bonjour, j’ai une question sur ma dernière facture.</Text>
            <Text style={styles.messageBubble}>
              Bonjour Aminata, je peux vous aider. Quelle référence souhaitez-vous vérifier ?
            </Text>
            <Text>La facture FAC-2026-0874, s’il vous plaît.</Text>
            <TextInput
              label="Écrire un message"
              mode="outlined"
              right={
                <TextInput.Icon
                  icon="send"
                  accessibilityLabel="Envoyer le message"
                  onPress={() => setQuery('Message envoyé.')}
                />
              }
            />
          </Card.Content>
        </Card>
      ) : null}
    </View>
  );
}

function ChatContent() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    'Bonjour, pouvez-vous confirmer l’heure du rendez-vous ?',
    'Bonjour Aminata, le technicien arrivera vers 14 h 30.',
    'Parfait, je serai sur place.',
  ]);
  return (
    <View style={styles.form}>
      <Card mode="outlined">
        <Card.Title
          title="Aminata Kouassi"
          subtitle="Cliente · en ligne"
          left={() => <Avatar.Text size={42} label="AK" />}
          right={() => <IconButton icon="phone-outline" accessibilityLabel="Appeler Aminata" />}
        />
        <Card.Content style={styles.chatMessages}>
          {messages.map((message, index) => (
            <View key={`${index}-${message}`} style={[styles.messageBubble, index % 2 ? styles.messageSent : null]}>
              <Text>{message}</Text>
              <Text variant="labelSmall">{index % 2 ? 'Vous · 09:42' : 'Aminata · 09:40'}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
      <TextInput
        label="Écrire un message"
        value={text}
        onChangeText={setText}
        mode="outlined"
        right={
          <TextInput.Icon
            icon="send"
            accessibilityLabel="Envoyer le message"
            disabled={!text.trim()}
            onPress={() => {
              setMessages((items) => [...items, text]);
              setText('');
            }}
          />
        }
      />
    </View>
  );
}

function DashboardExample() {
  const [period, setPeriod] = useState('month');
  const bars = period === 'month' ? [42, 55, 48, 76, 63, 87, 70, 94] : [56, 73, 68, 96];
  return (
    <View style={styles.form}>
      <View style={styles.stats}>
        <Stat title="Clients" value="1 284" />
        <Stat title="Véhicules" value="8 432" />
        <Stat title="Disponibilité" value="99,8 %" />
      </View>
      <Card mode="outlined">
        <Card.Title title="Chiffre d’affaires" subtitle="Abonnements, installations et matériel" />
        <Card.Content style={styles.form}>
          <SegmentedButtons
            value={period}
            onValueChange={setPeriod}
            buttons={[
              { value: 'month', label: 'Mois' },
              { value: 'quarter', label: 'Trimestre' },
              { value: 'year', label: 'Année' },
            ]}
          />
          <View style={styles.dashboardChart}>
            {bars.map((height, index) => (
              <View
                key={index}
                style={[
                  styles.dashboardBar,
                  { height: height * 1.15, backgroundColor: index === bars.length - 1 ? '#3157c8' : '#b9cdf2' },
                ]}
              />
            ))}
          </View>
          <View style={styles.row}>
            <Text>Avr.</Text>
            <Text>Mai</Text>
            <Text>Juin</Text>
            <Text>Juil.</Text>
            <Text>Août</Text>
            <Text>Sept.</Text>
            <Text>Oct.</Text>
          </View>
          <Text variant="titleMedium">55,8 M FCFA · +9,2 % vs période précédente</Text>
        </Card.Content>
      </Card>
      <Card mode="outlined">
        <Card.Title title="Activité récente" />
        {SAMPLE_ITEMS.map(([title, subtitle, icon]) => (
          <List.Item key={title} title={title} description={subtitle} left={(p) => <List.Icon {...p} icon={icon} />} />
        ))}
      </Card>
    </View>
  );
}

function CatalogContent() {
  const [category, setCategory] = useState('Tout');
  const [cart, setCart] = useState<string[]>([]);
  const products = [
    ['Clavier mécanique', 'Accessoires', '45 000 FCFA', 'keyboard-outline'],
    ['Écran 27 pouces', 'Écrans', '189 000 FCFA', 'monitor'],
    ['Casque sans fil', 'Audio', '32 500 FCFA', 'headphones'],
    ['Support ergonomique', 'Accessoires', '18 900 FCFA', 'desk'],
  ] as const;
  return (
    <View style={styles.form}>
      <View style={styles.row}>
        {['Tout', 'Accessoires', 'Écrans', 'Audio'].map((value) => (
          <Chip key={value} selected={category === value} onPress={() => setCategory(value)}>
            {value}
          </Chip>
        ))}
        <Chip icon="cart-outline">Panier · {cart.length}</Chip>
      </View>
      {products
        .filter(([, type]) => category === 'Tout' || category === type)
        .map(([name, type, price, icon]) => (
          <Card key={name} mode="outlined">
            <List.Item
              title={name}
              description={`${type} · ${price}`}
              left={(p) => <List.Icon {...p} icon={icon} />}
              right={() => <Button onPress={() => setCart((items) => [...items, name])}>Ajouter</Button>}
            />
          </Card>
        ))}
      {cart.length ? (
        <Card mode="contained">
          <Card.Content style={styles.row}>
            <Text>{cart.length} article(s)</Text>
            <Text style={{ flex: 1 }}>
              {cart
                .reduce(
                  (total, name) =>
                    total +
                    (name.includes('Écran')
                      ? 189000
                      : name.includes('Clavier')
                        ? 45000
                        : name.includes('Casque')
                          ? 32500
                          : 18900),
                  0,
                )
                .toLocaleString('fr-FR')}{' '}
              FCFA
            </Text>
            <Button mode="contained">Voir le panier</Button>
          </Card.Content>
        </Card>
      ) : null}
    </View>
  );
}

function BoardContent() {
  const [columns, setColumns] = useState({
    todo: ['Préparer les écrans', 'Valider les contenus', 'Relire le brief'],
    doing: ['Intégration mobile', 'Revue design'],
    done: ['Cadrage produit'],
  });
  const move = (from: keyof typeof columns, to: keyof typeof columns, item: string) =>
    setColumns((current) => ({
      ...current,
      [from]: current[from].filter((task) => task !== item),
      [to]: [...current[to], item],
    }));
  const groups = [
    ['todo', 'À faire'],
    ['doing', 'En cours'],
    ['done', 'Terminé'],
  ] as const;
  return (
    <View style={styles.board}>
      {groups.map(([key, title]) => (
        <Card key={key} mode="outlined" style={styles.boardColumn}>
          <Card.Title title={title} right={() => <Chip compact>{columns[key].length}</Chip>} />
          {columns[key].map((item) => (
            <List.Item
              key={item}
              title={item}
              description="Échéance · cette semaine"
              left={(p) => <List.Icon {...p} icon="drag" />}
              right={() => (
                <IconButton
                  icon={key === 'done' ? 'backup-restore' : 'arrow-right'}
                  accessibilityLabel={key === 'done' ? 'Rouvrir la tâche' : 'Déplacer la tâche'}
                  onPress={() => move(key, key === 'todo' ? 'doing' : key === 'doing' ? 'done' : 'todo', item)}
                />
              )}
            />
          ))}
        </Card>
      ))}
    </View>
  );
}

function FeedContent() {
  const [liked, setLiked] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  return (
    <View style={styles.form}>
      {(
        [
          ['Mariam Traoré', 'il y a 18 min', 'La nouvelle version de l’application est disponible pour revue 🎉', 'MT'],
          ['Jean-Marc N’Guessan', 'il y a 1 h', 'Réunion de lancement terminée. Merci à toute l’équipe !', 'JN'],
        ] as const
      ).map(([name, time, body, initials]) => (
        <Card key={name} mode="outlined">
          <Card.Title title={name} subtitle={time} left={() => <Avatar.Text size={38} label={initials} />} />
          <Card.Content style={styles.form}>
            <Text>{body}</Text>
            <View style={styles.row}>
              <Chip
                icon={liked.includes(name) ? 'heart' : 'heart-outline'}
                onPress={() =>
                  setLiked((items) => (items.includes(name) ? items.filter((item) => item !== name) : [...items, name]))
                }
              >
                J’aime · {8 + Number(liked.includes(name))}
              </Chip>
              <Chip icon="comment-outline">Commenter</Chip>
              <Chip icon="share-outline">Partager</Chip>
            </View>
            <TextInput
              label="Votre commentaire"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon="send"
                  accessibilityLabel="Publier le commentaire"
                  onPress={() => setComment('')}
                />
              }
            />
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

function ContentForPage({ slug, title }: { slug: string; title: string }) {
  const [enabled, setEnabled] = useState(true);
  const [text, setText] = useState('');
  if (slug.startsWith('auth-')) return <AuthenticationExample slug={slug} />;
  if (slug === 'dashboard') return <DashboardExample />;
  if (
    slug === 'contact' ||
    slug === 'checkout' ||
    slug === 'booking' ||
    slug === 'application' ||
    slug === 'onboarding' ||
    slug === 'survey'
  )
    return <ExampleForm slug={slug} />;
  if (slug === 'clients') return <ListContent slug={slug} />;
  if (slug === 'catalog') return <CatalogContent />;
  if (slug === 'board') return <BoardContent />;
  if (slug === 'feed') return <FeedContent />;
  if (slug === 'settings')
    return (
      <Card mode="outlined">
        <List.Item
          title="Notifications"
          description="Recevoir les mises à jour importantes"
          right={() => <Switch value={enabled} onValueChange={setEnabled} />}
        />
        <Divider />
        <List.Item
          title="Apparence"
          description="Thème clair, sombre ou système"
          left={(p) => <List.Icon {...p} icon="theme-light-dark" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Langue"
          description="Français"
          left={(p) => <List.Icon {...p} icon="translate" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
        />
      </Card>
    );
  if (slug === 'modules') return <ModulesContent />;
  if (slug === 'blog') return <BlogContent />;
  if (slug === 'article') return <ArticleContent />;
  if (slug === 'inbox') return <InboxContent />;
  if (slug === 'chat') return <ChatContent />;
  if (slug.startsWith('auth-'))
    return (
      <Card mode="outlined">
        <Card.Content style={styles.form}>
          {slug === 'auth-otp' ? (
            <>
              <Text variant="headlineSmall">Vérifiez votre identité</Text>
              <Text variant="bodyMedium">Saisissez le code à 6 chiffres envoyé à votre adresse e-mail.</Text>
              <TextInput label="Code de vérification" mode="outlined" keyboardType="number-pad" maxLength={6} />
              <Button mode="contained" onPress={() => setText('Code de démonstration : 123456.')}>
                Vérifier le code
              </Button>
            </>
          ) : slug === 'auth-forgot' ? (
            <>
              <Text variant="headlineSmall">Réinitialiser le mot de passe</Text>
              <TextInput label="Adresse e-mail" mode="outlined" keyboardType="email-address" />
              <Button
                mode="contained"
                onPress={() => setText('Si le compte existe, un lien de réinitialisation lui sera envoyé.')}
              >
                Envoyer le lien
              </Button>
            </>
          ) : slug === 'auth-accounts' ? (
            <>
              <Text variant="headlineSmall">Choisir un compte</Text>
              {['Jean Kouassi · jean.kouassi@example.com', 'Aïcha Koné · aicha.kone@example.com'].map((account) => (
                <List.Item
                  key={account}
                  title={account.split(' · ')[0]}
                  description={account.split(' · ')[1]}
                  left={(p) => <Avatar.Text {...p} label={account.slice(0, 1)} />}
                  onPress={() => setText(`Compte sélectionné : ${account.split(' · ')[0]}.`)}
                />
              ))}
              <Button
                mode="outlined"
                icon="account-plus-outline"
                onPress={() => setText('Ajoutez une adresse e-mail pour continuer.')}
              >
                Utiliser un autre compte
              </Button>
            </>
          ) : slug === 'auth-social' ? (
            <>
              <Text variant="headlineSmall">Continuer avec un compte</Text>
              {['Google', 'Apple', 'Microsoft', 'Facebook'].map((provider) => (
                <Button
                  key={provider}
                  mode="outlined"
                  icon="account-outline"
                  onPress={() => setText(`Connexion ${provider} simulée.`)}
                >
                  Continuer avec {provider}
                </Button>
              ))}
            </>
          ) : (
            <>
              <Text variant="headlineSmall">
                {slug === 'auth-register'
                  ? 'Créer votre compte'
                  : slug === 'auth-lock'
                    ? 'Session verrouillée'
                    : 'Content de te revoir'}
              </Text>
              {slug === 'auth-register' ? <TextInput label="Nom complet" mode="outlined" /> : null}
              <TextInput label="Adresse e-mail" mode="outlined" keyboardType="email-address" />
              <TextInput label="Mot de passe" mode="outlined" secureTextEntry />
              <Button mode="contained" onPress={() => setEnabled(false)}>
                {enabled
                  ? slug === 'auth-register'
                    ? 'Continuer'
                    : slug === 'auth-lock'
                      ? 'Déverrouiller'
                      : 'Se connecter'
                  : 'Connexion de démonstration réussie'}
              </Button>
              {slug !== 'auth-minimal' ? (
                <Button
                  mode="text"
                  onPress={() => setText('Un lien de réinitialisation sera envoyé à votre adresse e-mail.')}
                >
                  Mot de passe oublié ?
                </Button>
              ) : null}
              {['auth-centered', 'auth-split-right', 'auth-split-left', 'auth-image'].includes(slug) ? (
                <Button mode="outlined" icon="google">
                  Continuer avec Google
                </Button>
              ) : null}
            </>
          )}
          {text ? <Text variant="bodySmall">{text}</Text> : null}
        </Card.Content>
      </Card>
    );
  if (slug === 'monitoring')
    return (
      <>
        <View style={styles.stats}>
          <Stat title="Disponibilité" value="99,9 %" />
          <Stat title="Temps moyen" value="128 ms" />
        </View>
        <Card mode="outlined">
          <Card.Title title="Services" />
          <Card.Content>
            {['API principale', 'Base de données', 'Stockage fichiers'].map((item) => (
              <List.Item
                key={item}
                title={item}
                description="Opérationnel"
                left={(p) => <List.Icon {...p} icon="check-circle" color="#1f7a45" />}
                right={() => <Chip compact>En ligne</Chip>}
              />
            ))}
          </Card.Content>
        </Card>
      </>
    );
  if (slug === 'files')
    return (
      <Card mode="outlined">
        {(
          [
            ['Documents partagés', '12 fichiers', 'folder'],
            ['Rapport-2026.pdf', 'PDF · 2,4 Mo', 'file-pdf-box'],
            ['Maquette-mobile.fig', 'Figma · 8,1 Mo', 'image-outline'],
          ] as [string, string, string][]
        ).map(([name, desc, icon]) => (
          <List.Item
            key={name}
            title={name}
            description={desc}
            left={(p) => <List.Icon {...p} icon={icon} />}
            right={(p) => <List.Icon {...p} icon="dots-vertical" />}
          />
        ))}
      </Card>
    );
  if (slug === 'files-columns')
    return (
      <>
        <Card mode="outlined">
          <Card.Title title="Documents partagés" subtitle="3 éléments" />
          <Card.Content>
            {(
              [
                ['Rapport-2026.pdf', 'PDF · 2,4 Mo', 'file-pdf-box'],
                ['Maquette-mobile.fig', 'Figma · 8,1 Mo', 'image-outline'],
                ['Contrat-client.docx', 'DOCX · 340 Ko', 'file-word-outline'],
              ] as [string, string, string][]
            ).map(([name, detail, icon]) => (
              <List.Item
                key={name}
                title={name}
                description={detail}
                left={(p) => <List.Icon {...p} icon={icon} />}
                right={(p) => <List.Icon {...p} icon="chevron-right" />}
              />
            ))}
          </Card.Content>
        </Card>
        <Card mode="outlined">
          <Card.Content style={styles.form}>
            <Chip icon="file-pdf-box">PDF · 2,4 Mo</Chip>
            <Text variant="titleMedium">Rapport-2026.pdf</Text>
            <Text variant="bodyMedium">Mis à jour le 20 octobre 2026 par Aïcha Koné.</Text>
            {text ? <Text variant="bodySmall">{text}</Text> : null}
            <Button
              mode="contained-tonal"
              icon="download-outline"
              onPress={() => setText('Fichier prêt à consulter hors ligne.')}
            >
              Télécharger
            </Button>
          </Card.Content>
        </Card>
      </>
    );
  if (slug === 'board')
    return (
      <>
        {['À faire', 'En cours', 'Terminé'].map((column, i) => (
          <Card key={column} mode="outlined">
            <Card.Title title={column} right={() => <Chip compact>{[3, 2, 5][i]}</Chip>} />
            <Card.Content>
              {(i === 0
                ? ['Préparer les écrans', 'Valider les contenus']
                : i === 1
                  ? ['Intégration mobile', 'Revue design']
                  : ['Cadrage produit']
              ).map((item) => (
                <List.Item
                  key={item}
                  title={item}
                  description="Échéance · cette semaine"
                  left={(p) => <List.Icon {...p} icon="drag" />}
                />
              ))}
            </Card.Content>
          </Card>
        ))}
      </>
    );
  if (slug === 'client-detail')
    return (
      <Card mode="outlined">
        <Card.Title
          title="Aminata Kouassi"
          subtitle="Cliente depuis mars 2024"
          left={(p) => <Avatar.Text {...p} label="AK" />}
        />
        <Card.Content style={styles.form}>
          <Chip icon="check-circle">Compte actif</Chip>
          <List.Item
            title="E-mail"
            description="aminata@example.com"
            left={(p) => <List.Icon {...p} icon="email-outline" />}
          />
          <List.Item
            title="Téléphone"
            description="+225 07 00 00 00 00"
            left={(p) => <List.Icon {...p} icon="phone-outline" />}
          />
          <Text variant="titleMedium">Historique</Text>
          <List.Item
            title="Commande #2048"
            description="Confirmée · 12 octobre"
            left={(p) => <List.Icon {...p} icon="receipt-text-outline" />}
          />
        </Card.Content>
      </Card>
    );
  if (slug === 'inbox' || slug === 'chat')
    return (
      <>
        <Searchbar placeholder="Rechercher une conversation" value={text} onChangeText={setText} />
        <Card mode="outlined">
          {(
            [
              ['Aminata Kouassi', 'Bonjour, j’ai une question…', 'AK'],
              ['Équipe produit', 'Le prototype est prêt.', 'EP'],
              ['Support', 'Votre demande a été mise à jour.', 'SU'],
            ] as [string, string, string][]
          ).map(([name, message, initials]) => (
            <List.Item
              key={name}
              title={name}
              description={message}
              left={() => <Avatar.Text size={42} label={initials} />}
              right={() => <Text variant="labelSmall">09:42</Text>}
            />
          ))}
        </Card>
        <TextInput
          label="Écrire un message"
          value={text}
          onChangeText={setText}
          mode="outlined"
          right={<TextInput.Icon icon="send" accessibilityLabel="Envoyer le message" onPress={() => setText('')} />}
        />
      </>
    );
  if (slug === 'blog' || slug === 'article')
    return (
      <>
        <Card mode="outlined">
          <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000' }} />
          <Card.Content style={styles.form}>
            <Chip icon="book-open-variant">Produit · 6 min de lecture</Chip>
            <Text variant="headlineSmall">Concevoir de meilleures expériences mobiles</Text>
            <Text variant="bodyMedium">
              Des principes simples pour concevoir des interfaces claires, accessibles et agréables à utiliser au
              quotidien.
            </Text>
            <Text variant="bodySmall">Par Aïcha Koné · 21 octobre 2026</Text>
          </Card.Content>
        </Card>
        <Card mode="outlined">
          <Card.Title title="Commentaires" subtitle="12 réponses" />
          <Card.Content>
            <TextInput label="Ajouter un commentaire" value={text} onChangeText={setText} mode="outlined" />
            <Button mode="contained-tonal" onPress={() => setText('')}>
              Publier
            </Button>
          </Card.Content>
        </Card>
      </>
    );
  if (slug === 'docs')
    return (
      <>
        <Searchbar placeholder="Rechercher dans la documentation" value={text} onChangeText={setText} />
        <Card mode="outlined">
          {['Premiers pas', 'Composants', 'Thème et personnalisation', 'Accessibilité'].map((item) => (
            <List.Item
              key={item}
              title={item}
              description="Guide et références"
              left={(p) => <List.Icon {...p} icon="book-open-page-variant-outline" />}
              right={(p) => <List.Icon {...p} icon="chevron-right" />}
            />
          ))}
        </Card>
      </>
    );
  if (slug === 'feed')
    return (
      <>
        <Card mode="outlined">
          <Card.Title title="Mariam Traoré" subtitle="il y a 18 min" left={(p) => <Avatar.Text {...p} label="MT" />} />
          <Card.Content style={styles.form}>
            <Text>La nouvelle version de l’application est disponible pour revue 🎉</Text>
            <View style={styles.row}>
              <Chip icon="heart-outline">J’aime · 8</Chip>
              <Chip icon="comment-outline">Commenter</Chip>
            </View>
          </Card.Content>
        </Card>
        <Card mode="outlined">
          <Card.Title
            title="Jean-Marc N’Guessan"
            subtitle="il y a 1 h"
            left={(p) => <Avatar.Text {...p} label="JN" />}
          />
          <Card.Content>
            <Text>Réunion de lancement terminée. Merci à toute l’équipe !</Text>
          </Card.Content>
        </Card>
      </>
    );
  return (
    <Card mode="outlined">
      <Card.Content style={styles.form}>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="bodyMedium">
          Cette page réunit les éléments essentiels d’un écran {title.toLowerCase()} et les adapte à la navigation
          tactile.
        </Text>
        <ProgressBar progress={0.72} />
        <TextInput label="Ajouter une note" value={text} onChangeText={setText} mode="outlined" multiline />
        <View style={styles.row}>
          <Chip icon="check-circle-outline">Synchronisé</Chip>
          <Button mode="contained-tonal" onPress={() => setEnabled(!enabled)}>
            {enabled ? 'Action rapide' : 'Action effectuée'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function PageExampleScreen() {
  const { slug: rawSlug } = useLocalSearchParams<{ slug: string | string[] }>();
  const slug = Array.isArray(rawSlug) ? (rawSlug[0] ?? '') : (rawSlug ?? '');
  const example = useMemo(() => pageExampleBySlug(slug), [slug]);
  const theme = useKitTheme();
  if (!example)
    return (
      <Page>
        <Text variant="titleLarge">Page introuvable</Text>
        <Button onPress={() => router.replace('/pages')}>Retour à la galerie</Button>
      </Page>
    );
  return (
    <Page testID={`page-${slug}`}>
      <View style={styles.header}>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {example.group}
        </Text>
        <Text variant="headlineMedium" accessibilityRole="header">
          {example.title}
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          {example.description}
        </Text>
      </View>
      <ContentForPage slug={slug} title={example.title} />
      <Button mode="text" onPress={() => router.back()}>
        Retour
      </Button>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.s1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  stat: { flexGrow: 1, flexBasis: '30%' },
  form: { gap: space.s3 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  articleArt: { minHeight: 132, alignItems: 'center', justifyContent: 'center', gap: space.s2 },
  articleHero: { minHeight: 210 },
  messageBubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    padding: space.s3,
    borderRadius: 16,
    backgroundColor: '#edf0f6',
    gap: space.s1,
  },
  messageSent: { alignSelf: 'flex-end', backgroundColor: '#dce9fa' },
  chatMessages: { gap: space.s2 },
  dashboardChart: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: space.s2,
  },
  dashboardBar: { flex: 1, maxWidth: 30, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  board: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: space.s2 },
  boardColumn: { flex: 1, minWidth: 240 },
});
