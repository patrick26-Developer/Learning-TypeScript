import tseslint from 'typescript-eslint';

import base from '@atlas/eslint-config/base';

export default tseslint.config(
  ...base,

  {
    // Ce paquet EST une bibliothèque compilée (`rootDir: "src"`, voir
    // tsconfig.json) : ses tests ne peuvent pas figurer dans le même
    // programme TypeScript que son code de production sans casser
    // `rootDir`. Contrairement à un module de cours (dont le tsconfig
    // couvre exercises/solutions/tests ensemble, sans jamais émettre de
    // JavaScript), les tests d'ici restent donc hors de tout tsconfig.json
    // de programme — d'où cette exception, volontairement locale à ce
    // paquet plutôt que globale (voir packages/eslint-config/base.mjs).
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // `tsconfigRootDir` n'est pas répété ici : omis, typescript-eslint
        // retombe sur son propre répertoire de travail courant par défaut,
        // identique à ce que fixe explicitement packages/eslint-config/base.mjs.
        // L'écrire ici obligerait à référencer `process`, un global Node
        // absent de l'environnement de lint de ce fichier `.mjs`.
        projectService: {
          allowDefaultProject: ['*.config.ts', '*.config.mts', '*.config.cts', 'tests/*.ts'],
        },
      },
    },
  },
);
