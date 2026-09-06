// ---------------------------------------------------------------------------
// Point d'entrée ESLint à la racine du monorepo.
//
// ESLint 9+ remonte l'arborescence jusqu'au premier `eslint.config.mjs`.
// Ce fichier sert donc de filet de sécurité pour tout code qui ne vivrait
// pas déjà dans un paquet doté de sa propre configuration.
// ---------------------------------------------------------------------------

import base from '@atlas/eslint-config/base';

export default [
  ...base,
  {
    // Les scripts de maintenance du dépôt sont du JavaScript Node pur.
    files: ['scripts/**/*.mjs'],
    rules: {
      // Ces scripts s'adressent à un humain dans un terminal :
      // écrire sur la sortie standard est leur raison d'être.
      'no-console': 'off',
    },
  },
];
