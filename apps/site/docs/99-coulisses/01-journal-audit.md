---
id: journal-audit
slug: /coulisses/journal-audit
title: Journal d'audit
sidebar_label: Journal d'audit
sidebar_position: 1
description: Registre chronologique de toutes les décisions techniques du dépôt — datées, justifiées, contestables.
---

# Journal d'audit

> **Pourquoi ce document existe.** Dans un projet professionnel, la question
> qui coûte le plus cher n'est pas « comment ça marche ? » mais
> **« pourquoi est-ce fait comme ça ? »**. Sans réponse écrite, chaque nouvelle
> personne re-débat des mêmes choix, ou pire, les défait sans comprendre.
>
> Ce journal est donc à la fois un artefact d'ingénierie **et** un support de
> cours : vous êtes en train de lire ce que produit un architecte logiciel.

## Conventions de lecture

| Champ             | Signification                                    |
| ----------------- | ------------------------------------------------ |
| **Statut**        | `Accepté` · `Provisoire` · `Remplacé` · `Rejeté` |
| **Portée**        | Ce que la décision affecte                       |
| **Réversibilité** | 🟢 facile · 🟡 coûteuse · 🔴 structurante        |
| **Revue**         | Date à laquelle la décision doit être réexaminée |

---

## AUD-001 — Gestionnaire de paquets : pnpm

**2026-09-05** · Statut : `Accepté` · Portée : monorepo entier · Réversibilité : 🟡

**Contexte.** Trois candidats : npm (par défaut), yarn, pnpm.

**Décision.** pnpm 10, avec `hoist=false` dans `.npmrc`.

**Justification.**

1. **Pédagogique avant tout.** pnpm n'aplatit pas `node_modules`. Un paquet non
   déclaré dans le `package.json` qui l'importe devient **introuvable**. Les
   « dépendances fantômes » — qui marchent en local et cassent en production —
   sont donc structurellement impossibles. C'est une leçon que les apprenants
   _vivent_ au lieu de la lire (module 08).
2. **Volume.** Ce dépôt contiendra une trentaine de paquets. La mutualisation
   par liens physiques divise l'espace disque et le temps d'installation.
3. **Sécurité.** pnpm 10 bloque par défaut les scripts d'installation des
   dépendances. Les exceptions sont déclarées explicitement dans
   `onlyBuiltDependencies` — matière directe du module 11.

**Conséquence acceptée.** Les apprenants sous npm/yarn devront installer pnpm.
Coût : une commande (`corepack enable`). Jugé négligeable face au bénéfice.

---

## AUD-002 — Version de TypeScript : 6.0.3, et non 7.0.2 ⭐

**2026-09-05** · Statut : `Accepté` · Portée : tout le code · Réversibilité : 🟡
· Revue : **2026-12-01**

:::info Décision la plus structurante du dépôt
C'est aussi le meilleur exemple pédagogique du parcours : _comment un architecte
arbitre entre nouveauté et outillage_.
:::

**Contexte.** Au moment de la construction, `npm view typescript version`
renvoie **7.0.2** — la réécriture native du compilateur en Go, considérablement
plus rapide. La tentation d'enseigner « la dernière version » est forte.

**Investigation menée.**

```text
typescript              latest = 7.0.2   ← le plus récent
typescript              6.0.3            ← dernière ligne 6.x, non dépréciée
typescript-eslint       8.69.0
  └─ peerDependencies.typescript = ">=4.8.4 <6.1.0"   ⛔ EXCLUT TS 7
```

**Le conflit.** `typescript-eslint` fournit le **lint type-aware** : les règles
`no-floating-promises`, `no-misused-promises`, `no-unsafe-assignment`. Ce sont
elles qui détectent les bugs que `tsc` seul laisse passer, et elles constituent
le socle des modules 11 et 13. Adopter TS 7 aujourd'hui reviendrait à **retirer
une brique pédagogique centrale pour gagner du temps de compilation**.

**Décision.**

- Socle du monorepo : **TypeScript `~6.0.3`**, dernière version stable
  entièrement outillée.
- TypeScript 7 : traité dans un **laboratoire isolé** (`labs/ts7-native`),
  hors du graphe de build principal, avec mesures comparatives et guide de
  migration.

