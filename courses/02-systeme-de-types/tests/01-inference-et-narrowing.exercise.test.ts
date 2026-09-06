import { describe, expect, it } from 'vitest';

import { describeValue } from '../exercises/01-inference-et-narrowing.js';

describe('describeValue', () => {
  it('détecte null distinctement d’un objet', () => {
    expect(describeValue(null)).toBe('null');
  });

  it('détecte un tableau, y compris vide', () => {
    expect(describeValue([1, 2, 3])).toBe('tableau de 3 élément(s)');
    expect(describeValue([])).toBe('tableau de 0 élément(s)');
  });

  it('détecte une chaîne', () => {
    expect(describeValue('bonjour')).toBe('chaîne : "bonjour"');
  });

  it('détecte un nombre, y compris NaN', () => {
    expect(describeValue(42)).toBe('nombre : 42');
    expect(describeValue(Number.NaN)).toBe('NaN');
  });

  it('détecte un booléen', () => {
    expect(describeValue(true)).toBe('booléen : true');
    expect(describeValue(false)).toBe('booléen : false');
  });

  it('détecte un objet ordinaire et compte ses clés', () => {
    expect(describeValue({ a: 1, b: 2 })).toBe('objet avec 2 clé(s)');
  });

  it('gère les valeurs non couvertes explicitement sans planter', () => {
    expect(describeValue(undefined)).toBe('valeur de type undefined');
  });
});
