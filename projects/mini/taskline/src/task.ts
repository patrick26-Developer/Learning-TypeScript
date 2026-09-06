/**
 * Le domaine métier de taskline : une seule entité, `Task`.
 *
 * `TaskStatus` est un objet `as const` plutôt qu'un `enum` (module 03) :
 * aucun code généré à l'exécution au-delà d'un littéral, et compatible avec
 * `isolatedModules`.
 */
export const TaskStatus = {
  Todo: 'todo',
  Done: 'done',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly createdAt: string; // ISO 8601 — une Date ne survit pas à JSON.stringify
}

/**
 * Génère un identifiant lisible et suffisamment unique pour un usage local
 * mono-utilisateur. `crypto.randomUUID()` est disponible nativement dans
 * Node depuis la version 14.17 — aucune dépendance externe nécessaire.
 */
export function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    status: TaskStatus.Todo,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Une tâche est immuable (`readonly` partout) : on ne "modifie" jamais une
 * tâche, on en produit une NOUVELLE version. C'est ce qui rend impossible
 * la classe de bugs où deux parties du programme partagent la même
 * référence et se marchent dessus sans le savoir.
 */
export function markDone(task: Task): Task {
  return { ...task, status: TaskStatus.Done };
}
