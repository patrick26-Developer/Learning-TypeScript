import { themes as prismThemes } from 'prism-react-renderer';

import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// ---------------------------------------------------------------------------
// Ces deux constantes pilotent toutes les URL générées (liens « Modifier
// cette page », plan du site, lien GitHub de la barre de navigation, etc.).
// ---------------------------------------------------------------------------
const GITHUB_ORG = 'patrick26-Developer';
const GITHUB_REPO = 'Learning-TypeScript';
const REPO_URL = `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}`;

const config: Config = {
  // -------------------------------------------------------------------------
  // Identité du site
  // -------------------------------------------------------------------------
  title: 'TypeScript Atlas',
  tagline: 'De A à Z : du premier `let` à l’architecture d’API de production',
  favicon: 'img/favicon.svg',

  // -------------------------------------------------------------------------
  // Déploiement — GitHub Pages, sous forme de « project page ».
  //
  // Un compte personnel (pas une organisation) héberge une page UTILISATEUR
  // à la racine (https://<user>.github.io) UNIQUEMENT si le dépôt s'appelle
  // exactement `<user>.github.io`. Ce n'est pas notre cas ici : ce dépôt
  // s'appelle `Learning-TypeScript`, donc GitHub Pages le sert comme une
  // « project page », sous un sous-chemin — d'où le `baseUrl` non trivial.
  // -------------------------------------------------------------------------
  url: 'https://patrick26-developer.github.io',
  baseUrl: `/${GITHUB_REPO}/`,
  organizationName: GITHUB_ORG,
  projectName: GITHUB_REPO,
  trailingSlash: false,

  // Un lien mort FAIT ÉCHOUER la compilation. C'est volontaire et sévère :
  // dans une formation, un lien cassé fait perdre un apprenant. On préfère
  // casser le build chez nous que l'expérience chez lui.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',

  // -------------------------------------------------------------------------
  // Internationalisation — le cœur du caractère bilingue du site
  // -------------------------------------------------------------------------
  i18n: {
    // Le français est la langue SOURCE : le contenu de `docs/` est en français.
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    localeConfigs: {
      fr: {
        label: 'Français',
        direction: 'ltr',
        htmlLang: 'fr-FR',
        calendar: 'gregory',
        path: 'fr',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
        calendar: 'gregory',
        path: 'en',
      },
    },
  },

  // -------------------------------------------------------------------------
  // Rendu Markdown / MDX
  // -------------------------------------------------------------------------
  markdown: {
    // Autorise les fichiers `.md` ET `.mdx`, chacun avec le bon analyseur.
    // Un `.md` reste du Markdown pur : les accolades et chevrons du code
    // n'y sont pas interprétés comme du JSX. C'est ce qui permet d'écrire
    // sereinement `Array<T>` ou `{ a: 1 }` dans une leçon.
    format: 'detect',
    mermaid: true,
    hooks: {
      // Remplace l'option de premier niveau dépréciée `onBrokenMarkdownLinks`.
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  // ---------------------------------------------------------------------
  // Typographie — Inter, la police d'interface. `preconnect` avant le CSS
  // lui-même : le navigateur ouvre la connexion à fonts.gstatic.com pendant
  // qu'il télécharge encore la feuille de style, au lieu d'attendre.
  // ---------------------------------------------------------------------
  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
  ],
  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
      type: 'text/css',
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/', // La documentation EST le site : pas de préfixe /docs.
          sidebarPath: './sidebars.ts',
          editUrl: `${REPO_URL}/tree/main/apps/site/`,
          // Affiche « Dernière mise à jour » : un apprenant doit savoir si
          // ce qu'il lit est récent. Exige au moins un commit Git dans
          // l'historique du fichier — c'est le cas depuis AUD-011.
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
          breadcrumbs: true,
        },
        blog: {
          path: 'blog',
          routeBasePath: 'journal',
          showReadingTime: true,
          blogTitle: 'Journal de la formation',
          blogDescription: 'Notes de version, décisions techniques et évolutions du programme.',
          editUrl: `${REPO_URL}/tree/main/apps/site/`,
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
          feedOptions: {
            type: 'all',
            title: 'TypeScript Atlas — Journal',
            copyright: `© ${String(new Date().getFullYear())} TypeScript Atlas`,
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',

    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },

    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },

    announcementBar: {
      id: 'atlas-wip-2026',
      content:
        'Formation en construction ouverte — le programme complet est publié, les modules arrivent progressivement.',
      backgroundColor: '#1e293b',
      textColor: '#e2e8f0',
      isCloseable: true,
    },

    navbar: {
      title: 'TypeScript Atlas',
      hideOnScroll: false,
      logo: {
        alt: 'TypeScript Atlas',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'cours',
          position: 'left',
          label: 'Formation',
        },
        {
          to: '/plan-de-formation',
          position: 'left',
          label: 'Programme',
        },
        {
          to: '/orientation-parcours',
          position: 'left',
          label: 'Par où commencer ?',
        },
        {
          to: '/journal',
          position: 'left',
          label: 'Journal',
        },
        {
          // Sélecteur de langue FR / EN.
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: REPO_URL,
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'Dépôt GitHub',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Apprendre',
          items: [
            { label: 'Plan de formation', to: '/plan-de-formation' },
            { label: 'Guide d’utilisation', to: '/guide-utilisation' },
            { label: 'Méthode d’apprentissage', to: '/methode-apprentissage' },
            { label: 'Orientation', to: '/orientation-parcours' },
          ],
        },
        {
          title: 'Ressources',
          items: [
            { label: 'Installation', to: '/installation' },
            { label: 'Consignes', to: '/consignes' },
            { label: 'FAQ', to: '/faq' },
          ],
        },
        {
          title: 'Coulisses',
          items: [
            { label: 'Journal d’audit', to: '/coulisses/journal-audit' },
            { label: 'Dépôt GitHub', href: REPO_URL },
          ],
        },
      ],
      copyright: `© ${String(new Date().getFullYear())} TypeScript Atlas — Contenu sous licence CC BY-SA 4.0, code sous licence MIT.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      // Langages supplémentaires à colorer. TypeScript, JS, JSON et Markdown
      // sont inclus d'office ; les autres doivent être demandés.
      additionalLanguages: ['bash', 'diff', 'json5', 'sql', 'docker', 'yaml'],
      magicComments: [
        {
          className: 'theme-code-block-highlighted-line',
          line: 'surligner-ligne-suivante',
          block: { start: 'surligner-debut', end: 'surligner-fin' },
        },
        {
          className: 'code-block-error-line',
          line: 'erreur-ligne-suivante',
        },
        {
          className: 'code-block-ok-line',
          line: 'correct-ligne-suivante',
        },
      ],
    },

    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
