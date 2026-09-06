// ---------------------------------------------------------------------------
// Configuration ESLint pour les paquets exécutés côté serveur (API, CLI).
// Étend la base commune avec les globaux et les contraintes propres à Node.
// ---------------------------------------------------------------------------

import globals from 'globals';
import tseslint from 'typescript-eslint';

import base from './base.mjs';

export default tseslint.config(
  ...base,

  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: {
      globals: {
        // Déclare process, Buffer, setTimeout… comme identifiants connus.
        ...globals.node,
      },
    },
    rules: {
      // `console.log` est un outil de débogage, pas un outil de production.
      // Un serveur écrit des journaux structurés (pino), pas du texte libre :
      // c'est ce qui permet de filtrer, corréler et alerter.
      // `warn` et `error` restent tolérés pour le démarrage et les incidents.
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Interdit `require()` : ce dépôt est 100 % ESM.
      '@typescript-eslint/no-require-imports': 'error',
    },
  },

  {
    // Dans les tests, `console.log` est légitime pour diagnostiquer un échec.
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
);
