import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator as NativeSpinner, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Icon, TouchableRipple } from 'react-native-paper';

import {
  AlertDialog,
  BottomConfirm,
  CheckboxTile,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormSheet,
  FullscreenDialog,
  GlobalBanner,
  IndeterminateBar,
  KitAlert,
  KitBottomSheet,
  KitButton,
  KitCard,
  KitChip,
  KitIconButton,
  KitProgressBar,
  KitTextField,
  KitTooltip,
  OverlaySpinner,
  PriorityMessage,
  PromptDialog,
  PushMessage,
  ResultView,
  SegmentedToggle,
  SheetHeader,
  SidePanel,
  Skeleton,
  SkeletonListTile,
  SwitchTile,
  UploadQueue,
} from '../components';
import { useKitSnack } from '../core/snack';
import { DEMO_CLIENTS, NOTIFICATIONS } from '../data/showcase';
import { elevation, font, radius, space, toneColor, toneLight, useKitTheme, type KitTone } from '../theme';
import { Demo, DemoWrap, DocPage, Gap, type DocSection } from './doc';

type AlertKind = { title: string; message: string; icon?: string; tone?: KitTone; ok?: string };
type Confirm = 'close' | 'delete' | 'terminate' | null;

const ARTICLE =
  'Les prestations de géolocalisation sont fournies dans le cadre du contrat d’abonnement. Le client s’engage à informer ses chauffeurs de la présence du dispositif.';

