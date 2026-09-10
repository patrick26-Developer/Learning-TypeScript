---
id: fonctions
title: 'Module 04 — Fonctions : signatures, surcharges, this, variance'
sidebar_label: 'M04 · Fonctions'
sidebar_position: 5
description: Typer des fonctions, les surcharges, this explicite, et la variance — la notion qui débloque la compréhension de tout le reste du système de types.
keywords:
  [
    typescript,
    fonctions,
    surcharges,
    this,
    variance,
    strictFunctionTypes,
    bivariance,
  ]
---

# Module 04 — Fonctions : signatures, surcharges, `this`, variance

|               |                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Durée**     | ≈ 6 heures                                                                                                                      |
| **Prérequis** | [Module 03 — Objets & unions](../03-objets-et-unions/index.md)                                                                  |
| **Livrable**  | Comprendre pourquoi une fonction plus « restrictive » en paramètre peut être refusée là où une plus « permissive » est acceptée |

:::tip Le module le plus rentable de la Partie I
La **variance** (§4) explique un comportement que vous rencontrerez sans le
comprendre si vous sautez ce module : pourquoi TypeScript refuse parfois une
fonction qui semble pourtant « logiquement » compatible. C'est aussi la
notion qui sépare le plus nettement un niveau junior d'un niveau confirmé en
entretien technique.
:::

---

## 1. Signatures de fonctions

```ts
function add(a: number, b: number): number {
  return a + b;
}

// Paramètres optionnels : APRÈS les obligatoires, toujours
function greet(name: string, greeting?: string): string {
  return `${greeting ?? 'Bonjour'}, ${name} !`;
}

// Valeurs par défaut : rendent le paramètre optionnel pour l'appelant
function createUser(name: string, role: string = 'viewer') {
  return { name, role };
}

// Paramètres rest : doivent être tableaux, forcément en dernière position
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}
```

### Typer une fonction comme valeur

```ts
type BinaryOp = (a: number, b: number) => number;

const multiply: BinaryOp = (a, b) => a * b;
// Les paramètres n'ont pas besoin d'être ré-annotés : ils sont
// inférés depuis BinaryOp — c'est le "contextual typing".
```

---

## 2. Surcharges : quand elles sont justifiées

