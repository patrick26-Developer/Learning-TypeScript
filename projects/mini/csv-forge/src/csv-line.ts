/**
 * Découpe une ligne CSV en champs, en respectant les guillemets (RFC 4180) :
 * une virgule À L'INTÉRIEUR d'un champ entre guillemets ne sépare pas deux
 * champs, et `""` à l'intérieur d'un champ guillemeté représente un
 * guillemet littéral.
 *
 *   splitCsvLine('a,b,c')            → ['a', 'b', 'c']
 *   splitCsvLine('"a, b",c')         → ['a, b', 'c']
 *   splitCsvLine('"il dit ""oui"""') → ['il dit "oui"']
 *
 * `line.charAt(i)` plutôt que `line[i]` : avec `noUncheckedIndexedAccess`
 * (module 03), `line[i]` serait typé `string | undefined`. `.charAt()`
 * renvoie toujours une chaîne (vide hors limites), ce qui évite tout
 * narrowing superflu dans une boucle dont les bornes sont déjà correctes.
 */
export function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line.charAt(i);

    if (inQuotes) {
      if (char === '"') {
        if (line.charAt(i + 1) === '"') {
          current += '"';
          i += 1; // consomme le second guillemet de l'échappement
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}
