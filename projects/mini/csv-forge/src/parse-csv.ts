import { splitCsvLine } from './csv-line.js';
import type { ColumnDef } from './columns.js';

/**
 * `Schema<Row>` associe à CHAQUE clé de `Row` la colonne capable de la
 * produire. Techniquement, `{ [K in keyof Row]: … }` est un TYPE MAPPÉ —
 * une construction que le module 09 explique en profondeur, avec bien
 * d'autres. On l'utilise ici sous sa forme la plus simple, sans rien de
 * plus qu'une extension naturelle de `keyof` (déjà vu au module 06) :
 * "un objet qui a exactement les mêmes clés que Row, mais dont chaque
 * valeur est un ColumnDef pour le type de cette clé".
 */
export type Schema<Row> = {
  readonly [K in keyof Row]: ColumnDef<Row[K]>;
};

export interface RowError {
  readonly line: number; // numéro de ligne dans le fichier (1 = l'en-tête)
  readonly errors: readonly string[];
}

export interface CsvParseOutcome<Row> {
  readonly rows: readonly Row[];
  readonly rowErrors: readonly RowError[];
}

/**
 * Analyse un texte CSV complet selon un schéma déclaré par l'appelant.
 * Chaque ligne est traitée INDÉPENDAMMENT : une ligne invalide n'empêche
 * jamais l'analyse des suivantes — c'est la "gestion d'erreurs par
 * accumulation" annoncée au programme de ce mini-projet.
 */
export function parseCsv<Row>(source: string, schema: Schema<Row>): CsvParseOutcome<Row> {
  const lines = source.split(/\r\n|\n/).filter((line, index, all) => {
    // Autorise une dernière ligne vide (fichier terminé par un retour à
    // la ligne) sans la traiter comme une ligne de données invalide.
    return !(line === '' && index === all.length - 1);
  });

  const headerLine = lines[0];
  if (headerLine === undefined) {
    return {
      rows: [],
      rowErrors: [{ line: 1, errors: ['Fichier vide : aucun en-tête trouvé.'] }],
    };
  }

  // `Object.keys` renvoie `string[]`, pas `(keyof Row)[]` — une limitation
  // connue de TypeScript (les clés ajoutées dynamiquement à un objet ne
  // sont, en toute rigueur, jamais prouvables comme exhaustives). Ici,
  // `schema` a été construit avec EXACTEMENT les clés de `Row` (c'est ce
  // que garantit le type `Schema<Row>` lui-même) : l'assertion est donc
  // fondée sur une preuve du système de types, pas sur une supposition.
  const columnNames = Object.keys(schema) as (keyof Row & string)[];

  const header = splitCsvLine(headerLine).map((h) => h.trim());
  const missing = columnNames.filter((name) => !header.includes(name));
  const unexpected = header.filter((name) => !columnNames.includes(name as keyof Row & string));

  if (missing.length > 0 || unexpected.length > 0) {
    const errors: string[] = [];
    if (missing.length > 0) errors.push(`Colonnes manquantes : ${missing.join(', ')}.`);
    if (unexpected.length > 0) errors.push(`Colonnes inattendues : ${unexpected.join(', ')}.`);
    return { rows: [], rowErrors: [{ line: 1, errors }] };
  }

  const rows: Row[] = [];
  const rowErrors: RowError[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const rawLine = lines[i];
    if (rawLine === undefined || rawLine.trim() === '') continue; // ligne vide ignorée

    const fields = splitCsvLine(rawLine);
    const lineNumber = i + 1;

    if (fields.length !== header.length) {
      rowErrors.push({
        line: lineNumber,
        errors: [
          `Nombre de colonnes incorrect (attendu ${String(header.length)}, reçu ${String(fields.length)}).`,
        ],
      });
      continue;
    }

    const errors: string[] = [];
    // Construit la ligne colonne par colonne. L'assertion `as Row` en fin
    // de boucle est justifiée par la boucle elle-même : elle parcourt
    // TOUTES les clés de `columnNames` (dérivées de `Schema<Row>`, donc de
    // `Row`) avant de retourner — preuve, pas supposition (même principe
    // que `validate.ts` dans taskline).
    const partial: Partial<Row> = {};

    columnNames.forEach((name) => {
      const columnIndex = header.indexOf(name);
      const raw = fields[columnIndex] ?? '';
      const result = schema[name].parse(raw);

      if (result.ok) {
        partial[name] = result.value;
      } else {
        errors.push(...result.errors.map((e) => `Colonne "${name}" : ${e}`));
      }
    });

    if (errors.length > 0) {
      rowErrors.push({ line: lineNumber, errors });
    } else {
      rows.push(partial as Row);
    }
  }

  return { rows, rowErrors };
}