**Justification.** Une formation doit **compiler pour de vrai**. Une chaîne
d'outils cassée enseigne la frustration, pas TypeScript. Par ailleurs, la
situation exacte reproduite ici — « la version majeure est sortie, l'écosystème
n'a pas suivi » — est l'une des décisions les plus fréquentes du métier. Autant
la traiter explicitement.

**Vérification prévue à la revue.**

```bash
npm view typescript-eslint peerDependencies.typescript
# Quand la contrainte accepte >=7, réévaluer la bascule.
```

---

## AUD-003 — Rigueur du compilateur au-delà de `strict`

**2026-09-05** · Statut : `Accepté` · Portée : `tsconfig.base.json` · Réversibilité : 🔴

**Décision.** En plus de `strict: true`, activation de :

| Option                               | Bug qu'elle prévient                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `noUncheckedIndexedAccess`           | `TypeError: cannot read property of undefined` sur un accès par index                |
| `exactOptionalPropertyTypes`         | Confusion entre « absent » et « présent valant `undefined` » lors des sérialisations |
| `noImplicitOverride`                 | Surcharge silencieusement rompue après le renommage d'une méthode parente            |
| `noPropertyAccessFromIndexSignature` | Faux sentiment de sécurité sur des clés dynamiques                                   |
| `verbatimModuleSyntax`               | Imports survivant au runtime, dépendances circulaires                                |
| `isolatedModules`                    | Incompatibilité avec esbuild / SWC / Vite                                            |

**Justification.** Le coût d'activation est **nul sur un dépôt neuf** et
prohibitif sur un dépôt mature. Ces options ne sont pas un raffinement : elles
constituent la différence concrète entre « TypeScript activé » et « TypeScript
utilisé ».

**Conséquence acceptée.** `noUncheckedIndexedAccess` rend certains exercices
plus verbeux. C'est assumé : la verbosité est visible, le `undefined` en
production ne l'est pas.

**Exception documentée.** Les paquets de cours (`packages/tsconfig/exercises.json`)
désactivent `noUnusedLocals` et `noUnusedParameters` — sans quoi un squelette
d'exercice à compléter serait en erreur avant même que l'apprenant ait commencé.
Cet assouplissement est strictement limité à ce périmètre.

---

## AUD-004 — Lint type-aware obligatoire, et vérifié

**2026-09-05** · Statut : `Accepté` · Portée : tout le code · Réversibilité : 🟢

**Décision.** `typescript-eslint` en configuration `strictTypeChecked` +
`stylisticTypeChecked`, avec `projectService: true`.

**Validation effectuée — et c'est le point important.** La configuration n'a pas
été supposée correcte : un fichier sonde contenant trois défauts délibérés a été
soumis au linter.

```text
scripts/__probe__.ts
   5:1   error  Async function 'load' has no 'await' expression        require-await
  11:3   error  Promises must be awaited …                             no-floating-promises
  14:9   error  Unsafe assignment of an `any` value                     no-unsafe-assignment
  14:16  error  Unexpected any. Specify a different type                no-explicit-any
  19:15  error  Forbidden non-null assertion                            no-non-null-assertion

✖ 5 problems (5 errors, 0 warnings)
```

Les 3 défauts plantés ont été détectés, **plus 2 non anticipés**. La sonde a
ensuite été supprimée.

**Leçon transférée aux apprenants (module 13).** Une configuration de sécurité
qu'on n'a jamais vue échouer n'est pas une configuration de sécurité : c'est une
hypothèse. On teste ses garde-fous en les faisant se déclencher.

**Conséquence acceptée.** Le lint est lent (~1 à 3 min à froid). Documenté dans
la FAQ et l'installation, avec la parade `--filter`.

---

## AUD-005 — Langue source française, code anglais

**2026-09-05** · Statut : `Accepté` · Portée : tout le contenu · Réversibilité : 🔴

**Décision.**

- Contenu pédagogique : **français source** (`docs/`), **anglais traduit**
  (`i18n/en/`).
- Identifiants, noms de fichiers et commentaires **de code** : **anglais, toujours**.

