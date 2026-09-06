---
id: generiques
title: 'Module 06 — Génériques'
sidebar_label: 'M06 · Génériques'
sidebar_position: 2
description: Du concret au générique, contraintes extends, inférence, génériques sur classes et méthodes, et la variance des paramètres de type.
keywords: [typescript, génériques, generics, extends, inférence, variance]
---

# Module 06 — Génériques

|               |                                                                          |
| ------------- | ------------------------------------------------------------------------ |
| **Durée**     | ≈ 8 heures                                                               |
| **Prérequis** | [Module 05 — Interfaces & classes](../01-interfaces-et-classes/index.md) |
| **Livrable**  | Généraliser une fonction concrète sans perdre la précision de ses types  |

---

## 1. Du concret au générique : la démarche

Partons d'un vrai problème : trois fonctions presque identiques.

```ts
function firstString(arr: string[]): string | undefined {
  return arr[0];
}
function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}
function firstUser(arr: User[]): User | undefined {
  return arr[0];
}
```

La duplication saute aux yeux. La tentation immédiate — `any` — détruit
toute l'information :

```ts
function first(arr: any[]): any {
  return arr[0];
}

const x = first([1, 2, 3]);
x.toUpperCase(); // compile ! plante à l'exécution — `x` était un nombre
```

**Un générique conserve exactement l'information que `any` détruit** :

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const a = first([1, 2, 3]); // type : number | undefined
const b = first(['x', 'y']); // type : string | undefined
const c = first([{ id: 1 }]); // type : { id: number } | undefined
```

`T` est un **paramètre de type** : une variable, mais au niveau des types.
TypeScript l'**infère** depuis l'argument fourni — exactement comme il
infère le type d'une variable depuis sa valeur (module 02).

---

## 2. Contraintes (`extends`) : limiter ce qu'un générique accepte

```ts
function getLength<T>(value: T): number {
  return value.length;
  // ❌ Property 'length' does not exist on type 'T'.
}
```

Sans contrainte, `T` peut être **n'importe quoi** — y compris un nombre, qui
n'a pas de `.length`. La contrainte `extends` restreint l'ensemble des types
acceptables :

```ts
function getLength<T extends { length: number }>(value: T): number {
  return value.length; // ✅ garanti par la contrainte
}

getLength('bonjour'); // ✅ string a .length
getLength([1, 2, 3]); // ✅ tableau a .length
getLength(42); // ❌ number n'a pas .length
```

### `keyof` comme contrainte — le patron le plus utile de tous

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: 'Ada' };

getProperty(user, 'name'); // ✅ type : string
getProperty(user, 'email'); // ❌ 'email' n'est pas une clé de 'user'
```

`K extends keyof T` garantit, **à la compilation**, que `key` est bien une
propriété existante de `obj` — et que le type de retour (`T[K]`) est
exactement celui de cette propriété, pas un vague `unknown`.

### Paramètres de type par défaut

```ts
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

const generic: ApiResponse = { data: 'anything', status: 200 }; // T = unknown
const typed: ApiResponse<User> = { data: someUser, status: 200 };
```

---

## 3. Génériques sur classes et méthodes

```ts
class Stack<T> {
  #items: T[] = [];

  push(item: T): void {
    this.#items.push(item);
  }

  pop(): T | undefined {
    return this.#items.pop();
  }

  get size(): number {
    return this.#items.length;
  }
}

const numbers = new Stack<number>();
numbers.push(1);
numbers.push('x'); // ❌ Argument of type 'string' is not assignable to 'number'
```

Une **méthode** peut avoir son propre paramètre de type, indépendant de
celui de la classe :

```ts
class Container<T> {
  constructor(private value: T) {}

  map<U>(fn: (value: T) => U): Container<U> {
    return new Container(fn(this.value));
  }
}

const c = new Container(5).map((n) => n.toString()).map((s) => s.length);
// Container<number> → Container<string> → Container<number>
```

---

## 4. Les erreurs classiques

### Le générique inutile

```ts
// ❌ T n'apporte RIEN : il n'apparaît qu'une fois, jamais réutilisé
function wrap<T>(value: T): { value: T } {
  return { value };
}
// Correct — mais vérifiez : si `T` n'établit aucune RELATION entre
// plusieurs paramètres ou entre un paramètre et le retour, il est souvent
// superflu. Ici il EST utile : il relie le paramètre au type de retour.

// ❌ Cette fois, vraiment inutile :
function logAndReturn<T>(value: T): void {
  console.log(value);
  // T n'établit aucune relation puisque rien n'est retourné.
  // `function logAndReturn(value: unknown): void` ferait exactement l'affaire.
}
```

