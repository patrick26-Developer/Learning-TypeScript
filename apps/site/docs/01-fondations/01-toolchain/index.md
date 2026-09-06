---
id: toolchain
title: 'Module 01 — Toolchain, tsconfig, exécution, débogage'
sidebar_label: 'M01 · Toolchain'
sidebar_position: 2
description: Ce que tsc fait vraiment, comment exécuter du TypeScript en 2026 (tsc, tsx, node --experimental-strip-types), anatomie complète d'un tsconfig.json, et une méthode pour lire n'importe quelle erreur du compilateur.
keywords:
  [typescript, tsconfig, tsc, tsx, node, esm, commonjs, débogage, source map]
---

# Module 01 — Toolchain, `tsconfig`, exécution, débogage

|               |                                                                                    |
| ------------- | ---------------------------------------------------------------------------------- |
| **Durée**     | ≈ 6 heures                                                                         |
| **Prérequis** | [Module 00 — Origines](../00-origines/index.md)                                    |
| **Livrable**  | Configurer, exécuter et déboguer un fichier TypeScript sans dépendre d'un tutoriel |

:::tip Pourquoi ce module avant la syntaxe
Le module 00 vous a appris que les types **disparaissent** à la compilation.
Ce module vous montre **où ils disparaissent**, **qui les fait disparaître**,
et **comment observer chaque étape**. Sans cette carte mentale, chaque nouvel
outil (Vite, Vitest, Next.js…) rencontré dans ce parcours restera une boîte
noire. Avec elle, vous saurez toujours répondre à la question : _qu'est-ce
qui exécute réellement mon code, là, maintenant ?_
:::

---

## 1. Ce que `tsc` fait vraiment

`tsc` (le compilateur TypeScript) accomplit **deux métiers indépendants**,
qu'il est facile de confondre :

```text
                    ┌─────────────────┐
   fichier .ts ───▶ │  1. VÉRIFIER     │ ───▶ erreurs affichées dans le terminal
                    │  (type checking) │      (rien n'est encore émis)
                    └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  2. ÉMETTRE      │ ───▶ fichier .js
                    │  (transpilation) │      (les types ont disparu)
                    └─────────────────┘
```

**Le point crucial : ces deux métiers sont indépendants l'un de l'autre.**

- `tsc --noEmit` fait **seulement** le métier n° 1 : vérifier. Aucun fichier
  produit. C'est ce que ce dépôt utilise pour `pnpm typecheck` — on veut
  savoir si le code est correct, pas produire un artefact.