**Justification.** La nuance pédagogique se perd en traduction ; le français est
la langue de rédaction la plus fine ici. Le code, lui, doit rester conforme aux
usages professionnels : un `calculerPrixTotal` dans un dépôt public ferme des
portes. Cette frontière est explicite pour éviter toute hésitation.

**Conséquence acceptée.** Docusaurus attend conventionnellement l'anglais dans
`docs/`. On s'en écarte : `defaultLocale: 'fr'`. Aucune limitation technique
constatée.

---

## AUD-006 — Liens morts : échec du build

**2026-09-05** · Statut : `Accepté` · Portée : site · Réversibilité : 🟢

**Décision.** `onBrokenLinks`, `onBrokenAnchors`,
`markdown.hooks.onBrokenMarkdownLinks` et `onDuplicateRoutes` réglés sur
`throw`.

**Justification.** Sur un site de formation, un lien mort ne dégrade pas
l'expérience : il **interrompt un apprentissage**. Mieux vaut casser le build
chez nous que la progression chez l'apprenant.

**Conséquence acceptée.** Toute page doit exister avant d'être référencée. Ce
qui impose d'écrire les pages dans l'ordre des dépendances — contrainte saine.

---

## AUD-007 — URL pilotées par des slugs explicites

**2026-09-05** · Statut : `Accepté` · Portée : site · Réversibilité : 🟡

**Contexte.** Avec `routeBasePath: '/'`, Docusaurus déduit l'URL de
l'arborescence : `docs/00-demarrer/01-plan-de-formation.md` produit
`/demarrer/plan-de-formation`.

**Décision.** Slug explicite (`slug: /plan-de-formation`) sur les pages
d'accueil du parcours ; URL déduites de l'arborescence pour les modules.

**Justification.** Les pages d'entrée sont partagées, mises en favori et citées :
leurs URL doivent être courtes et **survivre à une réorganisation des dossiers**.
Les pages de module, elles, gagnent à refléter la structure du programme.

---

## AUD-008 — Le contenu de cours ne vit pas dans le site

**2026-09-05** · Statut : `Accepté` · Portée : arborescence · Réversibilité : 🔴

**Décision.**

- Le **texte** des leçons : `apps/site/docs/**`
- Le **code** (exercices, solutions, tests) : `courses/NN-*/` — de vrais paquets
  du workspace.

**Justification.** Du code enfermé dans des blocs Markdown n'est ni compilé, ni
linté, ni testé. Il pourrit en silence. Ici, chaque exercice est un paquet réel
qui passe `typecheck`, `lint` et `test` en intégration continue : **si une leçon
devient fausse, le build casse.**

**Conséquence acceptée.** Il faut un mécanisme d'inclusion pour afficher le code
réel dans les pages. Traité en AUD-009.

---

## AUD-009 — Inclusion du code source dans les pages

**2026-09-05** · Statut : `Provisoire` · Portée : site · Réversibilité : 🟢

**Problème.** Recopier le code dans le Markdown crée deux sources de vérité qui
divergeront. La question est de savoir _comment_ injecter le fichier réel.

**Piste retenue.** `remark-code-import` (référence par chemin depuis
`courses/`), ou un script de synchronisation vérifié en CI.

**Pourquoi `Provisoire`.** La solution n'est pas encore implémentée ni validée
sur ce dépôt. Marquer une décision comme provisoire tant qu'elle n'est pas
éprouvée fait partie de l'honnêteté d'un journal d'audit.

**Critère de passage en `Accepté`.** Le build du site doit échouer si un chemin
de fichier référencé n'existe plus.

---

## AUD-010 — Les configurations `tsconfig` partagées ne déclarent aucun chemin relatif ⭐

**2026-09-06** · Statut : `Accepté` · Portée : `packages/tsconfig/*`, tout module de cours · Réversibilité : 🟡

:::info Un vrai bug rencontré pendant la construction du dépôt, corrigé en direct
Conservé ici volontairement : c'est un exemple réel et représentatif des
pièges de configuration TypeScript en monorepo — matière directe du module 08.
:::

**Symptôme.** En validant le tout premier module de cours (`courses/02-*`),
deux échecs en cascade :

