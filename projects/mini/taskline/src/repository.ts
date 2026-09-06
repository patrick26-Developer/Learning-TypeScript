import { readFile, writeFile } from 'node:fs/promises';

import type { Task } from './task.js';
import { validateTasks } from './validate.js';

/**
 * Le contrat que le reste du programme utilise, sans jamais savoir SI la
 * persistance est un fichier, une base de données ou de la mémoire. C'est
 * le patron Repository, appliqué ici à sa forme la plus simple — le module
 * 16 y reviendra en profondeur avec une vraie base de données.
 */
export interface TaskRepository {
  load(): Promise<Task[]>;
  save(tasks: readonly Task[]): Promise<void>;
}

/**
 * Implémentation en mémoire — utilisée par les tests. Aucune trace sur
 * disque : chaque test démarre sur un état vide et prévisible.
 */
export class InMemoryTaskRepository implements TaskRepository {
  #tasks: Task[] = [];

  load(): Promise<Task[]> {
    return Promise.resolve([...this.#tasks]);
  }

  save(tasks: readonly Task[]): Promise<void> {
    this.#tasks = [...tasks];
    return Promise.resolve();
  }
}

/**
 * Implémentation réelle — un fichier JSON sur disque. C'est la SEULE classe
 * de tout le mini-projet qui touche le système de fichiers : isoler les
 * effets de bord dans un unique endroit est ce qui rend le reste du
 * programme testable sans mock.
 */
export class JsonFileTaskRepository implements TaskRepository {
  readonly #filePath: string;

  constructor(filePath: string) {
    this.#filePath = filePath;
  }

  async load(): Promise<Task[]> {
    let raw: string;
    try {
      raw = await readFile(this.#filePath, 'utf8');
    } catch (error) {
      // Un fichier absent n'est pas une erreur : c'est un carnet vide.
      // Toute AUTRE erreur (droits d'accès, disque plein…) doit remonter.
      if (isNodeError(error) && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }

    // `JSON.parse` renvoie `any` en JavaScript — on le force IMMÉDIATEMENT
    // vers `unknown`, pour que rien, nulle part, ne puisse l'utiliser sans
    // passer par `validateTasks` d'abord.
    const parsed: unknown = JSON.parse(raw);
    const result = validateTasks(parsed);

    if (!result.ok) {
      throw new Error(
        `Fichier de sauvegarde corrompu (${this.#filePath}) :\n` +
          result.errors.map((e) => `  - ${e}`).join('\n'),
      );
    }

    return result.value;
  }

  async save(tasks: readonly Task[]): Promise<void> {
    const content = JSON.stringify(tasks, null, 2);
    await writeFile(this.#filePath, content, 'utf8');
  }
}

/**
 * Les erreurs Node.js portent un champ `code` (ex. 'ENOENT'), mais le type
 * `Error` standard ne le déclare pas. Ce garde-type reste local à ce
 * fichier : il ne prétend rien au-delà de ce dont ce module a besoin.
 */
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
