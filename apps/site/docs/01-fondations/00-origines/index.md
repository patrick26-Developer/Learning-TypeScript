---
id: origines
title: 'Module 00 — Origines et philosophie de TypeScript'
sidebar_label: 'M00 · Origines'
sidebar_position: 1
description: Pourquoi TypeScript a été créé en 2012, les cinq décisions fondatrices qui expliquent chacune de ses bizarreries, et la conséquence que 90 % des débutants ignorent.
keywords:
  [
    typescript,
    histoire,
    origines,
    anders hejlsberg,
    typage structurel,
    type erasure,
  ]
---

# Module 00 — Origines et philosophie de TypeScript

|               |                                                                     |
| ------------- | ------------------------------------------------------------------- |
| **Durée**     | ≈ 4 heures                                                          |
| **Prérequis** | Aucun (bases de JavaScript recommandées)                            |
| **Livrable**  | Savoir expliquer _pourquoi_ TypeScript se comporte comme il le fait |

:::tip Pourquoi commencer par de l'histoire ?
Parce que **toutes** les bizarreries de TypeScript découlent de cinq décisions
prises en 2012. Quand vous les connaissez, vous cessez de mémoriser des règles :
vous les déduisez.

Ce module ne contient presque pas de syntaxe. Il contient les fondations sur
lesquelles les vingt suivants reposent. Ne le sautez pas.
:::

---

## 1. Le problème : JavaScript ne devait pas faire ça

### 1.1 Dix jours

En mai 1995, Brendan Eich écrit chez Netscape la première version de ce qui
deviendra JavaScript. **En dix jours.** Le cahier des charges tenait en une
phrase : un petit langage de script pour animer des pages web — valider un
formulaire, faire clignoter un texte.

Personne, à ce moment, n'envisage qu'on y écrira des tableurs, des éditeurs
vidéo ou des systèmes bancaires.

C'est pourtant ce qui est arrivé.

### 1.2 Ce qui casse à l'échelle

Un langage dynamique et permissif est **excellent** pour 200 lignes.
Au-delà de 200 000, les mêmes qualités deviennent des défauts :

```js
// Ce code est du JavaScript parfaitement valide.
// Il ne produit aucune erreur. Il s'exécute.
function computeTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
```

Trois questions auxquelles ce code ne répond pas :

1. Que contient `order` ? Il faut lire tous les appelants pour le savoir.
2. Que se passe-t-il si `price` est la chaîne `"12.50"` au lieu du nombre `12.5` ?
   Réponse : `sum + "12.50" * 2` donne `25`… mais `sum + "12.50"` donnerait
   `"012.50"`. Le bug dépend de données que vous ne voyez pas.
3. Si demain quelqu'un renomme `qty` en `quantity`, qui vous prévient ?
   **Personne.** Vous l'apprendrez par un client.

:::danger Le coût réel
Ce ne sont pas des erreurs d'inattention. C'est une classe entière de bugs
que le langage est **structurellement incapable** de détecter. Sur une base de
code de plusieurs centaines de milliers de lignes maintenue par des dizaines de
personnes, ce coût devient le facteur limitant de l'entreprise.
:::

### 1.3 Microsoft en 2010

Microsoft développe alors des applications web d'une taille inédite : Office
Web Apps, Bing, Outlook Web Access. Des équipes venues de C# écrivent du
JavaScript à une échelle pour laquelle le langage n'a jamais été conçu.

Le constat interne est brutal — **le refactoring est devenu impossible**.
Renommer une méthode exige de chercher une chaîne de caractères dans tout le
dépôt et de prier. L'autocomplétion ne peut rien proposer, puisqu'aucun outil ne
sait ce que contient un objet.

Deux options s'offrent à eux :

| Option                                                   | Conséquence                                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| Créer un nouveau langage compilé vers JS                 | Il faudrait tout réécrire. GWT et Dart ont essayé — échec d'adoption |
| Ajouter une couche d'outillage **par-dessus** JavaScript | Adoption progressive possible, code existant préservé                |

Ils choisissent la seconde. En octobre 2012, TypeScript 0.8 est publié.

### 1.4 L'homme derrière

**Anders Hejlsberg** dirige le projet. Son parcours n'est pas anodin :

- **Turbo Pascal** (1983) — un compilateur de 39 Ko, si rapide qu'il rendait
  la compilation invisible