- `tsc` seul (avec un `tsconfig.json` qui ne désactive pas l'émission) fait
  **les deux** : si la vérification échoue, `tsc` **émet quand même** le
  JavaScript par défaut (!), sauf si `noEmitOnError: true` est activé.

:::danger Le piège du duo "ça compile" / "ça marche"
« `tsc` n'a rien dit » ne signifie **pas** « mon programme est correct » —
cela signifie seulement « aucune incohérence de type n'a été détectée ».
Un programme peut être parfaitement typé et bourré de bugs logiques. À
l'inverse, sans `noEmitOnError`, un programme qui NE COMPILE PAS peut quand
même produire un fichier `.js` exécutable, bourré d'erreurs silencieuses.
Ce dépôt active `noEmitOnError` implicitement via `noEmit: true` dans les
paquets de cours (rien à émettre, donc rien à émettre _incorrectement_) et
explicitement dans les bibliothèques.
:::

### Pourquoi certains outils n'utilisent jamais `tsc` pour émettre

Vite, esbuild, SWC et Babel savent transformer du `.ts` en `.js`, mais
**aucun ne vérifie les types**. Ils font uniquement de l'_effacement de
types_ (le mot-clé `type`, les annotations `: number`, les génériques —
tout est simplement supprimé du texte, sans analyse). C'est pour cela qu'un
projet Vite typique exécute **deux processus séparés** :

| Processus              | Rôle                                    | Outil typique            |
| ---------------------- | --------------------------------------- | ------------------------ |
| Vérification des types | Lente, complète, capture les erreurs    | `tsc --noEmit`           |
| Transformation en JS   | Très rapide, ignore les erreurs de type | esbuild / SWC (via Vite) |

C'est exactement l'architecture de `pnpm verify` dans ce dépôt :
`lint` et `typecheck` vérifient, les bundlers des projets finaux (module 19+)
transforment séparément, en parallèle, sans jamais se marcher dessus.

---

## 2. Exécuter du TypeScript en 2026 : trois façons, un seul choix pour ce dépôt

### Option A — `tsc` puis `node` (deux étapes, le fondamental)

```bash
npx tsc fichier.ts        # produit fichier.js
node fichier.js           # exécute le JavaScript pur
```

C'est ce qui se passe **conceptuellement** partout ailleurs. Comprendre ce
duo est la base ; en pratique, personne ne tape ces deux commandes à la main
à chaque modification.

### Option B — `tsx` (l'outil de développement de ce dépôt)

```bash
npx tsx fichier.ts
```

`tsx` combine transformation (via esbuild) et exécution en une seule
commande, avec rechargement automatique en mode `--watch`. **C'est l'outil
utilisé dans tout ce dépôt** pour lancer un script TypeScript directement
(voir `scripts/` et les futurs mini-projets).

:::info Vérifié pendant la rédaction de ce module

```bash
$ cat enum-test.ts
enum Color { Red, Green, Blue }
console.log(Color.Red);

$ npx tsx enum-test.ts
0
```

`tsx` gère les `enum` sans problème : esbuild les **transpile** réellement
(il génère l'objet JavaScript équivalent), il ne se contente pas de les
effacer. Retenez cette distinction — elle explique le comportement de
l'option C, juste en dessous.
:::

### Option C — `node` directement, sans aucun outil (nouveau, et à connaître)

Depuis Node.js 22.6 (stable et **sans drapeau** depuis Node 23.6), Node sait
exécuter du `.ts` **nativement** :

```bash
node fichier.ts
```

Mais Node ne fait ici **ni transpilation, ni vérification** : il fait de
l'**effacement de types pur** (_type stripping_) — il retire les annotations
au niveau du texte, sans les comprendre. C'est extrêmement rapide, et cela a
deux conséquences vérifiables :

:::info Vérifié pendant la rédaction de ce module — conséquence n° 1

```ts title="bad.ts"
const x: number = 'this is a string, not a number';
console.log(x);
```

```bash
$ node bad.ts
this is a string, not a number
```

**Aucune erreur.** Node ne vérifie rien : il a juste supprimé `: number` du
texte et exécuté ce qui restait. C'est la démonstration la plus directe de
la Décision 2 du module 00 (l'effacement de types) que vous rencontrerez.
:::

:::info Vérifié pendant la rédaction de ce module — conséquence n° 2

```bash
$ node enum-test.ts
node:internal/modules/typescript:68
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not
supported in strip-only mode
```

Un `enum` **génère du code JavaScript réel** à l'exécution (module 00, §2.5) :
ce n'est pas une simple annotation qu'on peut retirer, c'est de la syntaxe
qui a besoin d'être **transformée**. Le mode _strip-only_ de Node ne
transforme rien — il échoue donc franchement, plutôt que de produire un
résultat silencieusement faux. C'est un comportement plus sûr que celui de
l'option A mal configurée, et une raison de plus d'éviter `enum` (le module
03 y revient).
:::

### Le choix de ce dépôt, et pourquoi

| Situation                                 | Commande                          | Pourquoi                                               |
| ----------------------------------------- | --------------------------------- | ------------------------------------------------------ |
| Lancer un script pendant le développement | `tsx script.ts`                   | Rapide, gère tout le langage (enums compris)           |
| Vérifier que le code est correct          | `tsc --noEmit` (`pnpm typecheck`) | C'est le SEUL outil qui vérifie réellement             |
| Exécuter les tests                        | `vitest`                          | Utilise esbuild en interne, comme `tsx`                |
| Explorer un fichier isolé, vite fait      | `node fichier.ts`                 | Zéro dépendance — mais gardez ses deux limites en tête |

**Aucune de ces commandes ne remplace les autres.** `tsx` et `node` exécutent
vite mais ne vérifient rien ; `tsc --noEmit` vérifie tout mais n'exécute
rien. Utiliser l'un sans l'autre, c'est accepter soit la lenteur, soit
l'aveuglement.

---

## 3. Anatomie complète d'un `tsconfig.json`

Un fichier `tsconfig.json` a trois rôles distincts, souvent mélangés dans un
seul document — apprenons à les séparer.

```json
{
  "extends": "...",           // ① Héritage
  "compilerOptions": { ... }, // ② Comportement du compilateur
  "include": [...],           // ③ Quels fichiers appartiennent au programme
  "exclude": [...],
  "references": [...]         // Monorepos avec project references (module 20)
}
```

### ① `extends` — hériter d'une configuration partagée

```json
{ "extends": "@atlas/tsconfig/node.json" }
```

:::warning Une règle contre-intuitive, apprise à la dure sur ce dépôt
**Tout chemin relatif** déclaré dans un fichier `tsconfig.json` — `include`,
`exclude`, `rootDir`, `outDir`… — est résolu par rapport à l'emplacement du
fichier qui le **déclare**, jamais par rapport à celui qui fait `extends`.

Un fichier de base partagé (comme `@atlas/tsconfig/node.json` dans ce dépôt)
ne doit donc **jamais** contenir de chemin relatif : seulement des drapeaux
de rigueur (`strict`, `target`…). Chaque projet qui l'étend déclare
lui-même ses propres `include`/`rootDir`/`outDir`. C'est un vrai incident
rencontré et corrigé pendant la construction de ce dépôt — voir
[AUD-010 du journal d'audit](../../99-coulisses/01-journal-audit.md) pour le
détail complet, avec le message d'erreur exact et la démonstration.
:::

### ② `compilerOptions` — les familles d'options qui comptent

| Famille              | Rôle                                              | Exemple                                |
| -------------------- | ------------------------------------------------- | -------------------------------------- |
| **Cible & modules**  | Quel JavaScript produire, quel système de modules | `target`, `module`, `moduleResolution` |
| **Rigueur**          | Quelles erreurs le compilateur doit-il refuser    | `strict`, `noUncheckedIndexedAccess`   |
| **Émission**         | Que produire, et où                               | `outDir`, `declaration`, `sourceMap`   |
| **Interopérabilité** | Compatibilité avec du code non-TS                 | `esModuleInterop`, `skipLibCheck`      |

Ce dépôt documente **chaque option activée**, avec le bug précis qu'elle
prévient, directement dans
[`packages/tsconfig/base.json`](https://github.com/typescript-atlas/typescript-atlas/blob/main/packages/tsconfig/base.json).
Allez le lire : un fichier de configuration commenté ligne par ligne est
lui-même un document pédagogique.

### ③ `include` / `exclude` — quels fichiers font partie du programme

Un fichier `.ts` non couvert par `include` (et non importé par un fichier qui
l'est) **n'existe pas** pour TypeScript, même s'il est syntaxiquement
valide. C'est une source fréquente de confusion : « pourquoi mon erreur
n'apparaît pas ? » a souvent pour réponse « ce fichier n'est dans aucun
programme ».

---

## 4. ESM contre CommonJS : la confusion n° 1 de l'écosystème Node

Deux systèmes de modules coexistent dans l'écosystème JavaScript/Node, et
TypeScript doit savoir lequel vous ciblez.

|                          | CommonJS (historique)         | ESM (standard moderne)   |
| ------------------------ | ----------------------------- | ------------------------ |
| Import                   | `const x = require('./a')`    | `import x from './a.js'` |
| Export                   | `module.exports = x`          | `export default x`       |
| Extension dans l'import  | Optionnelle                   | **Obligatoire**          |
| `package.json`           | rien, ou `"type": "commonjs"` | `"type": "module"`       |
| `tsconfig` correspondant | `"module": "commonjs"`        | `"module": "nodenext"`   |

Ce dépôt est **100 % ESM** (`"type": "module"` partout, `"module": "nodenext"`
dans `tsconfig.base.json`). La conséquence la plus visible, et la plus
déroutante pour un débutant :

```ts
// ❌ Erreur avec "moduleResolution": "nodenext" :
import { describeValue } from '../exercises/01-inference-et-narrowing';

// ✅ Correct : l'extension est obligatoire, même pour un fichier .ts,
//    et elle se termine en .js (l'extension du fichier COMPILÉ, pas source)
import { describeValue } from '../exercises/01-inference-et-narrowing.js';
```

:::info Vécu en construisant ce dépôt
Ce n'est pas un exemple inventé : le tout premier fichier de test de ce
parcours a buté exactement sur cette erreur
(`TS2835: Relative import paths need explicit file extensions`). La
correction a été d'ajouter `.js` à l'import — pas de renommer le fichier
source, qui reste bien un `.ts`.
:::

**Pourquoi `.js` et pas `.ts` ?** Parce que l'import décrit le fichier tel
qu'il existera **à l'exécution**, après compilation — exactement la
Décision 2 du module 00 appliquée aux chemins d'import.

---

## 5. Lire un message d'erreur de `tsc` sans paniquer : méthode en 4 étapes

Un message d'erreur TypeScript est verbeux. Voici comment le décomposer,
sur un exemple réel, obtenu avec `tsc --noEmit --strict` sur ce fichier :

```ts title="bad.ts"
const x: number = 'this is a string, not a number';
console.log(x);
```

```text
bad.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.
```

### Étape 1 — Repérer le fichier et la position

`bad.ts(1,7)` : ligne 1, colonne 7. C'est là que **la vérification a
échoué**, pas nécessairement là où est la « faute » — parfois l'erreur
réelle est plus haut dans le fichier (une déclaration de type incorrecte,
par exemple).

### Étape 2 — Lire le code d'erreur

`TS2322` est stable et cherchable. Une recherche « TS2322 » sur le site
TypeScript ou dans un moteur de recherche renvoie toujours la même famille
de problème : incompatibilité d'assignation. Mémoriser quelques codes
fréquents accélère énormément le diagnostic :

| Code                 | Signification résumée                        |
| -------------------- | -------------------------------------------- |
| `TS2322`             | Type non assignable (l'exemple ci-dessus)    |
| `TS2339`             | Propriété inexistante sur ce type            |
| `TS2345`             | Argument non assignable au paramètre attendu |
| `TS2531` / `TS18048` | Valeur possiblement `null`/`undefined`       |
| `TS7053`             | Accès à un objet via un index non typé       |

### Étape 3 — Lire la phrase, littéralement

`Type 'string' is not assignable to type 'number'` décrit **exactement** le
problème : vous essayez de mettre une valeur de type `string` là où le
programme a promis un `number`. TypeScript ne devine jamais une intention :
il rapporte un fait.

### Étape 4 — Remonter à la source de la promesse

Ici, la « promesse » est l'annotation `: number` explicite. Dans un cas
réel plus complexe, cette promesse peut venir de l'**inférence** (module 02)
ou d'un type importé d'ailleurs. Se demander « d'où vient exactement ce
type attendu ? » est la question qui débloque 90 % des erreurs qui
semblent, à première vue, incompréhensibles.

---

## 6. Déboguer du TypeScript pas à pas

### Cartes de correspondance (_source maps_)

Sans elles, déboguer du JavaScript compilé revient à déboguer un fichier
que vous n'avez jamais écrit. Avec `"sourceMap": true` (activé dans ce
dépôt), le débogueur affiche directement votre fichier `.ts` d'origine,
avec les bons numéros de ligne — alors qu'à l'exécution, c'est bien le
`.js` généré qui tourne.

### Déboguer dans VS Code

Créez `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Déboguer avec tsx",
      "runtimeExecutable": "tsx",
      "program": "${file}",
      "console": "integratedTerminal"
    }
  ]
}
```

Posez un point d'arrêt (clic dans la marge, à gauche du numéro de ligne),
lancez cette configuration (`F5`), et l'exécution s'arrête exactement là —
sur le fichier `.ts`, pas sur un `.js` généré illisible.

### Déboguer en ligne de commande

```bash
node --inspect-brk fichier.js
```

Puis ouvrez `chrome://inspect` dans Chrome, ou utilisez directement
l'inspecteur intégré de VS Code. Fonctionne aussi avec `tsx` :
`tsx --inspect-brk fichier.ts`.

---

## 7. Ce que vous devez retenir

1. **`tsc` vérifie et émet — deux métiers indépendants.** `--noEmit` ne fait
   que le premier ; sans `noEmitOnError`, un fichier peut être émis même
   après une erreur de vérification.
2. **Aucun bundler ne vérifie les types.** Vite/esbuild/SWC transforment
   vite, sans jamais lire vos annotations comme un contrat à vérifier.
3. **`node fichier.ts` exécute sans vérifier ET sans transpiler** — un
   `enum` y échoue franchement, une erreur de type y passe silencieusement.
   `tsx`, lui, transpile réellement (via esbuild).
4. **Un chemin relatif dans un `tsconfig` partagé se résout par rapport à
   ce fichier, jamais par rapport à celui qui l'étend.** Une config
   partagée ne doit donc jamais contenir de chemin.
5. **En ESM avec `nodenext`, l'extension `.js` est obligatoire dans les
   imports relatifs — même depuis un fichier `.ts`.**
6. **Un message d'erreur TypeScript se lit en 4 temps** : position → code →
   phrase littérale → origine de la promesse de type.

---

## 8. Auto-évaluation

1. Pourquoi `node bad.ts` (§2, option C) ne signale-t-il aucune erreur alors
   que `tsc --noEmit --strict bad.ts` en signale une ? _(§2, §1)_
2. Pourquoi `node enum-test.ts` échoue-t-il alors que `node bad.ts`
   « réussit » (sans détecter son erreur) ? Qu'est-ce que cela révèle sur
   la différence entre effacement de types et transpilation ? _(§2)_
3. Un fichier `packages/tsconfig/node.json` partagé déclare
   `"include": ["src/**/*.ts"]`. Un paquet `courses/05-x/tsconfig.json` fait
   `{ "extends": "@atlas/tsconfig/node.json" }` sans redéclarer `include`.
   Où TypeScript va-t-il chercher les fichiers `src/**/*.ts` ? _(§3, encadré)_
4. Pourquoi `import { x } from './a'` échoue-t-il dans ce dépôt, alors que
   `import { x } from './a.js'` fonctionne, alors même que le fichier
   source s'appelle `a.ts` ? _(§4)_
5. Vous obtenez `TS2339: Property 'name' does not exist on type '{}'`.
   Sans regarder le code, que pouvez-vous déjà déduire du **code** et de la
   **phrase** ? _(§5)_

---

## Étape suivante

👉 [Module 02 — Le système de types : primitifs, inférence, narrowing](../02-systeme-de-types/index.md)

Vous savez maintenant configurer et exécuter TypeScript. Il est temps
d'écrire vos premiers types — et de comprendre ce que le compilateur devine
tout seul.
