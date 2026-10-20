// Génère src/theme/generated/*.ts à partir des exports Angular (scripts/source/*.json).
// Les valeurs sont copiées telles quelles : aucune palette n'est recalculée.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => JSON.parse(readFileSync(join(root, 'scripts/source', f), 'utf8'));
const out = (f, s) => writeFileSync(join(root, 'src/theme/generated', f), s);

const camel = (k) => k.replace(/^--mat-sys-/, '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const pal = src('angular-palettes.json');
const metaTs = readFileSync(join(root, 'scripts/source/paletteMeta.ts'), 'utf8');
const labels = Object.fromEntries(
  [...metaTs.matchAll(/id: '([^']+)',\s*label: '([^']+)',\s*seed: '([^']+)'/g)].map((m) => [
    m[1],
    { label: m[2], seed: m[3] },
  ]),
);

const palettes = {};
for (const id of pal.paletteOrder) {
  const p = pal.palettes[id];
  palettes[id] = {};
  for (const mode of ['light', 'dark']) {
    palettes[id][mode] = Object.fromEntries(
      Object.entries(p[mode])
        .sort()
        .map(([k, v]) => [camel(k), v]),
    );
  }
}
const meta = pal.paletteOrder.map((id) => ({
  id,
  label: labels[id]?.label ?? id,
  seed: labels[id]?.seed ?? palettes[id].light.primary,
}));
const head = `// FICHIER GÉNÉRÉ par scripts/generate-theme.mjs — ne pas modifier à la main.\n// Source : ui-kit Angular ${pal.metadata.commit.slice(0, 7)} (${pal.metadata.branch}).\n`;
out(
  'palettes.ts',
  `${head}export const PALETTE_ORDER = ${JSON.stringify(pal.paletteOrder)} as const;\nexport type PaletteId = (typeof PALETTE_ORDER)[number];\nexport const PALETTE_META: readonly { id: PaletteId; label: string; seed: string }[] = ${JSON.stringify(meta)};\nexport type M3Role = ${Object.keys(
    palettes.cyan.light,
  )
    .map((k) => `'${k}'`)
    .join(
      ' | ',
    )};\nexport type M3Roles = Readonly<Record<M3Role, string>>;\nexport const PALETTES: Readonly<Record<PaletteId, { light: M3Roles; dark: M3Roles }>> = ${JSON.stringify(palettes)};\n`,
);

const t = src('angular-design-tokens.json');
const px = (v) => (v === '0' ? 0 : parseFloat(v));
const strip = (o, pre) =>
  Object.fromEntries(
    Object.entries(o)
      .filter(([k]) => k.startsWith(pre))
      .map(([k, v]) => [k.slice(pre.length), px(v.resolved)]),
  );
const sys = t.typography.sys;
const roles = [
  ...new Set(
    Object.keys(sys)
      .map((k) => k.match(/^--mat-sys-([a-z]+-[a-z]+)-size$/)?.[1])
      .filter(Boolean),
  ),
];
const rem = (v) => (v.endsWith('rem') ? Math.round(parseFloat(v) * 16 * 100) / 100 : parseFloat(v));
const type = Object.fromEntries(
  roles.map((r) => [
    r.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
    {
      family: sys[`--mat-sys-${r}-font`],
      size: rem(sys[`--mat-sys-${r}-size`]),
      lineHeight: rem(sys[`--mat-sys-${r}-line-height`]),
      tracking: rem(sys[`--mat-sys-${r}-tracking`] ?? '0'),
      weight: sys[`--mat-sys-${r}-weight`],
    },
  ]),
);
out(
  'tokens.ts',
  `${head}export const SPACE = ${JSON.stringify(strip(t.spacing, '--space-'))} as const;\nexport const RADIUS = ${JSON.stringify(strip(t.radius, '--radius-'))} as const;\nexport const CSS_ELEVATION = ${JSON.stringify(t.elevation)} as const;\nexport const STATE_LAYERS = ${JSON.stringify(Object.fromEntries(Object.entries(t.stateLayers).map(([k, v]) => [k.replace(/^--mat-sys-|-state-layer-opacity$/g, ''), Number(v)])))} as const;\nexport const TYPE_SCALE = ${JSON.stringify(type)} as const;\n`,
);
console.log('palettes', pal.paletteOrder.length, 'type roles', roles.length);
