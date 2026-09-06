---
id: systeme-de-types
title: 'Module 02 — Le système de types : primitifs, inférence, narrowing'
sidebar_label: 'M02 · Système de types'
sidebar_position: 3
description: any contre unknown contre never contre void, ce que l'inférence devine seule, widening et narrowing, as const et satisfies — les fondations sur lesquelles tout le reste du langage repose.
keywords:
  [
    typescript,
    any,
    unknown,
    never,
    void,
    inférence,
    narrowing,
    as const,
    satisfies,
  ]
---

# Module 02 — Le système de types : primitifs, inférence, narrowing

|               |                                                   |
| ------------- | ------------------------------------------------- |
| **Durée**     | ≈ 6 heures                                        |
| **Prérequis** | [Module 01 — Toolchain](../01-toolchain/index.md) |
| **Livrable**  | Ne plus jamais écrire `any`, et savoir pourquoi   |

---

## 1. Les primitifs, et un piège de vocabulaire

```ts
let name: string = 'Ada';
let age: number = 36;
let active: boolean = true;
```

:::danger `String` n'est presque jamais ce que vous voulez
JavaScript a **deux** notions de « chaîne » : le primitif `"Ada"` et l'objet
enveloppant `new String("Ada")`. TypeScript les type différemment —
`string` (minuscule) pour le primitif, `String` (majuscule) pour l'objet.

```ts
function greet(name: string) {
  /* … */
}

greet('Ada'); // ✅
greet(new String('Ada')); // ❌ 'String' n'est pas assignable à 'string'
```

Vous n'avez **jamais** besoin de `new String()`, `new Number()` ou
`new Boolean()` en pratique courante — ce sont des reliques de JavaScript
qui créent plus de problèmes qu'ils n'en résolvent (comparaison, coercition).
**Règle simple : toujours la version minuscule.**
:::

---

## 2. Le quatuor mal compris : `any`, `unknown`, `never`, `void`

### `any` — la sortie de secours qui contamine tout

```ts
let value: any = fetchSomething();
value.toUpperCase().thisMethodDoesNotExist(); // compile. explose à l'exécution.
```

`any` désactive la vérification **pour cette valeur, et pour tout ce qui en
dérive**. Une fois qu'un `any` entre dans votre programme, il se propage —
silencieusement — à travers chaque fonction qui le manipule.

:::danger La règle de ce dépôt
`any` est **interdit** (voir [consignes](../../00-demarrer/05-consignes.md)).
La suite de ce module vous donne les outils pour ne jamais en avoir besoin.
:::

### `unknown` — la sortie de secours qui vous protège

```ts
let value: unknown = fetchSomething();
value.toUpperCase(); // ❌ Object is of type 'unknown'.
```

`unknown` accepte **n'importe quelle valeur** (comme `any`), mais **interdit
toute opération** tant que vous n'avez pas prouvé, par narrowing (§4), ce
qu'elle contient réellement :

```ts
let value: unknown = fetchSomething();

if (typeof value === 'string') {
  value.toUpperCase(); // ✅ TypeScript sait maintenant que value est string
}
```

**`unknown` est le type de toute donnée qui vient de l'extérieur** —
réponse HTTP, `JSON.parse`, entrée utilisateur (module 11 y consacre un
module entier). C'est la traduction directe, en type, de la Décision 2 du
module 00 : « rien ne garantit la forme d'une donnée externe, alors le
compilateur vous y oblige à le vérifier vous-même ».

### `never` — l'ensemble vide

`never` est le type d'une valeur qui **ne peut jamais exister**.

```ts
function fail(message: string): never {
  throw new Error(message);
  // cette fonction ne RETOURNE jamais — elle lève toujours, ou boucle
}

function processValue(value: string | number) {
  if (typeof value === 'string') return value.toUpperCase();
  if (typeof value === 'number') return value.toFixed(2);
  // Ici, `value` est de type `never` : tous les cas ont été traités.
  // C'est la base du contrôle d'exhaustivité — module 07.
}
```

### `void` — l'absence de valeur de retour utile

```ts
function log(message: string): void {
  console.log(message);
  // pas de `return`, ou un `return;` sans valeur
}
```

:::info `void` contre `undefined`
`void` décrit une fonction dont la valeur de retour **ne doit pas être
utilisée** — même si, en JavaScript, elle retourne toujours techniquement
`undefined`. C'est une nuance d'intention, pas de valeur réelle :
`Array.prototype.forEach` est typé `(item: T) => void` précisément pour
signaler « le retour du callback est ignoré ».
:::

### Le tableau récapitulatif

