---
id: narrowing-avance
title: 'Module 07 — Narrowing avancé, type guards, exhaustivité'
sidebar_label: 'M07 · Narrowing avancé'
sidebar_position: 3
description: Unions discriminées, prédicats de type personnalisés, fonctions d'assertion, contrôle d'exhaustivité par never, et les limites réelles du narrowing.
keywords:
  [
    typescript,
    narrowing,
    type guards,
    unions discriminées,
    exhaustivité,
    never,
    asserts,
  ]
---

# Module 07 — Narrowing avancé, type guards, exhaustivité

|               |                                                                             |
| ------------- | --------------------------------------------------------------------------- |
| **Durée**     | ≈ 7 heures                                                                  |
| **Prérequis** | [Module 06 — Génériques](../02-generiques/index.md)                         |
| **Livrable**  | Modéliser un état de sorte qu'un cas invalide soit impossible à représenter |

:::tip Le patron le plus rentable de tout TypeScript
Si ce parcours devait ne retenir qu'**une seule** notion au-delà des bases,
ce serait celle-ci : **les unions discriminées**. Vous les avez déjà
croisées sans les nommer (le type `Command` de `taskline`, le
`ValidationResult` de `validate.ts`) — ce module leur donne un nom, une
méthode, et leurs limites.
:::

---

## 1. Récapitulatif rapide des type guards natifs

```ts
function describe(value: string | number | boolean | null) {
  if (typeof value === 'string') return value.toUpperCase(); // typeof
  if (typeof value === 'number') return value.toFixed(2);
  if (value === null) return 'rien'; // égalité
  return value ? 'vrai' : 'faux'; // vérité (truthiness)
}

class Cat {
  meow() {}
}
class Dog {
  bark() {}
}

function speak(animal: Cat | Dog) {
  if (animal instanceof Cat)
    animal.meow(); // instanceof
  else animal.bark();
}

interface Circle {
  kind: 'circle';
  radius: number;
}
interface Square {
  kind: 'square';
  side: number;
}

function area(shape: Circle | Square) {
  if ('radius' in shape) return Math.PI * shape.radius ** 2; // in
  return shape.side ** 2;
}
```

---

## 2. Unions discriminées : le patron central

Une union discriminée ajoute un champ **commun, littéral, unique par
membre** — le « discriminant » — qui permet à TypeScript de savoir
exactement quels autres champs sont disponibles :

```ts
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function render<T>(state: RequestState<T>): string {
  switch (state.status) {
    case 'idle':
      return 'En attente…';
    case 'loading':
      return 'Chargement…';
    case 'success':
      return `Données : ${JSON.stringify(state.data)}`;
    //                        ^ accessible SEULEMENT ici — state.data
    //                          n'existe sur AUCUNE autre branche
    case 'error':
      return `Erreur : ${state.error.message}`;
  }
}
```

**Ce que ce patron rend impossible à écrire** : il n'existe **aucune façon**
de construire un état qui aurait à la fois `status: 'idle'` et un champ
`data` — contrairement à une modélisation naïve avec des champs optionnels :

```ts
// ❌ Modélisation naïve : tous les états invalides restent CONSTRUCTIBLES
interface BadRequestState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: Error;
}

const impossible: BadRequestState<string> = {
  status: 'idle',
  data: 'pourtant on ne devrait rien avoir', // ✅ accepté, à tort
  error: new Error('et une erreur en même temps ?!'), // ✅ accepté aussi
};
```

:::danger La leçon de ce module, en une phrase
**Un état invalide qui peut être construit finira, un jour, par l'être.**
Le travail de modélisation ne consiste pas à documenter les états valides —
il consiste à rendre les états invalides **irreprésentables**. C'est
exactement ce que fait une union discriminée, et rien d'autre en
TypeScript ne l'accomplit aussi directement.
:::

---

## 3. Prédicats de type personnalisés (`x is T`)

```ts
interface Cat {
  kind: 'cat';
  meow(): void;
}
interface Dog {
  kind: 'dog';
  bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return animal.kind === 'cat';
}

function speak(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // ✅ narrowed vers Cat
  }
}
```

`animal is Cat` est une **promesse** que vous faites au compilateur : si la
fonction retourne `true`, alors `animal` est bien un `Cat`. TypeScript ne
vérifie **pas** que votre implémentation tient réellement cette promesse —
c'est à vous de garantir que la logique interne du prédicat est correcte.

:::info Depuis TypeScript 5.5 : les prédicats inférés

```ts
function isDefined<T>(value: T | undefined) {
  return value !== undefined;
}

const values = [1, undefined, 2, undefined, 3];
const clean = values.filter(isDefined); // type : number[], pas (number | undefined)[]
```

Sans annotation `: value is T` explicite, TypeScript **infère** que cette
fonction est un prédicat de type valide, à partir de son corps. C'est
un gain de confort direct issu des versions récentes du langage — mais la
version explicite reste préférable dès que la logique du prédicat n'est pas
triviale, pour que l'intention soit lisible sans deviner.
:::

