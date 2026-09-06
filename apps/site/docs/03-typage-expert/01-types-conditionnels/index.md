---
id: types-conditionnels
title: 'Module 09 — Types conditionnels, infer, mapped types, template literals'
sidebar_label: 'M09 · Types conditionnels'
sidebar_position: 1
description: Types conditionnels et leur distributivité, infer pour extraire un type, reconstruire Partial/Required/Pick/Omit à la main, remappage de clés par as, et les littéraux de gabarit.
keywords:
  [
    typescript,
    conditional types,
    infer,
    mapped types,
    template literal types,
    distributivité,
  ]
---

# Module 09 — Types conditionnels, `infer`, mapped types, template literals

|               |                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------- |
| **Durée**     | ≈ 10 heures                                                                                   |
| **Prérequis** | [Module 08 — Modules & déclarations](../../02-structurer/04-modules-et-declarations/index.md) |
| **Livrable**  | Réimplémenter `Partial`, `Required`, `Pick` et `Omit` sans les regarder                       |

:::tip Un changement de nature
Jusqu'ici, vous avez **décrit** des formes de données. À partir de ce
module, vous **calculez** des types à partir d'autres types — le système de
types de TypeScript devient un langage de programmation à part entière, qui
s'exécute à la compilation.
:::

---

## 1. Types conditionnels : `T extends U ? X : Y`

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<42>; // false
```

Combiné à des génériques, un type conditionnel choisit une forme selon la
nature du paramètre reçu :

```ts
type Flatten<T> = T extends (infer U)[] ? U : T;
// détaillé au §3
```

### La distributivité — vérifiée en construisant ce module

Un type conditionnel sur un paramètre de type **nu** (non enveloppé) se
**distribue** sur chaque membre d'une union :

```ts
type ToArray<T> = T extends unknown ? T[] : never;

type A = ToArray<string | number>;
// A = string[] | number[]   ← une UNION de deux tableaux
```

```ts title="Preuve"
const badA: string[] = {} as A;
// ❌ Type 'A' is not assignable to type 'string[]'.
//    Type 'number[]' is not assignable to type 'string[]'.
// La seule façon d'obtenir cette erreur est que A soit BIEN
// `string[] | number[]`, pas `(string | number)[]`.
```

Pour **empêcher** la distribution, enveloppez les deux côtés dans un tuple
à un élément :

```ts
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;

type B = ToArrayNonDist<string | number>;
// B = (string | number)[]   ← UN SEUL tableau mixte
```

```ts title="Preuve"
const goodB: (string | number)[] = {} as B;
// ✅ compile — confirme que B est bien (string | number)[]
```

:::danger Pourquoi cette distinction compte réellement
Sans le savoir, écrire `T extends U ? X : Y` sur un type générique produit
**presque toujours** un résultat distribué — c'est le comportement par
défaut. Si votre intention était de traiter l'union **comme un tout**
(par exemple : « ce type est-il l'union complète A | B ? »), un type
conditionnel nu répondra à une question différente de celle que vous posez,
sans qu'aucune erreur ne le signale. Le tuple à un élément est le seul
moyen de désactiver ce comportement.
:::

---

## 2. `Exclude`, `Extract` et `NonNullable` — construits sur cette base

```ts
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;
type MyNonNullable<T> = T extends null | undefined ? never : T;

type Status = 'active' | 'inactive' | 'banned';
type NotBanned = MyExclude<Status, 'banned'>; // 'active' | 'inactive'
```

La distributivité est ici **la fonctionnalité**, pas un piège : chaque
membre de l'union est testé individuellement contre `U`, et seuls ceux qui
échouent (`MyExclude`) ou réussissent (`MyExtract`) le test survivent —
c'est un `.filter()`, mais au niveau des types.

---

## 3. `infer` : extraire un type depuis un autre

```ts
type ElementType<T> = T extends (infer U)[] ? U : T;

type A = ElementType<string[]>; // string
type B = ElementType<number>; // number (T n'est pas un tableau : U ne s'applique pas)
```

`infer U` déclare une **variable de type locale**, dont la valeur est
déduite par la correspondance de motif (`T extends (infer U)[]`). C'est le
mécanisme qui alimente des utilitaires très fréquents :

```ts
type ReturnTypeOf<T> = T extends (...args: never[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: 'Ada' };
}
type User = ReturnTypeOf<typeof getUser>; // { id: number; name: string }

type ParamsOf<T> = T extends (...args: infer P) => unknown ? P : never;
type P = ParamsOf<(a: number, b: string) => void>; // [number, string]

type Awaited2<T> = T extends Promise<infer V> ? V : T;
type V = Awaited2<Promise<string>>; // string
```

:::info `ReturnType`, `Parameters`, `Awaited` existent déjà
Ces trois exemples réimplémentent (en version simplifiée) des utilitaires
**natifs** de TypeScript. Les réécrire soi-même une fois est le meilleur
moyen de comprendre ce qu'ils font réellement — vous utiliserez ensuite les
versions natives, plus complètes, sans jamais plus les traiter comme de la
magie.
:::

---

## 4. Types mappés : reconstruire `Partial`, `Required`, `Pick`, `Omit`

Un type mappé transforme **chaque propriété** d'un type source selon une
règle uniforme :

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyMutable<T> = { -readonly [K in keyof T]: T[K] };

type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyOmit<T, K extends keyof T> = MyPick<T, MyExclude<keyof T, K>>;
```