- **Delphi** (1995) — le développement d'interfaces par composants
- **C#** (2000) — le langage principal de la plateforme .NET

Une constante traverse ces trois projets : **l'obsession de l'expérience du
développeur**. Pas la pureté théorique du langage — la boucle de retour.
Vitesse de compilation, qualité des messages d'erreur, aide de l'éditeur.

Cela explique un fait souvent mal compris : le système de types de TypeScript
n'est **pas** conçu pour être mathématiquement sain (_sound_). Il est conçu
pour être **utile**. Nous y revenons au § 3.

---

## 2. Les cinq décisions fondatrices

Tout ce que vous rencontrerez dans ce parcours découle de ces cinq choix.

### Décision 1 — TypeScript est un sur-ensemble de JavaScript

> Tout programme JavaScript valide est un programme TypeScript valide.

```ts
// Ce fichier .ts ne contient aucune annotation.
// C'est du JavaScript. C'est aussi du TypeScript valide.
const greet = (name) => `Bonjour ${name}`;
console.log(greet('Ada'));
```

**Conséquences pratiques :**

- Renommer `.js` en `.ts` ne casse rien
- L'adoption peut se faire fichier par fichier
- ⚠️ Le revers : TypeScript hérite de **toutes** les bizarreries de JavaScript
  (`0.1 + 0.2 !== 0.3`, `typeof null === 'object'`, la coercition implicite…)
  Il ne les corrige pas. Il vous aide seulement à ne pas les déclencher.

### Décision 2 — Les types sont effacés à la compilation ⭐

> **C'est la décision la plus importante de ce module.**

TypeScript compile en supprimant purement et simplement les types.

```ts
// Ce que vous écrivez :
interface User {
  id: number;
  name: string;
}

function display(user: User): string {
  return user.name;
}
```

```js
// Ce qui s'exécute réellement :
function display(user) {
  return user.name;
}
// L'interface User n'existe plus. Nulle part. Elle n'a JAMAIS existé
// à l'exécution.
```

:::danger La conséquence que 90 % des débutants ignorent
**Un type ne protège rien à l'exécution.**

```ts
// Le compilateur accepte. Il ne peut rien vérifier :
// la réponse du serveur n'existe pas au moment de la compilation.
const user: User = await fetch('/api/user').then((r) => r.json());

console.log(user.name.toUpperCase());
// 💥 TypeError: Cannot read properties of undefined
//    si le serveur a renvoyé { userName: 'Ada' }
```

Le type `User` est une **promesse que vous faites au compilateur**, pas une
vérification qu'il effectue. Si la promesse est fausse, personne ne vous arrête.

C'est précisément le problème que résout le **module 11** avec la validation à
l'exécution. Retenez dès maintenant la règle qui structure tout le parcours :

> **Tout ce qui entre dans votre programme depuis l'extérieur est `unknown`
> jusqu'à preuve du contraire.**

HTTP, `JSON.parse`, `process.env`, base de données, fichiers, WebSocket, saisie
utilisateur. Sans exception.
:::

**Pourquoi ce choix ?** Vérifier les types à l'exécution coûterait de la
performance à chaque appel de fonction, et rendrait le JavaScript produit
méconnaissable. Hejlsberg a tranché : le JavaScript émis doit rester lisible et
rapide.

### Décision 3 — Le typage est structurel, pas nominal

En Java ou en C#, deux classes distinctes sont incompatibles même si elles ont
les mêmes champs : c'est le typage **nominal** (compatibilité par le _nom_).

TypeScript compare les **formes**.

```ts
interface Point {
  x: number;
  y: number;
}

class Vector {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

function distance(p: Point): number {
  return Math.sqrt(p.x ** 2 + p.y ** 2);
}

// ✅ Accepté : Vector n'implémente PAS Point, mais il en a la forme.
distance(new Vector(3, 4));

// ✅ Accepté aussi : un objet littéral suffit.
distance({ x: 3, y: 4 });
```

:::warning Le piège que cela ouvre
Deux types sémantiquement incompatibles peuvent être structurellement
identiques — et donc interchangeables :

```ts
type UserId = string;
type OrderId = string;

function cancelOrder(id: OrderId): void {
  /* … */
}

const userId: UserId = 'usr_123';
cancelOrder(userId); // ✅ Le compilateur accepte. C'est pourtant un bug grave.
```

La solution — les _branded types_ — est enseignée au module 10.
:::