```text
1. [TSCONFIG_ERROR] Failed to load tsconfig 'node_modules/tsconfig.base.json'
   (via Vitest / le transformateur oxc de Vite 8)

2. error TS18003: No inputs were found in config file '.../tsconfig.json'.
   Specified 'include' paths were
   '["../../packages/tsconfig/exercises/**/*.ts", …]'
   (via tsc lui-même)
```

**Cause n° 1 — un `extends` relatif ne doit jamais « remonter » hors d'un
paquet consommé via `node_modules`.** Les paquets partagés
(`packages/tsconfig/*.json`) sont atteints par les autres paquets via un lien
symbolique pnpm (`node_modules/@atlas/tsconfig/…`). Le premier jet de ces
fichiers écrivait `"extends": "../../tsconfig.base.json"` — une remontée de
deux niveaux. Certains outils (le transformateur `oxc` utilisé par Vite 8)
résolvent ce chemin relativement à l'**emplacement apparent du lien**, et non
à l'emplacement réel du fichier : la remontée sort alors du paquet et atterrit
n'importe où.

**Cause n° 2 — plus fondamentale, indépendante des liens symboliques.**
TypeScript résout **tout** chemin relatif d'un tsconfig (`include`, `exclude`,
`rootDir`, `outDir`, `baseUrl`, `tsBuildInfoFile`…) par rapport au fichier qui
le **déclare**, jamais par rapport au projet qui fait `extends`. Un fichier
partagé qui déclare `"include": ["src/**/*.ts"]` cherchera ce dossier à
l'intérieur de `packages/tsconfig/` lui-même — pas dans le paquet
consommateur. C'est documenté, mais contre-intuitif, et absent de la plupart
des tutoriels sur les monorepos.

**Décision.**

1. Tout `extends` entre paquets du workspace reste un **fichier frère**, dans
   le même dossier que sa propre base (`"./base.json"`), jamais une remontée
   `../..`.
2. Les fichiers `packages/tsconfig/*.json` ne contiennent **plus aucun**
   chemin relatif : ni `include`, ni `exclude`, ni `rootDir`, ni `outDir`, ni
   `tsBuildInfoFile`. Ils ne portent que des indicateurs de rigueur
   (`strict`, `noUncheckedIndexedAccess`…) et des réglages non liés au
   système de fichiers (`types: ["node"]`, qui est une résolution par nom de
   paquet et non un chemin).
3. Chaque paquet consommateur (`courses/**/tsconfig.json`,
   `packages/contracts/tsconfig.json`, etc.) déclare **lui-même** ses
   `include` / `exclude` / `rootDir` / `outDir`.

**Justification.** Une configuration partagée doit rester un pur ensemble de
_politiques_ (le niveau de rigueur). Les _chemins_ sont par nature une
propriété du paquet qui les possède — les mélanger produit une configuration
qui fonctionne par accident tant que personne ne l'atteint via un lien
symbolique ou un outil au comportement légèrement différent de `tsc`.

**Validation effectuée.** Après correction : `pnpm --filter @atlas/course-02
test`, `typecheck` et `lint` passent tous les trois. Voir aussi AUD-004, qui
applique le même principe de « ne pas supposer, vérifier ».

