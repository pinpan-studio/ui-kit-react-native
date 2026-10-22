/* global __dirname, describe, expect, it */
const { readdirSync, readFileSync } = require('fs');
const { join } = require('path');

/** Les composants du kit tirent toutes leurs couleurs du thème (`useKitTheme`), jamais de littéraux. */
describe('aucune couleur codée en dur dans src/components', () => {
  const dir = join(__dirname, '../src/components');
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.tsx'));

  it('trouve les composants', () => expect(files.length).toBeGreaterThan(0));

  it.each(files)('%s', (file) => {
    const src = readFileSync(join(dir, file), 'utf8');
    expect(src.match(/['"`]#[0-9a-fA-F]{3,8}['"`]|rgba?\(/g)).toBeNull();
  });
});
