# taskline

Mini-projet 1 de [TypeScript Atlas](../../../README.md) — un gestionnaire de
tâches en ligne de commande, **sans aucune dépendance externe** (hors outillage
de développement).

## Ce que ce projet réinvestit

| Notion                              | Où                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| Union discriminée                   | `src/commands.ts` — le type `Command`                                             |
| Validation d'une entrée non fiable  | `src/validate.ts` — le fichier JSON n'est jamais fait confiance                   |
| Immutabilité                        | `src/task.ts` — `markDone` produit une nouvelle tâche, n'en modifie aucune        |
| Inversion de dépendance             | `src/repository.ts` — `TaskRepository` rend la persistance interchangeable        |
| Contrôle d'exhaustivité par `never` | `src/cli.ts` — `dispatch()`                                                       |
| Effets de bord isolés               | `src/index.ts` — seul fichier qui touche `process.argv`, le disque, `console.log` |

## Utiliser le CLI

```bash
pnpm --filter @atlas/mini-taskline start add "Écrire le rapport"
pnpm --filter @atlas/mini-taskline start list
pnpm --filter @atlas/mini-taskline start done <id>
pnpm --filter @atlas/mini-taskline start remove <id>
pnpm --filter @atlas/mini-taskline start help
```

Les tâches sont sauvegardées dans `tasks.json`, à la racine de ce dossier
(chemin personnalisable via la variable d'environnement `TASKLINE_FILE`).

## Lancer les tests

```bash
pnpm --filter @atlas/mini-taskline test
pnpm --filter @atlas/mini-taskline test:watch
```

## Ce qui est volontairement absent

- Pas de bibliothèque d'analyse d'arguments (`commander`, `yargs`…) : le
  module 04 vient de vous montrer comment typer et tester une fonction pure
  (`parseArgs`) — un mini-projet en est l'application directe.
- Pas de validation par schéma (Zod) : ce sera le sujet du module 11.
  Ici, la validation est écrite à la main, pour comprendre ce qu'un
  validateur de schéma automatise ensuite.
