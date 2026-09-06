import { beforeEach, describe, expect, it } from 'vitest';

import { runCli } from '../src/cli.js';
import { InMemoryTaskRepository } from '../src/repository.js';

// Un dépôt en mémoire à chaque test : aucun état partagé entre les cas,
// aucun fichier créé sur le disque du contributeur qui lance ces tests.
let repository: InMemoryTaskRepository;
let lines: string[];

beforeEach(() => {
  repository = new InMemoryTaskRepository();
  lines = [];
});

async function run(...argv: string[]): Promise<void> {
  await runCli(argv, repository, (line) => lines.push(line));
}

describe('runCli', () => {
  it('ajoute une tâche puis la retrouve dans la liste', async () => {
    await run('add', 'Préparer', 'le', 'déploiement');
    await run('list');

    expect(lines[0]).toContain('✅ Tâche ajoutée');
    expect(lines[1]).toContain('[ ]');
    expect(lines[1]).toContain('Préparer le déploiement');
  });

  it('affiche un message dédié quand la liste est vide', async () => {
    await run('list');
    expect(lines[0]).toContain('Aucune tâche');
  });

  it('marque une tâche comme terminée', async () => {
    await run('add', 'Corriger', 'le', 'bug');
    const tasks = await repository.load();
    const id = tasks[0]?.id;
    if (id === undefined) throw new Error('setup invalide');

    lines = [];
    await run('done', id);
    await run('list');

    expect(lines[0]).toContain('✅ Tâche terminée');
    expect(lines[1]).toContain('[x]');
  });

  it("échoue proprement quand l'id n'existe pas", async () => {
    await run('done', 'id-inexistant');
    expect(lines[0]).toContain('❌');
  });

  it('supprime une tâche', async () => {
    await run('add', 'À supprimer');
    const tasks = await repository.load();
    const id = tasks[0]?.id;
    if (id === undefined) throw new Error('setup invalide');

    lines = [];
    await run('remove', id);
    await run('list');

    expect(lines[0]).toContain('🗑️');
    expect(lines[1]).toContain('Aucune tâche');
  });

  it('affiche l’aide', async () => {
    await run('help');
    expect(lines[0]).toContain('taskline — gestionnaire de tâches');
  });

  it('affiche une erreur lisible pour une commande inconnue', async () => {
    await run('teleport');
    expect(lines[0]).toContain('❌');
    expect(lines[0]).toContain('teleport');
  });
});
