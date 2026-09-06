#!/usr/bin/env node
import { fileURLToPath } from 'node:url';

import { runCli } from './cli.js';
import { JsonFileTaskRepository } from './repository.js';

/**
 * Point d'entrée réel : c'est le SEUL fichier qui touche `process.argv`,
 * le disque, et `console.log` directement. Tout le reste du programme
 * (cli.ts, task.ts, validate.ts, repository.ts) n'en a jamais besoin —
 * c'est ce qui les rend testables sans lancer un vrai processus Node.
 */
const args = process.argv.slice(2);

// `fileURLToPath`, pas `new URL(...).pathname` : sur Windows, `.pathname`
// produirait "/F:/Projets/..." — un chemin invalide pour les fonctions du
// système de fichiers. `fileURLToPath` gère cette conversion correctement
// sur toutes les plateformes.
const defaultFile = fileURLToPath(new URL('../tasks.json', import.meta.url));
const repository = new JsonFileTaskRepository(process.env['TASKLINE_FILE'] ?? defaultFile);

await runCli(args, repository, (line) => {
  console.log(line);
});