**Pourquoi ce choix ?** Parce que JavaScript est structurel par nature. Un objet
littéral n'a pas de classe. Imposer du nominal aurait rendu TypeScript
inutilisable sur le code existant, c'est-à-dire sur tout l'écosystème.

### Décision 4 — Le typage est graduel

Vous pouvez typer 5 % de votre code, ou 100 %. Le curseur est le vôtre, réglé
par les options du compilateur.

```ts
// Niveau 0 — aucun type. Compile.
function add(a, b) {
  return a + b;
}

// Niveau 1 — types explicites.
function add(a: number, b: number): number {
  return a + b;
}

// Niveau 2 — types explicites + toutes les options strictes.
// C'est le niveau de ce parcours, dès le premier exercice.
```

**Pourquoi ce choix ?** Sans progressivité, aucune entreprise n'aurait migré.
C'est le facteur décisif de l'adoption de TypeScript face à Dart ou CoffeeScript.

:::note Notre position
Le typage graduel est un formidable outil de **migration**. Ce n'est pas un
objectif. Ce parcours travaille dès le module 01 avec la configuration la plus
stricte disponible — parce que sur un projet neuf, le coût est nul.
:::

### Décision 5 — TypeScript n'invente pas de fonctionnalités d'exécution

Depuis 2014, l'équipe suit une règle stricte : **ne pas ajouter au langage de
fonctionnalité qui n'existerait pas déjà, ou ne serait pas en voie
d'existence, dans le standard ECMAScript.**

Les rares exceptions historiques sont antérieures à cette règle, et elles sont
aujourd'hui **déconseillées** :

| Exception historique                               | Statut actuel                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `enum`                                             | Génère du code à l'exécution. Les experts préfèrent un objet `as const` (module 03) |
| `namespace`                                        | Remplacé par les modules ES                                                         |
| Décorateurs (ancienne syntaxe)                     | Remplacés par les décorateurs standard ECMAScript                                   |
| Propriétés de paramètres (`constructor(public x)`) | Toléré, spécifique à TS                                                             |

**Pourquoi ce choix ?** Pour ne jamais diverger de JavaScript. Ce que vous
apprenez du langage reste vrai en dehors de TypeScript.

---

## 3. « Unsound » : le compromis assumé

Un système de types est dit **sain** (_sound_) s'il ne laisse jamais passer une
erreur de type. Celui de TypeScript ne l'est pas — **volontairement**.

```ts
const names: string[] = ['Ada', 'Alan'];
const value: (string | number)[] = names; // ❌ refusé, heureusement

// Mais ceci passe :
const items: unknown[] = names;
items.push(42); // 💥 `names` contient maintenant un nombre.
console.log(names.map((n) => n.toUpperCase())); // TypeError à l'exécution
```

D'autres brèches connues et **assumées** :

- L'accès à un index (résolu par `noUncheckedIndexedAccess`, activé ici)
- La bivariance des paramètres de méthode (module 04)
- `any`, qui désactive tout sur son passage
- Les assertions `as`, qui affirment sans vérifier

:::info Ce n'est pas un défaut, c'est un arbitrage
Un système sain existe — c'est celui d'Elm, de Rust, de Haskell. Il impose une
rigueur qui aurait rendu impossible le typage de l'écosystème JavaScript
existant.

L'équipe TypeScript a choisi **l'adoptabilité plutôt que la perfection**.
Le résultat est un langage utilisé par des millions de développeurs, plutôt
qu'un langage parfait utilisé par personne.

**Votre travail d'ingénieur consiste à savoir où sont les brèches** — et à les
fermer là où ça compte. C'est tout l'objet du module 11.
:::

---

## 4. Chronologie

| Année | Version | Ce que ça change                                                     |
| ----- | ------- | -------------------------------------------------------------------- |
| 2012  | 0.8     | Annonce publique. Classes, modules, types de base                    |
| 2014  | 1.0     | Première version stable. Réécriture du compilateur **en TypeScript** |
| 2016  | 2.0     | **`strictNullChecks`** — le tournant. `null` devient un type à part  |
| 2016  | 2.1     | `keyof`, types mappés — le typage devient calculable                 |
| 2018  | 2.8     | **Types conditionnels et `infer`** — le système devient un langage   |
| 2020  | 4.1     | **Types littéraux de gabarit** — les chaînes entrent dans les types  |
| 2021  | 4.4–4.5 | `unknown` dans `catch`, narrowing sur alias                          |
| 2023  | 5.0     | Décorateurs standard, `const` sur paramètres de type                 |
| 2023  | 5.2     | **`satisfies`** — vérifier sans élargir                              |
| 2024  | 5.5–5.7 | Prédicats de type inférés                                            |
| 2025  | 5.9     | Dernière ligne 5.x                                                   |
| 2026  | 6.0     | Dernière ligne du compilateur écrit en TypeScript                    |
| 2026  | 7.0     | **Compilateur natif réécrit en Go** — environ 10× plus rapide        |

