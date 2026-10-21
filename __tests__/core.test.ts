import { ago, compact, date, dateLong, decimal1, fcfa, NBSP, NNBSP, number } from '../src/core/format';
import { frenchTypography, revealSpaces } from '../src/core/frenchTypography';
import { contrast } from '../src/theme/colors';

describe('espaces spéciales', () => {
  it('insécable U+00A0 et fine insécable U+202F', () => {
    expect(NBSP.codePointAt(0)).toBe(0xa0);
    expect(NNBSP.codePointAt(0)).toBe(0x202f);
  });
});

describe('formats fr-FR (Fmt Flutter)', () => {
  it('nombres et montants avec espace fine insécable', () => {
    expect(number(1250000)).toBe(`1${NNBSP}250${NNBSP}000`);
    expect(number(-4500)).toBe(`-4${NNBSP}500`);
    expect(fcfa(1250000)).toBe(`1${NNBSP}250${NNBSP}000 FCFA`);
    expect(decimal1(96.4)).toBe('96,4');
    expect(decimal1(12345.67)).toBe(`12${NNBSP}345,7`);
  });
  it('compacts', () => {
    expect(compact(55800000)).toBe('55,8 M');
    expect(compact(2_400_000_000)).toBe('2,4 Md');
    expect(compact(45000)).toBe('45 k');
    expect(compact(950)).toBe('950');
  });
  it('dates', () => {
    const d = new Date(2026, 9, 16);
    expect(date(d)).toBe('16/10/2026');
    expect(dateLong(d)).toBe('16 octobre 2026');
  });
  it('relatif', () => {
    const now = new Date(2026, 9, 16, 12, 0);
    const before = (ms: number) => new Date(now.getTime() - ms);
    expect(ago(before(20_000), now)).toBe('à l’instant');
    expect(ago(before(12 * 60_000), now)).toBe('il y a 12 min');
    expect(ago(before(3 * 3_600_000), now)).toBe('il y a 3 h');
    expect(ago(before(26 * 3_600_000), now)).toBe('hier');
    expect(ago(before(5 * 86_400_000), now)).toBe('il y a 5 j');
    expect(ago(before(40 * 86_400_000), now)).toBe('06/09/2026');
  });
});

describe('typographie française', () => {
  const out = frenchTypography(
    'Le client a dit : "la balise est hors ligne depuis 14h05..." Montant du : 1250000 FCFA ! Equipe d\'intervention - priorite haute ?',
  );
  it('guillemets, apostrophe, points de suspension, tiret', () => {
    expect(out).toContain(`«${NBSP}la balise`);
    expect(out).toContain(`…${NBSP}»`);
    expect(out).toContain('Équipe d’intervention – priorite');
  });
  it('heures, milliers, unités et ponctuation haute', () => {
    expect(out).toContain(`14${NBSP}h${NBSP}05`);
    expect(out).toContain(`1${NNBSP}250${NNBSP}000${NBSP}FCFA${NNBSP}!`);
    expect(out).toContain(`haute${NNBSP}?`);
    expect(out).toContain(`dit${NBSP}:`);
  });
  it('les URL sont laissées intactes', () => {
    expect(frenchTypography('Voir https://lookas.ci/a?b=1 !')).toBe(`Voir https://lookas.ci/a?b=1${NNBSP}!`);
  });
  it('révèle les espaces spéciales', () => {
    expect(revealSpaces(`a${NBSP}b${NNBSP}c`)).toEqual([
      ['a', 'text'],
      [' ', 'nbsp'],
      ['b', 'text'],
      [' ', 'nnbsp'],
      ['c', 'text'],
    ]);
  });
});

describe('contraste WCAG', () => {
  it('noir sur blanc = 21, couleur translucide composée sur le fond', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrast('#00000000', '#ffffff')).toBeCloseTo(1, 5);
  });
});
