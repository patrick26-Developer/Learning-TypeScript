---
id: programmer-les-types
title: 'Module 10 — Programmer au niveau des types'
sidebar_label: 'M10 · Programmer les types'
sidebar_position: 2
description: Branded types pour retrouver du typage nominal, machines à états où une transition invalide est impossible à écrire, builders typés, chemins d'objets profonds, et le coût de compilation.
keywords:
  [
    typescript,
    branded types,
    opaque types,
    machine à états,
    builder pattern,
    coût de compilation,
  ]
---

# Module 10 — Programmer au niveau des types

|               |                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------- |
| **Durée**     | ≈ 10 heures                                                                                        |
| **Prérequis** | [Module 09 — Types conditionnels](../01-types-conditionnels/index.md)                              |
| **Livrable**  | Modéliser un domaine métier où un état invalide est **impossible à écrire**, pas seulement détecté |

---

## 1. Branded types : retrouver du nominal dans un système structurel

Rappel du module 00 (Décision 3) : deux types structurellement identiques
sont interchangeables, même quand ce n'est pas souhaitable.

```ts
type UserId = string;
type OrderId = string;

function cancelOrder(id: OrderId): void {
  /* … */
}

const userId: UserId = 'usr_123';
cancelOrder(userId); // ✅ accepté — et c'est un bug métier réel
```

Un **branded type** ajoute une propriété fantôme, qui **n'existe qu'au
niveau des types** :

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

function makeUserId(id: string): UserId {
  return id as UserId; // le SEUL endroit où l'assertion est nécessaire
}

function cancelOrder(id: OrderId): void {
  /* … */
}

const userId = makeUserId('usr_123');
cancelOrder(userId);
// ❌ Vérifié en construisant ce module :
// Argument of type 'UserId' is not assignable to parameter of type 'OrderId'.
//   Type 'UserId' is not assignable to type '{ readonly __brand: "OrderId"; }'.
//     Types of property '__brand' are incompatible.
//       Type '"UserId"' is not assignable to type '"OrderId"'.
```

:::info Le prix à payer, et pourquoi il est acceptable
La propriété `__brand` **n'existe jamais à l'exécution** — `JSON.stringify`
ne la voit pas, elle occupe zéro octet en mémoire. Le seul coût réel : vous
devez passer par une fonction de construction (`makeUserId`) qui contient
**l'unique** assertion de tout votre code base pour ce type. C'est un
échange délibéré — une ligne d'assertion isolée et auditée, contre
l'élimination d'une classe entière de bugs de confusion d'identifiants.
:::

---

## 2. Machines à états : rendre une transition invalide impossible à écrire

```ts
type TrafficLight =
  | { state: 'red'; next: () => TrafficLight }
  | { state: 'green'; next: () => TrafficLight }
  | { state: 'yellow'; next: () => TrafficLight };

function red(): TrafficLight {
  return { state: 'red', next: green };
}
function green(): TrafficLight {
  return { state: 'green', next: yellow };
}
function yellow(): TrafficLight {
  return { state: 'yellow', next: red };
}

let light = red();
light = light.next(); // état suivant, sans jamais nommer d'état invalide
```

Ce n'est encore qu'une union discriminée (module 07) — la vraie puissance
apparaît quand **chaque état porte des données différentes**, rendant les
transitions incohérentes structurellement impossibles :

```ts
type Door =
  | { state: 'closed'; open: () => Door }
  | { state: 'open'; contents: string[]; close: () => Door };

function closedDoor(): Door {
  return {
    state: 'closed',
    open: () => ({ state: 'open', contents: [], close: closedDoor }),
  };
}

const door = closedDoor();
door.contents;
// ❌ Property 'contents' does not exist on type '{ state: "closed"; … }'
//    IMPOSSIBLE d'accéder à `contents` avant d'être passé par `.open()` —
//    ce n'est pas une règle qu'on respecte, c'est une règle qu'on ne peut
//    pas enfreindre : le compilateur ne propose même pas l'autocomplétion.
```

---

## 3. Inférence pilotée par l'API : le patron _builder_ typé

```ts
class QueryBuilder<Selected extends string = never> {
  #columns: string[] = [];

  select<K extends string>(...columns: K[]): QueryBuilder<Selected | K> {
    this.#columns.push(...columns);
    return this as unknown as QueryBuilder<Selected | K>;
  }

  build(): Record<Selected, unknown>[] {
    return []; // implémentation réelle omise pour l'exemple
  }
}