```ts title="Preuve — le modificateur -? force le caractère obligatoire"
interface Draft {
  title?: string;
}
type Published = MyRequired<Draft>;

const p: Published = {}; // ❌ Property 'title' is missing
const p2: Published = { title: 'Titre requis' }; // ✅
```

Les préfixes `+`/`-` devant `readonly` ou `?` **ajoutent ou retirent**
explicitement le modificateur (`+` est le défaut implicite, rarement écrit).
`MyOmit` illustre la composition : il **réutilise** `MyPick` et
`MyExclude` plutôt que de tout réécrire — exactement comme la bibliothèque
standard de TypeScript le fait en interne.

---

## 5. Remappage de clés par `as`

Depuis TypeScript 4.1, un type mappé peut **transformer les noms de
propriétés**, pas seulement leurs valeurs :

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Point {
  x: number;
  y: number;
}
type PointGetters = Getters<Point>;
// { getX: () => number; getY: () => number }

const g: PointGetters = {
  getX: () => 1,
  getY: () => 2,
};
```

`Capitalize<S>` fait partie d'une petite famille de manipulations de
littéraux de chaîne **intégrées au langage** (`Uppercase`, `Lowercase`,
`Capitalize`, `Uncapitalize`), utilisables uniquement sur des types
littéraux de chaîne — jamais sur une valeur `string` à l'exécution
(module 00, Décision 2, encore et toujours).

`as never` dans le remappage **supprime** une clé du résultat :

```ts
type OmitByPrefix<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K];
};

type WithPrivate = { name: string; _internal: number };
type Cleaned = OmitByPrefix<WithPrivate>; // { name: string }
```

---

## 6. Types littéraux de gabarit (_template literal types_)

```ts
type EventName = 'click' | 'hover' | 'focus';
type HandlerName = `on${Capitalize<EventName>}`;
// 'onClick' | 'onHover' | 'onFocus'

type Route = `/users/${string}`;
const valid: Route = '/users/42'; // ✅
const invalid: Route = '/products/1'; // ❌
```

Combinés à `infer` **à l'intérieur d'un littéral**, les gabarits permettent
d'analyser la **structure** d'une chaîne au niveau des types :

```ts
type ExtractId<S extends string> = S extends `/users/${infer Id}` ? Id : never;

type Id = ExtractId<'/users/42'>; // '42' (un type littéral, pas un number !)
```

C'est **exactement** le mécanisme que le mini-projet de fin de partie
(`typed-router`) généralise pour déduire automatiquement les paramètres
nommés d'une route complète.

---

## 7. Types récursifs, et leur limite

```ts
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const data: Json = {
  name: 'Ada',
  tags: ['pioneer', 'mathematician'],
  metadata: { born: 1815 },
};
```

Un type peut se référer **à lui-même**, à condition qu'au moins une branche
ne soit pas récursive (ici, les primitifs). TypeScript limite la profondeur
de récursion qu'il accepte d'évaluer (environ 50 niveaux d'instanciation) :
au-delà, l'erreur `Type instantiation is excessively deep and possibly
infinite` apparaît — un signal qu'un type a probablement été mal conçu
(souvent une distributivité oubliée qui explose combinatoirement), plutôt
qu'une limite à contourner à tout prix.

---

## 8. Ce que vous devez retenir

1. **Un type conditionnel sur un paramètre nu se distribue sur une union**
   — `[T] extends [U]` désactive ce comportement quand vous voulez traiter
   l'union comme un bloc.
2. **`infer` déclare une variable de type déduite par correspondance de
   motif** — la base de `ReturnType`, `Parameters`, `Awaited`, et de tout
   parseur au niveau des types.
3. **Un type mappé transforme chaque propriété** ; `+`/`-` devant
   `readonly`/`?` ajoutent ou retirent explicitement un modificateur.
4. **Le remappage par `as`** transforme ou supprime (`as never`) des noms
   de clés.
5. **Les littéraux de gabarit** analysent la structure des chaînes au
   niveau des types, avec `infer` à l'intérieur du gabarit.

---

## 9. Auto-évaluation

1. Sans exécuter de code, prédisez ce que produit
   `type X<T> = T extends string ? 'oui' : 'non'` appliqué à
   `'a' | 42 | 'b'`. Pourquoi ?
2. Réimplémentez `Record<K, V>` en type mappé, sans le nommer `Record`.
3. Pourquoi `ExtractId<'/posts/7'>` (avec le gabarit `` `/users/${infer Id}` ``)
   donne-t-il `never`, et pas une erreur de compilation ?
4. Qu'est-ce qui distingue `MyReadonly<T>` de `Readonly<T>` (la version
   native) ? (Indice : rien — c'est voulu, pour vérifier votre
   compréhension autant que votre mémorisation.)
5. À partir de quand TypeScript refuse-t-il d'évaluer un type récursif, et
   que suggère généralement cette limite atteinte sur la conception du type ?

---

## Étape suivante

👉 [Module 10 — Programmer au niveau des types](../02-programmer-les-types/index.md)
