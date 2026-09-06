#!/usr/bin/env node
// ---------------------------------------------------------------------------
// `pnpm doctor` — diagnostic de l'environnement de travail.
//
// POURQUOI CE SCRIPT EXISTE
// Un apprenant qui bute sur « ça ne marche pas » à la première heure abandonne.
// Ce script transforme un échec opaque en une liste de corrections précises.
//
// Il est volontairement écrit en JavaScript pur (.mjs) et sans aucune
// dépendance : il doit pouvoir s'exécuter AVANT `pnpm install`, c'est-à-dire
// précisément quand rien ne fonctionne encore.
// ---------------------------------------------------------------------------

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- Petite bibliothèque de couleurs ANSI ----------------------------------
// `NO_COLOR` est une convention respectée par l'outillage sérieux :
// certains terminaux et journaux de CI n'interprètent pas les codes ANSI.
const useColor = process.stdout.isTTY && !process.env['NO_COLOR'];
const paint = (code, text) => (useColor ? `\u001B[${code}m${text}\u001B[0m` : text);
const bold = (t) => paint('1', t);
const dim = (t) => paint('2', t);
const green = (t) => paint('32', t);
const yellow = (t) => paint('33', t);
const red = (t) => paint('31', t);

// ---------------------------------------------------------------------------
// Comparaison de versions sémantiques : renvoie true si `actual` >= `required`.
// Réimplémentée ici plutôt qu'importée, pour rester sans dépendance.
// ---------------------------------------------------------------------------
function satisfiesMinimum(actual, required) {
  const parse = (v) => {
    const match = /(\d+)\.(\d+)\.(\d+)/.exec(v);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
  };

  const a = parse(actual);
  const r = parse(required);
  if (!a || !r) return false;

  for (let i = 0; i < 3; i += 1) {
    if (a[i] > r[i]) return true;
    if (a[i] < r[i]) return false;
  }
  return true; // strictement égal
}

// ---------------------------------------------------------------------------
// Exécute une commande et renvoie sa sortie, ou null si elle est absente.
// `execFileSync` (et non `execSync`) : pas d'interprétation par le shell,
// donc pas d'injection possible via une variable d'environnement.
// ---------------------------------------------------------------------------
function tryRun(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: process.platform === 'win32', // requis pour les .cmd sous Windows
    }).trim();
  } catch {
    return null;
  }
}

// --- Collecte des résultats ------------------------------------------------
const results = [];

/**
 * @param {string} name     Nom affiché de l'outil.
 * @param {string|null} raw Sortie brute de la commande de version.
 * @param {string} min      Version minimale requise.
 * @param {boolean} required `false` = absence tolérée (avertissement seulement).
 * @param {string} fix      Message d'aide affiché en cas de problème.
 */
function check(name, raw, min, required, fix) {
  if (raw === null) {
    results.push({ name, status: required ? 'error' : 'warn', found: 'absent', min, fix });
    return;
  }

  const version = /(\d+\.\d+\.\d+)/.exec(raw)?.[1] ?? raw;
  const ok = satisfiesMinimum(version, min);
  results.push({
    name,
    status: ok ? 'ok' : 'error',
    found: version,
    min,
    fix: ok ? '' : fix,
  });
}

// --- Les contrôles ---------------------------------------------------------

check(
  'Node.js',
  process.version,
  '22.12.0',
  true,
  'Installez fnm puis : fnm install 24 && fnm default 24',
);

check(
  'pnpm',
  tryRun('pnpm', ['--version']),
  '10.0.0',
  true,
  'corepack enable && corepack prepare pnpm@10.11.0 --activate',
);

check('Git', tryRun('git', ['--version']), '2.40.0', true, 'https://git-scm.com/downloads');

check(
  'Docker',
  tryRun('docker', ['--version']),
  '24.0.0',
  false, // non bloquant : nécessaire seulement à partir du module 14
  'Requis à partir du module 14 — https://docs.docker.com/get-docker/',
);

// Les dépendances sont-elles installées ?
results.push(
  existsSync(join(ROOT, 'node_modules'))
    ? { name: 'Dépendances', status: 'ok', found: 'installées', min: '—', fix: '' }
    : {
        name: 'Dépendances',
        status: 'error',
        found: 'absentes',
        min: '—',
        fix: 'Lancez : pnpm install',
      },
);

// La version de Node correspond-elle à celle épinglée par le dépôt ?
const nvmrcPath = join(ROOT, '.nvmrc');
if (existsSync(nvmrcPath)) {
  const pinned = readFileSync(nvmrcPath, 'utf8').trim();
  const current = process.version.replace(/^v/, '');
  const sameMajor = pinned.split('.')[0] === current.split('.')[0];
  results.push({
    name: 'Version épinglée',
    status: sameMajor ? 'ok' : 'warn',
    found: `v${current}`,
    min: `v${pinned}`,
    fix: sameMajor ? '' : 'Alignez-vous sur .nvmrc avec : fnm use',
  });
}

// --- Restitution -----------------------------------------------------------
const SYMBOL = { ok: green('✅'), warn: yellow('⚠️ '), error: red('❌') };

console.log(`\n${bold('TypeScript Atlas')} — diagnostic de l'environnement\n`);

for (const r of results) {
  const label = r.name.padEnd(18);
  const found = String(r.found).padEnd(12);
  const requirement = r.min === '—' ? '' : dim(`(requis : >=${r.min})`);
  console.log(`  ${SYMBOL[r.status]}  ${label}${found}${requirement}`);
}

const errors = results.filter((r) => r.status === 'error');
const warnings = results.filter((r) => r.status === 'warn');

if (errors.length > 0 || warnings.length > 0) {
  console.log(`\n${bold('À corriger :')}`);
  for (const r of [...errors, ...warnings]) {
    if (r.fix)
      console.log(`  ${r.status === 'error' ? red('•') : yellow('•')} ${r.name} — ${r.fix}`);
  }
}

if (errors.length === 0) {
  console.log(`\n${green(bold('Environnement prêt. Bon travail !'))}\n`);
  process.exit(0);
}

console.log(
  `\n${red(bold(`${String(errors.length)} problème(s) bloquant(s).`))} ` +
    `Corrigez-les puis relancez ${bold('pnpm doctor')}.\n`,
);
process.exit(1);