Une surcharge déclare **plusieurs signatures d'appel possibles** pour une
même fonction, dont une seule (l'implémentation) est visible à l'exécution.

```ts
function parseValue(value: string): string;
function parseValue(value: number): number;
function parseValue(value: string | number): string | number {
  if (typeof value === 'string') return value.trim();
  return value * 1;
}

const a = parseValue('  hi  '); // type : string (pas string | number !)
const b = parseValue(42); // type : number
```

:::warning La plupart du temps, une union suffit — et vaut mieux

```ts
// Souvent préférable à une surcharge :
function parseValue(value: string | number): string | number {
  return typeof value === 'string' ? value.trim() : value * 1;
}
```

Les surcharges se justifient quand la **relation** entre le type d'entrée et
le type de sortie n'est pas exprimable par une simple union — exactement le
cas ci-dessus, où `string` en entrée garantit `string` en sortie (pas
`string | number`). Si cette relation n'existe pas, une surcharge n'ajoute
que de la complexité de maintenance : plusieurs signatures à garder
cohérentes avec une seule implémentation.
:::

---

## 3. Typer `this`

En JavaScript, `this` dépend du **site d'appel**, pas du site de
déclaration — une source de bugs classique. TypeScript permet de le
contraindre explicitement :

```ts
interface Button {
  label: string;
  onClick(this: Button): void;
}

const button: Button = {
  label: 'Envoyer',
  onClick() {
    console.log(this.label); // ✅ this est garanti être Button ici
  },
};

const detached = button.onClick;
detached();
// ❌ The 'this' context of type 'void' is not assignable
//    to method's 'this' of type 'Button'.
```

Le paramètre `this` (toujours en première position, jamais compté dans les
arguments réels) **n'existe qu'au niveau des types** : il disparaît
totalement à la compilation, exactement comme toute autre annotation
(module 00, Décision 2).

---

## 4. Variance : la notion qui débloque tout le reste

### Le principe, en une phrase

> Un type `B` est substituable à un type `A` si tout ce qu'on peut faire
> avec `A`, on peut aussi le faire avec `B` — c'est la **substitution de
> Liskov**, appliquée aux types de fonctions.

### Pourquoi une fonction qui prend "moins" est substituable à une fonction qui prend "plus"

```ts
function handleAnyEvent(handler: (e: Event) => void) {
  handler(new Event('click'));
}

function onlyNeedsType(e: { type: string }) {
  console.log(e.type);
}

handleAnyEvent(onlyNeedsType); // ✅ accepté
```

`onlyNeedsType` accepte **moins** de choses en apparence ({ type: string }
plutôt que Event), mais un `Event` **possède** toujours une propriété
`type` — donc tout appel valide sur `Event` reste valide sur
`{ type: string }`. C'est la **contravariance des paramètres** : plus le
paramètre attendu par la fonction fournie est **général** (ou compatible),
plus cette fonction est substituable à une fonction qui en attendait un
plus spécifique.

À l'inverse :

```ts
function needsSpecificType(handler: (e: { type: string }) => void) {
  /* … */
}

function onlyHandlesClickEvent(e: MouseEvent) {
  /* … */
}

needsSpecificType(onlyHandlesClickEvent);
// ❌ 'MouseEvent' exige des propriétés absentes de '{ type: string }'
```

`onlyHandlesClickEvent` exige **plus** (un `MouseEvent` complet) que ce que
`needsSpecificType` promet de fournir (`{ type: string }`) : elle n'est pas
substituable.

### La brèche assumée : bivariance des méthodes

Ce comportement s'applique **strictement** aux fonctions typées comme
valeurs (`(a: T) => void`). Mais les **méthodes** déclarées avec la syntaxe
raccourcie se comportent différemment — un fait vérifié directement pour ce
module :

```ts
class Animal {}
class Dog extends Animal {
  bark(): void {}
}

// Méthode (syntaxe raccourcie)
interface HandlerMethod {
  handle(a: Animal): void;
}
const methodImpl: HandlerMethod = {
  handle(d: Dog) {
    d.bark();
  }, // ✅ ACCEPTÉ — pourtant non sain !
};

// Propriété typée comme fonction fléchée
interface HandlerProp {
  handle: (a: Animal) => void;
}
const propImpl: HandlerProp = {
  handle: (d: Dog) => {
    d.bark();
  },
};
// ❌ Types of parameters 'd' and 'a' are incompatible.
//    Property 'bark' is missing in type 'Animal' but required in type 'Dog'.
```

:::danger Vérifié en construisant ce module — exactement la brèche du module 00 §3
La méthode compile ; la propriété-fonction équivalente est refusée. C'est
**la même brèche assumée** que le module 00 a annoncée (« le système de
types n'est pas sain, et c'est un choix »). TypeScript autorise cette
bivariance sur les méthodes pour rester compatible avec des patrons très
répandus en JavaScript orienté objet (une sous-classe qui redéfinit une
méthode avec un paramètre plus spécifique) — au prix d'un trou de
solidité prouvé ci-dessus : `methodImpl.handle` peut planter si on
l'appelle avec un `Animal` qui n'est pas un `Dog`.

**Conséquence pratique** : préférez la syntaxe **propriété-fonction**
(`handle: (a: Animal) => void`) à la syntaxe **méthode**
(`handle(a: Animal): void`) dans les interfaces et les types, chaque fois
que la solidité de vos types de callback compte réellement — typiquement
pour des gestionnaires d'événements ou des callbacks passés à des API
tierces.
:::

### Pourquoi c'est LA notion qui débloque le reste

La variance explique, sans exception à mémoriser séparément :

- Pourquoi `Array<Dog>` n'est **pas** substituable à `Array<Animal>` en
  écriture (`array.push(uneAutreAnimal)` casserait le tableau de `Dog`),
  mais l'est en lecture seule (`ReadonlyArray<Animal>`).
- Pourquoi une fonction `(a: Animal) => Dog` est substituable à
  `(a: Animal) => Animal`, mais pas l'inverse (le **retour** est, lui,
  **covariant** : plus spécifique en retour reste substituable).
- Pourquoi les génériques (module 06) doivent parfois déclarer leur
  variance explicitement (`in`/`out`) pour rester sains.

---

## 5. Ce que vous devez retenir

1. **Les paramètres optionnels et par défaut viennent toujours après les
   obligatoires** ; les paramètres rest sont toujours en dernier.
2. **Une surcharge se justifie quand la relation entrée→sortie n'est pas
   exprimable par une simple union** — sinon, une union suffit et se
   maintient plus facilement.
3. **`this` est typable explicitement**, en première position, effacé à
   la compilation.
4. **Les fonctions sont contravariantes en paramètres, covariantes en
   retour** — c'est ce qui rend une fonction substituable à une autre.
5. **Les méthodes (syntaxe raccourcie) sont bivariantes par choix
   délibéré** — une brèche de solidité assumée, à connaître pour l'éviter
   quand la sûreté d'un callback compte.

---

## 6. Auto-évaluation

1. Pourquoi place-t-on toujours les paramètres optionnels après les
   obligatoires ?
2. Donnez un exemple où une surcharge est justifiée, et un exemple où elle
   devrait être remplacée par une union.
3. Que devient un paramètre `this: Button` à l'exécution, une fois compilé
   en JavaScript ?
4. Expliquez, dans vos propres mots, pourquoi
   `(handler: (e: Event) => void)` accepte une fonction dont le paramètre
   est plus **général** que `Event`, mais refuse une fonction dont le
   paramètre est plus **spécifique**.
5. Pourquoi la même relation entre `Animal` et `Dog`, exprimée comme
   méthode plutôt que comme propriété-fonction, change-t-elle le résultat
   de la vérification ?

---

## Étape suivante

👉 🛠️ **[Mini-projet 1 — `taskline`](../05-mini-projet-taskline/index.md)**

Un gestionnaire de tâches en ligne de commande, sans dépendance externe.
C'est ici que tout ce que vous avez appris dans la Partie I se rejoint pour
la première fois dans un vrai programme.