**Leçon transférée aux apprenants (module 08).** Dans un monorepo, deux outils
différents (`tsc` et le transformateur d'un bundler) peuvent résoudre le
_même_ chemin relatif de deux façons différentes dès qu'un lien symbolique
entre en jeu. La règle qui met tout le monde d'accord : **ne jamais faire
remonter un `extends` hors du dossier de son propre paquet, et ne jamais
mettre de chemin relatif dans un fichier destiné à être `extends`-é par
d'autres.**

---

## AUD-011 — `showLastUpdateTime` désactivé jusqu'au premier commit

**2026-09-06** · Statut : `Provisoire` · Portée : site · Réversibilité : 🟢
· Revue : **au premier commit du dépôt**

**Symptôme.** Le tout premier `pnpm --filter @atlas/site build`, exécuté dans
un dépôt Git fraîchement initialisé (`git init`) mais sans aucun commit,
échoue entièrement :

```text
fatal: your current branch 'main' does not have any commits yet
```

**Cause.** `showLastUpdateTime` (voir AUD-006) appelle `git log` pour chaque
page. Sur un fichier jamais committé mais dans un dépôt QUI A déjà des
commits, `git log` renvoie simplement un résultat vide — pas d'erreur.
Sur un dépôt **sans aucun commit**, la commande échoue avec un code de sortie
différent, et Docusaurus ne distingue pas ce cas : il fait échouer tout le
build plutôt que d'afficher une page sans date.

**Décision.** `showLastUpdateTime: false` le temps qu'il n'existe aucun commit.
Pas de commit créé pour lever ce blocage : créer un commit est une décision
qui revient à la personne qui possède le dépôt, pas à l'outillage de
construction du site.

**Action à effectuer, une fois prête.**

```bash
git add -A
git commit -m "chore: commit initial du squelette TypeScript Atlas"
```

Puis, dans `apps/site/docusaurus.config.ts`, repasser `showLastUpdateTime` à
`true`.

**Pourquoi `Provisoire` et non `Rejeté`.** La fonctionnalité reste jugée utile
(AUD-006) ; elle est seulement suspendue le temps d'une condition préalable
qui ne dépend pas de ce document.

---

## AUD-012 — Un échec de build en apparence structurel, en réalité transitoire

**2026-09-06** · Statut : `Accepté` (aucune action requise) · Portée : site · Réversibilité : —

:::info Conservé volontairement malgré la fausse piste
Un journal d'audit honnête documente aussi les hypothèses écartées, pas
seulement les décisions qui ont tenu. Voici le raisonnement complet, y
compris le détour.
:::

**Symptôme initial.** `docusaurus build` (comportement par défaut : toutes
les locales en une seule invocation) a échoué sur la **seconde** locale (`en`),
après avoir réussi la première (`fr`) :

```text
[SUCCESS] Generated static files in "build".        ← fr : succès
[ERROR] Error: Unable to build website for locale en.
  [cause]: ENOENT: no such file or directory, open
    '...\build\en\__server\server.bundle.js'
```

**Fausse piste explorée.** Hypothèse initiale : bug connu de Docusaurus sur
les builds multi-locales séquentiels, à contourner en construisant chaque
locale dans un processus séparé (`docusaurus build --locale fr && … --locale
en`). Cette commande s'exécute bien — mais **avant de l'adopter**, vérification
du HTML produit :

```bash
grep -o 'href="/en/[^"]*"' build/index.html   # → AUCUN résultat
```

Un `--locale en` isolé construit le site comme si `en` était l'unique locale :
les liens ne sont **pas** préfixés `/en/`. Fusionner cette sortie dans
`build/en/` aurait cassé silencieusement toute la navigation interne de la
version anglaise. **Fausse piste rejetée avant d'être committée.**

**Cause réelle.** Un nettoyage complet du cache (`rm -rf build .docusaurus
node_modules/.cache`) suivi d'un nouveau `docusaurus build` **standard** (sans
contournement) a réussi du premier coup, `build/en/` correctement imbriqué,
liens internes correctement préfixés (`href="/en/"` bien présent dans le HTML
de la version française). L'échec initial était donc un verrou de fichier
transitoire — plausible sur Windows, où l'antivirus scanne un fichier au
moment précis où un second processus webpack tente de le lire — et non un
défaut de Docusaurus.

**Décision.** Aucun contournement de code. `"build": "docusaurus build"`
reste la commande standard. Si l'échec revient de façon reproductible, purger
`.docusaurus/` et relancer avant toute autre action.

**Leçon transférée aux apprenants.** Une « solution » qui fait disparaître un
message d'erreur n'est pas nécessairement correcte — elle peut simplement
déplacer le problème ailleurs, de façon moins visible. Ici, le contournement
compilait et sortait un code de sortie 0 : en apparence, un succès complet.
Seule l'inspection du contenu produit (`grep` sur les liens générés) a révélé
qu'il était silencieusement faux. **Un build vert n'est une preuve que de ce
qu'on a vérifié.**

---

## AUD-013 — Contournement d'un bug de typage amont dans `@theme/Heading`

