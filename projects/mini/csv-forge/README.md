# csv-forge

Mini-projet 2 de [TypeScript Atlas](../../../README.md) — un parseur CSV
**typé par son schéma** : vous déclarez le type de vos lignes, vous fournissez
une colonne pour chaque champ, et la bibliothèque garantit que les deux
concordent — à la compilation, pas seulement à l'exécution.

## Exemple

```ts
import {
  parseCsv,
  stringColumn,
  numberColumn,
  optionalColumn,
  type Schema,
} from '@atlas/mini-csv-forge';

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

const { rows, rowErrors } = parseCsv<Person>(
  'name,age,nickname\nAda,36,\nAlan,41,The Professor',
  schema,
);

// rows: Person[] — le type est déduit du schéma, pas ré-annoté à la main
// rowErrors: chaque ligne invalide, SANS interrompre l'analyse des autres
```

Si vous oubliez une colonne dans `schema`, ou lui donnez le mauvais type de
retour, **`tsc` refuse de compiler** — avant même d'avoir lu un seul fichier.

## Ce que ce projet réinvestit

| Notion                                                         | Où                                              |
| -------------------------------------------------------------- | ----------------------------------------------- |
| Génériques + `keyof`                                           | `Schema<Row>` (module 06)                       |
| Générique qui enveloppe un générique                           | `optionalColumn<T>`                             |
| Union discriminée                                              | `ParseResult<T>` (module 07)                    |
| Gestion d'erreurs par accumulation                             | `parseCsv` continue après une ligne invalide    |
| Assertion justifiée par une preuve, jamais par une supposition | `Object.keys(schema) as (keyof Row & string)[]` |

## Lancer les tests

```bash
pnpm --filter @atlas/mini-csv-forge test
pnpm --filter @atlas/mini-csv-forge typecheck
pnpm --filter @atlas/mini-csv-forge lint
```

## Ce qui est volontairement absent

- Pas de support des retours à la ligne À L'INTÉRIEUR d'un champ guillemeté
  (un CSV « multiligne ») : `splitCsvLine` traite une ligne à la fois. Un
  vrai parseur RFC 4180 complet devrait consommer le flux caractère par
  caractère sans présupposer que chaque ligne du fichier est un
  enregistrement — laissé comme piste d'amélioration volontaire.
