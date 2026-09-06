import { describe, expect, it } from 'vitest';

import {
  booleanColumn,
  dateColumn,
  numberColumn,
  optionalColumn,
  stringColumn,
} from '../src/columns.js';

describe('stringColumn', () => {
  it('accepte toute chaîne', () => {
    expect(stringColumn().parse('Ada')).toEqual({ ok: true, value: 'Ada' });
  });
});

describe('numberColumn', () => {
  it('parse un nombre valide', () => {
    expect(numberColumn().parse('42')).toEqual({ ok: true, value: 42 });
  });

  it('rejette une valeur non numérique', () => {
    const result = numberColumn().parse('abc');
    expect(result.ok).toBe(false);
  });
});

describe('booleanColumn', () => {
  it.each([
    ['true', true],
    ['1', true],
    ['false', false],
    ['0', false],
  ])('parse "%s" en %s', (raw, expected) => {
    expect(booleanColumn().parse(raw)).toEqual({ ok: true, value: expected });
  });

  it('rejette une valeur ambiguë', () => {
    expect(booleanColumn().parse('maybe').ok).toBe(false);
  });
});

describe('dateColumn', () => {
  it('parse une date ISO valide', () => {
    const result = dateColumn().parse('2026-09-01');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeInstanceOf(Date);
    }
  });

  it('rejette une date invalide', () => {
    expect(dateColumn().parse('pas une date').ok).toBe(false);
  });
});

describe('optionalColumn', () => {
  it('transforme une chaîne vide en undefined', () => {
    expect(optionalColumn(numberColumn()).parse('')).toEqual({ ok: true, value: undefined });
  });

  it('délègue à la colonne enveloppée pour une valeur non vide', () => {
    expect(optionalColumn(numberColumn()).parse('7')).toEqual({ ok: true, value: 7 });
  });
});
