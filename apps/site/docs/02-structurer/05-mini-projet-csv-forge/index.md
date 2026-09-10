---
id: mini-projet-csv-forge
title: 'Mini-projet 2 — csv-forge'
sidebar_label: 'Mini-projet · csv-forge'
sidebar_position: 6
description: Un parseur CSV typé par son schéma — génériques, keyof, unions discriminées et gestion d'erreurs par accumulation, avec le code de la solution commenté.
keywords: [typescript, mini-projet, csv, génériques, keyof, parseur]
---

# Mini-projet 2 — csv-forge

|                 |                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Réinvestit**  | Modules 05 à 08                                                                                                           |
| **Code source** | [`projects/mini/csv-forge`](https://github.com/patrick26-Developer/Learning-TypeScript/tree/main/projects/mini/csv-forge) |
| **Tests**       | 23 tests, tous verts                                                                                                      |

Un parseur CSV **typé par son schéma** : vous déclarez le type de vos lignes,
vous fournissez une colonne pour chaque champ, et la bibliothèque garantit
que les deux concordent — **à la compilation**, pas seulement à l'exécution.

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

Oubliez une colonne dans `schema`, ou donnez-lui le mauvais type de retour :
**`tsc` refuse de compiler** — avant même d'avoir lu un seul fichier CSV.

---

## 1. Ce que ce projet réinvestit

| Notion                               | Où                                              | Module |
| ------------------------------------ | ----------------------------------------------- | ------ |
| Génériques + `keyof`                 | `Schema<Row>`                                   | 06     |
| Générique qui enveloppe un générique | `optionalColumn<T>`                             | 06     |
| Union discriminée                    | `ParseResult<T>`                                | 07     |
| Gestion d'erreurs par accumulation   | `parseCsv` continue après une ligne invalide    | 07     |
| Assertion justifiée par une preuve   | `Object.keys(schema) as (keyof Row & string)[]` | 05     |

---

## 2. Le schéma : un générique contraint par `keyof`

```ts title="src/columns.ts"
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
      return Number.isNaN(value)
        ? err(`"${raw}" n'est pas un nombre valide.`)
        : ok(value);
    },
  };
}
```

Un `ColumnDef<T>` sait transformer **un** champ texte brut en une valeur de
type `T`, ou expliquer pourquoi il ne le peut pas. C'est le seul point de
contact entre « du texte » et « un type » dans toute la bibliothèque —
`parseCsv` elle-même ne fait jamais d'interprétation de texte : elle
délègue entièrement aux colonnes.

`Schema<Row>` (déclaré à côté) relie chaque clé de `Row` à un `ColumnDef` du
bon type — c'est `keyof` (module 05) qui rend cette contrainte exprimable :
impossible d'oublier un champ ou de lui donner la mauvaise colonne.

### Un générique qui enveloppe un générique

```ts
export function optionalColumn<T>(
  column: ColumnDef<T>,
): ColumnDef<T | undefined> {
  return {
    parse: (raw) => (raw.trim() === '' ? ok(undefined) : column.parse(raw)),
  };
}
```

`optionalColumn` ne sait rien analyser lui-même : il **délègue** à la
colonne qu'on lui passe, et n'ajoute qu'un seul comportement — une chaîne
vide devient `undefined`. C'est le patron `map` du conteneur générique
(module 06), appliqué à un cas concret.

---

## 3. Lancer les tests

```bash
git clone https://github.com/patrick26-Developer/Learning-TypeScript.git
cd Learning-TypeScript && pnpm install
pnpm --filter @atlas/mini-csv-forge test
pnpm --filter @atlas/mini-csv-forge typecheck
pnpm --filter @atlas/mini-csv-forge lint
```

---

## 4. Ce qui est volontairement absent

- **Pas de support des retours à la ligne à l'intérieur d'un champ
  guillemeté** (un CSV « multiligne ») : `splitCsvLine` traite une ligne à
  la fois. Un vrai parseur RFC 4180 complet devrait consommer le flux
  caractère par caractère sans présupposer qu'une ligne du fichier est un
  enregistrement — une piste d'amélioration volontaire, excellent
  exercice 🔴.

---

## Étape suivante

👉 [Module 09 — Types conditionnels, `infer`, mapped types](../../03-typage-expert/01-types-conditionnels/index.md)
— la Partie III commence.