| Type      | Accepte quoi en entrée     | Autorise quelles opérations             |
| --------- | -------------------------- | --------------------------------------- |
| `any`     | tout                       | tout, sans vérification — **dangereux** |
| `unknown` | tout                       | rien, tant que non vérifié — **sûr**    |
| `never`   | rien                       | (n'existe jamais en pratique)           |
| `void`    | (type de retour seulement) | —                                       |

---

## 3. L'inférence : ce que TypeScript devine tout seul

Vous n'annotez pas toujours. TypeScript **infère** le type le plus précis
possible à partir de la valeur :

```ts
let count = 0; // inféré : number
const name = 'Ada'; // inféré : "Ada" (littéral, voir §4)
const user = { id: 1 }; // inféré : { id: number }

function double(x: number) {
  return x * 2; // le TYPE DE RETOUR est inféré : number
}
```

:::tip Quand annoter, quand laisser inférer

- **Paramètres de fonction** : toujours annoter. Rien ne permet de les
  inférer depuis l'intérieur de la fonction.
- **Variables locales avec valeur immédiate** : laissez inférer. Répéter
  `const count: number = 0` n'ajoute aucune information.
- **Types de retour de fonction publique** : annotez-les explicitement.
  Ce n'est pas pour aider TypeScript — il s'en sort très bien seul — c'est
  pour **vous**, et pour l'appelant : le type de retour devient une
  documentation qui ne peut pas mentir, vérifiée à chaque compilation.
  :::

---

## 4. _Widening_ et _narrowing_ : pourquoi `let` et `const` diffèrent

```ts
let a = 'rouge'; // type inféré : string       (élargi — "widened")
const b = 'rouge'; // type inféré : "rouge"       (littéral, précis)
```

**Pourquoi cette différence ?** `let` peut être réassigné : TypeScript
« élargit » `'rouge'` (un type **littéral**, très précis) vers `string` (un
type **général**), parce qu'il doit anticiper toute réassignation future.
`const` ne peut jamais changer : TypeScript garde le type le plus précis
possible.

```ts
let status = 'pending'; // type : string
status = 'approved'; // ✅ accepté, string est très permissif

function setStatus(s: 'pending' | 'approved' | 'rejected') {
  /* … */
}
setStatus(status); // ❌ 'string' n'est pas assignable à l'union précise
```

C'est le piège classique : `status` a été **élargi** à `string` dès sa
déclaration en `let`, et cet élargissement est **définitif** — il ne
« rétrécit » jamais tout seul. La solution : soit typer `status`
explicitement avec l'union voulue, soit utiliser `as const` (ci-dessous).

---

## 5. `as const` — figer un littéral

```ts
const point = { x: 10, y: 20 };
// type inféré : { x: number; y: number }  (élargi sur les nombres aussi)

const pointFixed = { x: 10, y: 20 } as const;
// type inféré : { readonly x: 10; readonly y: 20 }
```

`as const` demande à TypeScript de **ne rien élargir** : chaque valeur
littérale garde son type le plus précis possible, et l'objet entier devient
`readonly`, récursivement.

**Usage le plus fréquent : remplacer un `enum`** (module 03 explique
pourquoi les experts évitent `enum`) :

```ts
const Role = {
  Admin: 'admin',
  Editor: 'editor',
  Viewer: 'viewer',
} as const;

type Role = (typeof Role)[keyof typeof Role]; // 'admin' | 'editor' | 'viewer'

function checkAccess(role: Role) {
  /* … */
}
checkAccess(Role.Admin); // ✅
checkAccess('owner'); // ❌ n'appartient pas à l'union
```

---

## 6. `satisfies` — vérifier sans élargir

Introduit en TypeScript 4.9, `satisfies` répond à un problème réel : vous
voulez **vérifier** qu'une valeur respecte une forme, **sans perdre** le
type précis inféré de cette valeur.

```ts
type Config = Record<string, number | string>;

// Avec une annotation classique :
const config: Config = { retries: 3, timeout: 'long' };
config.retries.toFixed(2);
// ❌ 'retries' est vu comme `number | string` : toFixed() n'existe pas
//    sur `string`. L'annotation a ÉLARGI le type de chaque propriété
//    au type le plus général de l'union.

// Avec satisfies :
const configChecked = { retries: 3, timeout: 'long' } satisfies Config;
configChecked.retries.toFixed(2);
// ✅ TypeScript a VÉRIFIÉ la compatibilité avec Config, mais a GARDÉ
//    le type inféré précis : { retries: number; timeout: string }
```

:::info Ce que `satisfies` change concrètement

|                                   | `: Config` (annotation)   | `satisfies Config`                     |
| --------------------------------- | ------------------------- | -------------------------------------- |
| Vérifie la forme                  | ✅                        | ✅                                     |
| Type final de la variable         | Celui de `Config` (large) | Celui **inféré** de la valeur (précis) |
| Autocomplétion sur les propriétés | Limitée au type large     | Complète, propriété par propriété      |

`satisfies` est devenu, en quelques années, un réflexe d'expert : chaque
fois que vous écrivez `: TypeDéclaré` sur un littéral, demandez-vous si
`satisfies` ne préserverait pas une information que vous êtes en train de
perdre.
:::

---

## 7. Ce que vous devez retenir

1. **`string` en minuscule, toujours.** `String` est un piège hérité de
   JavaScript, jamais nécessaire en pratique.
2. **`unknown` remplace `any`** partout où vous accueillez une donnée dont
   vous ne contrôlez pas la provenance.
3. **`never`** décrit l'impossible, et sert de garde-fou d'exhaustivité.
4. **`let` élargit, `const` préserve.** Un élargissement, une fois fait, ne
   se corrige jamais tout seul.
5. **`as const`** fige des littéraux — le remplaçant moderne de `enum`.
6. **`satisfies`** vérifie sans élargir : le meilleur des deux mondes.

---

## 8. Auto-évaluation

1. Pourquoi `new String('x')` n'est-il pas assignable à un paramètre `string` ?
2. Donnez un exemple où `any` "compile" mais `unknown` refuse — et expliquez pourquoi c'est une bonne chose.
3. Que produit `let x = 'a'` en termes de type, contre `const x = 'a'` ?
4. Réécrivez `const cfg: Record<string, number> = { a: 1, b: 2 }` avec `satisfies` de façon à garder `cfg.a` et `cfg.b` individuellement accessibles avec autocomplétion.
5. Pourquoi `never` est-il le type inféré à l'intérieur d'un `if` qui a déjà éliminé tous les cas possibles d'une union ?

---

## Étape suivante

👉 [Module 03 — Objets, tableaux, tuples, unions, intersections, enums](../03-objets-et-unions/index.md)
