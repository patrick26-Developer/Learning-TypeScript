#!/usr/bin/env node
// ---------------------------------------------------------------------------
// `pnpm clean` — supprime les artefacts générés.
//
// Ce script est volontairement PRUDENT :
//   • il ne supprime que des noms de dossiers connus et listés ;
//   • il ne sort jamais de la racine du dépôt ;
//   • il ignore `node_modules` (c'est le rôle de `pnpm clean:deps`).
//
// Un script de nettoyage qui se trompe de dossier détruit le travail de
// quelqu'un. On préfère un script un peu bête à un script un peu malin.
// ---------------------------------------------------------------------------

import { readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(join(dirname(fileURLToPath(import.meta.url)), '..'));

/** Dossiers considérés comme des artefacts régénérables. */
const ARTIFACTS = new Set(['dist', 'build', 'coverage', '.turbo', '.next', '.docusaurus', '.expo']);

/** Dossiers dans lesquels on ne descend jamais (coûteux et inutile). */
const SKIP = new Set(['node_modules', '.git', '.pnpm-store']);

let removed = 0;

/**
 * Parcourt récursivement l'arborescence et supprime les artefacts rencontrés.
 * @param {string} dir Répertoire absolu à explorer.
 */
async function sweep(dir) {
  /** @type {import('node:fs').Dirent[]} */
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // dossier illisible ou disparu entre-temps : on ignore
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const full = join(dir, entry.name);

    // Garde-fou : ne JAMAIS agir en dehors de la racine du dépôt.
    // `relative` renvoie une valeur commençant par '..' si `full` est hors ROOT.
    if (relative(ROOT, full).startsWith('..')) continue;

    if (SKIP.has(entry.name)) continue;

    if (ARTIFACTS.has(entry.name)) {
      await rm(full, { recursive: true, force: true });
      console.log(`  supprimé  ${relative(ROOT, full)}`);
      removed += 1;
      continue; // inutile de descendre dans un dossier qu'on vient d'effacer
    }

    await sweep(full);
  }
}

// Fichiers isolés à supprimer en plus des dossiers.
async function sweepFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP.has(entry.name) || ARTIFACTS.has(entry.name)) continue;
      await sweepFiles(full);
    } else if (entry.name.endsWith('.tsbuildinfo')) {
      await rm(full, { force: true });
      console.log(`  supprimé  ${relative(ROOT, full)}`);
      removed += 1;
    }
  }
}

console.log('\nNettoyage des artefacts générés…\n');

await stat(ROOT); // échoue tôt et clairement si la racine est introuvable
await sweep(ROOT);
await sweepFiles(ROOT);

console.log(
  removed === 0
    ? '\nRien à nettoyer : le dépôt est déjà propre.\n'
    : `\n${String(removed)} élément(s) supprimé(s).\n`,
);
