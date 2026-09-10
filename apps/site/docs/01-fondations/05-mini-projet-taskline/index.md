---
id: mini-projet-taskline
title: 'Mini-projet 1 — taskline'
sidebar_label: 'Mini-projet · taskline'
sidebar_position: 6
description: Un gestionnaire de tâches en ligne de commande sans aucune dépendance externe — le premier projet complet de la formation, avec le code de la solution commenté.
keywords: [typescript, mini-projet, cli, union discriminée, validation]
---

# Mini-projet 1 — taskline

|                 |                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Réinvestit**  | Modules 00 à 04                                                                                                         |
| **Code source** | [`projects/mini/taskline`](https://github.com/patrick26-Developer/Learning-TypeScript/tree/main/projects/mini/taskline) |
| **Tests**       | 21 tests, tous verts                                                                                                    |

Un gestionnaire de tâches en ligne de commande, **sans aucune dépendance
externe** (hors outillage de développement). L'objectif n'est pas la
fonctionnalité — un gestionnaire de tâches en CLI est volontairement simple —
mais la **structure** : chaque fichier a une seule responsabilité, et c'est
cette séparation qui rend le code testable sans lancer un seul processus.

:::tip Comment utiliser cette page
Le code ci-dessous est **la solution**, pas un énoncé à compléter — ce
mini-projet n'a pas de version « à trous » : il sert à voir comment les
notions des modules 00 à 04 s'assemblent en un programme réel, une fois
qu'on les a pratiquées séparément dans leurs exercices respectifs.
:::

---

## 1. Ce que ce projet réinvestit

| Notion                             | Où                                                                 | Module |
| ---------------------------------- | ------------------------------------------------------------------ | ------ |
| Union discriminée                  | `src/commands.ts` — le type `Command`                              | 03, 07 |
| Validation d'une entrée non fiable | `src/validate.ts` — le fichier JSON n'est jamais fait confiance    | 02     |
| Immutabilité                       | `src/task.ts` — `markDone` produit une nouvelle tâche              | 03     |
| Inversion de dépendance            | `src/repository.ts` — la persistance devient interchangeable       | 04     |
| Exhaustivité par `never`           | `src/cli.ts` — `dispatch()`                                        | 07     |
| Effets de bord isolés              | `src/index.ts` — seul fichier qui touche `process.argv`, le disque | 01     |

---

## 2. L'union discriminée au cœur du programme

Toute commande tapée par l'utilisateur devient une valeur de ce type — un
**seul** endroit du programme sait ce qu'est une commande valide :

```ts title="src/commands.ts"
export type Command =
  | { readonly kind: 'add'; readonly title: string }
  | { readonly kind: 'list' }
  | { readonly kind: 'done'; readonly id: string }
  | { readonly kind: 'remove'; readonly id: string }
  | { readonly kind: 'help' }
  | { readonly kind: 'error'; readonly message: string };
```

Le champ `kind` est le **discriminant** (module 07) : chaque branche d'un
`switch` sur `command.kind` restreint automatiquement les autres champs
disponibles. Impossible d'accéder à `command.title` dans la branche `'list'`
— cette erreur n'existe pas dans ce programme, le compilateur l'interdit.

**Remarquez la branche `'error'`.** Une commande invalide n'est **jamais**
une exception levée : c'est une valeur du même type que les commandes
valides. L'appelant (`cli.ts`) décide quoi en faire — afficher le message et
continuer, par exemple. C'est le patron « erreurs comme valeurs » que le
module 12 formalise.

---

## 3. La frontière de validation

Le fichier de sauvegarde (`tasks.json`) est lu par `JSON.parse`, dont le
résultat n'est jamais fait confiance — exactement la règle du module 00 :
tout ce qui vient de l'extérieur est `unknown` jusqu'à preuve du contraire.

```ts title="src/validate.ts"
export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly string[] };

export function validateTasks(data: unknown): ValidationResult<Task[]> {
  if (!Array.isArray(data)) {
    return {
      ok: false,
      errors: ['La racine du fichier doit être un tableau.'],
    };
  }
  // … chaque élément est validé un par un, les erreurs s'accumulent
  // plutôt que de s'arrêter à la première ligne invalide.
}
```

Chaque champ de chaque tâche est vérifié individuellement — type, non-vide,
plage de valeurs — **avant** qu'une seule assertion `as Task` n'apparaisse.
C'est la seule forme d'assertion tolérée dans ce dépôt (voir les
[consignes](../../00-demarrer/05-consignes.md)) : après une preuve
explicite, jamais à sa place.

---

## 4. Utiliser le CLI

```bash
pnpm --filter @atlas/mini-taskline start add "Écrire le rapport"
pnpm --filter @atlas/mini-taskline start list
pnpm --filter @atlas/mini-taskline start done <id>
pnpm --filter @atlas/mini-taskline start remove <id>
pnpm --filter @atlas/mini-taskline start help
```

Les tâches sont sauvegardées dans `tasks.json` (chemin personnalisable via
la variable d'environnement `TASKLINE_FILE`).

## 5. Lancer les tests

```bash
git clone https://github.com/patrick26-Developer/Learning-TypeScript.git
cd Learning-TypeScript && pnpm install
pnpm --filter @atlas/mini-taskline test
pnpm --filter @atlas/mini-taskline test:watch
```

---

## 6. Ce qui est volontairement absent

- **Pas de bibliothèque d'analyse d'arguments** (`commander`, `yargs`…) : le
  module 04 vient de montrer comment typer et tester une fonction pure
  (`parseArgs`) — ce projet en est l'application directe.
- **Pas de validation par schéma** (Zod) : ce sera le sujet du module 11.
  Ici, la validation est écrite à la main, pour comprendre ce qu'un
  validateur de schéma automatise ensuite.

Ces manques sont des choix, pas des oublis — un excellent point de départ
pour vos propres exercices 🔴 une fois le module 11 terminé.

---

## Étape suivante

👉 [Module 05 — Interfaces, types, classes](../../02-structurer/01-interfaces-et-classes/index.md)
— la Partie II commence.