**Test rapide** : un générique se justifie s'il relie **au moins deux
occurrences** du même type dans la signature (deux paramètres, ou un
paramètre et le retour). S'il n'apparaît qu'une fois, c'est `unknown` (ou un
type concret) qu'il vous faut, pas un générique.

### Le générique qui ment

```ts
function processArray<T>(arr: T[]): T[] {
  return arr.map((item) => {
    // à l'intérieur de la fonction, TypeScript ne sait RIEN sur T
    // au-delà de ce que la contrainte garantit
    return item;
  });
}
```

Un paramètre de type sans contrainte est traité comme parfaitement
**opaque** à l'intérieur du corps de la fonction — vous ne pouvez rien lui
faire que ce que sa contrainte autorise explicitement, même si vous « savez »
intuitivement que ce sera toujours un `string` en pratique. Si votre code a
besoin d'une garantie, **exprimez-la dans la contrainte** plutôt que de vous
y fier implicitement.

---

## 5. Variance des paramètres de type (`in` / `out`)

Rappel du module 04 : les fonctions sont contravariantes en paramètres,
covariantes en retour. Les génériques héritent de cette logique, et
TypeScript peut vous demander de la **déclarer explicitement** dans
certains cas de types génériques complexes (bibliothèques, `.d.ts`) :

```ts
interface Producer<out T> {
  // `out` : T n'apparaît qu'en position de SORTIE — covariant
  produce(): T;
}

interface Consumer<in T> {
  // `in` : T n'apparaît qu'en position d'ENTRÉE — contravariant
  consume(value: T): void;
}

let dogProducer: Producer<Dog>;
let animalProducer: Producer<Animal> = dogProducer;
// ✅ un Producer<Dog> PEUT remplacer un Producer<Animal> :
//    tout ce qu'il produit EST un Animal (covariance)

let animalConsumer: Consumer<Animal>;
let dogConsumer: Consumer<Dog> = animalConsumer;
// ✅ un Consumer<Animal> PEUT remplacer un Consumer<Dog> :
//    il sait traiter TOUT Animal, donc n'importe quel Dog aussi
//    (contravariance — la direction est INVERSÉE)
```

:::info Dans la pratique quotidienne
La plupart du code applicatif n'a jamais besoin d'annoter `in`/`out`
explicitement — TypeScript l'infère depuis l'usage réel du paramètre de
type. Ces annotations servent surtout à **documenter une intention** dans
des bibliothèques publiques, et à accélérer la vérification sur de très
gros types génériques. Les retenir vous sera surtout utile pour comprendre
un message d'erreur de variance dans du code tiers — la matière change de
nature au module 09, où les génériques deviennent un langage de calcul à
part entière.
:::

---

## 6. Ce que vous devez retenir

1. **Un générique préserve l'information qu'`any` détruirait** — c'est sa
   seule raison d'être.
2. **`extends` restreint ce qu'un paramètre de type accepte**, et
   `K extends keyof T` est le patron le plus utile pour accéder à une
   propriété en gardant son type exact.
3. **Un générique qui n'apparaît qu'une fois dans une signature est
   probablement inutile** — testez : établit-il une relation entre au moins
   deux occurrences ?
4. **La variance** (`in`/`out`) des génériques suit la même logique que
   celle des fonctions (module 04), rarement à annoter à la main.

---

## 7. Auto-évaluation

1. Pourquoi `first<T>(arr: T[])` préserve-t-il l'information qu'une version
   avec `any[]` perdrait ?
2. Écrivez la contrainte nécessaire pour qu'une fonction générique
   `merge<T, U>(a: T, b: U)` puisse retourner `T & U` en toute sécurité.
3. Dans `getProperty<T, K extends keyof T>`, que se passe-t-il si vous
   appelez la fonction avec une clé qui n'existe pas sur `T` ?
4. Identifiez, dans du code que vous avez déjà écrit (ou dans ce module),
   un générique qui n'apparaît qu'une seule fois dans sa signature. Est-il
   réellement nécessaire ?
5. Pourquoi `Consumer<Animal>` est-il substituable à `Consumer<Dog>`, alors
   que c'est l'inverse pour `Producer` ?

---

## Étape suivante

👉 [Module 07 — Narrowing avancé, type guards, exhaustivité](../03-narrowing-avance/index.md)
