---
id: mini-projet-typed-router
title: 'Mini-projet 3 — typed-router'
sidebar_label: 'Mini-projet · typed-router'
sidebar_position: 5
description: Un routeur qui déduit les paramètres d'une route depuis sa chaîne d'URL, via des types littéraux de gabarit récursifs — avec le code de la solution commenté.
keywords: [typescript, mini-projet, routeur, template literal types, infer]
---

# Mini-projet 3 — typed-router

|                 |                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Réinvestit**  | Modules 09 à 11                                                                                                                 |
| **Code source** | [`projects/mini/typed-router`](https://github.com/patrick26-Developer/Learning-TypeScript/tree/main/projects/mini/typed-router) |
| **Tests**       | 12 tests, tous verts                                                                                                            |

Un routeur qui **déduit les paramètres nommés d'une route depuis sa chaîne
d'URL**, sans jamais les ré-annoter à la main.

```ts
import { Router } from '@atlas/mini-typed-router';

const router = new Router();

router.get('/users/:id/posts/:postId', (params) => {
  // params est déduit automatiquement : { id: string; postId: string }
  console.log(params.id, params.postId);
});

router.get('/health', (params) => {
  // params: {} — aucun paramètre à cette route
});

router.dispatch('GET', '/users/1/posts/7');
```

Écrivez `/users/:id/psots/:postId` (faute de frappe) et **le paramètre
`postId` disparaît du type** — le gestionnaire ne peut plus y accéder, avant
même d'avoir lancé le serveur une seule fois.

---

## 1. Ce que ce projet réinvestit

| Notion                                                | Où                                       | Module |
| ----------------------------------------------------- | ---------------------------------------- | ------ |
| Types littéraux de gabarit + `infer` récursif         | `src/params.ts`                          | 09     |
| Assertion unique, justifiée, isolée dans le framework | `src/router.ts`                          | 10     |
| Une API que l'on peut réellement donner à une équipe  | `Router` — chaînable, sans configuration | 10     |

---

## 2. Déduire les paramètres, un segment à la fois

```ts title="src/params.ts"
type ExtractParam<Segment extends string> = Segment extends `:${infer Name}`
  ? Name
  : never;

type ExtractParamNames<Path extends string> =
  Path extends `${infer Segment}/${infer Rest}`
    ? ExtractParam<Segment> | ExtractParamNames<Rest>
    : ExtractParam<Path>;

export type RouteParams<Path extends string> = Record<
  ExtractParamNames<Path>,
  string
>;
```

Trois types, chacun avec une seule responsabilité :

1. **`ExtractParam`** — un segment isolé (`:id`) donne son nom (`id`) ; un
   segment sans `:` donne `never`, qui disparaît silencieusement d'une union
   (module 09).
2. **`ExtractParamNames`** — la même récursion sur littéral de gabarit que
   `PathValue` du module 10, appliquée ici à la découpe d'une route plutôt
   qu'à la lecture d'un objet. Chaque segment produit un nom (ou rien), et
   l'union les accumule tous.
3. **`RouteParams`** — le seul type exporté publiquement. `Record<K, string>`
   plutôt qu'un type mappé `{ [P in K]: string }` écrit à la main : les deux
   sont équivalents ici (aucune valeur ne dépend de la clé), et `Record`
   est la forme que le lint de ce dépôt préfère dans ce cas précis.

**Testez-le vous-même dans le
[TypeScript Playground](https://www.typescriptlang.org/play)** :
`RouteParams<'/users/:id/posts/:postId'>` s'évalue, sous le curseur, en
`{ id: string; postId: string }` — sans qu'une seule ligne de code ne
s'exécute.

---

## 3. Lancer les tests

```bash
git clone https://github.com/patrick26-Developer/Learning-TypeScript.git
cd Learning-TypeScript && pnpm install
pnpm --filter @atlas/mini-typed-router test
pnpm --filter @atlas/mini-typed-router typecheck
pnpm --filter @atlas/mini-typed-router lint
```

---

## 4. Ce qui est volontairement absent

- **Pas de wildcards** (`/files/*`) ni de **paramètres optionnels**
  (`/users/:id?`) : le module 09 donne déjà tous les outils nécessaires pour
  les ajouter vous-même — un excellent exercice 🔴.
- **Pas de middleware ni de groupes de routes** : Express (module 15) et
  NestJS (module 17) les couvrent en profondeur.

---

## Étape suivante

👉 **Module 12 — Asynchrone typé, erreurs, concurrence, annulation**
_(en cours de rédaction)_ — la Partie IV commence.
