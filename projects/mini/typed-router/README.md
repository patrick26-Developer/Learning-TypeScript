# typed-router

Mini-projet 3 de [TypeScript Atlas](../../../README.md) — un routeur qui
**déduit les paramètres nommés d'une route depuis sa chaîne d'URL**, sans
jamais les ré-annoter à la main.

## Exemple

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
`postId` disparaît du type** — le gestionnaire ne pourra plus y accéder,
avant même d'avoir lancé le serveur une seule fois.

## Ce que ce projet réinvestit

| Notion                                                | Où                                                 |
| ----------------------------------------------------- | -------------------------------------------------- |
| Types littéraux de gabarit + `infer` récursif         | `src/params.ts` (module 09)                        |
| Assertion unique, justifiée, isolée dans le framework | `src/router.ts` (module 10, patron `QueryBuilder`) |
| Une API que l'on peut réellement donner à une équipe  | `Router` — chaînable, sans configuration           |

## Lancer les tests

```bash
pnpm --filter @atlas/mini-typed-router test
pnpm --filter @atlas/mini-typed-router typecheck
pnpm --filter @atlas/mini-typed-router lint
```

## Ce qui est volontairement absent

- Pas de wildcards (`/files/*`) ni de paramètres optionnels
  (`/users/:id?`) : le module 09 vous donne déjà tous les outils pour les
  ajouter vous-même — un excellent exercice 🔴 pour aller plus loin.
- Pas de middleware ni de groupes de routes : Express (module 15) et
  NestJS (module 17) les couvrent en profondeur.
