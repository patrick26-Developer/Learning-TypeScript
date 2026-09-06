import { type Task, TaskStatus } from './task.js';

/**
 * Résultat d'une validation : soit la donnée est valide et on obtient la
 * valeur typée, soit elle ne l'est pas et on obtient la liste des raisons.
 * Aucune exception levée ici — l'appelant DÉCIDE quoi faire d'une donnée
 * invalide (module 12 approfondit ce patron "erreurs comme valeurs").
 */
export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly string[] };

/**
 * Le fichier de sauvegarde est lu avec `JSON.parse`, qui renvoie `unknown`
 * dans un monde idéal (en réalité `any` en JavaScript pur — c'est
 * exactement le problème que ce module contourne à la main, avant que
 * Zod ne l'automatise au module 11). Toute donnée venue du disque est
 * TRAITÉE COMME NON FIABLE, qu'elle vienne d'un humain qui a édité le
 * fichier à la main ou d'une version antérieure du programme.
 */
export function validateTasks(data: unknown): ValidationResult<Task[]> {
  if (!Array.isArray(data)) {
    return { ok: false, errors: ['La racine du fichier doit être un tableau.'] };
  }

  const errors: string[] = [];
  const tasks: Task[] = [];

  data.forEach((entry: unknown, index: number) => {
    const result = validateTask(entry, index);
    if (result.ok) {
      tasks.push(result.value);
    } else {
      errors.push(...result.errors);
    }
  });

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: tasks };
}

function validateTask(entry: unknown, index: number): ValidationResult<Task> {
  if (typeof entry !== 'object' || entry === null) {
    return { ok: false, errors: [`Élément #${String(index)} : attendu un objet.`] };
  }

  // `entry` est maintenant `object`, mais TypeScript ne connaît toujours
  // aucune de ses propriétés : `noPropertyAccessFromIndexSignature` et
  // `strict` nous obligent à passer par un typage explicite (via
  // `Record<string, unknown>`) pour tester chaque champ un par un.
  const candidate = entry as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof candidate['id'] !== 'string' || candidate['id'].length === 0) {
    errors.push(`Élément #${String(index)} : "id" doit être une chaîne non vide.`);
  }
  if (typeof candidate['title'] !== 'string' || candidate['title'].length === 0) {
    errors.push(`Élément #${String(index)} : "title" doit être une chaîne non vide.`);
  }
  if (candidate['status'] !== TaskStatus.Todo && candidate['status'] !== TaskStatus.Done) {
    errors.push(
      `Élément #${String(index)} : "status" doit valoir "todo" ou "done" (reçu : ${JSON.stringify(candidate['status'])}).`,
    );
  }
  if (
    typeof candidate['createdAt'] !== 'string' ||
    Number.isNaN(Date.parse(candidate['createdAt']))
  ) {
    errors.push(`Élément #${String(index)} : "createdAt" doit être une date ISO valide.`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // À ce stade, chaque champ a été vérifié individuellement : l'assertion
  // est justifiée par les contrôles ci-dessus, elle n'affirme rien à
  // l'aveugle. C'est la seule forme d'assertion tolérée : après preuve,
  // jamais à la place d'une preuve.
  return { ok: true, value: candidate as unknown as Task };
}
