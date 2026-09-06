import { err, ok, type ParseResult } from './result.js';

/**
 * Un `ColumnDef<T>` sait transformer UN champ texte brut en une valeur de
 * type `T`, ou signaler pourquoi il ne le peut pas. C'est le seul point de
 * contact entre "du texte" et "un type" dans toute la bibliothèque — la
 * fonction `parseCsv` (voir parse-csv.ts) ne fait jamais elle-même
 * d'interprétation de texte, elle délègue entièrement aux colonnes.
 */
export interface ColumnDef<T> {
  readonly parse: (raw: string) => ParseResult<T>;
}

export function stringColumn(): ColumnDef<string> {
  return { parse: (raw) => ok(raw) };
}

export function numberColumn(): ColumnDef<number> {
  return {
    parse: (raw) => {
      const value = Number(raw);
      return Number.isNaN(value) ? err(`"${raw}" n'est pas un nombre valide.`) : ok(value);
    },
  };
}

export function booleanColumn(): ColumnDef<boolean> {
  return {
    parse: (raw) => {
      const normalized = raw.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') return ok(true);
      if (normalized === 'false' || normalized === '0') return ok(false);
      return err(`"${raw}" n'est pas un booléen valide (attendu : true/false/1/0).`);
    },
  };
}

export function dateColumn(): ColumnDef<Date> {
  return {
    parse: (raw) => {
      const timestamp = Date.parse(raw);
      return Number.isNaN(timestamp)
        ? err(`"${raw}" n'est pas une date valide.`)
        : ok(new Date(timestamp));
    },
  };
}

/**
 * Transforme n'importe quel `ColumnDef<T>` en colonne acceptant une chaîne
 * vide comme `undefined` — un GÉNÉRIQUE qui enveloppe un autre générique,
 * exactement le patron `map` du `Container<T>` du module 06.
 */
export function optionalColumn<T>(column: ColumnDef<T>): ColumnDef<T | undefined> {
  return {
    parse: (raw) => (raw.trim() === '' ? ok(undefined) : column.parse(raw)),
  };
}