## 4. Fonctions d'assertion (`asserts x is T`)

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Attendu une chaîne de caractères.');
  }
}

function process(value: unknown) {
  assertIsString(value);
  value.toUpperCase(); // ✅ narrowed après l'appel, sans bloc if
}
```

Contrairement à un prédicat (`x is T`, qui renvoie un `boolean` que
l'appelant doit tester), une fonction d'assertion **ne renvoie rien** — elle
narrowe simplement le type pour tout le code **qui suit son appel**, ou lève
une exception. C'est le patron idéal pour valider une précondition en tête
de fonction.

---

## 5. Le contrôle d'exhaustivité par `never`

```ts
function area(shape: Circle | Square | Triangle): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    // On "oublie" 'triangle' :
  }
  // ❌ Function lacks ending return statement (avec noImplicitReturns)
}

function areaExhaustive(shape: Circle | Square | Triangle): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default: {
      const check: never = shape;
      // Si un membre `Trapezoid` est ajouté à l'union un jour, `shape`
      // ne sera PLUS assignable à `never` ici — l'oubli devient une
      // ERREUR DE COMPILATION, immédiatement, à l'endroit exact où il
      // faut agir. Vous l'avez déjà vu à l'œuvre dans `cli.ts` de taskline.
      throw new Error(`Cas non géré : ${JSON.stringify(check)}`);
    }
  }
}
```

Ce patron transforme un oubli — le type de bug le plus facile à commettre
en ajoutant un cas à une union existante — en une erreur **détectée à la
compilation**, dans le fichier concerné, plutôt qu'en un bug silencieux
découvert (ou pas) en production.

---

## 6. Les limites réelles du narrowing

Le narrowing repose sur une hypothèse implicite : **rien d'autre ne modifie
la valeur entre la vérification et l'utilisation.** Cette hypothèse peut
être fausse.

```ts
interface State {
  value: string | undefined;
}

function process(state: State) {
  if (state.value !== undefined) {
    setTimeout(() => {
      console.log(state.value.toUpperCase());
      // ❌ 'state.value' is possibly 'undefined'.
      //    Correct : entre la vérification et l'exécution du callback,
      //    RIEN ne garantit que state.value n'a pas changé.
    }, 1000);
  }
}
```

```ts
function process(state: State) {
  if (state.value !== undefined) {
    const value = state.value; // copie dans une variable LOCALE
    setTimeout(() => {
      console.log(value.toUpperCase()); // ✅ `value` ne peut plus changer
    }, 1000);
  }
}
```

:::warning Pourquoi le narrowing ne survit pas à travers une propriété d'objet
Une **propriété** (`state.value`) peut, en théorie, être modifiée par un
autre bout de code entre le moment où on la vérifie et le moment où on
l'utilise — y compris via un `getter` qui renvoie une valeur différente à
chaque appel. Une **variable locale** (`value`), elle, ne peut être
réassignée que dans le bloc où elle est visible, et TypeScript le sait avec
certitude. **Copier une propriété narrowée dans une variable locale** avant
de l'utiliser dans une fonction imbriquée est le réflexe qui règle ce
problème dans la quasi-totalité des cas.
:::

---

## 7. Ce que vous devez retenir

1. **Une union discriminée rend les états invalides irreprésentables** —
   c'est l'objectif, pas seulement une organisation du code.
2. **Un prédicat (`x is T`) est une promesse non vérifiée** ; une fonction
   d'assertion (`asserts x is T`) narrowe la suite du code ou lève.
3. **Le contrôle d'exhaustivité par `never`** transforme l'oubli d'un cas en
   erreur de compilation, à l'endroit exact où corriger.
4. **Le narrowing ne survit pas à une closure ni à une réévaluation d'une
   propriété** — copier dans une variable locale résout ce problème.

---

## 8. Auto-évaluation

1. Réécrivez `BadRequestState<T>` (§2) en union discriminée qui rend
   impossible d'avoir simultanément `data` et `error`.
2. Quelle est la différence de comportement entre un prédicat `x is T` et
   une fonction d'assertion `asserts x is T`, du point de vue de
   l'appelant ?
3. Pourquoi le contrôle d'exhaustivité par `never` échoue-t-il à la
   compilation dès qu'un nouveau membre est ajouté à l'union, sans qu'aucun
   test n'ait besoin d'être exécuté ?
4. Pourquoi `if (state.value !== undefined)` ne suffit-il pas à garantir
   que `state.value` reste défini à l'intérieur d'un `setTimeout` imbriqué ?
5. Retrouvez, dans le code de `taskline` (`src/cli.ts`), l'endroit où le
   contrôle d'exhaustivité par `never` est déjà utilisé.

---

## Étape suivante

👉 [Module 08 — Modules, déclarations, `@types`, augmentation](../04-modules-et-declarations/index.md)
