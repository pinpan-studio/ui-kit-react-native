/** Fichiers et médias de démonstration (générés localement, aucun réseau). */

export type ViewerKind = 'image' | 'pdf' | 'video' | 'audio' | 'csv' | 'code' | 'text' | 'bin';

export interface ViewerFile {
  name: string;
  kind: ViewerKind;
  size: string;
  seed?: number;
}

export const VIEWER_FILES: ViewerFile[] = [
  { name: 'photo-installation.jpg', kind: 'image', size: '2,4 Mo', seed: 1 },
  { name: 'FAC-2026-0912.pdf', kind: 'pdf', size: '184 Ko' },
  { name: 'dashcam-10h05.mp4', kind: 'video', size: '18,2 Mo', seed: 4 },
  { name: 'appel-client.wav', kind: 'audio', size: '1,1 Mo' },
  { name: 'positions-octobre.csv', kind: 'csv', size: '86 Ko' },
  { name: 'gt06-config.json', kind: 'code', size: '2 Ko' },
  { name: 'notes-intervention.txt', kind: 'text', size: '1 Ko' },
  { name: 'firmware-v03.28.bin', kind: 'bin', size: '512 Ko' },
];

/** Vignettes de la galerie vidéo : titre, durée, graine de l'illustration. */
export const VIDEOS: [string, string, number][] = [
  ['Trajet CI-4521-AB', '2:14', 0],
  ['Pose balise FMB920', '5:02', 3],
  ['Dashcam — 10:05', '0:47', 4],
  ['Formation exploitants', '12:30', 2],
  ['Contrôle anti-démarrage', '1:36', 5],
  ['Recette port', '3:21', 1],
];

export const OFFRES = [
  {
    title: 'Suivi essentiel',
    subtitle: 'Position en temps réel, historique 90 jours, alertes de zone.',
    seed: 0,
    icon: 'mi:gps-fixed',
  },
  {
    title: 'Poids lourds',
    subtitle: 'Sondes carburant, temps de conduite, chronotachygraphe.',
    seed: 1,
    icon: 'mi:local-shipping',
  },
  { title: 'Vidéo embarquée', subtitle: 'Caméra double face et détection de fatigue.', seed: 2, icon: 'mi:videocam' },
  { title: 'Anti-démarrage', subtitle: 'Coupure moteur à distance et badge chauffeur.', seed: 4, icon: 'mi:lock' },
];

export const PHOTOS_INSTALLATION = {
  seeds: [1, 3, 5, 0, 2, 4],
  captions: [
    'Cabine CI-4521-AB',
    'Boîtier sous tableau de bord',
    'Antenne GPS',
    'Relais coupure moteur',
    'Faisceau d’alimentation',
    'Contrôle final',
  ],
};

export const INVOICE_LINES: [string, number, number][] = [
  ['Abonnement Suivi Premium — 24 véhicules', 24, 14500],
  ['Installation balise FMB920', 6, 35000],
  ['Option anti-démarrage', 6, 4500],
  ['Carte SIM data 1 Go', 24, 2500],
  ['Déplacement technicien (Yamoussoukro)', 1, 45000],
];

export const POSITIONS_CSV = [
  ['Immat.', 'Date', 'Km', 'Vitesse max'],
  ['CI-4521-AB', '01/10', '182', '94'],
  ['CI-2210-CD', '01/10', '96', '71'],
  ['CI-3307-EF', '02/10', '214', '88'],
  ['CI-0418-GH', '02/10', '0', '0'],
  ['CI-1150-LM', '03/10', '301', '102'],
];

export const GT06_CONFIG = `{
  "intervalle_gps": 15,
  "vitesse_max": 90,
  "coupe_moteur": true,
  "alertes": ["sortie_zone", "batterie_faible"]
}`;

export const NOTES_INTERVENTION = `Intervention INT-0412

Balise remplacée, antenne repositionnée.
Test de coupure moteur : OK.
Client informé.`;
