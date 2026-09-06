---
id: plan-de-formation
slug: /plan-de-formation
title: Plan de formation
sidebar_label: Plan de formation
sidebar_position: 1
description: Le programme complet de TypeScript Atlas — 21 modules, 6 mini-projets et 3 projets finaux, du premier `let` à l'architecture d'API de production.
keywords: [typescript, formation, curriculum, parcours, débutant, expert]
---

# Plan de formation

> **La promesse.** À la fin de ce parcours, vous ne « connaîtrez » pas TypeScript :
> vous saurez **concevoir**, **sécuriser**, **tester**, **containeriser** et **livrer**
> des systèmes typés que d'autres développeurs pourront reprendre sans vous.

---

## 1. Comment ce parcours est construit

Chaque module suit rigoureusement le même cycle en cinq temps. Ce n'est pas une
mise en page : c'est la structure d'apprentissage elle-même.

| #   | Temps         | Ce que vous faites                               | Pourquoi                                                             |
| --- | ------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| 1   | **Pourquoi**  | Vous lisez le problème réel que la notion résout | On ne retient pas une syntaxe, on retient une solution à une douleur |
| 2   | **Cours**     | Théorie + code commenté **ligne par ligne**      | Aucune ligne magique : tout est justifié                             |
| 3   | **Atelier**   | Exercices progressifs, tests fournis en rouge    | On apprend en faisant échouer puis passer des tests                  |
| 4   | **Corrigé**   | Solution commentée + _les erreurs classiques_    | Voir la bonne réponse ne suffit pas : il faut voir les mauvaises     |
| 5   | **Transfert** | Le mini-projet réinvestit tout le bloc           | Une notion non réinvestie est une notion oubliée                     |

### Les trois niveaux de difficulté

Chaque exercice est étiqueté. Vous savez toujours où vous mettez les pieds.

- 🟢 **Fondation** — application directe du cours. Vous devez le réussir.
- 🟡 **Consolidation** — combine plusieurs notions. C'est ici qu'on progresse.
- 🔴 **Expertise** — problème ouvert, plusieurs solutions valables. Niveau entretien senior.

---

## 2. Vue d'ensemble

```text
PARTIE I    Origines & Fondations ................. M00 → M04   ██████░░░░░░░░░░░░░░
            ↳ Mini-projet 1 : taskline (CLI)
PARTIE II   Structurer le code ..................... M05 → M08   ░░░░░░████░░░░░░░░░░
            ↳ Mini-projet 2 : csv-forge (parseur)
PARTIE III  Le niveau expert du typage ............. M09 → M11   ░░░░░░░░░░███░░░░░░░
            ↳ Mini-projet 3 : typed-router
PARTIE IV   Qualité & industrialisation ............ M12 → M14   ░░░░░░░░░░░░░███░░░░
            ↳ Mini-projet 4 : atlas-sdk (dockerisé)
PARTIE V    Backend & APIs de production ........... M15 → M18   ░░░░░░░░░░░░░░░░████
            ↳ Mini-projets 5 & 6 : API Express + microservice Nest
PARTIE VI   Frontend & Projets finaux .............. M19 → M20   ░░░░░░░░░░░░░░░░░░██
            ↳ NEXUS (Next.js) · PULSE (React+Vite) · TRAIL (Expo)
```

**Volume total estimé : 120 à 160 heures de travail effectif.**
Ce n'est pas un chiffre marketing. C'est le temps réel nécessaire pour que les
réflexes s'installent. Voir [Méthode d'apprentissage](./03-methode-apprentissage.md)
pour savoir comment répartir ces heures.

---

## 3. Partie I — Origines & Fondations

> **Objectif de la partie :** comprendre _pourquoi_ TypeScript existe, et manipuler
> son système de types de base sans jamais écrire `any`.

### Module 00 — Origines et philosophie de TypeScript

`≈ 4 h` · Aucun prérequis

Pourquoi Microsoft a créé un langage en 2012, et ce que cette histoire explique
de chaque bizarrerie du langage aujourd'hui.