:::warning Pourquoi cette formation utilise TypeScript 6 et non 7
TypeScript 7 est plus rapide, mais l'outillage de lint type-aware ne le supporte
pas encore (`typescript-eslint` exige `<6.1.0`). Choisir TS 7 aujourd'hui
signifierait perdre les règles qui détectent les promesses non attendues et la
propagation des `any` — c'est-à-dire le cœur des modules 11 et 13.

La décision complète, avec les mesures et la date de réexamen, est consignée
dans le [journal d'audit, AUD-002](../../99-coulisses/01-journal-audit.md).
TypeScript 7 est traité dans un laboratoire dédié.

**Cette situation — « la version majeure est sortie, l'écosystème n'a pas
suivi » — est l'une des décisions les plus fréquentes du métier.** Vous venez
d'en voir un cas réel, argumenté et daté.
:::

---

## 5. Ce que vous devez retenir

Cinq phrases. Si vous ne retenez que celles-ci, ce module a rempli son rôle.

1. **TypeScript existe parce que JavaScript ne passe pas à l'échelle** — pas
   parce que les types seraient « mieux » dans l'absolu.
2. **Les types disparaissent à la compilation.** Aucune protection à l'exécution.
   Ce qui entre depuis l'extérieur doit être validé.
3. **La compatibilité se juge sur la forme, pas sur le nom.** Deux types
   identiques en structure sont interchangeables, même si c'est absurde
   métier.
4. **Le système de types n'est pas sain, et c'est un choix.** Connaître les
   brèches fait partie du métier.
5. **TypeScript ne diverge pas de JavaScript.** Ce que vous apprenez reste vrai
   ailleurs.

---

## 6. Auto-évaluation

Répondez à voix haute, sans relire. Si vous hésitez, la section est indiquée.

1. Pourquoi ce code compile-t-il alors qu'il plantera ? _(§ 2.2)_
   ```ts
   const user: { name: string } = JSON.parse('{}');
   console.log(user.name.length);
   ```
2. Pourquoi `distance(new Vector(3, 4))` est-il accepté alors que `Vector`
   n'implémente pas `Point` ? _(§ 2.3)_
3. Citez une conséquence négative de la décision « sur-ensemble de
   JavaScript ». _(§ 2.1)_
4. Que signifie « le système de types n'est pas sain » ? Donnez un exemple. _(§ 3)_
5. Pourquoi les experts évitent-ils `enum` ? _(§ 2.5)_

---

## 7. Si vous devez consolider JavaScript d'abord

Ce module est accessible sans prérequis, mais le **module 02** suppose du
JavaScript. Vérifiez que vous savez :

- [ ] Déclarer avec `const` / `let` et expliquer la portée de bloc
- [ ] Écrire une fonction fléchée et comprendre son `this`
- [ ] Utiliser `map`, `filter`, `reduce`, `find`
- [ ] Déstructurer un objet et un tableau, utiliser le _spread_ `...`
- [ ] Distinguer `null` et `undefined`
- [ ] Comprendre `===` contre `==` et savoir pourquoi on n'utilise que le premier
- [ ] Lire une chaîne `async`/`await` et savoir ce qu'est une promesse rejetée
- [ ] Importer et exporter des modules ES

**Trois cases non cochées ou plus ?** Consacrez deux à trois semaines aux
fondamentaux JavaScript. Ce n'est pas du retard : c'est ce qui rendra la suite
possible.

Ressources recommandées : [MDN — Guide JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide)
· [javascript.info](https://javascript.info/)

---

## Étape suivante

👉 [Module 01 — Toolchain, `tsconfig`, exécution, débogage](../01-toolchain/index.md)

Vous saurez ce qui transforme votre code, comment le configurer, et comment lire
une erreur du compilateur sans paniquer.
