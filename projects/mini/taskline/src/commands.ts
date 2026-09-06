/**
 * Une UNION DISCRIMINÉE : le patron le plus rentable de tout TypeScript
 * (module 07). Le champ `kind` est le "discriminant" — il permet à un
 * `switch` de savoir, à la compilation, exactement quels autres champs
 * sont disponibles sur chaque branche.
 */
export type Command =
  | { readonly kind: 'add'; readonly title: string }
  | { readonly kind: 'list' }
  | { readonly kind: 'done'; readonly id: string }
  | { readonly kind: 'remove'; readonly id: string }
  | { readonly kind: 'help' }
  | { readonly kind: 'error'; readonly message: string };

/**
 * Traduit les arguments bruts de la ligne de commande (des `string[]`,
 * une entrée aussi peu fiable qu'un fichier JSON) en une `Command` typée.
 * Toute entrée non reconnue produit `{ kind: 'error' }` plutôt qu'une
 * exception — l'appelant (`cli.ts`) décide alors comment l'afficher.
 */
export function parseArgs(argv: readonly string[]): Command {
  const [action, ...rest] = argv;

  switch (action) {
    case 'add': {
      const title = rest.join(' ').trim();
      if (title.length === 0) {
        return { kind: 'error', message: 'Usage : taskline add <titre>' };
      }
      return { kind: 'add', title };
    }

    case 'list':
      return { kind: 'list' };

    case 'done': {
      const id = rest[0];
      if (id === undefined) {
        return { kind: 'error', message: 'Usage : taskline done <id>' };
      }
      return { kind: 'done', id };
    }

    case 'remove': {
      const id = rest[0];
      if (id === undefined) {
        return { kind: 'error', message: 'Usage : taskline remove <id>' };
      }
      return { kind: 'remove', id };
    }

    case undefined:
    case 'help':
      return { kind: 'help' };

    default:
      return {
        kind: 'error',
        message: `Commande inconnue : "${action}". Essayez "taskline help".`,
      };
  }
}

export const HELP_TEXT = `taskline — gestionnaire de tâches en ligne de commande

Usage :
  taskline add <titre>     Ajoute une nouvelle tâche
  taskline list             Liste toutes les tâches
  taskline done <id>        Marque une tâche comme terminée
  taskline remove <id>      Supprime une tâche
  taskline help              Affiche cette aide`;
