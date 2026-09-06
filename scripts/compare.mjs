#!/usr/bin/env node
// ---------------------------------------------------------------------------
// `pnpm compare <module> <exercice>` — affiche votre solution face au corrigé.
//
//   pnpm compare 02 01
//   → courses/02-*/exercises/01-*.ts   contre   courses/02-*/solutions/01-*.ts
//
// Ce script N'ÉCRIT RIEN. Il ne fait que lire et afficher : impossible
// d'écraser accidentellement votre travail en l'utilisant.
// ---------------------------------------------------------------------------

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COURSES = join(ROOT, 'courses');

const useColor = process.stdout.isTTY && !process.env['NO_COLOR'];
const ESC = '';
const paint = (code, text) => (useColor ? `${ESC}[${code}m${text}${ESC}[0m` : text);
const bold = (t) => paint('1', t);
const cyan = (t) => paint('36', t);
const green = (t) => paint('32', t);
const dim = (t) => paint('2', t);

const [moduleArg, exerciseArg] = process.argv.slice(2);

if (!moduleArg || !exerciseArg) {
  console.error(`
${bold('Usage :')} pnpm compare <module> <exercice>

${bold('Exemple :')}
  pnpm compare 02 01     ${dim('# module 02, exercice 01')}
  pnpm compare 7 3       ${dim('# les zéros initiaux sont optionnels')}
`);
  process.exit(1);
}

// Normalise « 7 » en « 07 » : les dossiers utilisent deux chiffres.
const pad = (value) => value.padStart(2, '0');
const moduleId = pad(moduleArg);
const exerciseId = pad(exerciseArg);

if (!existsSync(COURSES)) {
  console.error(`Dossier introuvable : ${COURSES}`);
  process.exit(1);
}

// Retrouve le dossier du module à partir de son préfixe numérique.
const moduleDir = (await readdir(COURSES, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .find((name) => name.startsWith(`${moduleId}-`));

if (!moduleDir) {
  console.error(`Aucun module ne commence par « ${moduleId}- » dans courses/.`);
  process.exit(1);
}

/**
 * Retrouve le fichier dont le nom commence par le numéro d'exercice.
 * @param {string} kind 'exercises' ou 'solutions'
 */
async function findFile(kind) {
  const dir = join(COURSES, moduleDir, kind);
  if (!existsSync(dir)) return null;

  const name = (await readdir(dir)).find(
    (f) => f.startsWith(`${exerciseId}-`) && f.endsWith('.ts'),
  );
  return name ? join(dir, name) : null;
}

const yoursPath = await findFile('exercises');
const solutionPath = await findFile('solutions');

if (!yoursPath || !solutionPath) {
  console.error(
    `Exercice ${exerciseId} introuvable dans le module ${moduleDir}.\n` +
      `Vérifiez : courses/${moduleDir}/exercises/ et /solutions/`,
  );
  process.exit(1);
}

const [yours, solution] = await Promise.all([
  readFile(yoursPath, 'utf8'),
  readFile(solutionPath, 'utf8'),
]);

const rule = '─'.repeat(72);

console.log(`\n${cyan(bold('▌ VOTRE SOLUTION'))}  ${dim(yoursPath.replace(ROOT, '.'))}`);
console.log(dim(rule));
console.log(yours.trimEnd());

console.log(`\n${green(bold('▌ CORRIGÉ'))}  ${dim(solutionPath.replace(ROOT, '.'))}`);
console.log(dim(rule));
console.log(solution.trimEnd());

console.log(`\n${dim(rule)}`);
console.log(
  dim(
    'Rappel : lisez, comprenez l’idée qui vous manquait, puis FERMEZ ceci\n' +
      'et réécrivez de mémoire. Copier un corrigé n’apprend rien.\n',
  ),
);
