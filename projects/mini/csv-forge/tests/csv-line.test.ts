import { describe, expect, it } from 'vitest';

import { splitCsvLine } from '../src/csv-line.js';

describe('splitCsvLine', () => {
  it('sépare des champs simples', () => {
    expect(splitCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('conserve une virgule à l’intérieur d’un champ guillemeté', () => {
    expect(splitCsvLine('"a, b",c')).toEqual(['a, b', 'c']);
  });

  it('dé-échappe un guillemet doublé à l’intérieur d’un champ guillemeté', () => {
    expect(splitCsvLine('"il dit ""oui""",ok')).toEqual(['il dit "oui"', 'ok']);
  });

  it('gère un champ vide en fin de ligne', () => {
    expect(splitCsvLine('a,b,')).toEqual(['a', 'b', '']);
  });

  it('gère une ligne à un seul champ', () => {
    expect(splitCsvLine('seul')).toEqual(['seul']);
  });
});
