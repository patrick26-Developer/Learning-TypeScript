#!/usr/bin/env node
// ---------------------------------------------------------------------------
// `pnpm audit:log` — rappelle où vivent les journaux d'audit du dépôt et
// affiche un résumé rapide de leur état, sans dépendance externe.
//
// Ce script ne modifie rien : il oriente. Le contenu réel des décisions
// vit dans le Markdown du site (source unique de vérité, versionnée avec
// le reste du contenu pédagogique).
// ---------------------------------------------------------------------------

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_LOG = join(ROOT, 'apps/site/docs/99-coulisses/01-journal-audit.md');

const useColor = process.stdout.isTTY && !process.env['NO_COLOR'];
const ESC = '';
const paint = (code, text) => (useColor ? `${ESC}[${code}m${text}${ESC}[0m` : text);
const bold = (t) => paint('1', t);
const dim = (t) => paint('2', t);
const yellow = (t) => paint('33', t);

if (!existsSync(AUDIT_LOG)) {
  console.error(`Journal d'audit introuvable : ${AUDIT_LOG}`);
  process.exit(1);
}

const content = readFileSync(AUDIT_LOG, 'utf8');

const decisions = [...content.matchAll(/^## (AUD-\d+ — .+)$/gm)].map((m) => m[1]);
const provisional = [...content.matchAll(/^## (AUD-\d+ — .+)\n\n\*\*.*?Statut : `Provisoire`/gms)];
const debtRows = [...content.matchAll(/^\| (DT-\d+) \| (.+?) \|/gm)];

console.log(`\n${bold("Journal d'audit — TypeScript Atlas")}\n`);
console.log(dim(AUDIT_LOG.replace(ROOT, '.')));
console.log(`\n${bold(`${String(decisions.length)} décision(s) consignée(s)`)} :`);
for (const d of decisions) console.log(`  • ${d}`);

if (debtRows.length > 0) {
  console.log(
    `\n${yellow(bold(`${String(debtRows.length)} élément(s) de dette technique ouverts`))} :`,
  );
  for (const [, ref, subject] of debtRows) console.log(`  ${yellow('•')} ${ref} — ${subject}`);
}

console.log(`\n${dim('Pour ajouter une décision, éditez directement le fichier ci-dessus.')}\n`);