**2026-09-06** · Statut : `Accepté` · Portée : `apps/site/src/pages/index.tsx` · Réversibilité : 🟢

**Symptôme.** `tsc --noEmit` refuse tout usage du composant Docusaurus
`@theme/Heading` avec des enfants JSX :

```text
error TS2322: Type '{ children: Element; as: "h1"; … }' is not assignable
  to type 'IntrinsicAttributes & Props'.
  Property 'children' does not exist on type '… & Props'.
```

**Cause, remontée jusqu'à sa source.** Dans
`@docusaurus/theme-classic/src/theme-classic.d.ts` :

```ts
declare module '@theme/Heading' {
  type HeadingType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  export interface Props extends ComponentProps<HeadingType> {
    readonly as: HeadingType;
  }
  // …
}
```

`ComponentProps<HeadingType>` est un type conditionnel à paramètre nu : sur
une **union** de balises (`'h1' | … | 'h6'`), TypeScript le **distribue**
puis **réunit** les résultats — le type obtenu est une _union_ d'objets, pas
un objet unique. Or **une interface ne peut hériter (`extends`) que d'un type
objet**, jamais d'une union. Le compilateur ignore alors silencieusement les
membres visés par cet `extends` invalide (dont `children`) : `Props` se
retrouve réduit à son seul membre propre, `{ readonly as: HeadingType }`.

Cette erreur, commise dans le paquet lui-même, n'apparaît normalement pas :
`skipLibCheck: true` (AUD-003) — activé dans la quasi-totalité des projets
TypeScript, y compris celui-ci — empêche `tsc` de **signaler** l'erreur à
l'intérieur de `theme-classic.d.ts`. Il continue en revanche d'en tenir
compte pour tout code qui **consomme** ce type ailleurs : le bug reste actif,
seulement invisible à sa source.

**Décision.** Ne pas contourner par un `as` ou un `// @ts-expect-error` :
`<Heading>` n'apporte, sur cette page d'accueil, que la mise en forme —
son intérêt réel (générer une ancre pour le sommaire de navigation) ne
concerne que les pages de documentation. Remplacement par des balises HTML
natives `<h1>`, `<h2>`, `<h3>`, qui n'ont besoin d'aucun type spécial.

**Justification.** Contourner un bug de typage amont par une assertion cache
le problème sans le résoudre : le composant resterait inutilisable avec des
enfants partout ailleurs dans le dépôt. Ici, le composant n'apportait de
toute façon rien sur cette page précise — la solution la plus sûre est aussi
la plus simple.

**Si `@theme/Heading` devient nécessaire ailleurs** (une page nécessitant
réellement une ancre de sommaire) : soit attendre un correctif amont de
Docusaurus, soit passer `children` via une prop distincte non couverte par ce
type défaillant, soit isoler un wrapper typé localement qui n'hérite pas du
type `Props` fautif.

**Leçon transférée aux apprenants (module 09/module 00 §3).** `skipLibCheck`
ne rend pas un bug de bibliothèque tierce inoffensif : il le rend seulement
**invisible à sa source**. Diagnostiquer un type qui « perd » une propriété
sans raison apparente passe souvent par remonter la chaîne d'héritage jusqu'à
son origine réelle — ici, un `extends` sur un type conditionnel distribué,
exactement la matière du module 09.

---

## AUD-014 — `pnpm test` ne peut pas être le critère de santé du dépôt ⭐

**2026-09-06** · Statut : `Accepté` · Portée : `courses/*`, scripts racine · Réversibilité : 🟡

**Constat.** En validant le tout premier module de cours, `pnpm test` à la
racine échoue — non pas à cause d'un bug, mais parce que l'exercice
`courses/02-*/exercises/01-…` contient, comme **tous** les exercices de ce
dépôt, un `throw new Error('Not implemented')` (AUD-008). Le test qui cible
cet exercice est rouge **par construction**, et le restera dans n'importe
quel clone frais du dépôt — un manuel non commencé n'est pas un manuel
défaillant.

