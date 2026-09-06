import { describe, expect, it } from 'vitest';

import { numberColumn, optionalColumn, stringColumn } from '../src/columns.js';
import { parseCsv, type Schema } from '../src/parse-csv.js';

interface Person {
  name: string;
  age: number;
  nickname: string | undefined;
}

const schema: Schema<Person> = {
  name: stringColumn(),
  age: numberColumn(),
  nickname: optionalColumn(stringColumn()),
};

describe('parseCsv', () => {
  it('analyse un CSV valide et déduit le type des lignes', () => {
    const csv = 'name,age,nickname\nAda,36,\nAlan,41,The Professor';

    const { rows, rowErrors } = parseCsv<Person>(csv, schema);

    expect(rowErrors).toHaveLength(0);
    expect(rows).toEqual([
      { name: 'Ada', age: 36, nickname: undefined },
      { name: 'Alan', age: 41, nickname: 'The Professor' },
    ]);
  });

  it('accumule les erreurs SANS interrompre l’analyse des lignes suivantes', () => {
    const csv = 'name,age,nickname\nAda,pas-un-nombre,\nAlan,41,';

    const { rows, rowErrors } = parseCsv<Person>(csv, schema);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ name: 'Alan', age: 41, nickname: undefined });
    expect(rowErrors).toHaveLength(1);
    expect(rowErrors[0]?.line).toBe(2);
    expect(rowErrors[0]?.errors[0]).toContain('age');
  });

  it('signale les colonnes manquantes dans l’en-tête', () => {
    const csv = 'name,age\nAda,36';

    const { rows, rowErrors } = parseCsv<Person>(csv, schema);

    expect(rows).toHaveLength(0);
    expect(rowErrors).toHaveLength(1);
    expect(rowErrors[0]?.errors[0]).toContain('nickname');
  });

  it('signale un nombre de colonnes incorrect sur une ligne donnée', () => {
    const csv = 'name,age,nickname\nAda,36';

    const { rowErrors } = parseCsv<Person>(csv, schema);

    expect(rowErrors).toHaveLength(1);
    expect(rowErrors[0]?.errors[0]).toContain('Nombre de colonnes');
  });

  it('respecte les champs guillemetés contenant des virgules', () => {
    const csv = 'name,age,nickname\n"Doe, Jane",30,';

    const { rows } = parseCsv<Person>(csv, schema);

    expect(rows[0]?.name).toBe('Doe, Jane');
  });

  it('signale un fichier vide', () => {
    const { rowErrors } = parseCsv<Person>('', schema);
    expect(rowErrors[0]?.errors[0]).toContain('Fichier vide');
  });
});
