---
id: objets-et-unions
title: 'Module 03 — Objets, tableaux, tuples, unions, intersections, enums'
sidebar_label: 'M03 · Objets & unions'
sidebar_position: 4
description: Propriétés optionnelles et readonly, le contrôle d'excès de propriétés, tuples nommés, l'algèbre des types (unions/intersections), et pourquoi les experts évitent enum.
keywords:
  [typescript, objets, tableaux, tuples, unions, intersections, enum, readonly]
---

# Module 03 — Objets, tableaux, tuples, unions, intersections, enums

|               |                                                                          |
| ------------- | ------------------------------------------------------------------------ |
| **Durée**     | ≈ 7 heures                                                               |
| **Prérequis** | [Module 02 — Système de types](../02-systeme-de-types/index.md)          |
| **Livrable**  | Modéliser une donnée composée avec la structure la plus précise possible |

---

## 1. Types objets : optionnel, `readonly`, excès de propriétés

```ts
interface User {
  readonly id: string; // ne peut plus être réassigné après création
  name: string;
  email?: string; // optionnel : `string | undefined`
}

const u: User = { id: '1', name: 'Ada' }; // email omis : ✅, il est optionnel
u.id = '2'; // ❌ Cannot assign to 'id' because it is a read-only property
```

### Le contrôle d'excès de propriétés — et sa limite précise

```ts
function createUser(u: User) {
  /* … */
}

createUser({ id: '1', name: 'Ada', age: 36 });
// ❌ Object literal may only specify known properties,
//    and 'age' does not exist in type 'User'.

const draft = { id: '1', name: 'Ada', age: 36 };
createUser(draft); // ✅ AUCUNE erreur !
```

:::warning Pourquoi ces deux appels se comportent différemment
Le contrôle d'excès de propriétés (_excess property check_) **ne s'applique
qu'aux littéraux d'objet écrits directement à l'endroit de l'assignation**.
Passer une variable préexistante contourne ce contrôle, parce que
TypeScript est **structurel** (module 00, Décision 3) : `draft` a toutes les
propriétés de `User` **et plus**, ce qui reste compatible avec une
assignation par variable.

Ce n'est pas une faille : le contrôle existe précisément pour attraper les
**fautes de frappe** dans un littéral (`{ nmae: 'Ada' }` au lieu de
`{ name: 'Ada' }`), pas pour interdire les objets « plus riches » que
nécessaire.
:::

---

## 2. Tableaux et tuples

```ts
const names: string[] = ['Ada', 'Alan'];
const scores: Array<number> = [10, 20]; // syntaxe équivalente

// Un TUPLE fixe la longueur ET le type de chaque position :
const point: [number, number] = [10, 20];
const entry: [string, number] = ['age', 36];

// Tuples NOMMÉS (lisibilité, aucun effet sur le typage) :
type HttpResult = [status: number, body: string];

// Tuples VARIADIQUES (longueur variable en tête ou en queue) :
type Coords = [x: number, y: number, ...rest: number[]];
const c3d: Coords = [1, 2, 3];
const c2d: Coords = [1, 2];
```

Avec `noUncheckedIndexedAccess` (module 00, actif dans ce dépôt) :

```ts
const first: string = names[0];
// ❌ Type 'string | undefined' is not assignable to type 'string'.

const first = names[0]; // ✅ TypeScript infère `string | undefined`
if (first !== undefined) {
  first.toUpperCase(); // ✅ narrowed
}
```

---

## 3. Unions et intersections : l'algèbre des types

### Union (`|`) — « l'un OU l'autre »

```ts
type Id = string | number;

function printId(id: Id) {
  console.log(id);
}

printId('abc123'); // ✅
printId(42); // ✅
```

Une union n'autorise que les opérations **communes à tous ses membres** :

```ts
function formatId(id: Id) {
  return id.toUpperCase();
  // ❌ Property 'toUpperCase' does not exist on type 'number'.
}
```

### Intersection (`&`) — « l'un ET l'autre »

