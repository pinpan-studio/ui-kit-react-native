import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Banner,
  Button,
  Card,
  Chip,
  Dialog,
  IconButton,
  List,
  Portal,
  ProgressBar,
  SegmentedButtons,
  Snackbar,
  Text,
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

export function FeedbackGallery() {
  const theme = useKitTheme();
  const [alert, setAlert] = useState('');
  const [snack, setSnack] = useState('');
  const [dialog, setDialog] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0.35);
  const [error, setError] = useState(false);
  const [banner, setBanner] = useState(true);
  const [result, setResult] = useState('success');
  const [undo, setUndo] = useState(false);
  const [uploads, setUploads] = useState([
    { name: 'rapport-T3.pdf', progress: 0.68, failed: false },
    { name: 'photo-balise.jpg', progress: 1, failed: true },
  ]);

  const toggleLoading = () => setLoading(!loading);
  const advance = () => setProgress((value) => (value >= 1 ? 0 : Math.min(1, value + 0.16)));

  return (
    <Page testID="category-feedback">
      <Text variant="titleLarge" accessibilityRole="header">
        Feedback
      </Text>
      <Text variant="bodyLarge">
        Alertes, confirmations, notifications, chargement, erreur, upload et retours d’action accessibles.
      </Text>
      <Section title="Alert">
        <View style={styles.notice}>
          <Text variant="titleSmall">Paiement reçu</Text>
          <Text>Bolloré Logistics CI a réglé la facture FAC-2026-0874.</Text>
          <Button onPress={() => setAlert('')}>Fermer</Button>
        </View>
        {alert ? null : (
          <View style={styles.row}>
            <Button onPress={() => setAlert('Mise à jour disponible · 12 balises peuvent être déployées.')}>
              Avertissement
            </Button>
            <Button onPress={() => setAlert('CI-0418-GH n’émet plus depuis 2 jours.')}>Erreur</Button>
            <Button onPress={() => setAlert('Aucune nouvelle alerte.')}>Réinitialiser</Button>
          </View>
        )}
        {alert ? (
          <Card mode="contained">
            <Card.Content style={styles.row}>
              <Text style={styles.flex}>{alert}</Text>
              <IconButton icon="close" accessibilityLabel="Fermer l’alerte" onPress={() => setAlert('')} />
            </Card.Content>
          </Card>
        ) : null}
      </Section>
      <Section title="Toast / Snackbar">
        <View style={styles.row}>
          <Button onPress={() => setSnack('Client enregistré avec succès')}>Succès</Button>
          <Button onPress={() => setSnack('Échec de la synchronisation')}>Erreur</Button>
          <Button onPress={() => setSnack('3 nouvelles alertes')}>Info</Button>
        </View>
        <Snackbar
          visible={Boolean(snack)}
          onDismiss={() => setSnack('')}
          action={{ label: 'Voir', onPress: () => setSnack('') }}
        >
          {snack}
        </Snackbar>
      </Section>
      <Section title="Modal">
        <View style={styles.row}>
          <Button
            mode="outlined"
            onPress={() => setDialog('Synchronisation terminée · 248 positions ont été importées.')}
          >
            Information
          </Button>
          <Button
            mode="outlined"
            onPress={() => setDialog('Nouvelle intervention · choisissez un véhicule et indiquez le motif.')}
          >
            Formulaire (feuille)
          </Button>
          <Button mode="outlined" onPress={toggleLoading}>
            Overlay plein écran
          </Button>
        </View>
        <Portal>
          <Dialog visible={Boolean(dialog)} onDismiss={() => setDialog('')}>
            <Dialog.Title>Lookas</Dialog.Title>
            <Dialog.Content>
              <Text>{dialog}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialog('')}>Fermer</Button>
              <Button onPress={() => setDialog('Intervention créée.')}>Continuer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Modal visible={loading} transparent animationType="fade" onRequestClose={toggleLoading}>
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.whiteText}>Synchronisation des positions…</Text>
            <Button textColor="#fff" onPress={toggleLoading}>
              Annuler
            </Button>
          </View>
        </Modal>
      </Section>
      <Section title="Dialog">
        <View style={styles.row}>
          <Button onPress={() => setDialog('La balise redémarrera à la prochaine connexion.')}>Information</Button>
          <Button onPress={() => setDialog('La carte SIM expire dans 5 jours.')}>Avertissement</Button>
          <Button onPress={() => setDialog('Impossible de joindre la balise.')}>Erreur</Button>
          <Button onPress={() => setDialog('Conditions générales · 8 articles.')}>Plein écran</Button>
        </View>
      </Section>
      <Section title="Confirmation">
        <Text>Clôturer l’intervention INT-0412 ?</Text>
        <Text variant="bodySmall">Le statut passera à « Clôturée ».</Text>
        <View style={styles.row}>
          <Button onPress={() => setDialog('Action annulée.')}>Annuler</Button>
          <Button mode="contained" onPress={() => setDialog('Intervention clôturée.')}>
            Confirmer
          </Button>
        </View>
      </Section>
      <Section title="Drawer">
        <Button mode="outlined" icon="menu-open" onPress={() => setDrawer(true)}>
          Ouvrir le panneau
        </Button>
        <Portal>
          <Dialog visible={drawer} onDismiss={() => setDrawer(false)} style={styles.drawerDialog}>
            <Dialog.Title>Détails de l’intervention</Dialog.Title>
            <Dialog.Content>
              <List.Item
                title="INT-0418 · Contrôle de balise"
                description="CI-4521-AB · Plateau, Abidjan"
                left={(p) => <List.Icon {...p} icon="wrench-outline" />}
              />
              <Text>Responsable · Mariam K.</Text>
              <Text>Échéance · Aujourd’hui à 14:30</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDrawer(false)}>Fermer</Button>
              <Button mode="contained" onPress={() => setDrawer(false)}>
                Modifier
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Section>
      <Section title="Tooltip">
        <View style={styles.row}>
          <IconButton
            icon="information-outline"
            accessibilityLabel="Information sur le contrat"
            onPress={() => setTooltip(!tooltip)}
          />
          <Text>Contrat Premium</Text>
          <Button onPress={() => setTooltip(!tooltip)}>Afficher l’aide</Button>
        </View>
        {tooltip ? (
          <Text variant="bodySmall">Le contrat Premium couvre 24 véhicules et inclut le suivi en temps réel.</Text>
        ) : null}
      </Section>
      <Section title="Loading">
        <View style={styles.row}>
          <Button mode="contained" onPress={toggleLoading}>
            {loading ? 'Terminer' : 'Simuler le chargement'}
          </Button>
          {loading ? <ActivityIndicator accessibilityLabel="Chargement en cours" /> : null}
          <Text>{loading ? 'Synchronisation…' : 'Prêt'}</Text>
        </View>
        <ProgressBar progress={progress} />
        <View style={styles.row}>
          <Button onPress={advance}>Avancer la progression</Button>
          <Text>{Math.round(progress * 100)} %</Text>
        </View>
      </Section>
      <Section title="Skeleton">
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]} />
          <View style={styles.flex}>
            <View style={[styles.skeletonLine, { backgroundColor: theme.colors.surfaceVariant, width: '70%' }]} />
            <View style={[styles.skeletonLine, { backgroundColor: theme.colors.surfaceVariant, width: '48%' }]} />
          </View>
        </View>
        <View
          style={[styles.skeletonLine, { backgroundColor: theme.colors.surfaceVariant, width: '100%', height: 64 }]}
        />
        <Text variant="bodySmall">Aperçu des placeholders pendant le chargement.</Text>
      </Section>
      <Section title="Error">
        <View
          style={[
            styles.errorBox,
            { backgroundColor: error ? theme.colors.errorContainer : theme.colors.surfaceVariant },
          ]}
        >
          <Text variant="titleSmall">{error ? 'Connexion perdue' : 'Aucun élément à afficher'}</Text>
          <Text>{error ? 'Impossible de charger les interventions.' : 'Il n’y a rien de nouveau pour le moment.'}</Text>
          <Button onPress={() => setError(!error)}>{error ? 'Réessayer' : 'Afficher une erreur'}</Button>
        </View>
      </Section>
      <Section title="Envoi multiple avec progression">
        {uploads.map((upload, index) => (
          <List.Item
            key={upload.name}
            title={upload.name}
            description={
              upload.failed ? 'Échec · réessayez' : `${Math.round(upload.progress * 100)} % · Envoi en cours`
            }
            left={(p) => <List.Icon {...p} icon={upload.failed ? 'alert-circle-outline' : 'file-outline'} />}
            right={() => (
              <IconButton
                icon={upload.failed ? 'refresh' : 'pause'}
                accessibilityLabel={upload.failed ? 'Réessayer' : 'Mettre en pause'}
                onPress={() =>
                  setUploads((items) =>
                    items.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, failed: false, progress: 1 } : item,
                    ),
                  )
                }
              />
            )}
          />
        ))}
        <ProgressBar progress={uploads[0]?.progress ?? 0} />
        <Button onPress={() => setUploads((items) => items.map((item) => ({ ...item, progress: 1, failed: false })))}>
          Tout reprendre
        </Button>
      </Section>
      <Section title="Banner">
        {banner ? (
          <Banner
            visible
            actions={[
              { label: 'Planifier', onPress: () => setBanner(false) },
              { label: 'Fermer', onPress: () => setBanner(false) },
            ]}
            icon="information-outline"
          >
            La mise à jour v03.28.07 est disponible pour 12 balises.
          </Banner>
        ) : (
          <Button onPress={() => setBanner(true)}>Réafficher la bannière</Button>
        )}
        <View style={styles.row}>
          <Button onPress={() => setBanner(false)}>Masquer</Button>
        </View>
      </Section>
      <Section title="Result">
        <SegmentedButtons
          value={result}
          onValueChange={setResult}
          buttons={[
            { value: 'success', label: 'Succès' },
            { value: 'error', label: 'Erreur' },
            { value: 'empty', label: 'Vide' },
          ]}
        />
        <View style={styles.result}>
          <IconButton
            icon={
              result === 'success'
                ? 'check-circle-outline'
                : result === 'error'
                  ? 'alert-circle-outline'
                  : 'tray-outline'
            }
            iconColor={result === 'error' ? theme.colors.error : theme.colors.primary}
            size={42}
            accessibilityLabel={`Résultat ${result}`}
          />
          <Text variant="titleMedium">
            {result === 'success'
              ? 'Intervention terminée'
              : result === 'error'
                ? 'Une erreur est survenue'
                : 'Aucun résultat'}
          </Text>
          <Text>
            {result === 'success'
              ? 'Le rapport a été envoyé au client.'
              : result === 'error'
                ? 'Réessayez ou contactez l’assistance.'
                : 'Modifiez les filtres pour afficher des données.'}
          </Text>
          <Button mode="contained" onPress={() => setResult('success')}>
            {result === 'error' ? 'Réessayer' : 'Continuer'}
          </Button>
        </View>
      </Section>
      <Section title="Undo">
        <Text>Intervention INT-0418 · Contrôle de balise</Text>
        <View style={styles.row}>
          <Button mode="contained" onPress={() => setUndo(true)}>
            Supprimer
          </Button>
          {undo ? (
            <Chip icon="check" onClose={() => setUndo(false)}>
              Intervention supprimée · Annuler
            </Chip>
          ) : null}
        </View>
        <Button onPress={() => setUndo(false)}>Réinitialiser l’exemple</Button>
      </Section>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.s2 },
  content: { gap: space.s3 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2 },
  flex: { flex: 1 },
  notice: { padding: space.s3, backgroundColor: '#e1f4e7', borderRadius: radius.md, gap: space.s1 },
  overlay: { flex: 1, backgroundColor: '#000b', justifyContent: 'center', alignItems: 'center', gap: space.s3 },
  whiteText: { color: '#fff' },
  drawerDialog: { alignSelf: 'flex-end', width: '90%', minHeight: '55%' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  skeletonLine: { height: 14, borderRadius: 7, marginVertical: space.s1 },
  errorBox: { borderRadius: radius.md, padding: space.s3, gap: space.s1 },
  result: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: space.s1 },
});
