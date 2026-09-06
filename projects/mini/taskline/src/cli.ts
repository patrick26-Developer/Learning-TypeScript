import { type Command, parseArgs, HELP_TEXT } from './commands.js';
import { createTask, markDone, type Task } from './task.js';
import type { TaskRepository } from './repository.js';

/**
 * Une fonction d'écriture injectée plutôt qu'un `console.log` direct :
 * c'est ce qui permet aux tests de CAPTURER la sortie au lieu de la
 * regarder défiler dans un terminal.
 */
export type Writer = (line: string) => void;

/**
 * Le cœur du programme, entièrement testable : ni `process.argv`, ni accès
 * disque direct, ni `console.log` — tout est reçu en paramètre. `index.ts`
 * ne fait que fournir les vraies implémentations (argv réel, fichier réel,
 * `console.log` réel).
 */
export async function runCli(
  argv: readonly string[],
  repository: TaskRepository,
  write: Writer,
): Promise<void> {
  const command = parseArgs(argv);
  await dispatch(command, repository, write);
}

async function dispatch(
  command: Command,
  repository: TaskRepository,
  write: Writer,
): Promise<void> {
  switch (command.kind) {
    case 'add': {
      const tasks = await repository.load();
      const task = createTask(command.title);
      await repository.save([...tasks, task]);
      write(`✅ Tâche ajoutée : ${task.id}  ${task.title}`);
      return;
    }

    case 'list': {
      const tasks = await repository.load();
      write(formatTaskList(tasks));
      return;
    }

    case 'done': {
      const tasks = await repository.load();
      const target = tasks.find((t) => t.id === command.id);
      if (!target) {
        write(`❌ Aucune tâche avec l'id "${command.id}".`);
        return;
      }
      const updated = tasks.map((t) => (t.id === command.id ? markDone(t) : t));
      await repository.save(updated);
      write(`✅ Tâche terminée : ${target.title}`);
      return;
    }

    case 'remove': {
      const tasks = await repository.load();
      const exists = tasks.some((t) => t.id === command.id);
      if (!exists) {
        write(`❌ Aucune tâche avec l'id "${command.id}".`);
        return;
      }
      await repository.save(tasks.filter((t) => t.id !== command.id));
      write(`🗑️  Tâche supprimée.`);
      return;
    }

    case 'help':
      write(HELP_TEXT);
      return;

    case 'error':
      write(`❌ ${command.message}`);
      return;

    default: {
      // Contrôle d'exhaustivité (module 07 en fait la matière centrale) :
      // si une variante de `Command` est un jour ajoutée sans être traitée
      // ci-dessus, cette ligne cesse de compiler — `command` ne peut plus
      // être `never`. C'est le compilateur qui vous rappelle de mettre ce
      // fichier à jour, pas un test qu'il aurait fallu se souvenir d'écrire.
      const exhaustiveCheck: never = command;
      throw new Error(`Commande non gérée : ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}

function formatTaskList(tasks: readonly Task[]): string {
  if (tasks.length === 0) {
    return 'Aucune tâche. Utilisez "taskline add <titre>" pour en créer une.';
  }

  return tasks
    .map((t) => {
      const box = t.status === 'done' ? '[x]' : '[ ]';
      return `${box} ${t.id}  ${t.title}`;
    })
    .join('\n');
}
