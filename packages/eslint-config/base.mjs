// ---------------------------------------------------------------------------
// Configuration ESLint de base — « flat config » (ESLint 9/10).
//
// POURQUOI DEUX OUTILS (tsc + ESLint) ?
//   • tsc répond à : « ce programme est-il cohérent du point de vue des types ? »
//   • ESLint répond à : « ce programme est-il PRUDENT ? »
// Exemple : `await` sur une valeur qui n'est pas une promesse compile très
// bien, mais c'est presque toujours un bug. Seul ESLint le voit.
//
// Le mode « type-aware » (projectService) donne à ESLint accès au vérificateur
// de types de TypeScript. C'est plus lent, mais c'est le seul moyen d'attraper
// les promesses non attendues, les `any` qui se propagent, les comparaisons
// toujours vraies, etc. C'est non négociable dans ce dépôt.
// ---------------------------------------------------------------------------

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // -------------------------------------------------------------------------
  // 0. Fichiers et dossiers ignorés par ESLint.
  //    Doit venir en premier et être seul dans son objet pour être global.
  // -------------------------------------------------------------------------
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/.docusaurus/**',
      '**/*.tsbuildinfo',
    ],
  },

  // -------------------------------------------------------------------------
  // 1. Règles JavaScript de base recommandées par ESLint lui-même.
  // -------------------------------------------------------------------------
  js.configs.recommended,

  // -------------------------------------------------------------------------
  // 2. Règles TypeScript exigeant le vérificateur de types.
  //    `strictTypeChecked`  : correction (attrape de vrais bugs).
  //    `stylisticTypeChecked` : cohérence d'écriture (lisibilité).
  // -------------------------------------------------------------------------
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // -------------------------------------------------------------------------
  // 3. Branchement d'ESLint sur le projet TypeScript.
  // -------------------------------------------------------------------------
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        // `projectService` laisse typescript-eslint découvrir tout seul le
        // tsconfig.json qui gouverne chaque fichier. Remplace l'ancien
        // `project: [...]`, pénible à maintenir dans un monorepo.
        projectService: {
          // Les fichiers de configuration d'outillage (vitest.config.ts…)
          // ne sont volontairement listés dans AUCUN tsconfig.json de
          // programme applicatif : ce ne sont pas des sources livrées.
          // Sans cette liste, typescript-eslint refuse de les analyser
          // ("was not found by the project service"). On leur attribue un
          // projet TypeScript par défaut, isolé, plutôt que de les exclure
          // du lint.
          allowDefaultProject: ['*.config.ts', '*.config.mts', '*.config.cts'],
        },
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      // ---------------------------------------------------------------------
      // SÉCURITÉ D'EXÉCUTION — la famille de règles la plus rentable.
      // ---------------------------------------------------------------------

      // Une promesse dont on ignore le résultat = une erreur qui disparaît
      // en silence. C'est la première cause de bugs asynchrones en Node.
      // Pour ignorer volontairement : `void maPromesse();`
      '@typescript-eslint/no-floating-promises': 'error',

      // Passer une fonction asynchrone là où une fonction synchrone est
      // attendue (ex. : un gestionnaire d'événement) : le rejet ne sera
      // jamais capturé.
      '@typescript-eslint/no-misused-promises': 'error',

      // Interdit `any` explicite. Le type d'une valeur inconnue est
      // `unknown` : il force à vérifier avant d'utiliser.
      '@typescript-eslint/no-explicit-any': 'error',

      // Interdit le `!` d'assertion non-nulle : il désactive silencieusement
      // strictNullChecks à l'endroit précis où le bug va se produire.
      '@typescript-eslint/no-non-null-assertion': 'error',

      // ---------------------------------------------------------------------
      // FRONTIÈRES ET IMPORTS
      // ---------------------------------------------------------------------

      // Force `import type { X } from '...'` quand seul le type est utilisé,
      // en cohérence avec `verbatimModuleSyntax` du tsconfig.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // ---------------------------------------------------------------------
      // LISIBILITÉ
      // ---------------------------------------------------------------------

      // Autorise les identifiants non utilisés s'ils commencent par `_` :
      // c'est la convention pour dire « je sais, c'est volontaire ».
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Un `switch` sur une union doit traiter tous les membres.
      // Complète `noFallthroughCasesInSwitch` côté compilateur.
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },

  // -------------------------------------------------------------------------
  // 4. Fichiers de configuration : JavaScript pur, hors du projet TypeScript.
  //    On y désactive les règles type-aware qui n'ont rien à analyser.
  // -------------------------------------------------------------------------
  {
    files: ['**/*.mjs', '**/*.cjs', '**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },

  // -------------------------------------------------------------------------
  // 4bis. Énoncés d'exercice de cours — même exception qu'au niveau du
  //    compilateur (voir packages/tsconfig/exercises.json et AUD-003).
  //    Un squelette à compléter contient légitimement des paramètres non
  //    encore utilisés :
  //
  //      export function sum(a: number, b: number): number {
  //        throw new Error('Not implemented');
  //      }
  //
  //    Sans cette exception, l'énoncé serait en erreur de lint AVANT même
  //    que l'apprenant ait commencé à travailler.
  // -------------------------------------------------------------------------
  {
    // Deux formes du motif : ESLint résout "files" relativement au dossier
    // depuis lequel il est invoqué. Chaque module de cours est linté avec
    // son propre dossier comme racine (`pnpm --filter @atlas/course-NN
    // lint`) — d'où 'exercises/**'. La forme '**/exercises/**' couvre en
    // plus un lint lancé depuis la racine du monorepo.
    files: ['exercises/**/*.ts', '**/exercises/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // -------------------------------------------------------------------------
  // 5. TOUJOURS EN DERNIER : désactive toutes les règles ESLint qui
  //    concernent la mise en forme, puisque Prettier s'en charge.
  //    Placé en fin de tableau pour écraser tout ce qui précède.
  // -------------------------------------------------------------------------
  prettier,
);