```ts
type Timestamped = { createdAt: Date };
type Named = { name: string };

type Event = Timestamped & Named;
// { createdAt: Date; name: string } — TOUTES les propriétés des deux côtés

const e: Event = { createdAt: new Date(), name: 'Lancement' };
```

:::info Union et intersection ne sont pas symétriques
`A | B` **réduit** ce que vous pouvez faire (seulement le commun).
`A & B` **augmente** ce que vous devez fournir (toutes les propriétés des
deux). C'est l'inverse de l'intuition qu'on a parfois avec `||` et `&&` en
JavaScript, qui portent sur des _valeurs_, pas sur des _types_.
:::

---

## 4. `enum`, et pourquoi les experts lui préfèrent un objet `as const`

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

console.log(Direction.Up); // 0 — enum numérique par défaut
```

Un `enum` **génère du code JavaScript réel** à l'exécution (vous l'avez
constaté concrètement au module 01 : `node` en mode _strip-only_ refuse de
l'exécuter, précisément parce que ce n'est pas une simple annotation
effaçable). Trois problèmes concrets en découlent :

```ts
enum Status {
  Active,
  Inactive,
}

function isActive(s: Status): boolean {
  return s === Status.Active;
}

isActive(0); // ✅ accepté ! 0 correspond à Status.Active
isActive(99); // ❌ refusé — mais seulement parce que 99 est hors plage
```

1. **Un enum numérique accepte n'importe quel nombre de sa plage implicite**,
   pas seulement ses membres nommés — une brèche de typage.
2. **Chaque `enum` génère un objet JavaScript à l'exécution**, avec un coût
   (taille du bundle, temps de démarrage), même si vous n'en avez jamais
   besoin qu'au niveau des types.
3. **Les `enum` const** (`const enum`) évitent ce coût, mais sont
   incompatibles avec `isolatedModules` (module 00, activé dans ce dépôt) —
   utilisés par Vite, esbuild et SWC.

### L'alternative recommandée : un objet `as const`

```ts
const Status = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

type Status = (typeof Status)[keyof typeof Status]; // 'active' | 'inactive'

function isActive(s: Status): boolean {
  return s === Status.Active;
}

isActive('active'); // ✅
isActive('anything'); // ❌ refusé à la compilation, pas seulement à l'exécution
```

**Avantages** : aucun code généré à l'exécution au-delà d'un objet littéral
simple, aucune plage implicite acceptée par erreur, compatible avec
`isolatedModules`, et le motif réutilise exactement ce que vous avez appris
au module 02 (`as const` + indexation par `typeof`).

:::note Ce dépôt n'utilise jamais `enum`
Vous ne rencontrerez cette syntaxe nulle part ailleurs dans ce parcours —
c'est un choix cohérent avec cette section.
:::

---

## 5. Ce que vous devez retenir

1. **Le contrôle d'excès de propriétés ne s'applique qu'aux littéraux
   directs** — le typage structurel reste la règle générale.
2. **Un tuple fixe longueur et types position par position** — plus précis
   qu'un tableau simple quand la structure est connue à l'avance.
3. **Une union restreint aux opérations communes ; une intersection exige
   toutes les propriétés réunies.**
4. **`enum` génère du code et accepte des valeurs hors de son intention** —
   un objet `as const` est presque toujours préférable.

---

## 6. Auto-évaluation

1. Pourquoi `createUser({ id: '1', name: 'Ada', age: 36 })` échoue-t-il alors
   que `createUser(draft)` (où `draft` contient les mêmes propriétés)
   réussit ?
2. Quelle est la différence de comportement entre `string[]` et
   `[string, string]` quand on accède à l'index `[5]` ?
3. Donnez un exemple concret où `A & B` produit un type **impossible à
   satisfaire** (indice : deux champs de même nom, de types incompatibles).
4. Pourquoi `isActive(0)` est-il accepté par un `enum` numérique alors que
   ce n'était probablement pas votre intention ?
5. Réécrivez `enum Role { Admin, User }` en objet `as const` avec le type
   union correspondant.

---

## Étape suivante

👉 [Module 04 — Fonctions : signatures, surcharges, `this`, variance](../04-fonctions/index.md)
