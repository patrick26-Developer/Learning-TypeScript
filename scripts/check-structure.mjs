#!/usr/bin/env node
// ---------------------------------------------------------------------------
// `pnpm audit:structure` — vérifie que chaque paquet de cours respecte le
// contrat décrit dans les guides publics du site (guide-utilisation.md,
// consignes.md) : présence de exercises/, solutions/, tests/, et un fichier
// de solution pour chaque énoncé d'exercice.
//
// Sans ce contrôle, rien n'empêche un module d'oublier son dossier
// `solutions/` — l'apprenant découvrirait le problème seul, en plein
// exercice. C'est un contrôle d'AUDIT au sens propre : il vérifie que la
// documentation publique décrit fidèlement ce qui existe réellement.
// ---------------------------------------------------------------------------

import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COURSES_DIR = join(ROOT, 'courses');

const useColor = process.stdout.isTTY && !process.env['NO_COLOR'];
const ESC = '';
const paint = (code, text) => (useColor ? `${ESC}[${code}m${text}${ESC}[0m` : text);
const bold = (t) => paint('1', t);
const red = (t) => paint('31', t);
const green = (t) => paint('32', t);
const dim = (t) => paint('2', t);

/** @type {string[]} */
const problems = [];

async function listTsFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith('.ts')).map((e) => e.name);
}

async function checkCourse(courseName) {
  const courseDir = join(COURSES_DIR, courseName);
  const exercisesDir = join(courseDir, 'exercises');
  const solutionsDir = join(courseDir, 'solutions');
  const testsDir = join(courseDir, 'tests');

  for (const [label, dir] of [
    ['exercises/', exercisesDir],
    ['solutions/', solutionsDir],
    ['tests/', testsDir],
  ]) {
    if (!existsSync(dir)) {
      problems.push(`${courseName} : dossier manquant → ${label}`);
    }
  }

  const exerciseFiles = await listTsFiles(exercisesDir);
  const solutionFiles = new Set(await listTsFiles(solutionsDir));
  const testFiles = await listTsFiles(testsDir);

  for (const file of exerciseFiles) {
    if (!solutionFiles.has(file)) {
      problems.push(`${courseName} : solution manquante pour exercises/${file}`);
    }
  }

  // Chaque exercice doit avoir au moins un test associé (même préfixe numérique).
  for (const file of exerciseFiles) {
    const prefix = file.split('-')[0];
    const hasTest = testFiles.some((t) => t.startsWith(`${prefix}-`));
    if (!hasTest) {
      problems.push(`${courseName} : aucun test ne semble couvrir exercises/${file}`);
    }
  }

  if (!existsSync(join(courseDir, 'package.json'))) {
    problems.push(`${courseName} : package.json manquant — le module ne sera pas exécuté par pnpm`);
  }
}

if (!existsSync(COURSES_DIR)) {
  console.log(dim('Aucun dossier courses/ pour le moment — rien à vérifier.'));
  process.exit(0);
}

const courseNames = (await readdir(COURSES_DIR, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

for (const name of courseNames) {
  await checkCourse(name);
}

console.log(`\n${bold('Audit de structure des modules de cours')}\n`);
console.log(dim(`${String(courseNames.length)} module(s) analysé(s) dans courses/`));

if (problems.length === 0) {
  console.log(`\n${green('✅ Aucun problème de structure détecté.')}\n`);
  process.exit(0);
}

console.log(`\n${red(bold(`${String(problems.length)} problème(s) :`))}\n`);
for (const p of problems) {
  console.log(`  ${red('•')} ${p}`);
}
console.log('');
process.exit(1);
