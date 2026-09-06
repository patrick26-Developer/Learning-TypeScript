---
id: interfaces-et-classes
title: 'Module 05 — Interfaces, types, classes, typage structurel'
sidebar_label: 'M05 · Interfaces & classes'
sidebar_position: 1
description: interface contre type (la vraie liste des différences), classes (visibilité, champs privés #, abstract), fusion de déclarations, et le typage structurel en profondeur.
keywords:
  [
    typescript,
    interface,
    type alias,
    classes,
    private fields,
    declaration merging,
    typage structurel,
  ]
---

# Module 05 — Interfaces, types, classes, typage structurel

|               |                                                                    |
| ------------- | ------------------------------------------------------------------ |
| **Durée**     | ≈ 6 heures                                                         |
| **Prérequis** | [Module 04 — Fonctions](../../01-fondations/04-fonctions/index.md) |
| **Livrable**  | Choisir `interface` ou `type` avec un argument, pas une habitude   |

---

## 1. `interface` contre `type` : la vraie liste des différences

La croyance répandue « `interface` pour les objets, `type` pour tout le
reste » est une simplification. Voici les différences **réelles**, vérifiées :

| Capacité                                              | `interface`  |         `type`         |
| ----------------------------------------------------- | :----------: | :--------------------: |
| Décrire la forme d'un objet                           |      ✅      |           ✅           |
| Étendre une autre forme                               | ✅ `extends` | ✅ `&` (intersection)  |
| Décrire une union                                     |      ❌      |           ✅           |
| Décrire un type primitif, tuple, fonction directement |      ❌      |           ✅           |
| **Fusion de déclarations** (§3)                       |      ✅      |           ❌           |
| Implémentée par une classe (`implements`)             |      ✅      | ✅ (si c'est un objet) |
| Types conditionnels, mappés (module 09)               |      ❌      |           ✅           |

```ts
// Impossible avec interface :
type Id = string | number;
type Point = [number, number];
type Callback = (error: Error | null) => void;

// Également impossible :
interface Id = string | number; // ❌ n'existe pas, syntaxe invalide
```

:::tip Règle pragmatique de ce dépôt
**`interface` pour les objets destinés à être étendus ou implémentés**
(contrats publics, formes de classes) ; **`type` pour tout le reste** —
unions, tuples, fonctions, types calculés. En cas de doute sur un simple
objet fermé, les deux sont équivalents : préférez `interface`, dont les
messages d'erreur sont historiquement plus lisibles sur de grosses formes
imbriquées.
:::

---

## 2. Classes : visibilité, `readonly`, champs privés `#`

```ts
class Account {
  readonly id: string; // en lecture seule après construction
  #balance: number; // PRIVÉ AU RUNTIME — pas seulement aux types
  protected owner: string; // visible dans les sous-classes seulement
  public label: string; // par défaut, si omis

  constructor(id: string, owner: string, initialBalance: number) {
    this.id = id;
    this.owner = owner;
    this.#balance = initialBalance;
    this.label = `Compte de ${owner}`;
  }

  deposit(amount: number): void {
    this.#balance += amount;
  }

  get balance(): number {
    return this.#balance;
  }
}

const acc = new Account('a1', 'Ada', 100);
acc.balance; // ✅ 100, via le getter
acc.#balance; // ❌ Property '#balance' is not accessible outside class 'Account'
//    (et une SyntaxError à l'exécution si on essaie de contourner !)
```

:::danger `private` (mot-clé TypeScript) contre `#` (JavaScript natif)

```ts
class Legacy {
  private secret: string = 'x';
}
class Modern {
  #secret: string = 'x';
}

// À l'exécution, après compilation :
console.log(JSON.stringify(new Legacy())); // { "secret": "x" } — VISIBLE !
console.log(JSON.stringify(new Modern())); // {}                — invisible
```

`private` est une annotation qui **disparaît à la compilation**
(module 00, Décision 2) : la propriété reste un champ JavaScript ordinaire
à l'exécution, lisible par quiconque contourne le vérificateur de types
(`(instance as any).secret`). `#` est une syntaxe **JavaScript native** :
l'encapsulation existe réellement, à l'exécution, pas seulement à la
compilation. **Préférez toujours `#` quand une vraie confidentialité
compte** (un secret, un solde bancaire, un jeton).
:::

### `abstract` — un contrat sans implémentation

```ts
abstract class Shape {
  abstract area(): number; // chaque sous-classe DOIT la fournir

  describe(): string {
    return `Aire : ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

new Shape(); // ❌ Cannot create an instance of an abstract class.
```

---

## 3. Fusion de déclarations : un pouvoir d'`interface` que `type` n'a pas

```ts
interface Config {
  timeout: number;
}

interface Config {
  retries: number;
}

// Config est maintenant { timeout: number; retries: number }
const c: Config = { timeout: 5000, retries: 3 };
```

Deux `interface` de même nom, dans le même espace de portée, **fusionnent**
au lieu de se marcher dessus (`type` produirait une erreur de redéclaration).

:::info Où c'est réellement utile : augmenter un type que vous ne possédez pas

```ts
// Dans un fichier de déclaration de votre projet :
declare global {
  namespace Express {
    interface Request {
      userId?: string; // ajoute un champ à TOUTES les requêtes Express
    }
  }
}
```

C'est exactement le mécanisme qu'utilise le module 08 pour augmenter les
types d'une bibliothèque tierce sans en modifier le code source — vous
l'utiliserez concrètement au module 15 pour attacher l'utilisateur
authentifié à chaque requête Express.
:::

---

## 4. Le typage structurel, en profondeur

Retour sur la Décision 3 du module 00, avec une conséquence pratique
souvent ignorée : **la compatibilité structurelle s'applique aussi entre
classes n'ayant AUCUN lien de parenté.**

```ts
class Employee {
  constructor(
    public name: string,
    public salary: number,
  ) {}
}

class Robot {
  constructor(
    public name: string,
    public salary: number,
  ) {}
  // un robot n'a pas de salaire, mais la classe le déclare quand même :
  // c'est un exemple, pas une bonne pratique de modélisation !
}

function printPayroll(person: Employee) {
  console.log(`${person.name} : ${String(person.salary)}€`);
}

printPayroll(new Robot('R2D2', 0)); // ✅ accepté — même forme, aucun lien de classe
```

### Forcer du nominal quand la structure ne suffit pas

Le module 10 traite ce sujet en profondeur (_branded types_), mais voici
l'intuition, directement liée à ce module :

```ts
class UserId {
  private readonly brand = 'UserId'; // jamais lu, sert uniquement à casser
  constructor(public readonly value: string) {}
}

class OrderId {
  private readonly brand = 'OrderId';
  constructor(public readonly value: string) {}
}

function cancelOrder(id: OrderId) {
  /* … */
}

cancelOrder(new UserId('u1'));
// ❌ Refusé : les champs privés `brand` de même nom mais de classes
//    différentes rendent les deux structurellement incompatibles.
```

Un champ privé **change la règle** : deux classes structurellement
identiques SAUF pour un champ privé (même s'il n'est jamais lu) deviennent
incompatibles entre elles, parce que TypeScript compare aussi les champs
privés dans son analyse structurelle — et un champ privé n'est visible
que depuis sa propre classe.

---

## 5. Ce que vous devez retenir

1. **`interface` pour ce qui s'étend et se fusionne, `type` pour tout ce
   qui se calcule** (unions, tuples, fonctions).
2. **`#` offre une vraie confidentialité à l'exécution ; `private` n'en
   offre qu'à la compilation.**
3. **La fusion de déclarations** est le mécanisme qui permet d'augmenter
   les types d'une bibliothèque tierce sans toucher son code.
4. **Le typage structurel s'applique même entre classes sans lien de
   parenté** — et un champ privé peut briser cette compatibilité
   volontairement.

---

## 6. Auto-évaluation

1. Écrivez un type qui ne peut être exprimé qu'avec `type`, jamais avec
   `interface`. Pourquoi cette limite existe-t-elle ?
2. Pourquoi `JSON.stringify` révèle-t-il un champ `private` mais pas un
   champ `#` ?
3. À quoi sert la fusion de déclarations dans un cas réel (donnez-en un) ?
4. Pourquoi `Robot` est-il assignable à un paramètre `Employee` alors
   qu'aucune des deux classes n'étend l'autre ?
5. Comment un champ privé, jamais lu par le programme, peut-il empêcher
   deux classes structurellement identiques d'être compatibles entre elles ?

---

## Étape suivante

👉 [Module 06 — Génériques](../02-generiques/index.md)