const rows = new QueryBuilder().select('id', 'name').build();
// type de rows : Record<'id' | 'name', unknown>[]
// Chaque colonne SÉLECTIONNÉE devient visible dans le type de retour,
// accumulée au fil des appels chaînés — sans jamais l'annoter à la main.
```

Chaque méthode **renvoie un type légèrement différent** de l'objet qui l'a
appelée, reflétant l'état accumulé par la chaîne d'appels. C'est le
mécanisme derrière des bibliothèques comme Prisma ou Drizzle (module 16) :
le type de la ligne retournée dépend exactement des colonnes demandées.

---

## 4. Typer des chemins d'objets profonds

```ts
type PathValue<
  T,
  Path extends string,
> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathValue<T[Key], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

interface Config {
  server: { port: number; host: string };
  db: { url: string };
}

type Port = PathValue<Config, 'server.port'>; // number
type Bad = PathValue<Config, 'server.wrong'>; // never

function getPath<T, P extends string>(obj: T, path: P): PathValue<T, P> {
  return path
    .split('.')
    .reduce(
      (acc: unknown, key) => (acc as Record<string, unknown>)[key],
      obj,
    ) as PathValue<T, P>;
}

const port = getPath(config, 'server.port'); // type : number, déduit du CHEMIN
```

Ce type **récursif** (module 09, §7) découpe le chemin `"server.port"`
littéral en `"server"` puis `"port"`, en descendant dans `T` à chaque étape
— exactement le mécanisme qui alimente les bibliothèques de gestion de
formulaires typées (`react-hook-form`, entre autres).

---

## 5. Le coût de compilation, et savoir le mesurer

Un type trop ambitieux peut ralentir `tsc` de façon perceptible sur un
grand projet. TypeScript expose un diagnostic pour objectiver ce coût,
plutôt que de deviner :

```bash
tsc --noEmit --extendedDiagnostics
```

```text
Files:                        842
Lines of Library:            42918
Lines of Definitions:        18204
Lines of TypeScript:          9847
Check time:                   4.21s
Types:                       284031
Instantiations:              892104
```

Un nombre d'**instantiations** anormalement élevé par rapport à la taille
réelle du projet signale généralement un type récursif trop gourmand, ou
une distributivité oubliée (module 09) qui explose combinatoirement sur de
grandes unions.

:::warning Une responsabilité d'équipe, pas seulement individuelle
Un type conçu pour être « élégant » peut devenir un problème collectif si
chaque sauvegarde de fichier déclenche plusieurs secondes de vérification
pour toute l'équipe. **Mesurer avant d'optimiser** : ne simplifiez un type
complexe que si `--extendedDiagnostics` (ou le temps de build réellement
observé) le justifie — simplifier un type qui ne coûte rien n'apporte
qu'une perte de précision sans bénéfice mesurable.
:::

---

## 6. Ce que vous devez retenir

1. **Un branded type retrouve du typage nominal** dans un système
   structurel, au prix d'une seule fonction de construction assumée.
2. **Une machine à états bien modélisée rend une transition invalide
   impossible à écrire**, pas seulement détectable après coup.
3. **Un builder typé accumule un type au fil d'une chaîne d'appels** — le
   type de retour final dépend du chemin exact emprunté à l'exécution.
4. **Un type récursif peut décrire un chemin d'objet et calculer sa valeur
   au niveau des types.**
5. **`--extendedDiagnostics` objective le coût de compilation** — à
   consulter avant de juger un type "trop compliqué".

---

## 7. Auto-évaluation

1. Pourquoi `id as UserId` est-il la SEULE assertion nécessaire dans tout
   un système utilisant des branded types, et où doit-elle vivre ?
2. Modélisez, en union discriminée, un état "panier" qui ne peut exposer un
   `total` qu'après être passé par un état "validé".
3. Dans le patron builder du §3, pourquoi `select` doit-il renvoyer
   `QueryBuilder<Selected | K>` plutôt que `QueryBuilder<K>` ?
4. Que renvoie `PathValue<Config, 'db.missing'>` (§4), et pourquoi n'est-ce
   pas une erreur de compilation à la définition du type ?
5. Vous observez un temps de compilation qui a doublé après l'ajout d'un
   type. Quelle commande consultez-vous en premier, et que cherchez-vous
   dans son résultat ?

---

## Étape suivante

👉 [Module 11 — Strictness, sécurité et fiabilité](../03-securite-et-fiabilite/index.md)
