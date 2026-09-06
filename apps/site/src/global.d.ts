// ---------------------------------------------------------------------------
// Déclaration globale requise par la configuration TypeScript officielle de
// Docusaurus : https://docusaurus.io/docs/typescript-support
//
// Sans elle, les modules virtuels `@generated/*` et `@theme/Layout` (entre
// autres) n'auraient aucun type connu, de même que les imports de fichiers
// `*.module.css`, `*.svg`, `*.md`. Ce fichier n'exporte rien : il augmente
// uniquement l'espace de types global.
//
// Volontairement absente : la référence à `@docusaurus/theme-classic`, qui
// ajouterait une dépendance rien que pour typer le composant `@theme/Heading`
// — un composant que cette page n'utilise pas (elle utilise des balises
// `<h1>/<h2>/<h3>` natives, ce dont elle a exactement besoin, une page
// d'accueil n'ayant pas à générer d'ancres de sommaire). Voir AUD-013 dans
// le journal d'audit si ce composant devient nécessaire un jour.
// ---------------------------------------------------------------------------

/// <reference types="@docusaurus/module-type-aliases" />
