// ---------------------------------------------------------------------------
// Prettier — mise en forme automatique du code.
//
// Principe pédagogique : le formatage n'est JAMAIS un sujet de débat en revue
// de code. Une machine le tranche, l'équipe discute du fond. Toute règle
// ci-dessous est un choix arbitraire assumé, pas une vérité.
// ---------------------------------------------------------------------------

/** @type {import("prettier").Config} */
const config = {
  // Longueur de ligne visée. 100 : assez large pour des types génériques
  // lisibles, assez court pour deux fichiers côte à côte sur un écran 16:9.
  printWidth: 100,

  // Indentation de 2 espaces (convention dominante de l'écosystème JS/TS).
  tabWidth: 2,
  useTabs: false,

  // Point-virgule explicite : supprime toute ambiguïté liée à l'insertion
  // automatique de point-virgule (ASI) de JavaScript.
  semi: true,

  // Guillemets simples en JS/TS, doubles en JSX (convention React).
  singleQuote: true,
  jsxSingleQuote: false,

  // Virgule finale partout : les diffs Git ne montrent que la ligne ajoutée,
  // pas la ligne précédente modifiée pour y ajouter une virgule.
  trailingComma: 'all',

  // Espaces à l'intérieur des accolades : { a: 1 } plutôt que {a: 1}.
  bracketSpacing: true,

  // Le `>` d'une balise JSX multi-ligne va à la ligne : la fin des props
  // reste visuellement distincte du début des enfants.
  bracketSameLine: false,

  // Toujours des parenthèses autour du paramètre d'une flèche : `(x) => x`.
  // Ajouter un type ou un second paramètre ne change alors pas la ligne.
  arrowParens: 'always',

  // Fins de ligne Unix, y compris sur Windows : le dépôt reste identique
  // pour tout le monde et Git n'affiche pas de faux diffs.
  endOfLine: 'lf',

  overrides: [
    {
      // En Markdown, on ne reformate pas les retours à la ligne : ils portent
      // du sens dans les listes, les tableaux et les blocs de code.
      files: ['*.md', '*.mdx'],
      options: { proseWrap: 'preserve', printWidth: 80 },
    },
    {
      // Le JSON n'accepte pas les virgules finales.
      files: ['*.json', '*.jsonc', '.*rc'],
      options: { trailingComma: 'none', parser: 'json' },
    },
  ],
};

export default config;