- Le problème JavaScript à l'échelle : le témoignage des équipes Office/Bing
- Anders Hejlsberg — de Turbo Pascal à C# à TypeScript : la même obsession
- **Les cinq décisions fondatrices**, et leurs conséquences pour vous :
  1. **Sur-ensemble de JavaScript** → tout JS valide est du TS valide
  2. **Effacement des types (type erasure)** → _aucun type n'existe à l'exécution_
  3. **Typage structurel** (« si ça a la forme d'un canard… ») et non nominal
  4. **Typage graduel** → l'adoption peut être progressive
  5. **Alignement sur ECMAScript** → TS n'invente pas de fonctionnalités runtime
- La conséquence n° 1 que 90 % des débutants ignorent : **TypeScript ne protège
  rien à l'exécution**. Une réponse d'API typée `User` peut contenir n'importe quoi.
  (Ce constat ouvre tout le module 11.)
- Chronologie 0.8 → 6.x, et ce qui arrive avec le compilateur natif 7.0

### Module 01 — Toolchain, `tsconfig`, exécution, débogage

`≈ 6 h` · Prérequis : M00

Avant d'écrire du code, savoir ce qui le transforme et où il casse.

- `tsc` : ce qu'il fait vraiment (vérifier, puis effacer) et ce qu'il ne fait pas
- Anatomie complète d'un `tsconfig.json`, option par option
- ESM vs CommonJS : la source de confusion n° 1 de l'écosystème Node
- Exécuter du TypeScript : `tsc`, `tsx`, `node --experimental-strip-types`
- `declaration`, source maps, et débogage pas à pas dans VS Code
- Lire un message d'erreur de `tsc` sans paniquer (méthode en 4 étapes)

### Module 02 — Le système de types : primitifs, inférence, narrowing

`≈ 6 h` · Prérequis : M01

- Primitifs, et pourquoi `String` (majuscule) est presque toujours une erreur
- **`any` vs `unknown` vs `never` vs `void`** — le quatuor mal compris
- L'inférence : ce que TypeScript devine seul, et quand l'aider
- _Widening_ et _narrowing_ : pourquoi `const x = 'a'` et `let x = 'a'` diffèrent
- `as const` : la clé pour figer des littéraux
- `satisfies` : vérifier **sans** élargir (l'opérateur qui change tout)

### Module 03 — Objets, tableaux, tuples, unions, intersections, enums

`≈ 7 h` · Prérequis : M02

- Types objets, propriétés optionnelles, `readonly`
- **Le contrôle d'excès de propriétés** : pourquoi il ne s'applique qu'aux littéraux
- Tableaux vs tuples ; tuples nommés et variadiques
- Unions et intersections : l'algèbre des types
- `enum`, `const enum`, et **pourquoi les experts leur préfèrent des objets `as const`**

### Module 04 — Fonctions : signatures, surcharges, `this`, variance

`≈ 6 h` · Prérequis : M03

- Types de fonctions, paramètres optionnels, valeurs par défaut, rest
- Surcharges : quand elles sont justifiées, quand une union suffit
- Typer `this` explicitement
- **Variance** : pourquoi un `(a: Animal) => void` est assignable à un
  `(c: Chien) => void` et pas l'inverse — la notion qui débloque tout le reste
- `strictFunctionTypes` et le cas particulier des méthodes

> 🛠️ **Mini-projet 1 — `taskline`**
> Un gestionnaire de tâches en ligne de commande, **zéro dépendance externe**.
> Persistance dans un fichier JSON. Vous y pratiquez : unions discriminées,
> validation d'entrées non fiables, gestion d'erreurs, et votre premier
> `tsconfig` strict de bout en bout.

---

## 4. Partie II — Structurer le code

> **Objectif :** passer du script au _logiciel_. Réutilisabilité et frontières nettes.

### Module 05 — Interfaces, types, classes, typage structurel

`≈ 6 h`

- `interface` vs `type` : la vraie liste des différences (et laquelle choisir)
- Classes : visibilité, `readonly`, champs privés `#`, `abstract`, `implements`
- Fusion de déclarations (_declaration merging_) et ses usages légitimes
- **Typage structurel en profondeur** : compatibilité, et comment forcer du
  nominal quand on en a besoin (préambule aux _branded types_ du M10)

### Module 06 — Génériques

`≈ 8 h`

- Du concret au générique : la démarche de généralisation
- Contraintes (`extends`), paramètres par défaut, inférence
- Génériques sur classes, méthodes, types
- **Les erreurs classiques** : le générique inutile, le générique qui ment
- Variance des paramètres de type (`in` / `out`)

### Module 07 — Narrowing avancé, type guards, exhaustivité

`≈ 7 h`

- `typeof`, `instanceof`, `in`, égalité, vérité (_truthiness_)
- **Unions discriminées** : le patron le plus rentable de tout TypeScript
- Prédicats de type (`x is T`) et fonctions d'assertion (`asserts x is T`)
- **Le contrôle d'exhaustivité par `never`** — comment le compilateur vous
  prévient quand vous ajoutez un cas sans traiter tous les endroits concernés
- Limites du narrowing : fermetures, propriétés, appels de fonction

### Module 08 — Modules, déclarations, `@types`, augmentation

`≈ 6 h`

- Résolution de modules : `node16`/`nodenext` vs `bundler`
- `import type`, `verbatimModuleSyntax`, imports circulaires
- Fichiers `.d.ts` : lire, écrire, publier des types
- `DefinitelyTyped` : évaluer la qualité d'un paquet de types
- Augmentation de modules et d'interfaces globales (ex. : `Express.Request`)
- Chemins d'import (`paths`) et frontières architecturales

> 🛠️ **Mini-projet 2 — `csv-forge`**
> Un parseur CSV **typé par son schéma** : vous déclarez les colonnes, la
> bibliothèque en déduit le type des lignes. Génériques, unions discriminées,
> gestion d'erreurs par accumulation, et une API publique agréable à utiliser.

---

## 5. Partie III — Le niveau expert du système de types

> **Objectif :** cesser de _décrire_ les types, et commencer à les **calculer**.

### Module 09 — Types conditionnels, `infer`, mapped types, template literals

`≈ 10 h`

- Types conditionnels et distributivité sur les unions
- `infer` : extraire un type depuis un autre
- Types mappés : `Partial`, `Required`, `Pick`, `Omit`… **réimplémentés à la main**
- Modificateurs `+`/`-` sur `readonly` et `?`, remappage par `as`
- Types littéraux de gabarit (_template literal types_)
- Types récursifs, et la limite de profondeur du compilateur
- **Reconstruire toute la bibliothèque de types utilitaires** de zéro

### Module 10 — Programmer au niveau des types

`≈ 10 h`

- **Branded / opaque types** : rendre un `UserId` incompatible avec un `OrderId`
- Machines à états typées : rendre une transition invalide **impossible à écrire**
- Inférence pilotée par l'API (le patron « builder » typé)
- Typer des chemins d'objets profonds
- **Coût de compilation** : mesurer, diagnostiquer (`--extendedDiagnostics`),
  et savoir quand un type trop malin devient un problème d'équipe

### Module 11 — Strictness, sécurité et fiabilité 🔐

`≈ 10 h` · **Module pivot de toute la formation**

- Chaque option stricte, une par une, avec le bug qu'elle prévient
- `noUncheckedIndexedAccess` et `exactOptionalPropertyTypes` : le vrai niveau strict
- **La frontière I/O** : tout ce qui entre dans le programme est `unknown`
  (HTTP, `JSON.parse`, `process.env`, base de données, fichiers, WebSocket)
- **Validation à l'exécution avec Zod 4** : un schéma, deux usages (types + contrôle)
- Erreurs comme valeurs : le type `Result` — quand l'utiliser, quand `throw` suffit
- Immutabilité : `readonly` profond, structures persistantes
- Typage des variables d'environnement, et **jamais de secret dans le dépôt**
- Sécurité de la chaîne d'approvisionnement : lockfile, scripts d'installation
  bloqués, `pnpm audit`, épinglage de versions
- Lint type-aware : les règles qui attrapent ce que `tsc` laisse passer

> 🛠️ **Mini-projet 3 — `typed-router`**
> Un routeur qui **déduit les paramètres depuis la chaîne d'URL** :
> `'/users/:id/posts/:postId'` produit automatiquement
> `{ id: string; postId: string }`. Template literal types, récursion,
> et une API que l'on peut réellement donner à une équipe.

---

## 6. Partie IV — Qualité & industrialisation

### Module 12 — Asynchrone typé, erreurs, concurrence, annulation

`≈ 8 h`

- Typage des promesses, `async`/`await`, et le piège du `Promise<Promise<T>>`
- **Promesses flottantes** : la première cause de bugs silencieux en Node
- `Promise.all` / `allSettled` / `race` / `any` typés correctement
- Erreurs : `unknown` dans `catch`, erreurs personnalisées, `cause`
- `AbortController` et l'annulation propre
- Streams, itérateurs et générateurs asynchrones typés
- Concurrence contrôlée (limitation, file d'attente, réessai avec repli exponentiel)

### Module 13 — Tests, qualité, CI

`≈ 8 h`

- Vitest 5 : configuration, organisation, doublures de test
- **Tester les types eux-mêmes** (`expectTypeOf`) — un type est du code testable
- Tests basés sur les propriétés (_property-based testing_)
- Couverture : la lire intelligemment, ne pas la fétichiser
- Tests d'intégration avec base de données jetable
- Chaîne CI complète : format → lint → typecheck → test → build

### Module 14 — Docker & industrialisation 🐳

`≈ 8 h`

- Pourquoi Docker pour une formation : « ça marche chez moi » n'existe plus
- Images **multi-stage** pour Node : de 1,2 Go à moins de 150 Mo
- Utilisateur non-root, `HEALTHCHECK`, arrêt gracieux (signaux `SIGTERM`)
- `docker compose` : API + PostgreSQL + Redis + outil d'administration
- Volumes, réseaux, variables d'environnement, secrets
- Devcontainer : un environnement identique pour tout le monde
- Publication d'image et pipeline CI/CD

> 🛠️ **Mini-projet 4 — `atlas-sdk`**
> Un SDK HTTP typé (client d'API), entièrement testé, publié en paquet et
> exécuté dans un conteneur. Vous produisez ici votre premier **artefact
> livrable de qualité professionnelle**.

---

## 7. Partie V — Backend & APIs de production

> **Objectif :** concevoir des API **robustes, modulaires, évolutives**.
> Les deux frameworks sont enseignés, avec un discours explicite sur _quand_
> choisir l'un ou l'autre.

### Module 15 — Node + Express 5 typé

`≈ 10 h`

- Express 5 : nouveautés et pièges de migration
- **Typer correctement `Request`, `Response`, les middlewares** et les erreurs
- Architecture en couches : `route → contrôleur → service → dépôt`
- Injection de dépendances **sans framework** (la version qu'on comprend)
- Validation d'entrée, gestion centralisée des erreurs, journalisation structurée
- Génération d'OpenAPI depuis les schémas Zod

### Module 16 — Persistance : d'abord sans base, puis avec

`≈ 10 h`

**Volontairement en deux temps** — vous devez savoir travailler _sans_ base.

- **Étape 1 — sans base** : dépôt en mémoire, persistance fichier JSON,
  concurrence, le patron _Repository_ qui rend la base interchangeable
- **Étape 2 — avec base** : PostgreSQL + Prisma 7
  - Modélisation, migrations, seed
  - Transactions, isolation, verrous
  - Requêtes N+1, index, `EXPLAIN`
  - Tests d'intégration sur base jetable (Docker)
- Le même service métier fonctionne avec les deux implémentations : **c'est la
  démonstration vivante de l'inversion de dépendance.**

### Module 17 — NestJS 12

`≈ 12 h`

- Pourquoi un framework à conteneur d'injection quand l'équipe grandit
- Modules, providers, portées, injection par token
- Pipes (validation), Guards (autorisation), Interceptors (transverse), Filters
- Configuration typée et validée au démarrage
- Architecture modulaire, CQRS, événements de domaine
- Tests unitaires et E2E avec le module de test Nest
- **Comparaison honnête Express vs Nest** : coût, bénéfice, critères de choix

### Module 18 — API de production 🚀

`≈ 12 h`

- Authentification : JWT + refresh tokens, rotation, révocation, cookies sûrs
- Autorisation : RBAC et ABAC, et où placer la décision
- OWASP API Top 10, appliqué ligne par ligne
- Limitation de débit, protection contre le rejeu, CORS, en-têtes (Helmet)
- Journaux structurés, corrélation par `requestId`, métriques, traces
- Pagination, filtrage, tri, **versionnement d'API**
- Cache Redis et invalidation
- **Scalabilité** : sans état, sondes de vitalité, arrêt gracieux, files d'attente

> 🛠️ **Mini-projets 5 & 6** — une API REST Express + Prisma complète, puis le
> même domaine métier réimplémenté en microservice NestJS. Comparer deux
> solutions au _même_ problème est le meilleur professeur d'architecture.

---

## 8. Partie VI — Frontend & Projets finaux

### Module 19 — TypeScript côté client (React 19)

`≈ 8 h`

- Typer les composants, les props, les enfants, les refs
- Hooks typés, hooks personnalisés génériques
- Composants génériques et polymorphes (`as`)
- État et données distantes typés
- Formulaires typés de bout en bout
- **Le contrat partagé** : un seul paquet de types entre l'API et l'interface

### Module 20 — Du monorepo au produit

`≈ 6 h`

- Frontières entre paquets, graphe de dépendances, règles d'import
- Contrats partagés de bout en bout, sans duplication
- Versionnement, changesets, publication
- Expérience développeur : scripts, générateurs, documentation vivante

---

### 🏛️ Les trois projets finaux

Trois produits complets, chacun exploitant un socle d'API partagé.
Ils ne sont pas des démonstrations : ce sont des **preuves de compétence**,
présentables en entretien.

#### NEXUS — plateforme de gestion de projets

`Next.js 16 · NestJS 12 · PostgreSQL · Prisma · Redis · Docker`

Application complète serveur-rendu : App Router, React Server Components,
Server Actions, authentification par session, rôles et permissions,
temps réel, tableau de bord, tests E2E, déploiement conteneurisé.

#### PULSE — tableau de bord analytique temps réel

`React 19 · Vite 8 · Express 5 · WebSocket · Redis · Docker`

Application monopage : routage et données typés, WebSocket typé de bout en
bout, graphiques, filtres complexes, mode hors-ligne, performance et
virtualisation, tests d'interface.

#### TRAIL — application mobile de randonnée

`React Native · Expo 57 · SQLite · API partagée`

Mobile natif : navigation typée, **priorité au hors-ligne** avec
synchronisation et résolution de conflits, géolocalisation, cartes, stockage
sécurisé, notifications, build EAS.

> Les trois consomment le **même paquet `@atlas/contracts`**. Modifier un champ
> dans le contrat casse la compilation des trois clients. C'est exactement ce
> qu'on attend d'un monorepo typé — et c'est la leçon finale du parcours.

---

## 9. Annexes incluses

| Annexe                    | Contenu                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| **Lab TS 7 natif**        | Le compilateur Go : gains mesurés, différences, guide de migration |
| **Migration JS → TS**     | Stratégie incrémentale sur une base de code existante              |
| **Antisèches**            | Fiches recto-verso imprimables par module                          |
| **Glossaire FR/EN**       | Chaque terme technique dans les deux langues                       |
| **Préparation entretien** | 120 questions classées par niveau, avec réponses argumentées       |
| **Journal d'audit**       | Toutes les décisions techniques du dépôt, datées et justifiées     |

---

## 10. Ce que vous saurez faire à la fin

Un objectif n'a de valeur que s'il est vérifiable. Voici les vôtres.

- [ ] Configurer un `tsconfig` strict et **justifier chaque option**
- [ ] Modéliser un domaine métier de sorte qu'un **état invalide soit inexprimable**
- [ ] Écrire des types conditionnels et mappés récursifs, et en mesurer le coût
- [ ] Sécuriser toutes les frontières d'entrée par validation à l'exécution
- [ ] Concevoir une API REST versionnée, authentifiée, journalisée, testée
- [ ] Choisir entre Express et NestJS **avec des arguments**, pas par habitude
- [ ] Rendre l'infrastructure de données interchangeable (inversion de dépendance)
- [ ] Containeriser une application Node en image de production sûre et légère
- [ ] Partager un contrat typé entre une API, un site web et une app mobile
- [ ] Auditer une base de code TypeScript et rédiger un plan de remédiation

---

## Étape suivante

👉 [Guide d'utilisation](./02-guide-utilisation.md) — comment travailler avec ce dépôt.
👉 [Orientation](./04-orientation-parcours.md) — **par où commencer selon votre niveau**.