**Le problème réel.** `turbo run test` agrège le script `test` de **tous**
les paquets sans distinction. Pour un module de cours, ce script ciblait
`exercises/` — pertinent pour un **apprenant** qui vérifie sa propre
progression, mais **jamais vert** pour quiconque d'autre : ni pour un
contributeur qui ajoute un exercice, ni pour une future intégration continue
(DT-05) qui doit répondre à une question différente — _« le corrigé fourni
est-il correct ? »_ — et non _« quelqu'un a-t-il fini ses devoirs ? »_.
`CONTRIBUTING.md` affirmait pourtant, avant cette correction, que
`pnpm verify` (qui inclut `test`) devait passer avant toute pull request :
une affirmation structurellement impossible à satisfaire.

**Décision.** Distinguer explicitement les deux publics et les deux
questions, avec un vocabulaire qui ne laisse pas de place à l'ambiguïté :

| Commande                                      | Cible        | Répond à                      | Toujours verte ?  |
| --------------------------------------------- | ------------ | ----------------------------- | ----------------- |
| `pnpm test` / `pnpm verify`                   | `exercises/` | _Ai-je résolu l'exercice ?_   | Non — c'est voulu |
| `pnpm test:solutions` / `pnpm verify:content` | `solutions/` | _Le corrigé est-il correct ?_ | **Oui, toujours** |

Concrètement : chaque module de cours porte désormais deux fichiers de test
par exercice (`*.exercise.test.ts` et `*.solution.test.ts`, mêmes
assertions, import différent) et deux configurations Vitest qui les
séparent. `turbo.json` déclare la tâche `test:solutions` ; Turborepo l'ignore
silencieusement dans les paquets qui ne la définissent pas (contracts,
projets…), sans erreur.

**Justification.** Une commande qui échoue « normalement » n'est pas une
commande de vérification — elle ne peut plus servir de signal. Séparer les
deux restaure un `pnpm verify:content` capable d'être réellement vert, ce
qui est la seule chose qu'une intégration continue peut exploiter (DT-05).

**Conséquence acceptée.** Chaque exercice futur double son nombre de
fichiers de test (un par cible). Le coût est mineur : les deux fichiers
partagent les mêmes assertions, seul l'import diffère.

**Leçon transférée aux apprenants.** Une suite de tests « rouge » n'est pas
toujours un signal d'alarme — parfois, elle décrit fidèlement un travail non
commencé. Le vrai risque en ingénierie n'est pas le rouge attendu : c'est un
outil de vérification qui ne peut structurellement jamais être vert, et que
plus personne ne regarde en conséquence.

---

## Dette technique connue

Un journal d'audit qui ne consigne que les réussites est un document de
communication, pas un outil d'ingénierie. Voici ce qui **manque encore**.

| Réf.  | Sujet                                                                   | Impact                                                 | Échéance    |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------------------ | ----------- |
| DT-01 | Configuration ESLint React absente (`packages/eslint-config/react.mjs`) | Bloque le lint des modules 19–20 et des projets finaux | Avant M19   |
| DT-02 | AUD-009 non implémenté                                                  | Risque de divergence code / documentation              | Avant M02   |
| DT-03 | Traduction anglaise non commencée                                       | Site bilingue annoncé mais incomplet                   | Progressive |
| DT-04 | Aucun crochet Git (`pre-commit`)                                        | `pnpm verify` repose sur la discipline                 | Avant M13   |
| DT-05 | Chaîne d'intégration continue non écrite                                | Rien ne vérifie les contributions                      | Avant M13   |
| DT-06 | Aucune mesure du temps de build à froid                                 | Impossible de détecter une régression de performance   | Avant M14   |

---

## Historique des révisions

| Date       | Événement                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-05 | Création du dépôt · AUD-001 à AUD-009 · dette DT-01 à DT-06 ouverte                                                                                                                                                                                                                                                                                                                                        |
| 2026-09-06 | AUD-010 à AUD-014 · premier module de cours (`courses/02-systeme-de-types`) et `@atlas/contracts` validés de bout en bout · dépôt Git initialisé · site bilingue FR/EN construit avec succès (build complet, deux locales, liens croisés vérifiés) · `verify` (apprenant) et `verify:content` (contributeur) distingués · Module 01 (Toolchain) rédigé, exemples vérifiés en direct (`node`, `tsx`, `tsc`) |