/** `/components/feedback` — alertes, snackbars, dialogs, confirmations, drawers, chargements… (`FeedbackGallery`). */
export function FeedbackGallery({ initialSection }: { initialSection?: string }) {
  const { kit, roles, colorMode } = useKitTheme();
  const snack = useKitSnack();
  const [closed, setClosed] = useState<string[]>([]);
  const [overlay, setOverlay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [determinate, setDeterminate] = useState(0.35);
  const [offline, setOffline] = useState(false);
  const [bannersClosed, setBannersClosed] = useState<string[]>([]);
  const [result, setResult] = useState('success');
  const [tasks, setTasks] = useState([
    'Relancer Bolloré Logistics',
    'Valider le devis DEV-118',
    'Planifier INT-0418',
    'Envoyer le rapport T3',
  ]);
  const [alert, setAlert] = useState<AlertKind | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [prompt, setPrompt] = useState(false);
  const [push, setPush] = useState(false);
  const [priority, setPriority] = useState(false);
  const [formSheet, setFormSheet] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [bottom, setBottom] = useState(false);
  const [panel, setPanel] = useState(false);
  const [draggable, setDraggable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const interval = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearInterval(interval.current);
    },
    [],
  );
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const runOverlay = () => {
    setOverlay(true);
    later(() => setOverlay(false), 1600);
  };
  const runDeterminate = () => {
    clearInterval(interval.current);
    setDeterminate(0);
    interval.current = setInterval(() => {
      setDeterminate((d) => {
        const next = Math.min(1, d + 0.02);
        if (next >= 1) clearInterval(interval.current);
        return next;
      });
    }, 60);
  };
  const close = (id: string) => setClosed((c) => [...c, id]);
  const closeBanner = (id: string) => setBannersClosed((c) => [...c, id]);

  const sections: DocSection[] = [
    {
      id: 'alert',
      title: 'Alert',
      source: 'KitAlert',
      children: [
        <Demo
          key="variants"
          label="Variantes"
          hint={closed.length ? 'réinitialiser ↻' : undefined}
          code={`<KitAlert tone="warning" title="Abonnement bientôt expiré" text="…"
  action="Renouveler" onClose={close} />`}
        >
          <Gap>
            {closed.includes('s') ? null : (
              <KitAlert
                tone="success"
                title="Paiement reçu"
                text="Bolloré Logistics CI a réglé la facture FAC-2026-0874."
                onClose={() => close('s')}
              />
            )}
            {closed.includes('i') ? null : (
              <KitAlert
                tone="info"
                title="Mise à jour disponible"
                text="Le firmware v03.28.07 peut être déployé sur 12 balises."
                action="Planifier"
                onAction={() => snack.demoAction('Planification')}
                onClose={() => close('i')}
              />
            )}
            {closed.includes('w') ? null : (
              <KitAlert
                tone="warning"
                title="Abonnement bientôt expiré"
                text="Le contrat CTR-2026-0042 arrive à échéance dans 12 jours."
                action="Renouveler"
                onClose={() => close('w')}
              />
            )}
            {closed.includes('e') ? null : (
              <KitAlert
                tone="error"
                title="Balise hors ligne"
                text="CI-0418-GH n’émet plus depuis 2 jours."
                onClose={() => close('e')}
              />
            )}
            {closed.length ? (
              <KitButton label="Réafficher" icon="mi:refresh" variant="ghost" onPress={() => setClosed([])} />
            ) : null}
          </Gap>
        </Demo>,
        <Demo key="compact" label="Compactes">
          <Gap gap={8}>
            <KitAlert compact tone="success" text="Modifications enregistrées." />
            <KitAlert compact tone="warning" text="3 champs requièrent votre attention." />
            <KitAlert compact tone="error" text="Connexion perdue — nouvelle tentative…" />
          </Gap>
        </Demo>,
        <Demo key="blocking" label="Alerte bloquante (.alert-client)">
          <KitAlert
            filled
            tone="error"
            icon="mi:block"
            title="Compte suspendu"
            text="Ce client a 3 factures impayées. Les nouvelles interventions sont bloquées jusqu’à régularisation."
          />
        </Demo>,
      ],
    },
    {
      id: 'toast',
      title: 'Toast / Snackbar',
      source: 'useKitSnack().show (snackbar-success / error / info)',
      description: 'Snackbars flottantes au-dessus de la barre de navigation, teintées selon le type.',
      cols: 2,
      children: [
        <Demo key="types" label="Types" code={`snack.show('Client enregistré', { kind: 'success' });`}>
          <DemoWrap>
            <KitButton
              label="Succès"
              variant="success"
              onPress={() => snack.show('Client enregistré avec succès', { kind: 'success' })}
            />
            <KitButton
              label="Erreur"
              variant="danger"
              onPress={() => snack.show('Échec de la synchronisation', { kind: 'error' })}
            />
            <KitButton
              label="Info"
              variant="secondary"
              onPress={() => snack.show('3 nouvelles alertes', { kind: 'info' })}
            />
            <KitButton
              label="Neutre"
              variant="outline"
              onPress={() => snack.show('Brouillon enregistré', { action: 'Voir' })}
            />
          </DemoWrap>
        </Demo>,
        <Demo key="positions" label="Positions">
          <DemoWrap>
            <KitButton label="Bas" variant="secondary" onPress={() => snack.show('En bas (par défaut)')} />
            <KitButton
              label="Haut"
              variant="secondary"
              onPress={() => snack.banner('Message en haut d’écran (bannière)')}
            />
          </DemoWrap>
        </Demo>,
      ],
    },
    {
      id: 'modal',
      title: 'Modal',
      source: 'AlertDialog · ConfirmDialog · PromptDialog · PushMessage · FormSheet',
      cols: 2,
      children: [
        <Demo key="service" label="ModalService (génériques)">
          <DemoWrap>
            <KitButton
              label="alert"
              variant="secondary"
              onPress={() =>
                setAlert({
                  title: 'Synchronisation terminée',
                  message: '248 positions ont été importées.',
                  icon: 'mi:cloud-done',
                  tone: 'success',
                })
              }
            />
            <KitButton label="confirm" variant="secondary" onPress={() => setConfirm('close')} />
            <KitButton label="prompt" variant="secondary" onPress={() => setPrompt(true)} />
          </DemoWrap>
        </Demo>,
        <Demo key="push" label="Messages poussés">
          <DemoWrap>
            <KitButton label="Annonce" icon="mi:campaign" variant="secondary" onPress={() => setPush(true)} />
            <KitButton
              label="Prioritaire"
              icon="mi:priority-high"
              variant="secondary"
              onPress={() => setPriority(true)}
            />
          </DemoWrap>
        </Demo>,
        <Demo key="sheet" label="Formulaire (feuille)">
          <KitButton label="Ouvrir" icon="mi:add" onPress={() => setFormSheet(true)} />
        </Demo>,
        <Demo key="overlay" label="Overlay plein écran">
          <KitButton label="Synchroniser" icon="mi:sync" variant="secondary" onPress={runOverlay} />
        </Demo>,
      ],
    },
    {
      id: 'dialog',
      title: 'Dialog',
      source: 'AlertDialog · FullscreenDialog',
      cols: 2,
      children: [
        <Demo key="types" label="Types">
          <DemoWrap>
            <KitButton
              label="Info"
              variant="secondary"
              onPress={() =>
                setAlert({ title: 'Information', message: 'La balise redémarrera à la prochaine connexion.' })
              }
            />
            <KitButton
              label="Avertissement"
              variant="secondary"
              onPress={() =>
                setAlert({
                  title: 'Attention',
                  message: 'La carte SIM expire dans 5 jours.',
                  icon: 'mi:warning-amber',
                  tone: 'warning',
                })
              }
            />
            <KitButton
              label="Erreur"
              variant="secondary"
              onPress={() =>
                setAlert({
                  title: 'Erreur',
                  message: 'Impossible de joindre la balise.',
                  icon: 'mi:error-outline',
                  tone: 'error',
                  ok: 'Fermer',
                })
              }
            />
            <KitButton label="Plein écran" variant="secondary" onPress={() => setFullscreen(true)} />
          </DemoWrap>
        </Demo>,
        <Demo key="static" label="Aperçu statique (contenu de dialog)" muted>
          <View style={[styles.staticDialog, { backgroundColor: roles.surfaceContainerLow }, elevation(2, colorMode)]}>
            <View style={[styles.disc52, { backgroundColor: kit.primaryLight }]}>
              <Icon source="mi:mark-email-read" size={24} color={kit.primary} />
            </View>
            <Text style={[font('600', 18, 'heading'), { color: kit.textPrimary }]}>Rapport envoyé</Text>
            <Text style={[font('400', 14), styles.center, { color: kit.textSecondary }]}>
              Le rapport mensuel a été envoyé à 3 destinataires.
            </Text>
            <KitButton label="Fermer" expand onPress={() => undefined} style={styles.mt8} />
          </View>
        </Demo>,
      ],
    },
    {
      id: 'confirm',
      title: 'Confirmation dialog',
      source: 'ConfirmDialog (danger, typeToConfirm) · BottomConfirm',
      description: 'Actions destructives : bouton rouge, et saisie de confirmation pour les plus graves.',
      cols: 2,
      children: [
        <Demo key="delete" label="Suppression">
          <DemoWrap>
            <KitButton
              label="Supprimer"
              icon="mi:delete-outline"
              variant="dangerOutline"
              onPress={() => setConfirm('delete')}
            />
            <KitButton label="Saisie de confirmation" variant="danger" onPress={() => setConfirm('terminate')} />
          </DemoWrap>
        </Demo>,
        <Demo key="bottom" label="Bottom sheet">
          <KitButton
            label="Confirmer en feuille"
            icon="mi:power-settings-new"
            variant="secondary"
            onPress={() => setBottom(true)}
          />
        </Demo>,
      ],
    },
    {
      id: 'drawer',
      title: 'Drawer / bottom sheet',
      source: 'SidePanel · KitBottomSheet (resizable)',
      description:
        'Le drawer droit 360 px du shell devient une feuille basse sur téléphone (panneau latéral sur tablette).',
      cols: 2,
      children: [
        <Demo key="panel" label="Panneau de notifications">
          <KitButton
            label="Ouvrir le panneau"
            icon="mi:notifications"
            variant="raised"
            onPress={() => setPanel(true)}
          />
        </Demo>,
        <Demo key="drag" label="Feuille extensible">
          <KitButton
            label="Tâches du jour"
            icon="mi:expand-less"
            variant="secondary"
            onPress={() => setDraggable(true)}
          />
        </Demo>,
      ],
    },
    {
      id: 'tooltip',
      title: 'Tooltip',
      source: 'KitTooltip (appui long sur mobile)',
      description:
        'Sur écran tactile, l’info-bulle apparaît à l’appui long ; elle double toujours un libellé accessible.',
      children: (
        <Demo label="Appui long">
          <DemoWrap spacing={16} style={styles.tipRow}>
            <KitTooltip message="Modifier le client">
              <Icon source="mi:edit" size={24} color={kit.textPrimary} />
            </KitTooltip>
            <KitTooltip message="Balise en ligne · dernier signal il y a 12 s">
              <Icon source="mi:sensors" size={24} color={kit.success} />
            </KitTooltip>
            <KitTooltip
              trigger="tap"
              message={
                <Text style={[font('400', 12), { color: roles.inverseOnSurface }]}>
                  <Text style={font('700', 12)}>{'CA mensuel\n'}</Text>
                  <Text style={{ color: kit.success }}>1 250 000 FCFA · +9 %</Text>
                </Text>
              }
            >
              <View pointerEvents="none">
                <KitChip label="Toucher (riche)" icon="mi:touch-app" />
              </View>
            </KitTooltip>
          </DemoWrap>
        </Demo>
      ),
    },
    {
      id: 'loading',
      title: 'Loading',
      source: 'ActivityIndicator · IndeterminateBar · KitProgressBar · RefreshControl',
      cols: 2,
      children: [
        <Demo key="spinners" label="Spinners">
          <DemoWrap spacing={24}>
            <ActivityIndicator size={20} color={kit.primary} accessibilityLabel="Chargement" />
            <ActivityIndicator size={32} color={kit.primary} />
            <View style={[styles.spinBg, { borderColor: kit.tertiaryLight }]}>
              <ActivityIndicator size={44} color={kit.tertiary} />
            </View>
            <NativeSpinner color={kit.primary} />
          </DemoWrap>
        </Demo>,
        <Demo key="indeterminate" label="Barre indéterminée">
          <IndeterminateBar />
        </Demo>,
        <Demo key="determinate" label="Barre déterminée" hint="toucher pour rejouer">
          <TouchableRipple
            onPress={runDeterminate}
            accessibilityRole="button"
            accessibilityLabel="Rejouer l’import"
            style={styles.rounded}
          >
            <Gap>
              <KitProgressBar
                value={determinate}
                height={8}
                trackColor={roles.secondaryContainer}
                accessibilityLabel="Import des positions"
              />
              <Text style={[font('400', 12), { color: kit.textSecondary }]}>
                {`Import des positions : ${Math.round(determinate * 100)} %`}
              </Text>
            </Gap>
          </TouchableRipple>
        </Demo>,
        <Demo key="refresh" label="Tirer pour rafraîchir" flush>
          <ScrollView
            nestedScrollEnabled
            style={styles.refresh}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                colors={[kit.primary]}
                tintColor={kit.primary}
                progressBackgroundColor={roles.surfaceContainerHigh}
                onRefresh={() => {
                  setRefreshing(true);
                  later(() => {
                    setRefreshing(false);
                    snack.show('Liste actualisée', { kind: 'success' });
                  }, 900);
                }}
              />
            }
          >
            <Text style={[font('400', 12), styles.center, styles.pad12, { color: kit.textMuted }]}>
              ↓ Tirez la liste vers le bas
            </Text>
            {DEMO_CLIENTS.slice(0, 5).map((x) => (
              <View key={x.id} style={styles.denseRow}>
                <Text style={[font('500', 14), { color: kit.textPrimary }]}>{x.raisonSociale}</Text>
                <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{x.ville}</Text>
              </View>
            ))}
          </ScrollView>
        </Demo>,
        <Demo key="labelled" label="Chargement avec libellé" flush>
          <View style={styles.h140}>
            <OverlaySpinner message="Chargement des clients…" />
          </View>
        </Demo>,
        <Demo key="button" label="Bouton en cours">
          <KitButton
            label="Enregistrer"
            loadingLabel="Enregistrement…"
            icon="mi:save"
            loading={saving}
            onPress={() => {
              setSaving(true);
              later(() => setSaving(false), 1500);
            }}
          />
        </Demo>,
      ],
    },
    {
      id: 'skeleton',
      title: 'Skeleton',
      source: 'Skeleton · SkeletonListTile',
      cols: 2,
      children: [
        <Demo key="lines" label="Lignes">
          <Gap gap={8}>
            <Skeleton width={180} height={16} />
            <Skeleton height={12} />
            <Skeleton height={12} />
            <Skeleton width={220} height={12} />
          </Gap>
        </Demo>,
        <Demo key="list" label="Liste avec avatar">
          <SkeletonListTile />
          <SkeletonListTile />
          <SkeletonListTile />
        </Demo>,
        <Demo key="card" label="Carte">
          <Gap gap={10}>
            <Skeleton height={120} radius={16} />
            <Skeleton width={160} height={16} />
            <Skeleton height={12} />
            <View style={styles.row8}>
              <Skeleton width={80} height={28} radius={14} />
              <Skeleton width={80} height={28} radius={14} />
            </View>
          </Gap>
        </Demo>,
        <Demo key="kpi" label="Tuiles KPI">
          <View style={styles.row10}>
            <View style={styles.fill}>
              <Skeleton height={72} radius={20} />
            </View>
            <View style={styles.fill}>
              <Skeleton height={72} radius={20} />
            </View>
          </View>
        </Demo>,
      ],
    },
    {
      id: 'error',
      title: 'Error state',
      source: 'ErrorState · EmptyState',
      cols: 3,
      children: [
        <Demo key="error" label="Erreur de chargement">
          <ErrorState code="HTTP 503 · réf. 7f2c-91" onRetry={() => snack.show('Nouvelle tentative…')} />
        </Demo>,
        <Demo key="notfound" label="Ressource introuvable">
          <EmptyState
            icon="mi:person-off"
            title="Client introuvable"
            subtitle="Ce client a peut-être été supprimé ou fusionné."
            actionLabel="Retour à la liste"
            actionIcon="mi:arrow-back"
            onAction={() => undefined}
          />
        </Demo>,
        <Demo key="forbidden" label="Accès refusé">
          <ResultView
            tone="warning"
            icon="mi:lock-outline"
            title="Accès refusé"
            subtitle="Vous n’avez pas la permission « Finance › Paiements ». Contactez votre administrateur."
          />
        </Demo>,
      ],
    },
    {
      id: 'upload-queue',
      title: 'Envoi multiple avec progression',
      source: 'UploadQueue (simulé, sans réseau)',
      description:
        'Deux envois simultanés, pause / reprise, échec et nouvelle tentative (le fichier « photo » échoue volontairement).',
      children: (
        <Demo label="File d’envoi">
          <UploadQueue />
        </Demo>
      ),
    },
    {
      id: 'banner',
      title: 'Bannière globale & hors ligne',
      source: 'GlobalBanner',
      children: [
        <Demo key="banners" label="Bannières" flush>
          {bannersClosed.includes('m') ? null : (
            <GlobalBanner
              tone="info"
              icon="mi:build-circle"
              title="Maintenance planifiée"
              text="dimanche 02:00 – 04:00"
              onClose={() => closeBanner('m')}
            />
          )}
          {bannersClosed.includes('i') ? null : (
            <GlobalBanner
              tone="error"
              icon="mi:report"
              title="Incident en cours"
              text="retards de remontée GPS"
              action="Statut"
              onAction={() => undefined}
              onClose={() => closeBanner('i')}
            />
          )}
          {bannersClosed.includes('a') ? null : (
            <GlobalBanner
              tone="warning"
              icon="mi:schedule"
              title="Abonnement bientôt expiré"
              text="dans 12 jours"
              action="Renouveler"
              onAction={() => undefined}
              onClose={() => closeBanner('a')}
            />
          )}
          {bannersClosed.includes('n') ? null : (
            <GlobalBanner
              tone="purple"
              icon="mi:auto-awesome"
              title="Nouveau : rapports carburant"
              action="Découvrir"
              onAction={() => undefined}
              onClose={() => closeBanner('n')}
            />
          )}
          {bannersClosed.length ? (
            <View style={styles.pad12}>
              <KitButton label="Réafficher les bannières" variant="ghost" onPress={() => setBannersClosed([])} />
            </View>
          ) : null}
        </Demo>,
        <Demo key="offline" label="Hors ligne" hint="basculer la connexion" flush>
          {offline ? (
            <View accessibilityRole="alert" style={[styles.offline, { backgroundColor: kit.textPrimary }]}>
              <Icon source="mi:cloud-off" size={18} color={kit.bg} />
              <Text style={[font('400', 12.5), styles.fill, { color: kit.bg }]}>
                Hors ligne — les modifications seront synchronisées au retour du réseau.
              </Text>
            </View>
          ) : null}
          <View style={styles.offlineSwitch}>
            <Icon source={offline ? 'mi:wifi-off' : 'mi:wifi'} size={24} color={kit.textSecondary} />
            <View style={styles.fill}>
              <SwitchTile
                value={!offline}
                title="Connexion réseau"
                onChange={(v) => {
                  setOffline(!v);
                  if (v) snack.show('Connexion rétablie', { kind: 'success' });
                }}
              />
            </View>
          </View>
        </Demo>,
      ],
    },
    {
      id: 'result',
      title: 'Page de résultat',
      source: 'ResultView',
      children: (
        <Demo label="Résultats">
          <Gap>
            <SegmentedToggle
              value={result}
              expand
              onChange={setResult}
              options={[
                { value: 'success', label: 'Succès' },
                { value: 'error', label: 'Échec' },
                { value: 'pending', label: 'Attente' },
                { value: '404', label: '404' },
              ]}
            />
            {result === 'success' ? (
              <ResultView
                key="s"
                tone="success"
                title="Paiement confirmé"
                subtitle="Un reçu a été envoyé à jean.kouassi@transports-yao.ci."
                extra={
                  <KitCard>
                    <Text style={[font('400', 14), styles.center, { color: kit.textPrimary }]}>
                      Réf. PAY-2026-4412 · 1 250 000 FCFA · Orange Money
                    </Text>
                  </KitCard>
                }
                actions={
                  <>
                    <KitButton label="Voir le reçu" onPress={() => undefined} />
                    <KitButton label="Retour" variant="secondary" onPress={() => undefined} />
                  </>
                }
              />
            ) : result === 'error' ? (
              <ResultView
                key="e"
                tone="error"
                title="Paiement refusé"
                subtitle="Solde insuffisant sur le compte mobile money."
                actions={<KitButton label="Réessayer" onPress={() => undefined} />}
              />
            ) : result === 'pending' ? (
              <ResultView
                key="p"
                tone="info"
                icon="mi:hourglass-top"
                title="Validation en cours"
                subtitle="Votre demande sera traitée sous 24 h ouvrées."
              />
            ) : (
              <ResultView
                key="n"
                tone="neutral"
                icon="mi:travel-explore"
                title="Page introuvable"
                subtitle="Le lien est peut-être expiré."
                actions={<KitButton label="Accueil" variant="secondary" onPress={() => undefined} />}
              />
            )}
          </Gap>
        </Demo>
      ),
    },
    {
      id: 'undo',
      title: 'Snackbar « Annuler »',
      source: "snack.show(…, { action: 'Annuler' })",
      description:
        'Suppression optimiste : l’élément disparaît tout de suite et peut être restauré pendant quelques secondes.',
      children: (
        <Demo label="Tâches" flush>
          {tasks.length === 0 ? (
            <EmptyState compact icon="mi:task-alt" title="Plus aucune tâche" subtitle="Bravo !" />
          ) : null}
          {tasks.map((t) => (
            <View key={t} style={styles.task}>
              <Icon source="mi:radio-button-unchecked" size={24} color={kit.textMuted} />
              <Text style={[font('500', 14), styles.fill, { color: kit.textPrimary }]}>{t}</Text>
              <KitIconButton
                icon="mi:delete-outline"
                accessibilityLabel={`Supprimer ${t}`}
                iconColor={kit.textSecondary}
                onPress={() => {
                  const i = tasks.indexOf(t);
                  setTasks((list) => list.filter((x) => x !== t));
                  snack.show(`« ${t} » supprimée`, {
                    action: 'Annuler',
                    duration: 5000,
                    onAction: () => setTasks((list) => [...list.slice(0, i), t, ...list.slice(i)]),
                  });
                }}
              />
            </View>
          ))}
        </Demo>
      ),
    },
  ];

  const confirmSpec = {
    close: { title: 'Clôturer l’intervention ?', message: 'INT-0412 passera au statut « Clôturée ».' },
    delete: {
      title: 'Supprimer ce client ?',
      message: 'Transports Yao & Fils et ses 12 véhicules seront supprimés.',
      confirm: 'Supprimer',
      danger: true,
    },
    terminate: {
      title: 'Résilier le contrat ?',
      message: 'Toutes les balises seront désactivées.',
      confirm: 'Résilier',
      danger: true,
      typeToConfirm: 'CTR-0042',
    },
  } as const;
  const spec = confirm ? confirmSpec[confirm] : null;

  return (
    <View style={styles.fill}>
      <DocPage
        title="Feedback"
        icon="mi:notifications-active"
        initialSection={initialSection}
        testID="category-feedback"
        subtitle="Retours visuels : alertes, snackbars, dialogs génériques, formulaires en feuille, confirmations, drawers, indicateurs de chargement, squelettes et états d’erreur."
        sections={sections}
      />
      {overlay ? <OverlaySpinner absolute message="Synchronisation des positions…" /> : null}

      <AlertDialog
        visible={alert !== null}
        onDismiss={() => setAlert(null)}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        icon={alert?.icon}
        tone={alert?.tone}
        ok={alert?.ok}
      />
      <ConfirmDialog
        visible={spec !== null}
        title={spec?.title ?? ''}
        message={spec?.message ?? ''}
        confirm={spec && 'confirm' in spec ? spec.confirm : undefined}
        danger={spec && 'danger' in spec ? spec.danger : false}
        typeToConfirm={spec && 'typeToConfirm' in spec ? spec.typeToConfirm : undefined}
        onResult={(ok) => {
          const kind = confirm;
          setConfirm(null);
          if (kind === 'close') snack.show(ok ? 'Confirmé' : 'Annulé');
          else if (kind === 'delete' && ok) snack.show('Client supprimé (démo)', { kind: 'error' });
        }}
      />
      <PromptDialog
        visible={prompt}
        title="Renommer le groupe"
        initial="Livraisons Nord"
        hint="Nom du groupe"
        onResult={(v) => {
          setPrompt(false);
          if (v !== null) snack.show(`Renommé en « ${v} »`, { kind: 'success' });
        }}
      />
      <PushMessage
        visible={push}
        onDismiss={() => setPush(false)}
        title="Nouveau : rapports carburant"
        message="Suivez la consommation de chaque véhicule et recevez une alerte en cas de siphonnage."
      />
      <PriorityMessage
        visible={priority}
        onDismiss={() => setPriority(false)}
        title="Maintenance planifiée"
        message="La plateforme sera indisponible dimanche de 02:00 à 04:00. Les positions seront mises en mémoire tampon par les balises."
      />
      <FormSheet
        visible={formSheet}
        onDismiss={() => setFormSheet(false)}
        title="Nouvelle intervention"
        icon="mi:build"
        onSubmit={() => setFormSheet(false)}
      >
        <KitTextField label="Véhicule" hint="CI-4521-AB" icon="mi:directions-car" />
        <KitTextField label="Motif" lines={3} hint="Décrivez le problème…" />
      </FormSheet>
      <FullscreenDialog
        visible={fullscreen}
        onDismiss={() => setFullscreen(false)}
        title="Conditions générales"
        action="Accepter"
        onAction={() => setFullscreen(false)}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <View key={i} style={styles.article}>
            <Text
              accessibilityRole="header"
              style={[font('700', 16, 'heading'), { color: kit.textPrimary }]}
            >{`Article ${i + 1}`}</Text>
            <Text style={[font('400', 14), styles.lh, { color: kit.textSecondary }]}>{ARTICLE}</Text>
          </View>
        ))}
      </FullscreenDialog>
      <BottomConfirm
        visible={bottom}
        title="Couper le moteur ?"
        message="Le véhicule CI-4521-AB sera immobilisé à son prochain arrêt."
        confirm="Couper le moteur"
        danger
        icon="mi:power-settings-new"
        onResult={(ok) => {
          setBottom(false);
          if (ok) snack.show('Commande envoyée (démo)', { kind: 'info' });
        }}
      />
      <SidePanel visible={panel} onDismiss={() => setPanel(false)} title="Notifications" icon="mi:notifications">
        {NOTIFICATIONS.map((n) => (
          <View key={n.title} style={styles.notif}>
            <View style={[styles.notifDisc, { backgroundColor: toneLight(n.tone, kit) }]}>
              <Icon source={n.icon} size={19} color={toneColor(n.tone, kit)} />
            </View>
            <View style={styles.fill}>
              <Text style={[font(n.read ? '500' : '700', 14), { color: kit.textPrimary }]}>{n.title}</Text>
              <Text style={[font('400', 12.5), { color: kit.textSecondary }]}>{n.text}</Text>
            </View>
          </View>
        ))}
      </SidePanel>
      <KitBottomSheet
        visible={draggable}
        onDismiss={() => setDraggable(false)}
        resizable={{ initial: 0.45, min: 0.3, max: 0.92 }}
      >
        <SheetHeader title="Tâches du jour" />
        <ScrollView contentContainerStyle={styles.sheetList}>
          <Text style={[font('400', 12), styles.sheetHint, { color: kit.textMuted }]}>
            Glissez la poignée vers le haut pour agrandir.
          </Text>
          {DEMO_CLIENTS.slice(0, 14).map((x, i) => (
            <CheckboxTile
              key={x.id}
              value={i < 3}
              onChange={() => undefined}
              title={`Tâche ${i + 1} — ${x.raisonSociale}`}
            />
          ))}
        </ScrollView>
      </KitBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { textAlign: 'center' },
  mt8: { marginTop: space.s2 },
  pad12: { padding: space.s3 },
  lh: { lineHeight: 21.7 },
  row8: { flexDirection: 'row', gap: 8 },
  row10: { flexDirection: 'row', gap: 10 },
  staticDialog: {
    alignSelf: 'center',
    width: 300,
    maxWidth: '100%',
    borderRadius: radius.x2l,
    padding: space.s5,
    alignItems: 'center',
    gap: 6,
  },
  disc52: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tipRow: { paddingTop: 36 },
  spinBg: { borderRadius: 999, borderWidth: 4 },
  rounded: { borderRadius: radius.sm },
  refresh: { height: 200 },
  denseRow: { paddingHorizontal: space.s4, minHeight: 64, justifyContent: 'center' },
  h140: { height: 140 },
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: space.s2,
    paddingHorizontal: space.s4,
  },
  offlineSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s4,
    paddingLeft: space.s4,
    paddingRight: space.s2,
  },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s4,
    paddingLeft: space.s4,
    paddingRight: space.s1,
    minHeight: 56,
  },
  article: { gap: 6, marginBottom: space.s4 },
  notif: { flexDirection: 'row', gap: space.s4, paddingHorizontal: space.s4, paddingVertical: space.s3 },
  notifDisc: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  sheetList: { paddingHorizontal: space.s4, paddingBottom: space.s4 },
  sheetHint: { marginBottom: space.s1 },
});
